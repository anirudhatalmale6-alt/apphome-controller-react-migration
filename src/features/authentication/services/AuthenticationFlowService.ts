/**
 * Authentication Flow Service
 * Orchestrates sign-in, logout, OTP, MFA decisioning
 * Migrated from AppHomeController.js multi-step authentication sequences
 */
import type { DeviceDetectorData, SignInInput, LoginStatusInput } from '../types/AuthenticationTypes';

/**
 * Gets browser/device information for login tracking
 * Migrated from deviceDetector usage in AppHomeController
 */
export const getDeviceInfo = (): DeviceDetectorData => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let browser_version = '';
  let os = 'Unknown';
  let os_version = '';
  const device = /Mobile|Android|iPhone|iPad/.test(ua) ? 'mobile' : 'desktop';

  // Browser detection
  if (ua.includes('Chrome')) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    if (match) browser_version = match[1];
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    if (match) browser_version = match[1];
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    if (match) browser_version = match[1];
  } else if (ua.includes('Edge')) {
    browser = 'Edge';
    const match = ua.match(/Edge\/(\d+)/);
    if (match) browser_version = match[1];
  }

  // OS detection
  if (ua.includes('Windows')) {
    os = 'Windows';
    if (ua.includes('Windows NT 10')) os_version = '10';
    else if (ua.includes('Windows NT 6.3')) os_version = '8.1';
    else if (ua.includes('Windows NT 6.1')) os_version = '7';
  } else if (ua.includes('Mac OS')) {
    os = 'Mac';
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    if (match) os_version = match[1].replace('_', '.');
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
    const match = ua.match(/Android (\d+)/);
    if (match) os_version = match[1];
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
    const match = ua.match(/OS (\d+)/);
    if (match) os_version = match[1];
  }

  return { browser, browser_version, device, os, os_version };
};

/**
 * Prepares sign-in payload
 * @param username - User's email/username
 * @param encryptedPassword - Pre-encrypted password
 */
export const prepareSignInPayload = (
  username: string,
  encryptedPassword: string
): SignInInput => ({
  username,
  password: encryptedPassword,
  browserData: getDeviceInfo()
});

/**
 * Prepares login status payload for session management
 * @param username - User's email/username
 * @param remoteKey - Optional remote key for concurrent login handling
 */
export const prepareLoginStatusPayload = (
  username: string,
  remoteKey?: string
): LoginStatusInput => {
  const deviceData = getDeviceInfo();
  delete deviceData.raw; // Remove raw data as per original

  return {
    user_login_id: username,
    browserData: deviceData,
    IPAddress: '',
    sessionId: '',
    ip: '',
    ...(remoteKey && { remoteKey })
  };
};

/**
 * Gets client timezone information
 * Migrated from timezone handling in AppHomeController
 */
export const getClientTimezoneInfo = () => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const clientTime = now.toLocaleString('en-US', { timeZone });

  const offset = -now.getTimezoneOffset();
  const hours = Math.floor(offset / 60);
  const minutes = offset % 60;
  const utcOffset = `UTC${hours >= 0 ? '+' : ''}${hours}:${minutes.toString().padStart(2, '0')}`;

  return {
    clientTimeZone: timeZone,
    clientTime,
    clientUTCTimeZone: utcOffset,
    clientUTCTime: now.toISOString()
  };
};

/**
 * Parses URL parameters for new user password setup
 * Migrated from URL param handling in AppHomeController
 */
export const getPasswordSetupParams = (): { username: string; userType: string } | null => {
  const params = new URLSearchParams(window.location.search);
  const username = params.get('username');
  const userType = params.get('userType');

  if (username && userType === 'newUser') {
    return { username, userType };
  }
  return null;
};

/**
 * Clears URL parameters after password setup
 */
export const clearPasswordSetupParams = (): void => {
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
};

/**
 * Determines if account is locked based on login attempts
 * @param attempts - Account access attempts data
 */
export const isAccountLocked = (attempts: { attempts_status?: string; lock_status?: string } | null): boolean => {
  return attempts?.attempts_status === 'ACCOUNT_LOCKED' && attempts?.lock_status === '1';
};
