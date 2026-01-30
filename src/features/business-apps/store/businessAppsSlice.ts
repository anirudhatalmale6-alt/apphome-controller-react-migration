import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  BusinessAppsState,
  MenuTab,
  QueueAction,
  WorkflowItem,
  TasksCount,
  PaginationState,
  DateRange,
  UploadAttachment,
  ExportConfig,
} from '../types/BusinessAppsTypes';

const initialState: BusinessAppsState = {
  menuTabs: [],
  selectedTabIndex: 0,
  queueActions: [],
  selectedQueue: null,
  recentWorkflows: [],
  pastDueWorkflows: [],
  customWorkflows: [],
  tasksCount: [],
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  },
  selectedAgingFilter: '',
  searchField: '',
  searchValue: '',
  dateRange: {
    startDate: '',
    endDate: '',
  },
  attachments: [],
  totalUploadSize: 0,
  exportConfig: [],
  currentView: 'recent',
  isSidebarCollapsed: false,
  loading: false,
  loadingWorkflows: false,
  error: null,
};

const businessAppsSlice = createSlice({
  name: 'businessApps',
  initialState,
  reducers: {
    setMenuTabs(state, action: PayloadAction<MenuTab[]>) {
      state.menuTabs = action.payload;
    },
    setSelectedTabIndex(state, action: PayloadAction<number>) {
      state.selectedTabIndex = action.payload;
    },
    setQueueActions(state, action: PayloadAction<QueueAction[]>) {
      state.queueActions = action.payload;
    },
    setSelectedQueue(state, action: PayloadAction<QueueAction | null>) {
      state.selectedQueue = action.payload;
    },
    setRecentWorkflows(state, action: PayloadAction<WorkflowItem[]>) {
      state.recentWorkflows = action.payload;
    },
    setPastDueWorkflows(state, action: PayloadAction<WorkflowItem[]>) {
      state.pastDueWorkflows = action.payload;
    },
    setCustomWorkflows(state, action: PayloadAction<WorkflowItem[]>) {
      state.customWorkflows = action.payload;
    },
    setTasksCount(state, action: PayloadAction<TasksCount[]>) {
      state.tasksCount = action.payload;
    },
    setPagination(state, action: PayloadAction<Partial<PaginationState>>) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage(state, action: PayloadAction<number>) {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },
    setTotalItems(state, action: PayloadAction<number>) {
      state.pagination.totalItems = action.payload;
    },
    setSelectedAgingFilter(state, action: PayloadAction<string>) {
      state.selectedAgingFilter = action.payload;
    },
    setSearchField(state, action: PayloadAction<string>) {
      state.searchField = action.payload;
    },
    setSearchValue(state, action: PayloadAction<string>) {
      state.searchValue = action.payload;
    },
    setDateRange(state, action: PayloadAction<DateRange>) {
      state.dateRange = action.payload;
    },
    addAttachment(state, action: PayloadAction<UploadAttachment>) {
      state.attachments.push(action.payload);
      state.totalUploadSize += action.payload.size;
    },
    removeAttachment(state, action: PayloadAction<string>) {
      const index = state.attachments.findIndex(a => a.name === action.payload);
      if (index !== -1) {
        state.totalUploadSize -= state.attachments[index].size;
        state.attachments.splice(index, 1);
      }
    },
    clearAttachments(state) {
      state.attachments = [];
      state.totalUploadSize = 0;
    },
    setExportConfig(state, action: PayloadAction<ExportConfig[]>) {
      state.exportConfig = action.payload;
    },
    setCurrentView(state, action: PayloadAction<'recent' | 'pastDue' | 'custom' | 'upload'>) {
      state.currentView = action.payload;
      state.pagination.currentPage = 1;
    },
    toggleSidebar(state) {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setLoadingWorkflows(state, action: PayloadAction<boolean>) {
      state.loadingWorkflows = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetBusinessApps() {
      return initialState;
    },
  },
});

export const {
  setMenuTabs,
  setSelectedTabIndex,
  setQueueActions,
  setSelectedQueue,
  setRecentWorkflows,
  setPastDueWorkflows,
  setCustomWorkflows,
  setTasksCount,
  setPagination,
  setCurrentPage,
  setItemsPerPage,
  setTotalItems,
  setSelectedAgingFilter,
  setSearchField,
  setSearchValue,
  setDateRange,
  addAttachment,
  removeAttachment,
  clearAttachments,
  setExportConfig,
  setCurrentView,
  toggleSidebar,
  setLoading,
  setLoadingWorkflows,
  setError,
  resetBusinessApps,
} = businessAppsSlice.actions;

export default businessAppsSlice.reducer;
