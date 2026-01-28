/**
 * Global TypeScript Types
 * Migrated from AppHomeController.js $scope and $rootScope patterns
 */

// User data structure from loginedUserData
export interface UserData {
  user_id: string;
  user_login_id: string;
  user_name: string;
  customer_id: string;
  bps_id: string;
  bu_id: string;
  tps_id?: string;
  dept_id?: string;
  queue_id?: string;
  user_type_id: string;
  role_homepage: string;
  session_id?: string;
  signed_ip_address?: string;
  client_name?: string;
  sp_process_id?: string;
  corp_profile_configuration?: string;
  corp_logo?: string;
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
  sessionId: string | null;
  error: string | null;
}

// Sign-in credentials
export interface SignInCredentials {
  username: string;
  password: string;
  totp?: string;
}

// Password validation result
export interface PasswordValidationResult {
  isValid: boolean;
  error: string | null;
  strength: PasswordStrength;
}

export interface PasswordStrength {
  score: number;
  label: 'Weak' | 'Medium' | 'Strong' | '';
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  status: number;
}

// OTP verification
export interface OtpVerification {
  otp_value: string;
  user_login_id: string;
}

// User profile update
export interface UserProfileUpdate {
  user_id: string;
  user_login_id: string;
  newPassword?: string;
  confirmNewPassword?: string;
  otpValue?: string;
}

// Navigation state
export interface NavigationState {
  currentPath: string;
  selectedItem: string;
  isLoading: boolean;
  isItemSelected: Record<string, boolean>;
}

// Application shell state
export interface ApplicationShellState {
  isLoginPage: boolean;
  showFooter: boolean;
  isLoading: boolean;
  isSidebarHidden: boolean;
  companyId?: string;
}

// Browser/device info for login
export interface DeviceInfo {
  browser: string;
  browser_version: string;
  device: string;
  os: string;
  os_version: string;
}

// Corp details
export interface CorpDetails {
  companyID: string;
  name?: string;
  logoData?: string;
  displayTrue?: boolean;
}

// MFA state
export interface MfaState {
  isEnabled: boolean;
  qrCodeUrl?: string;
  secretKey?: string;
  isVerified: boolean;
}
