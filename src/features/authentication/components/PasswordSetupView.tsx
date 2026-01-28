/**
 * PasswordSetupView Component
 * New-user password creation from URL parameters
 * Migrated from AppHomeController.js $scope.showNewPassword flow
 * Origin: submitNewPassword, URL param handling for newUser
 */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetPasswordMutation } from '../api/authenticationApi';
import { getPasswordSetupParams, clearPasswordSetupParams } from '../services/AuthenticationFlowService';
import { usePasswordValidation, useConfirmPassword } from '../hooks/usePasswordValidation';
import { PasswordStrengthIndicator, PasswordRequirements } from './PasswordStrengthIndicator';

/**
 * Password setup view for new users
 * Accessed via URL params: ?username=xxx&userType=newUser
 */
export const PasswordSetupView: React.FC = () => {
  const navigate = useNavigate();
  const [setPassword, { isLoading }] = useSetPasswordMutation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    password,
    setPassword: handlePasswordChange,
    strength,
    error: passwordError,
    validate: validatePassword,
  } = usePasswordValidation();

  const {
    confirmPassword,
    setConfirmPassword,
    error: confirmError,
    isMatch,
  } = useConfirmPassword(password);

  // Get username from URL params
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const params = getPasswordSetupParams();
    if (params) {
      setUsername(params.username);
    } else {
      // No valid params, redirect to login
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password
    if (!validatePassword()) {
      return;
    }

    // Check password match
    if (!isMatch) {
      setError('Passwords do not match');
      return;
    }

    try {
      const result = await setPassword({ userName: username, password }).unwrap();

      if (result[0]?.[0]?.result === 'Success' || result) {
        setSuccess(true);
        clearPasswordSetupParams();

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError('Password setup failed. Please try again.');
      }
    } catch {
      setError('Failed to set password. Please try again.');
    }
  }, [username, password, isMatch, validatePassword, setPassword, navigate]);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Password Set Successfully</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Set Your Password</h1>
          <p className="text-gray-600 mt-2">Create a secure password for your account</p>
        </div>

        {/* Username Display */}
        <div className="mb-6 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Setting password for:</p>
          <p className="font-medium text-gray-900">{username}</p>
        </div>

        {/* Error Display */}
        {(error || passwordError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error || passwordError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="input-field"
              placeholder="Enter new password"
              disabled={isLoading}
              maxLength={8}
            />
            <PasswordStrengthIndicator strength={strength} />
          </div>

          {/* Confirm Password */}
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
              disabled={isLoading}
              maxLength={8}
            />
            {confirmError && <p className="error-text">{confirmError}</p>}
          </div>

          {/* Password Requirements */}
          <PasswordRequirements />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isMatch || strength.score < 3}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordSetupView;
