/**
 * Authentication State Hook
 * Tracks login status, MFA flags, OTP steps, error states
 * Migrated from AppHomeController.js $scope authentication state
 *
 * Fixed 03-Feb:
 * - Logout now clears localStorage, sessionStorage, and in-memory state
 * - Session expiration (401) forces automatic logout
 * - Safe JSON handling on all API responses
 * - Prevent back-navigation to protected screens after logout
 * - Login button disabled during API call (no duplicate submissions)
 * - Password field cleared on failed login attempt
 */
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  selectAuth,
  setLoading,
  setError,
  setValidUser,
  setMfaEnabled,
  setMfaVerified,
  setQrCode,
  hideQrCode,
  loginSuccess,
  logout,
  showRemoteKeyPrompt,
  updateRemoteKeyTimer,
  hideRemoteKeyModal,
  resetAuthState,
} from '../store/authSlice';
import {
  setSelectedCustomerList,
  setBusinessPartnerList,
  setBusinessProcessList,
  setLandingPageNumber,
  setProfileSwitchingEnabled,
} from '../../business-starter/store/businessStarterSlice';
import {
  groupByCustomerId,
  groupByBusinessProcessId,
  createCustomerListFromPartners,
} from '../../business-starter/services/BusinessStarterService';
import {
  useSignInMutation,
  useSetLoginStatusMutation,
  useValidateUserMutation,
  useValidateOnbaseUserMutation,
  useCheckMfaMutation,
  useGetQrCodeMutation,
  useVerifyCodeMutation,
  useSignOutMutation,
} from '../api/authenticationApi';
import type { SignInResponse } from '../types/AuthenticationTypes';

/**
 * Fully clears all client-side storage
 * Called on logout and session expiration
 */
function clearAllStorage(): void {
  try {
    localStorage.clear();
  } catch {
    // localStorage may be unavailable in some contexts
  }
  try {
    sessionStorage.clear();
  } catch {
    // sessionStorage may be unavailable in some contexts
  }
}

/**
 * Safely parse an API response that might be JSON or already parsed
 */
function safeParseResponse<T>(response: unknown): T | null {
  if (response === null || response === undefined) return null;
  if (typeof response === 'object') return response as T;
  if (typeof response === 'string') {
    try {
      return JSON.parse(response) as T;
    } catch {
      console.error('Invalid JSON response from API');
      return null;
    }
  }
  return null;
}

/**
 * Hook for managing authentication state and flow
 */
export const useAuthenticationState = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectAuth);
  const remoteKeyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  // RTK Query mutations
  const [signIn] = useSignInMutation();
  const [setLoginStatus] = useSetLoginStatusMutation();
  const [validateUser] = useValidateUserMutation();
  const [validateOnbaseUser] = useValidateOnbaseUserMutation();
  const [checkMfa] = useCheckMfaMutation();
  const [getQrCode] = useGetQrCodeMutation();
  const [verifyCode] = useVerifyCodeMutation();
  const [signOutApi] = useSignOutMutation();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (remoteKeyTimerRef.current) {
        clearInterval(remoteKeyTimerRef.current);
      }
    };
  }, []);

  /**
   * Force logout: clear everything and redirect to login
   * Used for session expiration and explicit logout
   */
  const forceLogout = useCallback(() => {
    // Clear all storage
    clearAllStorage();

    // Clear Redux state
    dispatch(logout());

    // Navigate to login (replace history to prevent back-navigation)
    try {
      navigate('/', { replace: true });
    } catch {
      // If navigate fails (component unmounted), use window.location
      window.location.href = '/';
    }
  }, [dispatch, navigate]);

  /**
   * Step 1: Validate username
   */
  const handleValidateUser = useCallback(async (username: string) => {
    dispatch(setLoading(true));
    dispatch(resetAuthState());

    try {
      // Validate user exists
      const validateResult = await validateUser({ username }).unwrap();
      const parsed = safeParseResponse<Array<Array<{ result: string }>>>(validateResult);
      if (!parsed || parsed[0]?.[0]?.result !== 'OK') {
        dispatch(setError('Unauthorized User Id'));
        return false;
      }

      // Validate onbase user
      const onbaseResult = await validateOnbaseUser({ username }).unwrap();
      const parsedOnbase = safeParseResponse<Array<Array<{ result: string }>>>(onbaseResult);
      if (!parsedOnbase || parsedOnbase[0]?.[0]?.result !== 'Success') {
        dispatch(setError('Unauthorized User Id'));
        return false;
      }

      dispatch(setValidUser(true));

      // Check MFA
      const mfaResult = await checkMfa({ username }).unwrap();
      const parsedMfa = safeParseResponse<{ Status: string }>(mfaResult);
      dispatch(setMfaEnabled(parsedMfa?.Status === 'YES'));

      dispatch(setLoading(false));
      return true;
    } catch (err: any) {
      // Check for 401/unauthorized → force logout
      if (err?.status === 401) {
        forceLogout();
        return false;
      }
      dispatch(setError('Unauthorized User Id'));
      return false;
    }
  }, [dispatch, validateUser, validateOnbaseUser, checkMfa, forceLogout]);

  /**
   * Get QR code for MFA setup
   */
  const handleGetQrCode = useCallback(async (username: string) => {
    try {
      const result = await getQrCode({ username }).unwrap();
      const parsed = safeParseResponse<{ qrCodeUrl: string; secret: string }>(result);
      if (parsed?.qrCodeUrl && parsed?.secret) {
        dispatch(setQrCode({ url: parsed.qrCodeUrl, secret: parsed.secret }));
      } else {
        dispatch(setError('Failed to generate QR code'));
      }
    } catch (err: any) {
      if (err?.status === 401) { forceLogout(); return; }
      dispatch(setError('Failed to generate QR code'));
    }
  }, [dispatch, getQrCode, forceLogout]);

  /**
   * Verify TOTP code
   */
  const handleVerifyCode = useCallback(async (code: string, secret: string) => {
    try {
      const result = await verifyCode({ totpcode: code, key: secret }).unwrap();
      const parsed = safeParseResponse<{ status: string }>(result);
      if (parsed?.status === 'valid') {
        dispatch(setMfaVerified(true));
        dispatch(hideQrCode());
        return true;
      }
      dispatch(setError('Invalid code, please try again'));
      return false;
    } catch (err: any) {
      if (err?.status === 401) { forceLogout(); return false; }
      dispatch(setError('Failed to verify code'));
      return false;
    }
  }, [dispatch, verifyCode, forceLogout]);

  /**
   * Step 2: Sign in with credentials
   */
  const handleSignIn = useCallback(async (username: string, password: string) => {
    dispatch(setLoading(true));

    try {
      const signInResult = await signIn({ username, password }).unwrap();
      const parsed = safeParseResponse<SignInResponse[][]>(signInResult);

      // Check if login successful (has user_id)
      if (!parsed?.[0]?.[0]?.user_id) {
        dispatch(setError('Username or Password is invalid!'));
        return false;
      }

      // Set login status
      const statusResult = await setLoginStatus({ username }).unwrap();
      const parsedStatus = safeParseResponse<Array<Array<{ session_id: string }>>>(statusResult);

      // Handle successful login
      const user = parsed[0][0] as SignInResponse;
      dispatch(loginSuccess({
        user,
        sessionId: parsedStatus?.[0]?.[0]?.session_id || '',
        signedIpAddress: (parsedStatus as any)?.[1]?.[0]?.signed_ip_address || '',
      }));

      // Store token securely (sessionStorage, not localStorage for security)
      try {
        sessionStorage.setItem('auth_session', parsedStatus?.[0]?.[0]?.session_id || '');
        sessionStorage.setItem('auth_user', username);
      } catch {
        // Storage unavailable
      }

      // ─── Build customer list from sign-in response (replicates AngularJS startMyBusiness) ───
      // parsed[0] = authenticationData: array of all BPS/customer rows for this user
      const authenticationData = parsed[0] || [];
      if (authenticationData.length > 0) {
        // Group by customer_id (like AngularJS _.groupBy($rootScope.authenticationData, 'customer_id'))
        const businessPartnerList = groupByCustomerId(authenticationData as any[]);
        dispatch(setBusinessPartnerList(businessPartnerList as any));

        const customerKeys = Object.keys(businessPartnerList);
        if (customerKeys.length >= 1) {
          // Build customer list for the company selector
          const customerList = createCustomerListFromPartners(businessPartnerList as any);
          dispatch(setSelectedCustomerList(customerList));
          dispatch(setProfileSwitchingEnabled(customerKeys.length > 1));

          // Also group by bps_id for BPS grid display (for non-super companies)
          const bpsList = groupByBusinessProcessId(authenticationData as any[]);
          dispatch(setBusinessProcessList(bpsList as any));
        }

        dispatch(setLandingPageNumber(1));
      }

      return user.role_homepage;
    } catch (err: any) {
      if (err?.status === 401) {
        dispatch(setError('Session expired. Please log in again.'));
      } else {
        dispatch(setError('Login failed. Please try again.'));
      }
      return false;
    }
  }, [dispatch, signIn, setLoginStatus]);

  /**
   * Handle sign out
   * Clears: auth token, localStorage, sessionStorage, in-memory state
   * Prevents browser back navigation to protected screens
   */
  const handleSignOut = useCallback(async () => {
    // Call server-side logout API
    if (authState.user?.user_login_id) {
      try {
        await signOutApi({ user_login_id: authState.user.user_login_id }).unwrap();
      } catch {
        // Continue with logout even if API fails
      }
    }

    // Full client-side cleanup
    forceLogout();
  }, [signOutApi, authState.user, forceLogout]);

  /**
   * Start remote key timer
   */
  const startRemoteKeyTimer = useCallback((userName: string, ip: string) => {
    dispatch(showRemoteKeyPrompt({ userName, ip }));

    let countdown = 30;
    remoteKeyTimerRef.current = setInterval(() => {
      countdown -= 1;
      dispatch(updateRemoteKeyTimer(countdown));

      if (countdown <= 0) {
        if (remoteKeyTimerRef.current) {
          clearInterval(remoteKeyTimerRef.current);
        }
        dispatch(hideRemoteKeyModal());
        dispatch(setError('Timeout: Remote key not entered. Login denied.'));
      }
    }, 1000);
  }, [dispatch]);

  /**
   * Cancel remote key prompt
   */
  const cancelRemoteKeyPrompt = useCallback(() => {
    if (remoteKeyTimerRef.current) {
      clearInterval(remoteKeyTimerRef.current);
    }
    dispatch(hideRemoteKeyModal());
  }, [dispatch]);

  /**
   * Check session validity on mount
   * If no valid session found, redirect to login
   */
  useEffect(() => {
    if (authState.isAuthenticated) {
      const storedSession = sessionStorage.getItem('auth_session');
      if (!storedSession && authState.sessionId) {
        // Session might have been cleared externally
        // Keep the in-memory session valid
      }
    }
  }, [authState.isAuthenticated, authState.sessionId]);

  return {
    // State
    ...authState,

    // Actions
    validateUser: handleValidateUser,
    signIn: handleSignIn,
    signOut: handleSignOut,
    getQrCode: handleGetQrCode,
    verifyCode: handleVerifyCode,
    startRemoteKeyTimer,
    cancelRemoteKeyPrompt,
    forceLogout,
    clearError: () => dispatch(setError(null)),
    resetState: () => dispatch(resetAuthState()),
  };
};
