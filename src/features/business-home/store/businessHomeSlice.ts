/**
 * BusinessHome Redux Slice
 * State management for dashboard analytics
 * Migrated from BusinessHomeViews.js $scope/$rootScope variables
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  TasksWorkflowCount,
  DisplayTimeSettings,
  BusinessException,
  PaginationState,
  DateRange,
  SearchFilters,
} from '../types/BusinessHomeTypes';

interface BusinessHomeState {
  // Dashboard state
  isDashboardAvailable: boolean;
  homePageLoading: boolean;
  analyticsPageLoading: boolean;
  activeTab: number;

  // Task counts
  tasksCountforUI: TasksWorkflowCount | null;

  // Display settings
  displayTimeResponse: DisplayTimeSettings | null;

  // YTD Pending data
  ytdPendingData: {
    labels: string[];
    data: number[];
    series: string[];
  };

  // Business Exceptions
  businessExceptions: BusinessException[];
  businessExceptionsPagination: PaginationState;

  // Batch Inventory
  batchInventoryData: {
    labels: string[];
    values: number[];
  };

  // Invoice Inventory
  invoiceInventoryData: {
    labels: string[];
    values: number[];
  };

  // Agent data
  agentsPagination: PaginationState;

  // Search and filters
  searchFilters: SearchFilters;

  // Selected items
  selectedSpProcessId: string | null;
  selectedSupplier: string | null;
}

const initialState: BusinessHomeState = {
  isDashboardAvailable: false,
  homePageLoading: true,
  analyticsPageLoading: false,
  activeTab: 0,

  tasksCountforUI: null,
  displayTimeResponse: null,

  ytdPendingData: {
    labels: ['TODAY', 'YESTERDAY', '3-7 DAYS', '8-15 DAYS', '16-30 DAYS', '31-60 DAYS', '61-90 DAYS', '90+ DAYS'],
    data: [],
    series: ['Pending Items'],
  },

  businessExceptions: [],
  businessExceptionsPagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  },

  batchInventoryData: {
    labels: ['0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'],
    values: [],
  },

  invoiceInventoryData: {
    labels: ['0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'],
    values: [],
  },

  agentsPagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  },

  searchFilters: {
    searchText: '',
    dateRange: undefined,
    status: undefined,
    supplier: undefined,
  },

  selectedSpProcessId: null,
  selectedSupplier: null,
};

const businessHomeSlice = createSlice({
  name: 'businessHome',
  initialState,
  reducers: {
    setDashboardAvailable(state, action: PayloadAction<boolean>) {
      state.isDashboardAvailable = action.payload;
    },

    setHomePageLoading(state, action: PayloadAction<boolean>) {
      state.homePageLoading = action.payload;
    },

    setAnalyticsPageLoading(state, action: PayloadAction<boolean>) {
      state.analyticsPageLoading = action.payload;
    },

    setActiveTab(state, action: PayloadAction<number>) {
      state.activeTab = action.payload;
    },

    setTasksCount(state, action: PayloadAction<TasksWorkflowCount>) {
      state.tasksCountforUI = action.payload;
    },

    setDisplayTimeSettings(state, action: PayloadAction<DisplayTimeSettings>) {
      state.displayTimeResponse = action.payload;
    },

    setYTDPendingData(state, action: PayloadAction<{ labels: string[]; data: number[]; series: string[] }>) {
      state.ytdPendingData = action.payload;
    },

    setBusinessExceptions(state, action: PayloadAction<BusinessException[]>) {
      state.businessExceptions = action.payload;
    },

    setBusinessExceptionsPagination(state, action: PayloadAction<Partial<PaginationState>>) {
      state.businessExceptionsPagination = { ...state.businessExceptionsPagination, ...action.payload };
    },

    setBatchInventoryData(state, action: PayloadAction<{ labels: string[]; values: number[] }>) {
      state.batchInventoryData = action.payload;
    },

    setInvoiceInventoryData(state, action: PayloadAction<{ labels: string[]; values: number[] }>) {
      state.invoiceInventoryData = action.payload;
    },

    setAgentsPagination(state, action: PayloadAction<Partial<PaginationState>>) {
      state.agentsPagination = { ...state.agentsPagination, ...action.payload };
    },

    setSearchFilters(state, action: PayloadAction<Partial<SearchFilters>>) {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },

    setSearchText(state, action: PayloadAction<string>) {
      state.searchFilters.searchText = action.payload;
    },

    setDateRange(state, action: PayloadAction<DateRange | undefined>) {
      state.searchFilters.dateRange = action.payload;
    },

    setSelectedSpProcessId(state, action: PayloadAction<string | null>) {
      state.selectedSpProcessId = action.payload;
    },

    setSelectedSupplier(state, action: PayloadAction<string | null>) {
      state.selectedSupplier = action.payload;
    },

    resetFilters(state) {
      state.searchFilters = initialState.searchFilters;
    },

    resetDashboard() {
      return initialState;
    },
  },
});

export const {
  setDashboardAvailable,
  setHomePageLoading,
  setAnalyticsPageLoading,
  setActiveTab,
  setTasksCount,
  setDisplayTimeSettings,
  setYTDPendingData,
  setBusinessExceptions,
  setBusinessExceptionsPagination,
  setBatchInventoryData,
  setInvoiceInventoryData,
  setAgentsPagination,
  setSearchFilters,
  setSearchText,
  setDateRange,
  setSelectedSpProcessId,
  setSelectedSupplier,
  resetFilters,
  resetDashboard,
} = businessHomeSlice.actions;

export default businessHomeSlice.reducer;
