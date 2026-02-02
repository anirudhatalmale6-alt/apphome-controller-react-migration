/**
 * ForgotPasswordView Component
 * Forgot-password initiation and OTP flow
 * Migrated from AppHomeController.js forgotPassword, verify_otp_to_proceed, updateProfiles
 *
 * Flow:
 * Step 1: Enter email -> Send OTP (email input page)
 * Step 2: OTP verification page (full page, not modal)
 * Step 3: Create new password (split layout with requirements)
 * Step 4: Success with "Back to Sign In" link
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePasswordValidation, useConfirmPassword } from '../hooks/usePasswordValidation';
import { encryptData, encryptPassword, decryptData, maskEmail } from '../../../lib/crypto';
import apiClient, { API_ENDPOINTS } from '../../../lib/api';

type Step = 'email' | 'otp' | 'newPassword' | 'success';

export const ForgotPasswordView: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Record<string, unknown> | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [email, setEmail] = useState('');

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
        headers: { 'X-Encrypt': 'false', 'Content-Type': 'text/plain' }
      });

      const data = decryptData<Array<Array<{ user_id?: string }>>>(response.data);

      if (data[0]?.[0]?.user_id) {
        setUserProfile(data[0][0]);
        setStep('otp'); // Move to OTP page instead of modal
      } else {
        setError('No account found with this email address.');
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
        headers: { 'X-Encrypt': 'false', 'Content-Type': 'text/plain' }
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
   * Resend OTP
   */
  const handleResendOtp = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setOtpValue('');

    try {
      const input = { user_login_id: email, otp_status: 0 };
      const encrypted = encryptData(input);

      await apiClient.post(API_ENDPOINTS.OTP_RECOVER_PASSWORD, encrypted, {
        headers: { 'X-Encrypt': 'false', 'Content-Type': 'text/plain' }
      });

      setError('OTP resent successfully. Please check your email.');
    } catch {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

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
        headers: { 'X-Encrypt': 'false', 'Content-Type': 'text/plain' }
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

  // Common left branding panel
  const LeftBrandingPanel = () => (
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
      <div className="p-4 text-xs text-gray-500">
        Copyright optusintelligence Inc &copy; {new Date().getFullYear()}
      </div>
    </div>
  );

  // Step 1: Email entry page
  if (step === 'email') {
    return (
      <div className="flex h-screen overflow-hidden">
        <LeftBrandingPanel />

        <div className="w-1/2 bg-white flex flex-col">
          <div className="text-center mt-[5%] mb-[3%]">
            <span className="text-xl text-gray-500">Access </span>
            <span className="text-2xl text-gray-500">
              <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
            </span>
          </div>

          <div className="text-center mb-4">
            <span className="text-[#9aaad1] text-lg">Forgot Password</span>
          </div>

          <div className="px-8 max-w-md mx-auto w-full">
            <p className="text-sm text-slate-600 mb-6">
              Please enter your registered email address:
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
              {isLoading ? 'Sending...' : 'Submit'}
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-[#9aaad1] underline hover:text-[#8a9ac1]"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: OTP verification page (full page, not modal)
  if (step === 'otp') {
    return (
      <div className="flex h-screen overflow-hidden">
        <LeftBrandingPanel />

        <div className="w-1/2 bg-white flex flex-col">
          <div className="text-center mt-[5%] mb-[3%]">
            <span className="text-xl text-gray-500">Access </span>
            <span className="text-2xl text-gray-500">
              <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
            </span>
          </div>

          <div className="text-center mb-4">
            <span className="text-[#9aaad1] text-lg">Verify OTP</span>
          </div>

          <div className="px-8 max-w-md mx-auto w-full">
            <p className="text-sm text-slate-600 mb-6">
              A One Time Password (OTP) has been sent to your Email ID{' '}
              <span className="text-blue-600 font-medium">{maskEmail(email)}</span>.
              Please verify and enter below.
            </p>

            {error && (
              <div className={`mb-4 p-3 rounded text-sm ${
                error.includes('success')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Enter OTP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 border-b border-dotted border-gray-300 focus:border-[#9aaad1] outline-none bg-transparent text-center text-xl tracking-widest"
                placeholder="------"
                maxLength={6}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('email'); setOtpValue(''); setError(null); }}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={isLoading || !otpValue}
                className="flex-1 py-2 bg-[#9aaad1] text-white rounded hover:bg-[#8a9ac1] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <span className="text-sm text-gray-500">Didn't receive the code? </span>
              <button
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-sm text-[#9aaad1] underline hover:text-[#8a9ac1] disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-500 underline hover:text-gray-700"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: New password page (split layout with requirements)
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
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>Only English single-byte characters allowed (no double-byte, Unicode, emojis, or non-English scripts).</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2">•</span>Password must combine at least 3 of the 4 character types: uppercase, lowercase, number, special character.</li>
              </ul>
            </div>
          </div>
          <div className="p-4 text-xs text-gray-500">
            Copyright optusintelligence Inc &copy; {new Date().getFullYear()}
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-1/2 bg-white flex flex-col">
          <div className="text-center mt-[5%] mb-[3%]">
            <span className="text-xl text-gray-500">Access </span>
            <span className="text-2xl text-gray-500">
              <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
            </span>
          </div>

          <div className="text-center mb-4">
            <span className="text-[#9aaad1] text-lg">Create New Password</span>
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

  // Step 4: Success page
  if (step === 'success') {
    return (
      <div className="flex h-screen overflow-hidden">
        <LeftBrandingPanel />

        <div className="w-1/2 bg-white flex flex-col">
          <div className="text-center mt-[5%] mb-[3%]">
            <span className="text-xl text-gray-500">Access </span>
            <span className="text-2xl text-gray-500">
              <b className="text-slate-600"><span className="text-[#4a4a4a]">one</span>base</b>
            </span>
          </div>

          <div className="text-center mb-4">
            <span className="text-[#9aaad1] text-lg">Password Updated</span>
          </div>

          <div className="px-8 max-w-md mx-auto w-full text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-700 font-medium">Your password has been changed successfully!</p>
            </div>

            <button
              onClick={() => navigate('/')}
              className="px-8 py-2 bg-[#9aaad1] text-white rounded hover:bg-[#8a9ac1] transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ForgotPasswordView;
