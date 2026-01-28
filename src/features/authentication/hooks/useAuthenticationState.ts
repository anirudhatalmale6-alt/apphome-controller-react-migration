/**
 * Authentication State Hook
 * Tracks login status, MFA flags, OTP steps, error states
 * Migrated from AppHomeController.js $scope authentication state
 */
import { useCallback, useEffect, useRef } from 'react';
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
 * Hook for managing authentication state and flow
 */
export const useAuthenticationState = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectAuth);
  const remoteKeyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
   * Step 1: Validate username
   */
  const handleValidateUser = useCallback(async (username: string) => {
    dispatch(setLoading(true));
    dispatch(resetAuthState());

    try {
      // Validate user exists
      const validateResult = await validateUser({ username }).unwrap();
      if (validateResult[0][0].result !== 'OK') {
        dispatch(setError('Unauthorized User Id'));
        return false;
      }

      // Validate onbase user
      const onbaseResult = await validateOnbaseUser({ username }).unwrap();
      if (onbaseResult[0][0].result !== 'Success') {
        dispatch(setError('Unauthorized User Id'));
        return false;
      }

      dispatch(setValidUser(true));

      // Check MFA
      const mfaResult = await checkMfa({ username }).unwrap();
      dispatch(setMfaEnabled(mfaResult.Status === 'YES'));

      dispatch(setLoading(false));
      return true;
    } catch {
      dispatch(setError('Unauthorized User Id'));
      return false;
    }
  }, [dispatch, validateUser, validateOnbaseUser, checkMfa]);

  /**
   * Get QR code for MFA setup
   */
  const handleGetQrCode = useCallback(async (username: string) => {
    try {
      const result = await getQrCode({ username }).unwrap();
      dispatch(setQrCode({ url: result.qrCodeUrl, secret: result.secret }));
    } catch {
      dispatch(setError('Failed to generate QR code'));
    }
  }, [dispatch, getQrCode]);

  /**
   * Verify TOTP code
   */
  const handleVerifyCode = useCallback(async (code: string, secret: string) => {
    try {
      const result = await verifyCode({ totpcode: code, key: secret }).unwrap();
      if (result.status === 'valid') {
        dispatch(setMfaVerified(true));
        dispatch(hideQrCode());
        return true;
      }
      dispatch(setError('Invalid code, please try again'));
      return false;
    } catch {
      dispatch(setError('Failed to verify code'));
      return false;
    }
  }, [dispatch, verifyCode]);

  /**
   * Step 2: Sign in with credentials
   */
  const handleSignIn = useCallback(async (username: string, password: string) => {
    dispatch(setLoading(true));

    try {
      const signInResult = await signIn({ username, password }).unwrap();

      // Check if login successful (has user_id)
      if (!signInResult[0]?.[0]?.user_id) {
        dispatch(setError('Username or Password is invalid!'));
        return false;
      }

      // Set login status
      const statusResult = await setLoginStatus({ username }).unwrap();

      // Handle successful login
      const user = signInResult[0][0] as SignInResponse;
      dispatch(loginSuccess({
        user,
        sessionId: statusResult[0][0].session_id,
        signedIpAddress: statusResult[1]?.[0]?.signed_ip_address || '',
      }));

      return user.role_homepage;
    } catch {
      dispatch(setError('Login failed. Please try again.'));
      return false;
    }
  }, [dispatch, signIn, setLoginStatus]);

  /**
   * Handle sign out
   */
  const handleSignOut = useCallback(async () => {
    if (authState.user?.user_login_id) {
      try {
        await signOutApi({ user_login_id: authState.user.user_login_id }).unwrap();
      } catch {
        // Continue with logout even if API fails
      }
    }
    dispatch(logout());
  }, [dispatch, signOutApi, authState.user]);

  /**
   * Start remote key timer
   */
  const startRemoteKeyTimer = useCallback((userName: string, ip: string) => {
    dispatch(showRemoteKeyPrompt({ userName, ip }));

    remoteKeyTimerRef.current = setInterval(() => {
      dispatch(updateRemoteKeyTimer(authState.remoteKeyTimer - 1));

      if (authState.remoteKeyTimer <= 1) {
        if (remoteKeyTimerRef.current) {
          clearInterval(remoteKeyTimerRef.current);
        }
        dispatch(hideRemoteKeyModal());
        dispatch(setError('Timeout: Remote key not entered. Login denied.'));
      }
    }, 1000);
  }, [dispatch, authState.remoteKeyTimer]);

  /**
   * Cancel remote key prompt
   */
  const cancelRemoteKeyPrompt = useCallback(() => {
    if (remoteKeyTimerRef.current) {
      clearInterval(remoteKeyTimerRef.current);
    }
    dispatch(hideRemoteKeyModal());
  }, [dispatch]);

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
    clearError: () => dispatch(setError(null)),
    resetState: () => dispatch(resetAuthState()),
  };
};
