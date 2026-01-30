/**
 * BusinessTasks Redux Slice
 * State management for task management module
 * Migrated from BusinessTasksController.js $scope/$rootScope variables
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  TaskCount,
  DisplayTimeSettings,
  RecentWorkflow,
  PastDueWorkflow,
  CustomWorkflow,
  TransactionLog,
  PaginationState,
  DateRange,
  SearchFilters,
  TabConfig,
  InsightsTab,
} from '../types/BusinessTasksTypes';

interface BusinessTasksState {
  // Tab state
  activeTab: number;
  selectedInsightsTab: number;
  tabConfigs: TabConfig[];
  insightsTabs: InsightsTab[];

  // Loading states
  isLoading: boolean;
  isRecentLoading: boolean;
  isPastDueLoading: boolean;
  isInsightsLoading: boolean;
  isExceptionsLoading: boolean;

  // Task counts
  taskCount: TaskCount | null;

  // Display settings
  displayTimeSettings: DisplayTimeSettings | null;

  // Recent workflows
  recentWorkflows: RecentWorkflow[];
  recentPagination: PaginationState;

  // Past due workflows
  pastDueWorkflows: PastDueWorkflow[];
  pastDuePagination: PaginationState;
  pastDueCount: number;

  // Custom workflows
  customWorkflows: CustomWorkflow[];
  customPagination: PaginationState;
  customDateRange: DateRange;

  // Transaction history
  transactionLogs: TransactionLog[];
  showTransactionModal: boolean;
  selectedDINNumber: string | null;

  // Insights/Aging data
  agingPagination: PaginationState;

  // Search and filters
  searchFilters: SearchFilters;

  // Selected items for actions
  selectedWorkflow: RecentWorkflow | PastDueWorkflow | CustomWorkflow | null;
  selectedAction: string | null;

  // Context IDs
  spProcessId: string | null;
  queueId: string | null;
}

const initialState: BusinessTasksState = {
  activeTab: 0,
  selectedInsightsTab: 0,
  tabConfigs: [
    { id: 'tasks', label: 'Tasks', enabled: true },
    { id: 'insights', label: 'Insights', enabled: true },
    { id: 'exceptions', label: 'Exceptions', enabled: true },
  ],
  insightsTabs: [
    { id: 'aging', label: 'Aging (YTD)', type: 'aging' },
    { id: 'custom', label: 'Custom', type: 'custom' },
  ],

  isLoading: true,
  isRecentLoading: false,
  isPastDueLoading: false,
  isInsightsLoading: false,
  isExceptionsLoading: false,

  taskCount: null,
  displayTimeSettings: null,

  recentWorkflows: [],
  recentPagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  },

  pastDueWorkflows: [],
  pastDuePagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  },
  pastDueCount: 0,

  customWorkflows: [],
  customPagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  },
  customDateRange: {
    startDate: '',
    endDate: '',
  },

  transactionLogs: [],
  showTransactionModal: false,
  selectedDINNumber: null,

  agingPagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  },

  searchFilters: {
    searchText: '',
    dateRange: undefined,
    status: undefined,
    priority: undefined,
  },

  selectedWorkflow: null,
  selectedAction: null,

  spProcessId: null,
  queueId: null,
};

const businessTasksSlice = createSlice({
  name: 'businessTasks',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<number>) {
      state.activeTab = action.payload;
    },

    setSelectedInsightsTab(state, action: PayloadAction<number>) {
      state.selectedInsightsTab = action.payload;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    setRecentLoading(state, action: PayloadAction<boolean>) {
      state.isRecentLoading = action.payload;
    },

    setPastDueLoading(state, action: PayloadAction<boolean>) {
      state.isPastDueLoading = action.payload;
    },

    setTaskCount(state, action: PayloadAction<TaskCount>) {
      state.taskCount = action.payload;
    },

    setDisplayTimeSettings(state, action: PayloadAction<DisplayTimeSettings>) {
      state.displayTimeSettings = action.payload;
    },

    setRecentWorkflows(state, action: PayloadAction<RecentWorkflow[]>) {
      state.recentWorkflows = action.payload;
    },

    setRecentPagination(state, action: PayloadAction<Partial<PaginationState>>) {
      state.recentPagination = { ...state.recentPagination, ...action.payload };
    },

    setPastDueWorkflows(state, action: PayloadAction<PastDueWorkflow[]>) {
      state.pastDueWorkflows = action.payload;
    },

    setPastDuePagination(state, action: PayloadAction<Partial<PaginationState>>) {
      state.pastDuePagination = { ...state.pastDuePagination, ...action.payload };
    },

    setPastDueCount(state, action: PayloadAction<number>) {
      state.pastDueCount = action.payload;
    },

    setCustomWorkflows(state, action: PayloadAction<CustomWorkflow[]>) {
      state.customWorkflows = action.payload;
    },

    setCustomPagination(state, action: PayloadAction<Partial<PaginationState>>) {
      state.customPagination = { ...state.customPagination, ...action.payload };
    },

    setCustomDateRange(state, action: PayloadAction<DateRange>) {
      state.customDateRange = action.payload;
    },

    setTransactionLogs(state, action: PayloadAction<TransactionLog[]>) {
      state.transactionLogs = action.payload;
    },

    setShowTransactionModal(state, action: PayloadAction<boolean>) {
      state.showTransactionModal = action.payload;
    },

    setSelectedDINNumber(state, action: PayloadAction<string | null>) {
      state.selectedDINNumber = action.payload;
    },

    setAgingPagination(state, action: PayloadAction<Partial<PaginationState>>) {
      state.agingPagination = { ...state.agingPagination, ...action.payload };
    },

    setSearchFilters(state, action: PayloadAction<Partial<SearchFilters>>) {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },

    setSearchText(state, action: PayloadAction<string>) {
      state.searchFilters.searchText = action.payload;
    },

    setSelectedWorkflow(state, action: PayloadAction<RecentWorkflow | PastDueWorkflow | CustomWorkflow | null>) {
      state.selectedWorkflow = action.payload;
    },

    setSelectedAction(state, action: PayloadAction<string | null>) {
      state.selectedAction = action.payload;
    },

    setSpProcessId(state, action: PayloadAction<string | null>) {
      state.spProcessId = action.payload;
    },

    setQueueId(state, action: PayloadAction<string | null>) {
      state.queueId = action.payload;
    },

    clearSearch(state) {
      state.searchFilters = initialState.searchFilters;
    },

    resetTasks() {
      return initialState;
    },
  },
});

export const {
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
  setSpProcessId,
  setQueueId,
  clearSearch,
  resetTasks,
} = businessTasksSlice.actions;

export default businessTasksSlice.reducer;
