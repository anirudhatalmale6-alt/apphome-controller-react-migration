/**
 * API Configuration - Axios Instance
 * Migrated from AppHomeController.js $http patterns
 * Handles encryption/decryption of API payloads
 */
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { encryptData, decryptData } from './crypto';

// API Gateway base URL - empty string allows Vite proxy to work
// In production, set VITE_API_GATEWAY to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY || '';

/**
 * Configured Axios instance with encryption interceptors
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json;charset=utf-8',
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

/**
 * Request interceptor - encrypts outgoing data
 * Matches original $http POST pattern with encrypted body
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Encrypt request body if it's a POST with data
    if (config.method === 'post' && config.data && config.headers['X-Encrypt'] !== 'false') {
      config.data = encryptData(config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - decrypts incoming data
 * Matches original response decryption pattern
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Decrypt response data if it's encrypted (string response)
    if (typeof response.data === 'string' && response.headers['X-Decrypt'] !== 'false') {
      try {
        response.data = decryptData(response.data);
      } catch {
        // Response not encrypted, return as-is
      }
    }
    return response;
  },
  (error) => Promise.reject(error)
);

/**
 * API endpoints mapping - mirrors AngularJS API calls
 * All paths relative to /baasHome or /baasContent
 */
export const API_ENDPOINTS = {
  // Authentication
  SIGN_IN: '/baasHome/signIn',
  SIGN_OUT: '/baasHome/signOutFromOnebase',
  SET_LOGIN_STATUS: '/baasHome/setLoginStatus',
  VALIDATE_USER: '/baasHome/validateUser',
  VALIDATE_ONBASE_USER: '/baasHome/validateOnbaseUser',

  // Password Management
  SET_PASSWORD: '/baasHome/setPassword',
  UPDATE_USER_PROFILE: '/baasHome/update_user_profile',
  OTP_RECOVER_PASSWORD: '/baasHome/otp_to_recover_password',
  VERIFY_OTP: '/baasHome/verify_otp_to_proceed',
  FORGOT_USERNAME: '/baasHome/forgotUsername',
  VALID_MAIL_ID: '/baasHome/vaildMailID',

  // MFA
  CHECK_MFA: '/baasHome/checkMFA',
  GET_QR_CODE: '/baasHome/getQRcode',
  VERIFY_CODE: '/baasHome/verifyCode',

  // User Activity
  UPDATE_USER_ACTIVITIES: '/baasHome/updateUserActivitesLogging',
  ACCOUNT_ACCESS_ATTEMPTS: '/baasHome/AccountAccessAttempts',

  // Business Config
  LOAD_BUSINESS_CONFIG: '/baasHome/load_business_config',
  LOAD_SETTING: '/baasHome/loadSetting',
  LOAD_DISPLAY_TIME: '/baasHome/loadDisplayTimeForInbox',
  FETCH_TIMEZONE: '/baasHome/fetch_TimeZone_Details',
  UPDATE_TIMEZONE: '/baasHome/update_TimeZone_Details',

  // Content
  CORP_DETAILS: '/baasContent/corp_details',
  SAVE_IXSD_JSON: '/baasContent/saveIXSDJSON'
} as const;

export default apiClient;
