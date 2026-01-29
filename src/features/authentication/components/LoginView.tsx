/**
 * LoginView Component
 * Username/password sign-in orchestration with MFA support
 * Migrated from AppHomeController.js login flow
 * Origin: $scope.signInPageShow, SignInToOnebase, validateUser
 *
 * UI: Split-screen layout matching original AngularJS design
 * Left: Optus Intelligence branding
 * Right: Access onebase login form
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticationState } from '../hooks/useAuthenticationState';

/**
 * Main login view component
 * Handles two-step login: 1) Username validation, 2) Password entry + MFA
 */
export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    error,
    isValidUser,
    isMfaEnabled,
    isMfaVerified,
    showQrCode,
    qrCodeUrl,
    secretKey,
    validateUser,
    signIn,
    getQrCode,
    verifyCode,
    clearError,
    resetState,
  } = useAuthenticationState();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showUnauthorizedError, setShowUnauthorizedError] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Step 1: Validate username
  const handleValidateUser = useCallback(async () => {
    if (!username.trim()) return;

    clearError();
    setShowUnauthorizedError(false);

    const isValid = await validateUser(username);
    if (isValid) {
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } else {
      setShowUnauthorizedError(true);
    }
  }, [validateUser, username, clearError]);

  // Handle edit username (go back to step 1)
  const handleEditUsername = useCallback(() => {
    resetState();
    setPassword('');
    setTotpCode('');
    setAgreeToTerms(false);
    setShowUnauthorizedError(false);
  }, [resetState]);

  // Get QR code for MFA setup
  const handleGetQrCode = useCallback(() => {
    getQrCode(username);
  }, [getQrCode, username]);

  // Verify TOTP code
  const handleVerifyTotp = useCallback(async () => {
    if (secretKey && totpCode) {
      await verifyCode(totpCode, secretKey);
    }
  }, [verifyCode, secretKey, totpCode]);

  // Step 2: Sign in with password
  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) return;

    const homepage = await signIn(username, password);
    if (homepage) {
      navigate(`/${homepage}`);
    }
  }, [signIn, username, password, agreeToTerms, navigate]);

  // Check if can proceed to sign in
  const canSignIn = agreeToTerms && (!isMfaEnabled || isMfaVerified);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="w-1/2 bg-[#e2e2e2] flex flex-col">
        {/* Logo */}
        <div className="p-5">
          <span className="text-xl text-slate-500">
            <b className="text-[#4a4a4a]">optus</b> intelligence
          </span>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <h2 className="text-2xl text-gray-500 mb-2">
            Automate with <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
          </h2>
          <p className="text-xl text-gray-500 mb-24">
            Steamline, Scale any business process
          </p>

          <div className="self-end mr-8">
            <button
              className="px-6 py-2 bg-[#9aaad1] text-white rounded hover:bg-[#8a9ac1] transition-colors"
              onClick={() => window.open('https://optusintelligence.com', '_blank')}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-1/2 bg-white flex flex-col">
        {/* Header */}
        <div className="text-center mt-[5%] mb-[5%]">
          <span className="text-xl text-gray-500">Access </span>
          <span className="text-2xl text-gray-500">
            <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
          </span>
        </div>

        <div className="text-center mb-4">
          <span className="text-[#9aaad1] text-lg">Log in to continue</span>
        </div>

        {/* Toast Notifications */}
        {showSuccessToast && (
          <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-2 z-50 animate-fadeIn">
            <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="text-gray-700">Valid User Id</span>
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-white border border-red-200 rounded-lg shadow-lg p-4 flex items-center gap-2 z-50 animate-fadeIn">
            <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
            <span className="text-gray-700">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <div className="px-8">
          <form onSubmit={handleSignIn}>
            {/* Username Field */}
            <div className="mb-4 mx-auto max-w-md">
              <label className="block text-sm text-gray-600 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isValidUser}
                  className="w-full px-3 py-2 border-b border-dotted border-gray-300 focus:border-[#9aaad1] outline-none bg-transparent disabled:bg-gray-50"
                  placeholder=""
                />
                {isValidUser && (
                  <button
                    type="button"
                    onClick={handleEditUsername}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Forgot Username & Continue */}
              {!isValidUser && (
                <div className="flex justify-between items-center mt-2">
                  <div>
                    {showUnauthorizedError && (
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); navigate('/forgot-username'); }}
                        className="text-xs text-gray-600 underline hover:text-gray-800"
                      >
                        Forgot Username?
                      </a>
                    )}
                  </div>
                  <div>
                    {username.length > 0 && (
                      <button
                        type="button"
                        onClick={handleValidateUser}
                        disabled={isLoading}
                        className="px-4 py-1.5 bg-[#9aaad1] text-white text-sm rounded hover:bg-[#8a9ac1] transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Validating...' : 'Continue'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Password Field - Only shown after valid username */}
            {isValidUser && (
              <>
                <div className="mb-4 mx-auto max-w-md">
                  <label className="block text-sm text-gray-600 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border-b border-dotted border-gray-300 focus:border-[#9aaad1] outline-none bg-transparent"
                    autoComplete="current-password"
                  />
                </div>

                {/* MFA TOTP Field */}
                {isMfaEnabled && (
                  <div className="mb-4 mx-auto max-w-md">
                    <label className="block text-sm text-gray-600 mb-1">
                      Enter TOTP code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        className="w-full px-3 py-2 border-b border-dotted border-gray-300 focus:border-[#9aaad1] outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyTotp}
                        disabled={totpCode.length !== 6}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700 disabled:text-gray-400"
                        title="Verify TOTP Code"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleGetQrCode(); }}
                      className="text-xs text-gray-600 underline hover:text-gray-800 mt-1 inline-block"
                    >
                      click to get QR-code for App Registration
                    </a>

                    {/* QR Code Display */}
                    {showQrCode && qrCodeUrl && (
                      <div className="mt-4 flex justify-center">
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                      </div>
                    )}
                  </div>
                )}

                {/* Privacy Policy Checkbox */}
                <div className="mb-4 mx-auto max-w-md">
                  <label className="flex items-center text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mr-2"
                    />
                    I accept to optus intelligence{' '}
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); window.open('/privacy-policy', 'popup', 'width=600,height=600'); }}
                      className="text-blue-600 hover:text-blue-700 ml-1"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Login Button */}
                <div className="mb-4 mx-auto max-w-md">
                  <button
                    type="submit"
                    disabled={isLoading || !canSignIn || !password}
                    className="w-full py-2 bg-[#9aaad1] text-white rounded hover:bg-[#8a9ac1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Signing In...
                      </span>
                    ) : 'Login'}
                  </button>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right mx-auto max-w-md mb-4">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
                    className="text-xs text-gray-600 underline hover:text-gray-800"
                  >
                    Forgot Password?
                  </a>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-1/2 p-4 text-xs text-gray-500">
        Copyright optusintelligence Inc &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default LoginView;
