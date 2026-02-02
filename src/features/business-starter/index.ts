/**
 * Business Starter Feature Public API
 * Exports all business-starter-related components, hooks, and utilities
 * Origin Controller: BusinessStarterController.js
 */

// Components
export { BusinessStarterView } from './components/BusinessStarterView';
export { CompanySelector } from './components/CompanySelector';
export { InsightsTabs } from './components/InsightsTabs';
export { BusinessProcessGrid } from './components/BusinessProcessGrid';
export { CustomerDashboard } from './components/CustomerDashboard';
export { AdminSettingsPanel } from './components/AdminSettingsPanel';
export { TechOpsInbox } from './components/TechOpsInbox';
export { LoadingSpinner } from './components/LoadingSpinner';

// Hooks
export { useBusinessStarterState, usePagination } from './hooks/useBusinessStarterState';

// Services
export * from './services/BusinessStarterService';

// Types
export type * from './types/BusinessStarterTypes';

// API
export {
  businessStarterApi,
  useLoadQueueMenuStatusMutation,
  useLoadCustomerDashboardQuery,
  useLazyLoadCustomerDashboardQuery,
  useLoadAdminSettingsQuery,
  useLazyLoadAdminSettingsQuery,
  useLoadAdminSettingsEnableDisableQuery,
  useLazyLoadAdminSettingsEnableDisableQuery,
  useEnableDisableQueueUserMenuMutation,
  useEnableDisableMenuMutation,
  useLoadAdminTechopsQuery,
  useLazyLoadAdminTechopsQuery,
  useLoadTechopsInboxQuery,
  useLazyLoadTechopsInboxQuery,
} from './api/businessStarterApi';

// Store
export {
  default as businessStarterReducer,
  selectBusinessStarter,
  selectLandingPageNumber,
  selectSelectedCustomer,
  selectSelectedBpsList,
  selectIsGridView,
  selectSelectedInsightsTab,
  selectAdminQueues,
  selectTechOpsWorkflows,
  selectTechOpsPagination,
  setLandingPageNumber,
  setSwitchToQueuePage,
  setLoadingAfterSignIn,
  setAnalyticsPageLoading,
  setTabLoading,
  setSelectedCustomer,
  setSelectedCustomerList,
  selectPartner,
  setBusinessPartnerList,
  setBusinessProcessList,
  setSelectedBusinessProcess,
  setSelectedBpsList,
  setSelectedBuIndex,
  setSelectedBuList,
  setBusinessQueueList,
  setBusinessQueueGrid,
  setSearchBUInput,
  setSearchDepartments,
  setSearchQueues,
  setSearchInput,
  setSuperSearch,
  toggleGridView,
  setSelectedInsightsTab,
  setInsightsTabs,
  setCustomerDashboardData,
  setSelectedBps,
  setAdminQueues,
  toggleQueueExpanded,
  updateQueueEnable,
  updateQueueMailEnable,
  clearQueueChanges,
  setLoadingBpsDetails,
  setSelectedTechopsBps,
  setTechOpsWorkflows,
  setTechOpsPagination,
  setLoadingTechopsDetails,
  setProfileSwitchingEnabled,
  setSettingEnable,
  resetBusinessStarterState,
  goBackToBusinessProcess,
} from './store/businessStarterSlice';
