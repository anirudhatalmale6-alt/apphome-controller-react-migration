/**
 * Application Shell Types
 * Types for global application state
 * Origin: AppHomeController.js $rootScope global flags
 */

export interface ApplicationShellState {
  isLoginPage: boolean;
  viewFooterDiv: boolean;
  isLoading: boolean;
  loadingAfterSignIn: boolean;
  companyId: string | null;
  isBusinessStarterLoaded: boolean;
  corpDetails: CorpDetails | null;
  pageNotFound: boolean;
}

export interface CorpDetails {
  companyID: string;
  name?: string;
  logoData?: string;
  displayTrue?: boolean;
}

export interface BusinessConfig {
  customer_id: string;
  bps_id: string;
  config_data?: Record<string, unknown>;
}

export interface TimeZoneInfo {
  clientTimeZone: string;
  clientTime: string;
  clientUTCTimeZone: string;
  clientUTCTime: string;
  displayTimezone?: string;
}
