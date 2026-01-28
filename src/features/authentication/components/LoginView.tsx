/**
 * LoginView Component
 * Username/password sign-in orchestration with MFA support
 * Migrated from AppHomeController.js login flow
 * Origin: $scope.signInPageShow, SignInToOnebase, validateUser
 */
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { signInSchema, type SignInFormData } from '../schemas/AuthenticationSchemas';
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

  const [step, setStep] = useState<'username' | 'password'>('username');
  const [totpCode, setTotpCode] = useState('');

  const { register, handleSubmit, formState: { errors }, watch, getValues } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
  });

  const username = watch('username');

  // Step 1: Validate username
  const handleUsernameSubmit = useCallback(async () => {
    clearError();
    const isValid = await validateUser(getValues('username'));
    if (isValid) {
      setStep('password');
    }
  }, [validateUser, getValues, clearError]);

  // Handle edit username (go back to step 1)
  const handleEditUsername = useCallback(() => {
    resetState();
    setStep('username');
    setTotpCode('');
  }, [resetState]);

  // Get QR code for MFA setup
  const handleGetQrCode = useCallback(() => {
    getQrCode(getValues('username'));
  }, [getQrCode, getValues]);

  // Verify TOTP code
  const handleVerifyTotp = useCallback(async () => {
    if (secretKey && totpCode) {
      await verifyCode(totpCode, secretKey);
    }
  }, [verifyCode, secretKey, totpCode]);

  // Step 2: Sign in with password
  const onSubmit = useCallback(async (data: SignInFormData) => {
    const homepage = await signIn(data.username, data.password);
    if (homepage) {
      navigate(`/${homepage}`);
    }
  }, [signIn, navigate]);

  // Check if can proceed to sign in
  const canSignIn = !isMfaEnabled || isMfaVerified;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600 mt-2">Enter your credentials to continue</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Email / Username
            </label>
            {step === 'username' ? (
              <input
                {...register('username')}
                type="email"
                id="username"
                className="input-field"
                placeholder="Enter your email"
                autoComplete="username"
                disabled={isLoading}
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-gray-100 rounded text-gray-700">
                  {getValues('username')}
                </span>
                <button
                  type="button"
                  onClick={handleEditUsername}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Edit
                </button>
              </div>
            )}
            {errors.username && (
              <p className="error-text">{errors.username.message}</p>
            )}
          </div>

          {/* Step 1: Validate Username Button */}
          {step === 'username' && (
            <button
              type="button"
              onClick={handleUsernameSubmit}
              disabled={isLoading || !username}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Validating...' : 'Continue'}
            </button>
          )}

          {/* Step 2: Password & MFA */}
          {step === 'password' && isValidUser && (
            <>
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  id="password"
                  className="input-field"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="error-text">{errors.password.message}</p>
                )}
              </div>

              {/* MFA Section */}
              {isMfaEnabled && !isMfaVerified && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Two-factor authentication is required
                  </p>

                  {!showQrCode ? (
                    <button
                      type="button"
                      onClick={handleGetQrCode}
                      className="btn-secondary w-full"
                    >
                      Show QR Code
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {qrCodeUrl && (
                        <div className="flex justify-center">
                          <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                        </div>
                      )}
                      <input
                        type="text"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="input-field text-center tracking-widest"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyTotp}
                        disabled={totpCode.length !== 6}
                        className="btn-secondary w-full"
                      >
                        Verify Code
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading || !canSignIn}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}
        </form>

        {/* Learn More Link */}
        <div className="mt-6 text-center">
          <a
            href="https://optusintelligence.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Learn more about Optus Intelligence
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
