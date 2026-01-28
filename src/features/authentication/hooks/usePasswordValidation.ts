/**
 * Password Validation Hook
 * Password strength, pattern, and policy validation
 * Migrated from AppHomeController.js password validation rules
 */
import { useState, useCallback, useMemo } from 'react';
import {
  validatePassword,
  getPasswordStrength,
  isValidEmail,
  type PasswordStrength,
  type ValidationContext
} from '../services/PasswordPolicyService';

interface UsePasswordValidationOptions {
  /** User context for preventing personal info in password */
  context?: ValidationContext;
  /** Whether to validate on change */
  validateOnChange?: boolean;
}

interface UsePasswordValidationReturn {
  /** Current password value */
  password: string;
  /** Set password value */
  setPassword: (value: string) => void;
  /** Validation error message */
  error: string | null;
  /** Password strength */
  strength: PasswordStrength;
  /** Whether password is valid */
  isValid: boolean;
  /** Validate current password */
  validate: () => boolean;
  /** Reset state */
  reset: () => void;
}

/**
 * Hook for password validation with strength indicator
 * @param options - Configuration options
 */
export const usePasswordValidation = (
  options: UsePasswordValidationOptions = {}
): UsePasswordValidationReturn => {
  const { context, validateOnChange = true } = options;

  const [password, setPasswordState] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasBlurred, setHasBlurred] = useState(false);

  // Calculate strength whenever password changes
  const strength = useMemo(
    () => getPasswordStrength(password, context),
    [password, context]
  );

  // Handle password change
  const setPassword = useCallback((value: string) => {
    setPasswordState(value);

    if (validateOnChange && hasBlurred) {
      const validationError = validatePassword(value, context);
      setError(validationError);
    }
  }, [validateOnChange, hasBlurred, context]);

  // Manual validation
  const validate = useCallback(() => {
    setHasBlurred(true);
    const validationError = validatePassword(password, context);
    setError(validationError);
    return validationError === null;
  }, [password, context]);

  // Reset state
  const reset = useCallback(() => {
    setPasswordState('');
    setError(null);
    setHasBlurred(false);
  }, []);

  return {
    password,
    setPassword,
    error,
    strength,
    isValid: error === null && password.length === 8,
    validate,
    reset,
  };
};

/**
 * Hook for confirm password validation
 * @param originalPassword - Password to match against
 */
export const useConfirmPassword = (originalPassword: string) => {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(() => {
    if (confirmPassword !== originalPassword) {
      setError('Passwords do not match');
      return false;
    }
    setError(null);
    return true;
  }, [confirmPassword, originalPassword]);

  const handleChange = useCallback((value: string) => {
    setConfirmPassword(value);
    if (value && value !== originalPassword) {
      setError('Passwords do not match');
    } else {
      setError(null);
    }
  }, [originalPassword]);

  return {
    confirmPassword,
    setConfirmPassword: handleChange,
    error,
    isMatch: confirmPassword === originalPassword && confirmPassword.length > 0,
    validate,
    reset: () => {
      setConfirmPassword('');
      setError(null);
    },
  };
};

/**
 * Hook for email validation
 */
export const useEmailValidation = () => {
  const [email, setEmailState] = useState('');
  const [error, setError] = useState<string | null>(null);

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    if (value && !isValidEmail(value)) {
      setError('Please enter a valid email address');
    } else {
      setError(null);
    }
  }, []);

  const validate = useCallback(() => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError(null);
    return true;
  }, [email]);

  return {
    email,
    setEmail,
    error,
    isValid: isValidEmail(email),
    validate,
    reset: () => {
      setEmailState('');
      setError(null);
    },
  };
};
