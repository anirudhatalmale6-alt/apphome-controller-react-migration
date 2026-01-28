/**
 * UserProfileView Component
 * Change-password and profile update workflows
 * Migrated from AppHomeController.js changePassword, ChangePassword.html
 */
import { useState, useCallback } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { selectUser } from '../../authentication/store/authSlice';
import { usePasswordValidation, useConfirmPassword } from '../../authentication/hooks/usePasswordValidation';
import { PasswordStrengthIndicator, PasswordRequirements } from '../../authentication/components/PasswordStrengthIndicator';
import { convertToPartialDots } from '../../../lib/crypto';
import {
  useUpdateUserProfileMutation,
  useRequestOtpForPasswordChangeMutation,
  useVerifyOtpForProfileUpdateMutation,
} from '../api/userProfileApi';

type PasswordChangeStep = 1 | 2 | 3;

/**
 * User profile view with password change functionality
 */
export const UserProfileView: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const user = useAppSelector(selectUser);
  const [step, setStep] = useState<PasswordChangeStep>(1);
  const [otpValue, setOtpValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpForPasswordChangeMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpForProfileUpdateMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

  const {
    password,
    setPassword,
    strength,
    error: passwordError,
    validate: validatePassword,
  } = usePasswordValidation({ context: { email: user?.user_login_id } });

  const { confirmPassword, setConfirmPassword, error: confirmError, isMatch } = useConfirmPassword(password);

  const isLoading = isRequestingOtp || isVerifyingOtp || isUpdating;

  // Step 1: Request OTP
  const handleRequestOtp = useCallback(async () => {
    if (!user) return;
    setError(null);

    try {
      const result = await requestOtp({
        user_login_id: user.user_login_id,
        sp_process_id: user.sp_process_id,
      }).unwrap();

      if (result[0]?.[0]?.result === 'Success') {
        setStep(2);
      } else {
        setError('Failed to send OTP');
      }
    } catch {
      setError('Failed to send OTP');
    }
  }, [user, requestOtp]);

  // Step 2: Verify OTP
  const handleVerifyOtp = useCallback(async () => {
    if (!user || otpValue.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }
    setError(null);

    try {
      const result = await verifyOtp({
        user_login_id: user.user_login_id,
        otp_value: otpValue,
      }).unwrap();

      if (result[0]?.[0]?.user_id) {
        setStep(3);
      } else {
        setError('Invalid OTP');
      }
    } catch {
      setError('Failed to verify OTP');
    }
  }, [user, otpValue, verifyOtp]);

  // Step 3: Update password
  const handleUpdatePassword = useCallback(async () => {
    if (!user || !validatePassword() || !isMatch) {
      if (!isMatch) setError('Passwords do not match');
      return;
    }
    setError(null);

    try {
      const result = await updateProfile({
        ...user,
        newPassword: password,
        otpValue,
      }).unwrap();

      if (result[0]?.[0]?.user_id) {
        setSuccess(true);
      } else {
        setError('Failed to update password');
      }
    } catch {
      setError('Failed to update password');
    }
  }, [user, password, otpValue, isMatch, validatePassword, updateProfile]);

  if (!user) return null;

  if (success) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Password Changed Successfully</h3>
        <button onClick={onClose} className="btn-primary mt-4">Close</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Change Password</h2>

      {/* User Info */}
      <div className="mb-6 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-500">Logged in as:</p>
        <p className="font-medium">{convertToPartialDots(user.user_login_id)}</p>
      </div>

      {/* Error */}
      {(error || passwordError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error || passwordError}
        </div>
      )}

      {/* Step 1: Request OTP */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            To change your password, we'll send a verification code to your email.
          </p>
          <button onClick={handleRequestOtp} disabled={isLoading} className="w-full btn-primary disabled:opacity-50">
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </div>
      )}

      {/* Step 2: Enter OTP */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
            <input
              type="text"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input-field text-center tracking-widest"
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
            />
          </div>
          <button onClick={handleVerifyOtp} disabled={isLoading || otpValue.length !== 6} className="w-full btn-primary disabled:opacity-50">
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button onClick={() => setStep(1)} className="w-full btn-secondary">Back</button>
        </div>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter new password"
              maxLength={8}
              disabled={isLoading}
            />
            <PasswordStrengthIndicator strength={strength} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Confirm password"
              maxLength={8}
              disabled={isLoading}
            />
            {confirmError && <p className="error-text">{confirmError}</p>}
          </div>
          <PasswordRequirements />
          <button onClick={handleUpdatePassword} disabled={isLoading || !isMatch || strength.score < 3} className="w-full btn-primary disabled:opacity-50">
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      )}

      {/* Cancel */}
      <button onClick={onClose} className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm">
        Cancel
      </button>
    </div>
  );
};

export default UserProfileView;
