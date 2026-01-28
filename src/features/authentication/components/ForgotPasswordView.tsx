/**
 * ForgotPasswordView Component
 * Forgot-password initiation and OTP flow
 * Migrated from AppHomeController.js forgotPassword, verify_otp_to_proceed, updateProfiles
 * Origin: $scope.signPageNumber flow (1->2->3->4)
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePasswordValidation, useConfirmPassword, useEmailValidation } from '../hooks/usePasswordValidation';
import { PasswordStrengthIndicator, PasswordRequirements } from './PasswordStrengthIndicator';
import { encryptData, encryptPassword, decryptData, maskEmail } from '../../../lib/crypto';
import apiClient, { API_ENDPOINTS } from '../../../lib/api';

type Step = 'email' | 'otp' | 'newPassword' | 'success';

/**
 * Forgot password multi-step flow
 * Step 1: Enter email -> Send OTP
 * Step 2: Verify OTP
 * Step 3: Set new password
 * Step 4: Success
 */
export const ForgotPasswordView: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Record<string, unknown> | null>(null);
  const [otpValue, setOtpValue] = useState('');

  const { email, setEmail, error: emailError, validate: validateEmail } = useEmailValidation();

  const {
    password,
    setPassword: handlePasswordChange,
    strength,
    error: passwordError,
    validate: validatePassword,
  } = usePasswordValidation({ context: { email } });

  const { confirmPassword, setConfirmPassword, error: confirmError, isMatch } = useConfirmPassword(password);

  /**
   * Step 1: Request OTP for password recovery
   */
  const handleRequestOtp = useCallback(async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    setError(null);

    try {
      const input = { user_login_id: email, otp_status: 0 };
      const encrypted = encryptData(input);

      const response = await apiClient.post(API_ENDPOINTS.OTP_RECOVER_PASSWORD, encrypted, {
        headers: { 'X-Encrypt': 'false' }
      });

      const data = decryptData<Array<Array<{ user_id?: string }>>>(response.data);

      if (data[0]?.[0]?.user_id) {
        setUserProfile(data[0][0]);
        setStep('otp');
      } else {
        setError('No account found with this email address');
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, validateEmail]);

  /**
   * Step 2: Verify OTP
   */
  const handleVerifyOtp = useCallback(async () => {
    if (otpValue.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const input = { user_login_id: email, otp_value: otpValue };
      const encrypted = encryptData(input);

      const response = await apiClient.post(API_ENDPOINTS.VERIFY_OTP, encrypted, {
        headers: { 'X-Encrypt': 'false' }
      });

      const data = decryptData<Array<Array<{ user_id?: string }>>>(response.data);

      if (data[0]?.[0]?.user_id) {
        setStep('newPassword');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, otpValue]);

  /**
   * Step 3: Update password
   */
  const handleUpdatePassword = useCallback(async () => {
    if (!validatePassword() || !isMatch) {
      if (!isMatch) setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const input = {
        ...userProfile,
        newPassword: encryptPassword(password),
        otpValue,
      };
      const encrypted = encryptData(input);

      const response = await apiClient.post(API_ENDPOINTS.UPDATE_USER_PROFILE, encrypted, {
        headers: { 'X-Encrypt': 'false' }
      });

      const data = decryptData<Array<Array<{ user_id?: string }>>>(response.data);

      if (data[0]?.[0]?.user_id) {
        setStep('success');
      } else {
        setError('Failed to update password. Please try again.');
      }
    } catch {
      setError('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, password, otpValue, isMatch, validatePassword]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'success' ? 'Password Changed' : 'Forgot Password'}
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 'email' && 'Enter your email to receive a verification code'}
            {step === 'otp' && `Enter the code sent to ${maskEmail(email)}`}
            {step === 'newPassword' && 'Create your new password'}
            {step === 'success' && 'Your password has been updated successfully'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 'email' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {emailError && <p className="error-text">{emailError}</p>}
            </div>
            <button
              onClick={handleRequestOtp}
              disabled={isLoading || !email}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center tracking-widest text-lg"
                placeholder="000000"
                disabled={isLoading}
                maxLength={6}
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={isLoading || otpValue.length !== 6}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button onClick={() => setStep('email')} className="w-full btn-secondary">
              Back
            </button>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 'newPassword' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="input-field"
                placeholder="Enter new password"
                maxLength={8}
                disabled={isLoading}
              />
              <PasswordStrengthIndicator strength={strength} />
              {passwordError && <p className="error-text">{passwordError}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Confirm new password"
                maxLength={8}
                disabled={isLoading}
              />
              {confirmError && <p className="error-text">{confirmError}</p>}
            </div>
            <PasswordRequirements />
            <button
              onClick={handleUpdatePassword}
              disabled={isLoading || !isMatch || strength.score < 3}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <button onClick={() => navigate('/')} className="w-full btn-primary">
              Back to Sign In
            </button>
          </div>
        )}

        {/* Back to Login Link */}
        {step !== 'success' && (
          <div className="mt-6 text-center">
            <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-700 text-sm">
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordView;
