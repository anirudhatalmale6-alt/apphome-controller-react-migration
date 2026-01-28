/**
 * User Profile Types
 * Typed user profile and credential models
 * Origin: AppHomeController.js $scope.user_profile
 */

export interface UserProfile {
  user_id: string;
  user_login_id: string;
  user_name: string;
  customer_id: string;
  bps_id: string;
  bu_id: string;
  newPassword?: string;
  confirmNewPassword?: string;
  otpValue?: string;
}

export interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  stepForPasswordChange: number;
  passwordChangeInProcess: boolean;
}

export interface UpdateProfileInput {
  user_id: string;
  user_login_id: string;
  newPassword: string;
  otpValue: string;
}

export interface LoggingActivity {
  hasValidUserEmail: string;
  hasValidUserHash: string;
  hasValidUserId: string;
  hasValidUserName: string;
  hasCustomerId: string;
  changeType: string;
}
