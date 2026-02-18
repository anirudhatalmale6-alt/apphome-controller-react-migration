/**
 * App Settings Service
 * Data transformation & business logic extracted from AppSettingPage.js
 * Handles: date formatting, user data mapping, validation, excel helpers
 */
import type {
  ExistingUser,
  UserFormData,
  SelectOption,
} from '../types/AppSettingsTypes';

// ─── Date/Time Helpers ───

/**
 * Format a Date to T&C timestamp string: "DD-MM-YYYY HH:MM am/pm"
 * Origin: TermsAndConditionsFormatDate (line ~170)
 */
export function formatTermsDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'pm' : 'am';
  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
}

/**
 * Format a Date to datetime string for API: "YYYY-MM-DD HH:MM:SS"
 * Origin: formatDateTime (line ~846)
 */
export function formatDateTime(date: Date | string | null): string | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Format a Date to date string: "YYYY-MM-DD"
 * Origin: formatDate (line ~850)
 */
export function formatDate(date: Date | string | null): string | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

/**
 * Parse MySQL / DD-MMM-YYYY date string to Date
 * Origin: parseMySQLDate (line ~2302)
 */
export function parseMySQLDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;

  // Case 1: ISO / MySQL format -> "YYYY-MM-DD HH:mm:ss"
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const parsed = new Date(dateStr.replace(' ', 'T'));
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // Case 2: DD-MMM-YYYY format -> "10-Jan-2023"
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const parts = dateStr.match(/(\d+)-(\w+)-(\d+)/);
  if (parts) {
    const day = parseInt(parts[1], 10);
    const month = months[parts[2]];
    const year = parseInt(parts[3], 10);
    if (month !== undefined) {
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

// ─── User Data Mapping ───

/**
 * Safely parse JSON string or return object
 * Origin: safeParse helper (line ~2288)
 */
export function safeParse<T = Record<string, any>>(jsonOrObj: string | T | null | undefined): T {
  if (!jsonOrObj) return {} as T;
  if (typeof jsonOrObj === 'string') {
    try {
      return JSON.parse(jsonOrObj) as T;
    } catch {
      return {} as T;
    }
  }
  return jsonOrObj;
}

/**
 * Normalize option value from JSON object or plain string
 * Origin: normalizeOptionValue helper (line ~2356)
 */
export function normalizeOptionValue(rawValue: string | null | undefined): string {
  if (!rawValue) return '';

  const parsed = safeParse(rawValue);
  if (typeof parsed === 'object' && Object.keys(parsed).length > 0) {
    const key = Object.keys(parsed).find(
      (k) => (parsed as any)[k] === 'yes' || (parsed as any)[k] === 'enabled'
    );
    if (key) return key;
  }

  if (typeof rawValue === 'string') {
    try {
      const clean = JSON.parse(rawValue);
      return clean || '';
    } catch {
      return rawValue.replace(/"/g, '').trim();
    }
  }

  return '';
}

/**
 * Map existing user API data to form data
 * Origin: $scope.editUser (line ~2250)
 */
export function mapUserToFormData(user: ExistingUser): UserFormData {
  const userPrimaryLocation = safeParse<{ city?: string; country?: string }>(
    user.user_primary_location as string
  );
  const userPrimaryContact = safeParse<{ landline?: string; mobile?: string }>(
    user.primary_contact as string
  );

  return {
    email: user.email_id || '',
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    enrollDate: parseMySQLDate(user.enroll_datetime || null),
    activeStatus: String(user.active_status || ''),
    aurnantAccount: user.aurnant_account || '',
    format: user.format || '',
    disable: String(user.disabled || ''),
    lastKYU: user.last_kyu || '',
    lastKYUDate: parseMySQLDate(user.last_kyu_datetime || null),
    remoteKey: user.remote_key || '',
    userSecretKey: user.user_secret_key || '',
    enrollEmail: user.email_id_enroll || user.enroll_email_id || '',
    encryptedPassword: user.encrypted_password || '',
    dynamicEncryptedKey: user.dynamic_encrypted_key || '',
    passkeyEnabled: user.passkey || '',
    passkeyMedia: normalizeOptionValue(user.passkey_media),
    plainPassword: user.password || '',
    multiDeviceAccess: user.multi_device_access || '',
    multiDeviceAuth: normalizeOptionValue(user.multi_device_auth),
    passkeyAccess: normalizeOptionValue(user.passkey_access),
    userCity: userPrimaryLocation.city || '',
    userCountry: userPrimaryLocation.country || '',
    firstAccessIP: user.user_first_access_ip || '',
    firstAccessDevice: user.user_first_access_device || '',
    lastAccessDate: parseMySQLDate(user.user_last_access_datetime || null),
    lastAccessLocation: user.last_access_location || '',
    lastAccessDevice: user.last_access_device || '',
    darmentDate: parseMySQLDate(user.user_darment_date || null),
    disableDate: parseMySQLDate(user.user_disable_date || null),
    userStatus: user.user_status || '',
    userLock: String(user.user_lock || ''),
    lastUpdatedBy: user.last_update_user || '',
    lastUpdatedDate: parseMySQLDate(user.last_update || null),
    companyName: user.company_name || '',
    id: user.user_id_enroll || '',
    supervisorEmail: user.supervisor_email_id || '',
    adminEmail: user.admin_email_id || '',
    landlineContact: userPrimaryContact.landline || '',
    primaryContact: userPrimaryContact.mobile || '',
  };
}

/**
 * Map form data to API payload
 * Origin: $scope.submitForm personalAndAccessData (line ~1432)
 */
export function mapFormDataToApiPayload(
  formData: UserFormData,
  loginedUserData: { customer_id: string; bps_id: string; user_id: string }
): Record<string, any> {
  return {
    email_id: formData.email,
    first_name: formData.firstName,
    last_name: formData.lastName,
    enroll_datetime: formatDateTime(formData.enrollDate),
    active_status: formData.activeStatus,
    aurnant_account: formData.aurnantAccount,
    format: formData.format,
    disabled: formData.disable,
    last_kyu: formData.lastKYU,
    last_kyu_datetime: formatDateTime(formData.lastKYUDate),
    user_primary_location: {
      city: formData.userCity || null,
      country: formData.userCountry || null,
    },
    user_first_access_ip: formData.firstAccessIP,
    user_first_access_device: formData.firstAccessDevice,
    user_last_access_datetime: formatDateTime(formData.lastAccessDate),
    last_access_location: formData.lastAccessLocation,
    last_access_device: formData.lastAccessDevice,
    user_darment_date: formatDate(formData.darmentDate),
    user_disable_date: formatDate(formData.disableDate),
    user_status: formData.userStatus,
    user_lock: formData.userLock,
    last_update_user: formData.lastUpdatedBy,
    lastUpdatedDate: formatDateTime(formData.lastUpdatedDate),
    company_name: formData.companyName,
    id: formData.id,
    supervisor_email_id: formData.supervisorEmail,
    admin_email_id: formData.adminEmail,
    primary_contact: {
      landline: formData.landlineContact || null,
      mobile: formData.primaryContact || null,
    },
    // Enrollment data
    remote_key: formData.remoteKey,
    user_secret_key: formData.userSecretKey,
    encrypted_password: formData.encryptedPassword,
    dynamic_encrypted_key: formData.dynamicEncryptedKey,
    passkey: formData.passkeyEnabled,
    passkey_media: formData.passkeyMedia,
    password: formData.plainPassword,
    multi_device_access: formData.multiDeviceAccess,
    multi_device_auth: formData.multiDeviceAuth,
    passkey_access: formData.passkeyAccess,
    customer_id: loginedUserData.customer_id,
    bps_id: loginedUserData.bps_id,
    user_id: loginedUserData.user_id,
  };
}

/**
 * Parse user field resources API response
 * Origin: $scope.userFieldResources callback (line ~1400)
 */
export function parseUserFieldResources(response: any): {
  passkeyMediaOptions: SelectOption[];
  multiDeviceAuthOptions: SelectOption[];
  passkeyAccessOptions: SelectOption[];
} {
  const defaultResult = {
    passkeyMediaOptions: [],
    multiDeviceAuthOptions: [],
    passkeyAccessOptions: [],
  };

  try {
    const parsed = typeof response === 'string' ? JSON.parse(response) : response;
    if (!Array.isArray(parsed) || !Array.isArray(parsed[0]) || parsed[0][0]?.result !== 'Success') {
      return defaultResult;
    }

    const passkeyMedia = JSON.parse(parsed[0][0].lookup_data || '[]');
    const multiDeviceAuth = JSON.parse(parsed[0][1].lookup_data || '[]');
    const passkeyAccess = JSON.parse(parsed[0][2].lookup_data || '[]');

    return {
      passkeyMediaOptions: (passkeyMedia || []).filter((m: any) => m && m.value),
      multiDeviceAuthOptions: (multiDeviceAuth || []).filter((m: any) => m && m.value),
      passkeyAccessOptions: (passkeyAccess || []).filter((m: any) => m && m.value),
    };
  } catch {
    return defaultResult;
  }
}

/**
 * Validate review user data for exception flags
 * Origin: FormByUserExcelData callback (line ~771)
 */
export function flagExceptionUsers(users: any[]): any[] {
  return users.map((user) => {
    const copy = { ...user };
    copy.hasException = false;
    for (const key in copy) {
      if (Object.prototype.hasOwnProperty.call(copy, key) && typeof copy[key] === 'string') {
        if (copy[key].includes('cannot be blank') || copy[key].includes('Please enter a valid')) {
          copy.hasException = true;
          break;
        }
      }
    }
    return copy;
  });
}

/**
 * Stringify nested objects for grant access API
 * Origin: stringifyNestedObjects helper (line ~1837)
 */
export function normalizeForGrantAccess(data: Record<string, any> | Record<string, any>[]): Record<string, any>[] {
  const arr = Array.isArray(data) ? data : [data];
  return arr.map((obj) => {
    const copy = { ...obj };
    const keysToStringify = ['user_primary_location', 'primary_contact'];
    keysToStringify.forEach((key) => {
      if (copy[key] && typeof copy[key] === 'object') {
        copy[key] = JSON.stringify(copy[key]);
      }
    });
    return copy;
  });
}

/**
 * Validate user form field for error keywords
 * Origin: $rootScope.redirectUserValidationPage (line ~2448)
 */
export function extractFormErrors(formData: Record<string, any>): Record<string, string> {
  const errors: Record<string, string> = {};
  const errorKeywords = ['cannot be blank', 'cannot be null', 'must be', 'Please enter a valid'];

  for (const key in formData) {
    if (!Object.prototype.hasOwnProperty.call(formData, key)) continue;
    const value = String(formData[key] || '');
    const hasError = errorKeywords.some((keyword) => value.includes(keyword));
    if (hasError) {
      errors[key] = value;
    }
  }

  return errors;
}
