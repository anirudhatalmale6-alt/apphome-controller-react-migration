/**
 * Application Shell Feature Public API
 * Origin Controller: AppHomeController.js
 */

// Components
export { ApplicationShellView } from './components/ApplicationShellView';

// Types
export type * from './types/ApplicationShellTypes';

// API
export {
  applicationShellApi,
  useGetCorpDetailsQuery,
  useLoadBusinessConfigMutation,
  useLoadSettingsQuery,
  useLoadDisplayTimeQuery,
  useFetchTimezoneDetailsMutation,
  useUpdateTimezoneDetailsMutation,
} from './api/applicationShellApi';

// Store
export {
  default as applicationShellReducer,
  selectApplicationShell,
  selectIsLoginPage,
  setIsLoginPage,
  setCompanyId,
  setCorpDetails,
  setLoading,
  resetShell,
} from './store/applicationShellSlice';
