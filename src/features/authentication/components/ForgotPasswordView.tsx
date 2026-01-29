/**
 * ForgotPasswordView Component
 * Forgot-password initiation and OTP flow
 * Migrated from AppHomeController.js forgotPassword, verify_otp_to_proceed, updateProfiles
 * Origin: $scope.signPageNumber flow (1->2->3->4)
 *
 * UI: Split-screen layout matching original AngularJS design
 * Left: Password requirements (when in newPassword step)
 * Right: Form
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePasswordValidation, useConfirmPassword } from '../hooks/usePasswordValidation';
import { encryptData, encryptPassword, decryptData, maskEmail } from '../../../lib/crypto';
import apiClient, { API_ENDPOINTS } from '../../../lib/api';

type Step = 'email' | 'otp' | 'newPassword' | 'success';

/**
 * Forgot password multi-step flow
 * Step 1: Enter email -> Send OTP
 * Step 2: Verify OTP (popup style)
 * Step 3: Set new password (split layout)
 * Step 4: Success
 */
export const ForgotPasswordView: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Record<string, unknown> | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [email, setEmail] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

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
    if (!email.trim()) return;

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
        setShowOtpModal(true);
      } else {
        setError('No account found with this email address');
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  /**
   * Step 2: Verify OTP
   */
  const handleVerifyOtp = useCallback(async () => {
    if (otpValue.length < 4) {
      setError('Please enter a valid OTP');
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
        setShowOtpModal(false);
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

  // Render email step (simple form)
  if (step === 'email') {
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Left Panel - Branding */}
        <div className="w-1/2 bg-[#e2e2e2] flex flex-col">
          <div className="p-5">
            <span className="text-xl text-slate-500">
              <b className="text-[#4a4a4a]">optus</b> intelligence
            </span>
          </div>
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

        {/* Right Panel - Form */}
        <div className="w-1/2 bg-white flex flex-col">
          <div className="text-center mt-[5%] mb-[5%]">
            <span className="text-xl text-gray-500">Access </span>
            <span className="text-2xl text-gray-500">
              <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
            </span>
          </div>

          <div className="text-center mb-4">
            <span className="text-[#9aaad1] text-lg">Log in to continue</span>
          </div>

          <div className="px-8 max-w-md mx-auto w-full">
            <p className="text-sm text-slate-600 mb-6">
              Enter your email address to receive a verification code
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border-b border-dotted border-gray-300 focus:border-[#9aaad1] outline-none bg-transparent"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleRequestOtp}
              disabled={isLoading || !email}
              className="w-full py-2 bg-[#9aaad1] text-white rounded hover:bg-[#8a9ac1] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-xs text-gray-600 underline hover:text-gray-800"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>

        {/* OTP Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
              <div className="text-center mb-4">
                <span className="text-xl text-gray-500">Access </span>
                <span className="text-xl text-gray-500">
                  <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
                </span>
              </div>

              <div className="text-center mb-4">
                <span className="text-[#9aaad1] text-sm">Log in to continue</span>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                A One Time Password(OTP) has been sent to your Email ID{' '}
                <span className="text-blue-600">{maskEmail(email)}</span>. Please verify and enter below
              </p>

              {error && (
                <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                  {error}
                </div>
              )}

              <input
                type="text"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 border-b border-dotted border-gray-300 focus:border-[#9aaad1] outline-none bg-transparent mb-4"
                placeholder="Enter OTP"
                disabled={isLoading}
              />

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowOtpModal(false); setOtpValue(''); setError(null); }}
                  className="px-4 py-1.5 bg-pink-500 text-white text-sm rounded hover:bg-pink-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || !otpValue}
                  className="px-4 py-1.5 bg-[#9aaad1] text-white text-sm rounded hover:bg-[#8a9ac1] transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 w-1/2 p-4 text-xs text-gray-500">
          Copyright optusintelligence Inc &copy; {new Date().getFullYear()}
        </div>
      </div>
    );
  }

  // Render new password step (split layout with requirements)
  if (step === 'newPassword') {
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Left Panel - Password Requirements */}
        <div className="w-1/2 bg-gradient-to-b from-[#f0f4f8] to-white border-r border-gray-200 flex flex-col">
          <div className="p-5">
            <span className="text-xl text-slate-500">
              <b className="text-[#4a4a4a]">optus</b> intelligence
            </span>
          </div>

          <div className="px-8 py-4">
            <h1 className="text-xl font-medium text-gray-800 text-center mb-4">Create New Password</h1>
            <p className="text-sm text-gray-600 text-center mb-6">
              Enter a strong, unique password to secure your account.
            </p>

            <div className="bg-white rounded-lg p-6">
              <h2 className="font-medium text-gray-800 mb-4">Password Requirements</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>Password must be exactly 8 characters long.</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>One uppercase letter (A–Z)</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>One lowercase letter (a–z)</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>One number (0–9)</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>One special character (e.g., !@#$%^&*)</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>No predictable patterns (e.g., 123, 321, abc, xyz, qwerty, asdf, aaa, 111).</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>No common or weak words (e.g., password, welcome, admin, guest).</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>No guessable formats (e.g., Name@123, User@2024).</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>No personal information (username, name, or date of birth).</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>No years or date patterns (e.g., 1990, 2024).</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>No email addresses inside the password.</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>Only English single-byte characters allowed.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-1/2 bg-white flex flex-col">
          <div className="text-center mt-[5%] mb-[5%]">
            <span className="text-xl text-gray-500">Access </span>
            <span className="text-2xl text-gray-500">
              <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
            </span>
          </div>

          <div className="px-8 max-w-md mx-auto w-full">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full px-3 py-2 border-b border-dotted border-gray-300 focus:border-[#9aaad1] outline-none bg-transparent"
                maxLength={8}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center mt-1">
                {passwordError && <span className="text-xs text-red-500">{passwordError}</span>}
                {password && (
                  <span className={`text-xs ml-auto ${
                    strength.score === 1 ? 'text-red-500' :
                    strength.score === 2 ? 'text-orange-500' :
                    strength.score === 3 ? 'text-green-500' : 'text-orange-500'
                  }`}>
                    {strength.label}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border-b border-dotted border-gray-300 focus:border-[#9aaad1] outline-none bg-transparent"
                maxLength={8}
                disabled={isLoading}
              />
              {confirmError && <p className="text-xs text-red-500 mt-1">{confirmError}</p>}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUpdatePassword}
                disabled={isLoading || !isMatch || strength.score < 3 || !!passwordError}
                className="px-8 py-2 bg-[#9aaad1] text-white rounded hover:bg-[#8a9ac1] transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render success step
  if (step === 'success') {
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Left Panel - Branding */}
        <div className="w-1/2 bg-[#e2e2e2] flex flex-col">
          <div className="p-5">
            <span className="text-xl text-slate-500">
              <b className="text-[#4a4a4a]">optus</b> intelligence
            </span>
          </div>
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

        {/* Right Panel - Success */}
        <div className="w-1/2 bg-white flex flex-col">
          <div className="text-center mt-[5%] mb-[5%]">
            <span className="text-xl text-gray-500">Access </span>
            <span className="text-2xl text-gray-500">
              <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
            </span>
          </div>

          <div className="text-center mb-4">
            <span className="text-[#9aaad1] text-lg">Log in to continue</span>
          </div>

          <div className="px-8 max-w-md mx-auto w-full text-center">
            <div className="flex items-center justify-center text-sm text-slate-600 mb-4">
              <span className="text-blue-500 mr-2">ℹ</span>
              Your password has been changed{' '}
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-700 ml-1"
              >
                Sign in Now
              </button>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-1/2 p-4 text-xs text-gray-500">
          Copyright optusintelligence Inc &copy; {new Date().getFullYear()}
        </div>
      </div>
    );
  }

  return null;
};

export default ForgotPasswordView;
