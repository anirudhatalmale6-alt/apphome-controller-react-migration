/**
 * Business Apps Redux Slice
 * State management for business apps feature
 * Origin: BusinessAppsController.js $scope and $rootScope variables
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type {
  BusinessAppsState,
  MenuTab,
  QueueItem,
  QueueProperty,
  Workflow,
  SearchConfig,
  DateRange,
  UploadFile,
  TaskCount,
} from '../types/BusinessAppsTypes';

const initialState: BusinessAppsState = {
  // Loading states
  analyticsPageLoading: false,
  appPageLoading: false,
  isDashboardAvailable: false,
  isBusinessStarterLoaded: false,

  // Tab state
  menuTabs: [],
  selectedTabIndex: 0,
  selectedTab: 0, // Recent = 0, Past Due = 1, Custom = 2
  tabs: [
    { title: 'Recent', index: 0 },
    { title: 'Past Due', index: 1 },
    { title: 'Custom', index: 2 },
  ],

  // Queue state
  buQueueItems: [],
  buQueueActionsItems: [],
  expandedSections: {},
  activeItemIndex: {},
  queueIdFromUI: null,
  actionsFromUI: null,

  // Workflow data
  workflows: [],
  searchRecentData: [],
  totalItemsAppsRecents: 0,
  totalItemsAppsPastDue: 0,
  totalItemsAppsCustom: 0,

  // Search state
  searchText: '',
  searchByAll: [],
  selectedAction: null,
  isSearchEnable: false,
  inputColumn: null,
  inputValue: null,

  // Pagination
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  },
  optionsPerPage: [5, 10, 20],

  // Date range for custom tab
  dateRange: {
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    startDateAndTime: '',
    endDateAndTime: '',
  },

  // Aging tab
  agingSelectedTab: 0,
  agingTabs: [
    { title: 'All', value: 'all', index: 0 },
    { title: '0-24 hrs', value: '0-24', index: 1 },
    { title: '24-48 hrs', value: '24-48', index: 2 },
    { title: '>48 hrs', value: '>48', index: 3 },
  ],

  // Upload state
  attachmentList: [],
  totalUploadSize: 0,
  ifMenuUploads: false,

  // No data flags
  noDataAvailableRecent: false,
  noDataAvailablePast: false,
  noDataAvailableCustom: false,

  // Display time
  displayTimeValue: '',

  // Task counts
  tasksCountForUI: [],

  // Selected workflow
  selectedDIN: null,
  storedWorkflow: null,
  storedEvent: null,
  storedIndex: null,
};

const businessAppsSlice = createSlice({
  name: 'businessApps',
  initialState,
  reducers: {
    // Loading state actions
    setAnalyticsPageLoading: (state, action: PayloadAction<boolean>) => {
      state.analyticsPageLoading = action.payload;
    },
    setAppPageLoading: (state, action: PayloadAction<boolean>) => {
      state.appPageLoading = action.payload;
    },
    setIsDashboardAvailable: (state, action: PayloadAction<boolean>) => {
      state.isDashboardAvailable = action.payload;
    },
    setIsBusinessStarterLoaded: (state, action: PayloadAction<boolean>) => {
      state.isBusinessStarterLoaded = action.payload;
    },

    // Tab actions
    setMenuTabs: (state, action: PayloadAction<MenuTab[]>) => {
      state.menuTabs = action.payload;
    },
    setSelectedTabIndex: (state, action: PayloadAction<number>) => {
      state.selectedTabIndex = action.payload;
    },
    setSelectedTab: (state, action: PayloadAction<number>) => {
      state.selectedTab = action.payload;
    },

    // Queue actions
    setBuQueueItems: (state, action: PayloadAction<QueueItem[]>) => {
      state.buQueueItems = action.payload;
    },
    setBuQueueActionsItems: (state, action: PayloadAction<QueueItem[]>) => {
      state.buQueueActionsItems = action.payload;
    },
    toggleSection: (state, action: PayloadAction<string>) => {
      const queueName = action.payload;
      state.expandedSections[queueName] = !state.expandedSections[queueName];
    },
    setExpandedSection: (state, action: PayloadAction<{ queueName: string; expanded: boolean }>) => {
      state.expandedSections[action.payload.queueName] = action.payload.expanded;
    },
    setActiveItemIndex: (state, action: PayloadAction<{ queueName: string; index: number }>) => {
      state.activeItemIndex[action.payload.queueName] = action.payload.index;
    },
    setQueueIdFromUI: (state, action: PayloadAction<string | null>) => {
      state.queueIdFromUI = action.payload;
    },
    setActionsFromUI: (state, action: PayloadAction<QueueProperty | null>) => {
      state.actionsFromUI = action.payload;
    },

    // Workflow actions
    setWorkflows: (state, action: PayloadAction<Workflow[]>) => {
      state.workflows = action.payload;
      state.noDataAvailableRecent = action.payload.length === 0 ||
        (action.payload.length > 0 && action.payload[0].result?.toLowerCase() === 'no data');
    },
    setSearchRecentData: (state, action: PayloadAction<Workflow[]>) => {
      state.searchRecentData = action.payload;
    },
    setTotalItemsAppsRecents: (state, action: PayloadAction<number>) => {
      state.totalItemsAppsRecents = action.payload;
    },
    setTotalItemsAppsPastDue: (state, action: PayloadAction<number>) => {
      state.totalItemsAppsPastDue = action.payload;
    },
    setTotalItemsAppsCustom: (state, action: PayloadAction<number>) => {
      state.totalItemsAppsCustom = action.payload;
    },

    // Search actions
    setSearchText: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },
    setSearchByAll: (state, action: PayloadAction<SearchConfig[]>) => {
      state.searchByAll = action.payload;
    },
    setSelectedActionSearch: (state, action: PayloadAction<SearchConfig | null>) => {
      state.selectedAction = action.payload;
    },
    setIsSearchEnable: (state, action: PayloadAction<boolean>) => {
      state.isSearchEnable = action.payload;
    },
    setInputColumn: (state, action: PayloadAction<string | null>) => {
      state.inputColumn = action.payload;
    },
    setInputValue: (state, action: PayloadAction<string | null>) => {
      state.inputValue = action.payload;
    },

    // Pagination actions
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemsPerPage = action.payload;
    },
    setTotalItems: (state, action: PayloadAction<number>) => {
      state.pagination.totalItems = action.payload;
    },
    resetPagination: (state) => {
      state.pagination.currentPage = 1;
      state.pagination.itemsPerPage = 10;
    },

    // Date range actions
    setDateRange: (state, action: PayloadAction<Partial<DateRange>>) => {
      state.dateRange = { ...state.dateRange, ...action.payload };
    },
    initializeDateRange: (state) => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      state.dateRange = {
        startDate: now.toISOString().split('T')[0],
        startTime: '00:00:00',
        endDate: now.toISOString().split('T')[0],
        endTime: '23:59:59',
        startDateAndTime: startOfDay.toISOString().slice(0, 19).replace('T', ' '),
        endDateAndTime: endOfDay.toISOString().slice(0, 19).replace('T', ' '),
      };
    },

    // Aging actions
    setAgingSelectedTab: (state, action: PayloadAction<number>) => {
      state.agingSelectedTab = action.payload;
    },

    // Upload actions
    addAttachment: (state, action: PayloadAction<UploadFile>) => {
      state.attachmentList.push(action.payload);
      state.totalUploadSize += action.payload.size;
    },
    removeAttachment: (state, action: PayloadAction<number>) => {
      const removed = state.attachmentList.splice(action.payload, 1);
      if (removed.length > 0) {
        state.totalUploadSize -= removed[0].size;
      }
    },
    clearAttachments: (state) => {
      state.attachmentList = [];
      state.totalUploadSize = 0;
    },
    setIfMenuUploads: (state, action: PayloadAction<boolean>) => {
      state.ifMenuUploads = action.payload;
    },

    // No data flags
    setNoDataAvailableRecent: (state, action: PayloadAction<boolean>) => {
      state.noDataAvailableRecent = action.payload;
    },
    setNoDataAvailablePast: (state, action: PayloadAction<boolean>) => {
      state.noDataAvailablePast = action.payload;
    },
    setNoDataAvailableCustom: (state, action: PayloadAction<boolean>) => {
      state.noDataAvailableCustom = action.payload;
    },

    // Display time
    setDisplayTimeValue: (state, action: PayloadAction<string>) => {
      state.displayTimeValue = action.payload;
    },

    // Task counts
    setTasksCountForUI: (state, action: PayloadAction<TaskCount[]>) => {
      state.tasksCountForUI = action.payload;
    },

    // Selected workflow
    setSelectedDIN: (state, action: PayloadAction<Workflow | null>) => {
      state.selectedDIN = action.payload;
    },
    setStoredWorkflow: (state, action: PayloadAction<Workflow | null>) => {
      state.storedWorkflow = action.payload;
    },
    setStoredEvent: (state, action: PayloadAction<unknown | null>) => {
      state.storedEvent = action.payload;
    },
    setStoredIndex: (state, action: PayloadAction<number | null>) => {
      state.storedIndex = action.payload;
    },

    // Reset state
    resetBusinessAppsState: () => initialState,
  },
});

export const {
  setAnalyticsPageLoading,
  setAppPageLoading,
  setIsDashboardAvailable,
  setIsBusinessStarterLoaded,
  setMenuTabs,
  setSelectedTabIndex,
  setSelectedTab,
  setBuQueueItems,
  setBuQueueActionsItems,
  toggleSection,
  setExpandedSection,
  setActiveItemIndex,
  setQueueIdFromUI,
  setActionsFromUI,
  setWorkflows,
  setSearchRecentData,
  setTotalItemsAppsRecents,
  setTotalItemsAppsPastDue,
  setTotalItemsAppsCustom,
  setSearchText,
  setSearchByAll,
  setSelectedActionSearch,
  setIsSearchEnable,
  setInputColumn,
  setInputValue,
  setCurrentPage,
  setItemsPerPage,
  setTotalItems,
  resetPagination,
  setDateRange,
  initializeDateRange,
  setAgingSelectedTab,
  addAttachment,
  removeAttachment,
  clearAttachments,
  setIfMenuUploads,
  setNoDataAvailableRecent,
  setNoDataAvailablePast,
  setNoDataAvailableCustom,
  setDisplayTimeValue,
  setTasksCountForUI,
  setSelectedDIN,
  setStoredWorkflow,
  setStoredEvent,
  setStoredIndex,
  resetBusinessAppsState,
} = businessAppsSlice.actions;

// Selectors
export const selectBusinessApps = (state: RootState) => state.businessApps;
export const selectAnalyticsPageLoading = (state: RootState) => state.businessApps.analyticsPageLoading;
export const selectAppPageLoading = (state: RootState) => state.businessApps.appPageLoading;
export const selectMenuTabs = (state: RootState) => state.businessApps.menuTabs;
export const selectSelectedTabIndex = (state: RootState) => state.businessApps.selectedTabIndex;
export const selectSelectedTab = (state: RootState) => state.businessApps.selectedTab;
export const selectWorkflows = (state: RootState) => state.businessApps.workflows;
export const selectPagination = (state: RootState) => state.businessApps.pagination;
export const selectDateRange = (state: RootState) => state.businessApps.dateRange;
export const selectBuQueueActionsItems = (state: RootState) => state.businessApps.buQueueActionsItems;
export const selectExpandedSections = (state: RootState) => state.businessApps.expandedSections;

export default businessAppsSlice.reducer;
