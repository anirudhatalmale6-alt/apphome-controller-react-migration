/**
 * Authentication Types
 * Strongly typed models replacing AngularJS $scope patterns
 * Origin: AppHomeController.js authentication-related variables
 */

export interface SignInInput {
  username: string;
  password: string;
  browserData?: DeviceDetectorData;
}

export interface DeviceDetectorData {
  browser: string;
  browser_version: string;
  device: string;
  os: string;
  os_version: string;
  raw?: unknown;
}

export interface SignInResponse {
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
  client_name?: string;
  corp_profile_configuration?: string;
  corp_logo?: string;
  sp_process_id?: string;
}

export interface LoginStatusInput {
  user_login_id: string;
  browserData: DeviceDetectorData;
  IPAddress?: string;
  sessionId?: string;
  ip?: string;
  remoteKey?: string;
}

export interface LoginStatusResponse {
  session_id: string;
  signed_ip_address: string;
  results?: 'LOGIN_SUCCESS' | 'PROMPT_KEY' | 'DENIED';
  ip?: string;
  userName?: string;
}

export interface ValidateUserResponse {
  result: 'OK' | 'FAIL';
}

export interface ValidateOnbaseUserResponse {
  result: 'Success' | 'Fail';
  user_id: string;
  user_login_id: string;
  user_name: string;
  customer_id: string;
}

export interface MfaCheckResponse {
  Status: 'YES' | 'NO';
}

export interface QrCodeResponse {
  qrCodeUrl: string;
  secret: string;
}

export interface VerifyCodeInput {
  totpcode: string;
  key: string;
}

export interface VerifyCodeResponse {
  status: 'valid' | 'invalid';
}

export interface AuthenticationState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SignInResponse | null;
  sessionId: string | null;
  signedIpAddress: string | null;
  error: string | null;
  // Login flow state
  isValidUser: boolean;
  isMfaEnabled: boolean;
  isMfaVerified: boolean;
  showQrCode: boolean;
  qrCodeUrl: string | null;
  secretKey: string | null;
  // Remote key state (for concurrent login handling)
  showRemoteKeyModal: boolean;
  remoteKeyTimer: number;
  conflictUserName: string | null;
  conflictUserIp: string | null;
}

export interface ValidUserDetails {
  hasValidUserEmail: string;
  hasValidUserHash: string;
  hasValidUserId: string;
  hasValidUserName: string;
  hasCustomerId: string;
  changeType?: 'PASSWORDFORGET' | 'PASSWORDCHANGE';
}
