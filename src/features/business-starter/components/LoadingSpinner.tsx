/**
 * Loading Spinner Component
 * Reusable loading indicator
 * Origin: BusinessStarterPage.html - spinner elements
 */
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        {message && <p>{message}</p>}
      </div>
    );
  }

  return (
    <div className="loading-container-inline">
      <div className="spinner" />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
