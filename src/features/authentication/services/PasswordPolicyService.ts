/**
 * Password Policy Service
 * Pure domain logic for password validation and strength scoring
 * Migrated from AppHomeController.js password validation functions
 */

export interface PasswordStrength {
  score: number;
  label: 'Weak' | 'Medium' | 'Strong' | '' | 'Invalid length';
}

export interface ValidationContext {
  username?: string;
  email?: string;
  name?: string;
}

const PWD_CONFIG = { LENGTH: 8 };

const WEAK_PASSWORDS = [
  'password', 'password1', 'welcome', 'welcome1', 'welcome123', 'welcome@123',
  'admin', 'admin123', 'letmein', 'qwerty', 'qwerty123', 'abc123', 'iloveyou',
  '123456', '12345678', '123456789', '111111', '000000', 'test', 'guest',
  'wellcome', 'wellcome123', 'wellcome@123'
];

// Regex patterns for weak password detection
const containsNonAscii = (pw: string): boolean => /[^\x00-\x7F]/.test(pw);
const containsEmail = (pw: string): boolean => /\S+@\S+\.\S+/.test(pw);
const hasYearTail = (pw: string): boolean => /(19|20)\d{2}$/.test(pw);
const looksLikeWordPlusPunctPlusDigits = (pw: string): boolean => /^[A-Za-z]+[\W_][0-9]+$/.test(pw);
const looksSequential = (pw: string): boolean => /(012|123|234|345|456|567|678|789|987|876|765|654|543|432|321)/.test(pw);
const hasRepetition = (pw: string): boolean => /(.)\1{2,}/.test(pw);
const hasKeyboardPattern = (pw: string): boolean => /(qwerty|asdf|zxcv)/i.test(pw);

const containsUserFragments = (pw: string, ctx?: ValidationContext): boolean => {
  if (!ctx) return false;
  const lowerPw = pw.toLowerCase();
  if (ctx.username && lowerPw.includes(ctx.username.toLowerCase())) return true;
  if (ctx.email && lowerPw.includes(ctx.email.split('@')[0].toLowerCase())) return true;
  if (ctx.name && lowerPw.includes(ctx.name.toLowerCase())) return true;
  return false;
};

/**
 * Validates password against security policy
 * @param password - Password to validate
 * @param ctx - Optional context with user info to prevent personal data in password
 * @returns Error message or null if valid
 */
export const validatePassword = (password: string, ctx?: ValidationContext): string | null => {
  if (!password) return 'Password is required.';
  if (password.length !== PWD_CONFIG.LENGTH) {
    return 'Password must be exactly 8 characters long.';
  }

  const lowerPassword = password.toLowerCase();

  // Weak dictionary check
  if (WEAK_PASSWORDS.some(p => lowerPassword.includes(p))) {
    return 'Password is too common or easily guessable.';
  }

  // Pattern checks
  if (looksSequential(password)) return 'Password should not use sequential numbers/letters.';
  if (hasRepetition(password)) return 'Password should not have repeated characters.';
  if (hasKeyboardPattern(password)) return 'Password should not contain keyboard patterns.';
  if (looksLikeWordPlusPunctPlusDigits(password)) return 'Password looks like a weak format (e.g., Name@123).';
  if (hasYearTail(password)) return 'Password should not end with a year.';
  if (containsEmail(password)) return 'Password cannot contain an email address.';
  if (containsNonAscii(password)) return 'Password must use only English characters (no Unicode/emojis).';
  if (containsUserFragments(password, ctx)) return 'Password cannot include your username, name, or email.';

  // Complexity check
  let rules = 0;
  if (/[0-9]/.test(password)) rules++;
  if (/[a-z]/.test(password)) rules++;
  if (/[A-Z]/.test(password)) rules++;
  if (/[\W_]/.test(password)) rules++;

  if (rules < 3) {
    return 'Password must include at least 3 of: uppercase, lowercase, number, special character.';
  }

  return null; // Valid
};

/**
 * Calculates password strength score
 * @param password - Password to evaluate
 * @param ctx - Optional validation context
 * @returns Strength score and label
 */
export const getPasswordStrength = (password: string, ctx?: ValidationContext): PasswordStrength => {
  if (!password) return { score: 0, label: '' };

  if (password.length !== PWD_CONFIG.LENGTH) {
    return { score: 0, label: 'Invalid length' };
  }

  const lowerPassword = password.toLowerCase();

  // Check for weak patterns
  if (WEAK_PASSWORDS.some(p => lowerPassword.includes(p))) return { score: 1, label: 'Weak' };
  if (looksSequential(password)) return { score: 1, label: 'Weak' };
  if (hasRepetition(password)) return { score: 1, label: 'Weak' };
  if (hasKeyboardPattern(password)) return { score: 1, label: 'Weak' };
  if (looksLikeWordPlusPunctPlusDigits(password)) return { score: 1, label: 'Weak' };
  if (hasYearTail(password)) return { score: 1, label: 'Weak' };
  if (containsEmail(password)) return { score: 1, label: 'Weak' };
  if (containsNonAscii(password)) return { score: 1, label: 'Weak' };
  if (containsUserFragments(password, ctx)) return { score: 1, label: 'Weak' };

  // Complexity scoring
  let score = 0;
  if (/[0-9]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[\W_]/.test(password)) score++;

  if (score < 3) return { score: 1, label: 'Weak' };

  return { score: 3, label: 'Strong' };
};

/**
 * Checks if email format is valid
 * @param input - Input string to validate
 * @returns true if valid email format
 */
export const isValidEmail = (input: string): boolean => {
  const validEmailRegEx = /^[A-Z0-9_'%=+!`#~$*?^{}&|-]+([.][A-Z0-9_'%=+!`#~$*?^{}&|-]+)*@[A-Z0-9-]+(\.[A-Z0-9-]+)+$/i;
  return validEmailRegEx.test(input);
};
