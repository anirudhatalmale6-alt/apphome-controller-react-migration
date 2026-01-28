/**
 * Password Strength Indicator Component
 * Visual feedback for password strength
 * Migrated from AppHomeController.js getStrength function display
 */
import type { PasswordStrength } from '../services/PasswordPolicyService';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  showLabel?: boolean;
}

/**
 * Displays password strength as a visual bar with optional label
 */
export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  strength,
  showLabel = true,
}) => {
  const { score, label } = strength;

  // Determine bar width and color based on score
  const getBarStyle = () => {
    switch (score) {
      case 0:
        return { width: '0%', className: 'bg-gray-300' };
      case 1:
        return { width: '33%', className: 'bg-red-500' };
      case 2:
        return { width: '66%', className: 'bg-yellow-500' };
      case 3:
        return { width: '100%', className: 'bg-green-500' };
      default:
        return { width: '0%', className: 'bg-gray-300' };
    }
  };

  const barStyle = getBarStyle();

  // Determine label color
  const getLabelColor = () => {
    switch (label) {
      case 'Weak':
        return 'text-red-500';
      case 'Medium':
        return 'text-yellow-600';
      case 'Strong':
        return 'text-green-500';
      case 'Invalid length':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="mt-2">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${barStyle.className}`}
          style={{ width: barStyle.width }}
        />
      </div>

      {/* Label */}
      {showLabel && label && (
        <p className={`text-xs mt-1 ${getLabelColor()}`}>
          {label}
        </p>
      )}
    </div>
  );
};

/**
 * Password requirements list component
 */
export const PasswordRequirements: React.FC = () => (
  <div className="mt-3 text-xs text-gray-500">
    <p className="font-medium mb-1">Password must:</p>
    <ul className="list-disc list-inside space-y-0.5">
      <li>Be exactly 8 characters</li>
      <li>Include at least 3 of: uppercase, lowercase, number, special character</li>
      <li>Not contain common words or patterns</li>
      <li>Not include your name or email</li>
    </ul>
  </div>
);

export default PasswordStrengthIndicator;
