/**
 * RemoteKeyVerificationView Component
 * Remote key verification for concurrent login conflicts
 * Migrated from AppHomeController.js $scope.showRemoteKeyModal flow
 * Origin: askRemoteKey, verifyRemoteKey, cancelRemoteKey
 */
import { useCallback } from 'react';
import { useAuthenticationState } from '../hooks/useAuthenticationState';

interface RemoteKeyVerificationViewProps {
  /** Callback when verification succeeds */
  onSuccess?: () => void;
}

/**
 * Modal dialog for remote key verification
 * Displayed when user is logged in on another device
 */
export const RemoteKeyVerificationView: React.FC<RemoteKeyVerificationViewProps> = ({
  onSuccess,
}) => {
  const {
    showRemoteKeyModal,
    remoteKeyTimer,
    conflictUserName,
    conflictUserIp,
    cancelRemoteKeyPrompt,
  } = useAuthenticationState();

  const [remoteKey, setRemoteKey] = React.useState('');

  const handleVerify = useCallback(async () => {
    if (!remoteKey) return;
    // Verification logic would go here
    // For now, this is a placeholder
    onSuccess?.();
  }, [remoteKey, onSuccess]);

  if (!showRemoteKeyModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-slideIn">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Already Logged In</h2>
          <p className="text-gray-600 mt-2 text-sm">
            User <span className="font-medium">{conflictUserName}</span> is logged in on another system
            (<span className="font-medium">{conflictUserIp}</span>).
          </p>
          <p className="text-gray-600 mt-1 text-sm">
            Enter remote key to continue:
          </p>
        </div>

        {/* Timer */}
        <div className="mb-4 text-center">
          <span className={`text-lg font-mono ${remoteKeyTimer <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
            {remoteKeyTimer}s remaining
          </span>
        </div>

        {/* Remote Key Input */}
        <div className="mb-6">
          <input
            type="text"
            value={remoteKey}
            onChange={(e) => setRemoteKey(e.target.value)}
            placeholder="Enter remote key"
            className="input-field text-center"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={cancelRemoteKeyPrompt}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={!remoteKey}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

// Import React for useState
import React from 'react';

export default RemoteKeyVerificationView;
