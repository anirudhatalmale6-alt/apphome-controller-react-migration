/**
 * App Settings Types
 * Strongly typed models replacing AngularJS $scope/$rootScope patterns
 * Origin: AppSettingPage.js (settingViewsCtrl)
 */

// ─── Setting Tab Types ───

export interface SettingTab {
  title: string;
  content?: string;
  events?: string;
}

export interface UniqueTab {
  title: 'Setting' | 'BpsConfiguration' | 'DevOps';
  templateUrl: string;
}

// ─── Setting Config (from fetch_setting_data) ───

export interface SettingConfig {
  lastupdated_termsconditions?: string;
  lastupdated_dateformat?: string;
  current_timeformat?: string;
  display_timezone?: string;
  [key: string]: any;
}

// ─── Date Format Types ───

export interface DateFormatItem {
  format: string;
  example?: string;
  label?: string;
}

export interface DateFormatRow {
  input_type: 'date';
  value: string;
  key_hint: string;
  date_format: string;
}

// ─── Time Format Types ───

export interface TimeFormatRow {
  input_type: 'time';
  value: string;
  time_format: string;
  timeFormatLabel: string;
}

// ─── Timezone Types ───

export interface TimezoneRow {
  input_type: 'timeZone';
  value: string;
  current_time_zone: string;
  new_time_zone: string;
}

// ─── Corporation Profile Types ───

export interface CorporationProfile {
  name?: string;
  industry?: string;
  logoData?: string | null;
  lastUpdatedTime?: string;
  [key: string]: any;
}

// ─── User Types ───

export interface ExistingUser {
  user_id: string;
  email_id: string;
  first_name: string;
  last_name: string;
  enroll_datetime?: string;
  active_status?: string | number;
  aurnant_account?: string;
  format?: string;
  disabled?: string | number;
  last_kyu?: string;
  last_kyu_datetime?: string;
  remote_key?: string;
  user_secret_key?: string;
  enroll_email_id?: string;
  email_id_enroll?: string;
  encrypted_password?: string;
  dynamic_encrypted_key?: string;
  passkey?: string;
  passkey_media?: string;
  password?: string;
  multi_device_access?: string;
  multi_device_auth?: string;
  passkey_access?: string;
  user_primary_location?: string | { city?: string; country?: string };
  user_first_access_ip?: string;
  user_first_access_device?: string;
  user_last_access_datetime?: string;
  last_access_location?: string;
  last_access_device?: string;
  user_darment_date?: string;
  user_disable_date?: string;
  user_status?: string;
  user_lock?: string | number;
  last_update_user?: string;
  last_update?: string;
  company_name?: string;
  user_id_enroll?: string;
  supervisor_email_id?: string;
  admin_email_id?: string;
  primary_contact?: string | { landline?: string; mobile?: string };
  result?: string;
  selected?: boolean;
  [key: string]: any;
}

export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  enrollDate: Date | null;
  activeStatus: string;
  aurnantAccount: string;
  format: string;
  disable: string;
  lastKYU: string;
  lastKYUDate: Date | null;
  remoteKey: string;
  userSecretKey: string;
  enrollEmail: string;
  encryptedPassword: string;
  dynamicEncryptedKey: string;
  passkeyEnabled: string;
  passkeyMedia: string;
  plainPassword: string;
  multiDeviceAccess: string;
  multiDeviceAuth: string;
  passkeyAccess: string;
  userCity: string;
  userCountry: string;
  firstAccessIP: string;
  firstAccessDevice: string;
  lastAccessDate: Date | null;
  lastAccessLocation: string;
  lastAccessDevice: string;
  darmentDate: Date | null;
  disableDate: Date | null;
  userStatus: string;
  userLock: string;
  lastUpdatedBy: string;
  lastUpdatedDate: Date | null;
  companyName: string;
  id: string;
  supervisorEmail: string;
  adminEmail: string;
  landlineContact: string;
  primaryContact: string;
}

export interface ReviewUser {
  user_id: string;
  result?: string;
  data_extract_json?: string | Record<string, any>;
  hasException?: boolean;
  selected?: boolean;
  [key: string]: any;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface UserFieldResources {
  passkeyMediaOptions: SelectOption[];
  multiDeviceAuthOptions: SelectOption[];
  passkeyAccessOptions: SelectOption[];
}

// ─── API Input Types ───

export interface BaseSettingsParams {
  customer_id: string;
  bps_id: string;
}

export interface FetchSettingDataInput extends BaseSettingsParams {}

export interface UpdateInfoSettingInput extends BaseSettingsParams {
  colValue: string;
  colName: string;
}

export interface SettingDateFormatsInput extends BaseSettingsParams {}

export interface StoreRemoteKeyInput extends BaseSettingsParams {
  user_login_id: string;
  user_id: string;
  secretKey: string;
}

export interface SaveCorporationInput extends BaseSettingsParams {
  bu_id: string;
  config_data: string;
}

export interface ExistingUsersInput extends BaseSettingsParams {
  pageNumber: number;
  pageSize: number;
}

export interface LoadReviewUsersInput extends BaseSettingsParams {
  pageNumber: number;
  pageSize: number;
}

export interface ValidateExcelInput extends BaseSettingsParams {}

export interface ReadExcelInput extends BaseSettingsParams {
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_content: string;
}

export interface UserFieldResourcesInput extends BaseSettingsParams {}

export interface UsersProcessInput extends BaseSettingsParams {
  inpuJson: Record<string, any>;
}

export interface DeleteUsersInput extends BaseSettingsParams {
  user_id: string;
  deleteType: 'existingDelete' | 'reviewDelete' | 'multiDelete' | 'reviewMultiDelete' | 'reviewExistingEditDelete';
}

export interface GrantAccessInput {
  selectedIds: Record<string, any>[];
}

// ─── API Response Types ───

export interface FetchSettingDataResponse {
  settingConfig: SettingConfig;
}

export interface StoreRemoteKeyResponse {
  result: 'Success' | 'Error';
}

export interface ExistingUsersResponse {
  users: ExistingUser[];
  totalCount: number;
  result: string;
}

export interface ReviewUsersResponse {
  users: ReviewUser[];
  totalCount: number;
  result: string;
}

export interface ReadExcelResponse {
  result: string;
}

export interface UserFieldResourcesResponse {
  passkeyMediaOptions: SelectOption[];
  multiDeviceAuthOptions: SelectOption[];
  passkeyAccessOptions: SelectOption[];
}

export interface GrantAccessResponse {
  result: string;
}

// ─── State Type ───

export interface AppSettingsState {
  // Loading
  isLoading: boolean;
  isLoadingState: boolean;

  // Active tabs
  settingSelectedTab: number;
  activeUniqueTab: string;
  activeSection: 'users' | 'bulk';

  // Setting config
  settingConfig: SettingConfig | null;
  successMessage: string;

  // Date format
  displayDateFormat: string;
  dateFormats: DateFormatItem[];

  // Time format
  timeFormatValue: string;
  timeFormatLabel: string;

  // Timezone
  displayTimeZone: string;
  formattedCurrentTime: string;
  formattedNewTime: string;

  // Corp profile
  corporationProfile: CorporationProfile;
  isCropping: boolean;

  // Remote key
  remoteKeySuccess: string;
  remoteKeyError: string;

  // User management
  existingUserList: ExistingUser[];
  existingTotalItems: number;
  existingTotalPages: number;
  currentPageExisting: number;
  itemsPerPageExisting: number;

  // Review users (bulk upload)
  reviewUserList: ReviewUser[];
  reviewTotalItems: number;
  reviewTotalPages: number;
  currentPageReview: number;
  itemsPerPageReview: number;
  checkExcelUserData: any[];
  forValidateUserData: any[];

  // User form
  showForm: boolean;
  isEditing: boolean;
  editingUserId: string;
  activeEditType: 'existing' | 'review' | '';
  userFormData: UserFormData | null;
  formErrors: Record<string, string>;
  formSubmitted: boolean;

  // User field resources
  userFieldResources: UserFieldResources | null;

  // Selection
  selectedUserIds: string[];
  reviewSelectedUserIds: string[];

  // Error
  error: string | null;
}
