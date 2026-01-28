/**
 * Authentication Feature Public API
 * Exports all authentication-related components, hooks, and utilities
 * Origin Controller: AppHomeController.js
 */

// Components
export { LoginView } from './components/LoginView';
export { PasswordSetupView } from './components/PasswordSetupView';
export { ForgotPasswordView } from './components/ForgotPasswordView';
export { RemoteKeyVerificationView } from './components/RemoteKeyVerificationView';
export { PasswordStrengthIndicator, PasswordRequirements } from './components/PasswordStrengthIndicator';

// Hooks
export { useAuthenticationState } from './hooks/useAuthenticationState';
export { usePasswordValidation, useConfirmPassword, useEmailValidation } from './hooks/usePasswordValidation';

// Services
export * from './services/PasswordPolicyService';
export * from './services/AuthenticationFlowService';

// Types
export type * from './types/AuthenticationTypes';

// Schemas
export * from './schemas/AuthenticationSchemas';

// API
export {
  authenticationApi,
  useSignInMutation,
  useSetLoginStatusMutation,
  useValidateUserMutation,
  useValidateOnbaseUserMutation,
  useCheckMfaMutation,
  useGetQrCodeMutation,
  useVerifyCodeMutation,
  useSignOutMutation,
  useSetPasswordMutation,
  useForgotUsernameMutation,
} from './api/authenticationApi';

// Store
export {
  default as authReducer,
  selectAuth,
  selectIsAuthenticated,
  selectUser,
  selectAuthLoading,
  selectAuthError,
} from './store/authSlice';
