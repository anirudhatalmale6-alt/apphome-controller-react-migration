/**
 * Authentication Validation Schemas
 * Zod schemas for form validation
 * Origin: AppHomeController.js input validation patterns
 */
import { z } from 'zod';

/**
 * Username validation schema
 */
export const usernameSchema = z
  .string()
  .min(1, 'Username is required')
  .email('Please enter a valid email address');

/**
 * Password validation schema - enforces password policy
 * Migrated from validatePassword function in AppHomeController
 */
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .length(8, 'Password must be exactly 8 characters long')
  .refine((password) => {
    // Check for weak/common passwords
    const weakPasswords = [
      'password', 'password1', 'welcome', 'welcome1', 'welcome123', 'welcome@123',
      'admin', 'admin123', 'letmein', 'qwerty', 'qwerty123', 'abc123', 'iloveyou',
      '123456', '12345678', '123456789', '111111', '000000', 'test', 'guest',
      'wellcome', 'wellcome123', 'wellcome@123'
    ];
    return !weakPasswords.some(p => password.toLowerCase().includes(p));
  }, 'Password is too common or easily guessable')
  .refine((password) => {
    // Check for sequential patterns
    const sequential = /(012|123|234|345|456|567|678|789|987|876|765|654|543|432|321)/;
    return !sequential.test(password);
  }, 'Password should not use sequential numbers/letters')
  .refine((password) => {
    // Check for repeated characters
    return !/(.)\1{2,}/.test(password);
  }, 'Password should not have repeated characters')
  .refine((password) => {
    // Check for keyboard patterns
    return !/(qwerty|asdf|zxcv)/i.test(password);
  }, 'Password should not contain keyboard patterns')
  .refine((password) => {
    // Check for weak format (Name@123)
    return !/^[A-Za-z]+[\W_][0-9]+$/.test(password);
  }, 'Password looks like a weak format (e.g., Name@123)')
  .refine((password) => {
    // Check for year at end
    return !/(19|20)\d{2}$/.test(password);
  }, 'Password should not end with a year')
  .refine((password) => {
    // Check for email pattern
    return !/\S+@\S+\.\S+/.test(password);
  }, 'Password cannot contain an email address')
  .refine((password) => {
    // Check complexity - at least 3 of: uppercase, lowercase, number, special char
    let rules = 0;
    if (/[0-9]/.test(password)) rules++;
    if (/[a-z]/.test(password)) rules++;
    if (/[A-Z]/.test(password)) rules++;
    if (/[\W_]/.test(password)) rules++;
    return rules >= 3;
  }, 'Password must include at least 3 of: uppercase, lowercase, number, special character');

/**
 * Sign-in form schema
 */
export const signInSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'Password is required'),
  totp: z.string().optional()
});

/**
 * Forgot password form schema
 */
export const forgotPasswordSchema = z.object({
  email: usernameSchema
});

/**
 * OTP verification schema
 */
export const otpSchema = z.object({
  otp_value: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers')
});

/**
 * Password change schema with confirmation
 */
export const passwordChangeSchema = z.object({
  newPassword: passwordSchema,
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword']
});

/**
 * New password setup schema (for new users)
 */
export const newPasswordSetupSchema = z.object({
  userName: z.string().min(1, 'Username is required'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Type exports
export type SignInFormData = z.infer<typeof signInSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type NewPasswordSetupFormData = z.infer<typeof newPasswordSetupSchema>;
