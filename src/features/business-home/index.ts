/**
 * BusinessHome Feature Module
 * Exports for business dashboard functionality
 * Migrated from BusinessHomeViews.js
 */

// Components
export { BusinessHomeView } from './components/BusinessHomeView';
export { DashboardCards } from './components/DashboardCards';
export { YTDPendingChart } from './components/YTDPendingChart';
export { ExceptionsTable } from './components/ExceptionsTable';
export { BatchInventoryChart, InvoiceInventoryChart } from './components/InventoryCharts';
export { AgentsTable } from './components/AgentsTable';

// API
export { businessHomeApi } from './api/businessHomeApi';
export {
  useGetTasksWorkflowsCountQuery,
  useGetDisplayTimeSettingsQuery,
  useGetYTDPending30_60_90Query,
  useGetYTDBusinessExceptionsQuery,
  useSearchYTDBusinessExceptionsMutation,
  useGetBatchInventoryOverviewQuery,
  useGetBatchInventory30_60_90Query,
  useGetInvoiceInventoryOverviewQuery,
  useGetAgentDataQuery,
} from './api/businessHomeApi';

// Hooks
export { useBusinessHomeState } from './hooks/useBusinessHomeState';
export { usePagination } from './hooks/usePagination';

// Store
export { default as businessHomeReducer } from './store/businessHomeSlice';
export {
  setDashboardAvailable,
  setHomePageLoading,
  setActiveTab,
  setTasksCount,
  setBusinessExceptionsPagination,
  setAgentsPagination,
  setSearchText,
  setDateRange,
  resetFilters,
  resetDashboard,
} from './store/businessHomeSlice';

// Types
export type {
  TasksWorkflowCount,
  DisplayTimeSettings,
  YTDPending30_60_90,
  BusinessException,
  SupplierExceptionCount,
  BatchInventoryOverview,
  BatchInventory30_60_90,
  InvoiceInventoryOverview,
  AgentData,
  InsightsCustomData,
  BusinessConfig,
  PaginationState,
  ChartData,
  ChartOptions,
  DateRange,
  SearchFilters,
} from './types/BusinessHomeTypes';
