/**
 * BusinessTasks Feature Module
 * Exports for task management functionality
 * Migrated from BusinessTasksController.js
 */

// Components
export { BusinessTasksView } from './components/BusinessTasksView';
export { RecentTasksTable } from './components/RecentTasksTable';
export { PastDueTasksTable } from './components/PastDueTasksTable';
export { InsightsView } from './components/InsightsView';
export { TransactionHistoryModal } from './components/TransactionHistoryModal';

// API
export { businessTasksApi } from './api/businessTasksApi';
export {
  useGetTasksWorkflowsCountQuery,
  useGetDisplayTimeSettingsQuery,
  useGetYTDAuditDataQuery,
  useSearchYTDAuditDataMutation,
  useSearchInsightsCustomMutation,
  useGetSearchConfigQuery,
  useGetYTDExceptionsQuery,
  useSearchYTDExceptionsMutation,
  useGetExceptionSupplierCountQuery,
  useGetExceptionsBySupplierQuery,
  useGetProcessedAgingCountQuery,
  useGetProcessedQueueDataQuery,
  useSearchProcessedQueueDataMutation,
  useGetRecentWorkflowsQuery,
  useSearchRecentWorkflowsMutation,
  useGetPastDueCountQuery,
  useGetPastDueWorkflowsQuery,
  useSearchPastDueTasksMutation,
  useGetCustomWorkflowsQuery,
  useSearchCustomTasksMutation,
  useGetDINHistoryQuery,
} from './api/businessTasksApi';

// Store
export { default as businessTasksReducer } from './store/businessTasksSlice';
export {
  setActiveTab,
  setSelectedInsightsTab,
  setLoading,
  setRecentLoading,
  setPastDueLoading,
  setTaskCount,
  setDisplayTimeSettings,
  setRecentWorkflows,
  setRecentPagination,
  setPastDueWorkflows,
  setPastDuePagination,
  setPastDueCount,
  setCustomWorkflows,
  setCustomPagination,
  setCustomDateRange,
  setTransactionLogs,
  setShowTransactionModal,
  setSelectedDINNumber,
  setAgingPagination,
  setSearchFilters,
  setSearchText,
  setSelectedWorkflow,
  setSelectedAction,
  clearSearch,
  resetTasks,
} from './store/businessTasksSlice';

// Types
export type {
  TaskWorkflow,
  TaskCount,
  DisplayTimeSettings,
  YTDAuditData,
  InsightsCustomData,
  SearchConfig,
  ExceptionItem,
  SupplierExceptionCount,
  AgingCount,
  ProcessedQueueData,
  RecentWorkflow,
  PastDueWorkflow,
  CustomWorkflow,
  TransactionLog,
  TabConfig,
  InsightsTab,
  ChartData,
  PaginationState,
  DateRange,
  SearchFilters,
  DINData,
} from './types/BusinessTasksTypes';
