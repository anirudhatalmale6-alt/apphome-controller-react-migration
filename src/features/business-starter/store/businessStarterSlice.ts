/**
 * Business Starter Redux Slice
 * State management for business starter feature
 * Origin: BusinessStarterController.js $scope and $rootScope variables
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type {
  BusinessStarterState,
  Customer,
  BusinessProcess,
  BusinessUnit,
  Queue,
  CustomerDashboardData,
  AdminSettingQueue,
  TechOpsWorkflow,
  InsightTab,
} from '../types/BusinessStarterTypes';

const initialState: BusinessStarterState = {
  // Landing page
  landingPageNumber: 0,
  switchToQueuePage: false,
  loadingAfterSignIn: false,
  analyticsPageLoading: false,
  isTabLoading: false,

  // Customer/Partner selection
  selectedCustomerId: null,
  selectedCustomerName: null,
  selectedCustomerList: [],
  businessPartnerList: {},
  businessProcessList: {},

  // Business Process selection
  selectedBusinessProcessId: null,
  selectedBusinessProcess: null,
  selectedBpsList: [],

  // Business Unit selection
  selectedBuIndex: 0,
  selectedBuList: [],
  businessQueueList: [],
  businessQueueGrid: [],

  // Search filters
  searchBUInput: '',
  searchDepartments: '',
  searchQueues: '',
  searchInput: '',
  superSearch: '',

  // View state
  isGridView: false,
  selectedInsightsTab: 0,
  insightsTabs: [],
  bpaasWorkflowTabs: [],

  // Dashboard data
  customerDashboardData: null,

  // Admin settings
  selectedBps: null,
  locateAdminBps: false,
  adminQueues: [],
  isLoadingBpsDetails: false,

  // TechOps
  selectedTechopsBps: null,
  locateAdminTechopsBps: false,
  techOpsWorkflows: [],
  techOpsPagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  },
  isLoadingTechopsDetails: false,
  noDataAvailableTechopsInbox: false,

  // Profile
  profileSwitchingEnabled: false,
  settingEnable: false,
};

const businessStarterSlice = createSlice({
  name: 'businessStarter',
  initialState,
  reducers: {
    // Landing page actions
    setLandingPageNumber: (state, action: PayloadAction<number>) => {
      state.landingPageNumber = action.payload;
    },
    setSwitchToQueuePage: (state, action: PayloadAction<boolean>) => {
      state.switchToQueuePage = action.payload;
    },
    setLoadingAfterSignIn: (state, action: PayloadAction<boolean>) => {
      state.loadingAfterSignIn = action.payload;
    },
    setAnalyticsPageLoading: (state, action: PayloadAction<boolean>) => {
      state.analyticsPageLoading = action.payload;
    },
    setTabLoading: (state, action: PayloadAction<boolean>) => {
      state.isTabLoading = action.payload;
    },

    // Customer selection actions
    setSelectedCustomer: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.selectedCustomerId = action.payload.id;
      state.selectedCustomerName = action.payload.name;
    },
    setSelectedCustomerList: (state, action: PayloadAction<Customer[]>) => {
      state.selectedCustomerList = action.payload;
    },
    selectPartner: (state, action: PayloadAction<number>) => {
      state.selectedCustomerList = state.selectedCustomerList.map((customer, index) => ({
        ...customer,
        isSelected: index === action.payload,
      }));
    },
    setBusinessPartnerList: (state, action: PayloadAction<Record<string, BusinessProcess[]>>) => {
      state.businessPartnerList = action.payload;
    },
    setBusinessProcessList: (state, action: PayloadAction<Record<string, BusinessUnit[]>>) => {
      state.businessProcessList = action.payload;
    },

    // Business Process actions
    setSelectedBusinessProcess: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.selectedBusinessProcessId = action.payload.id;
      state.selectedBusinessProcess = action.payload.name;
    },
    setSelectedBpsList: (state, action: PayloadAction<BusinessProcess[][]>) => {
      state.selectedBpsList = action.payload;
    },

    // Business Unit actions
    setSelectedBuIndex: (state, action: PayloadAction<number>) => {
      state.selectedBuIndex = action.payload;
    },
    setSelectedBuList: (state, action: PayloadAction<BusinessUnit[]>) => {
      state.selectedBuList = action.payload;
    },
    setBusinessQueueList: (state, action: PayloadAction<Queue[]>) => {
      state.businessQueueList = action.payload;
    },
    setBusinessQueueGrid: (state, action: PayloadAction<Queue[][]>) => {
      state.businessQueueGrid = action.payload;
    },

    // Search filter actions
    setSearchBUInput: (state, action: PayloadAction<string>) => {
      state.searchBUInput = action.payload;
      if (action.payload.trim() === '') {
        state.selectedBuIndex = 0;
      }
    },
    setSearchDepartments: (state, action: PayloadAction<string>) => {
      state.searchDepartments = action.payload;
    },
    setSearchQueues: (state, action: PayloadAction<string>) => {
      state.searchQueues = action.payload;
    },
    setSearchInput: (state, action: PayloadAction<string>) => {
      state.searchInput = action.payload;
    },
    setSuperSearch: (state, action: PayloadAction<string>) => {
      state.superSearch = action.payload;
    },

    // View state actions
    toggleGridView: (state) => {
      state.isGridView = !state.isGridView;
    },
    setSelectedInsightsTab: (state, action: PayloadAction<number>) => {
      state.selectedInsightsTab = action.payload;
    },
    setInsightsTabs: (state, action: PayloadAction<InsightTab[]>) => {
      state.insightsTabs = action.payload;
    },
    setBpaasWorkflowTabs: (state, action: PayloadAction<any[]>) => {
      state.bpaasWorkflowTabs = action.payload;
    },

    // Dashboard data actions
    setCustomerDashboardData: (state, action: PayloadAction<CustomerDashboardData>) => {
      state.customerDashboardData = action.payload;
    },

    // Admin settings actions
    setSelectedBps: (state, action: PayloadAction<string | null>) => {
      state.selectedBps = action.payload;
      state.locateAdminBps = action.payload !== null;
    },
    setAdminQueues: (state, action: PayloadAction<AdminSettingQueue[]>) => {
      state.adminQueues = action.payload;
    },
    toggleQueueExpanded: (state, action: PayloadAction<string>) => {
      const queue = state.adminQueues.find(q => q.queue_id === action.payload);
      if (queue) {
        queue.expanded = !queue.expanded;
      }
    },
    updateQueueEnable: (state, action: PayloadAction<{ queueId: string; isEnable: boolean }>) => {
      const queue = state.adminQueues.find(q => q.queue_id === action.payload.queueId);
      if (queue) {
        queue.isEnable = action.payload.isEnable;
        queue.hasQueueChanges = true;
      }
    },
    updateQueueMailEnable: (state, action: PayloadAction<{ queueId: string; isMailEnable: boolean }>) => {
      const queue = state.adminQueues.find(q => q.queue_id === action.payload.queueId);
      if (queue) {
        queue.isMailEnable = action.payload.isMailEnable;
        queue.hasQueueChanges = true;
      }
    },
    clearQueueChanges: (state, action: PayloadAction<string>) => {
      const queue = state.adminQueues.find(q => q.queue_id === action.payload);
      if (queue) {
        queue.hasQueueChanges = false;
        queue.hasUserChanges = false;
        queue.hasMenuChanges = false;
        queue.hasActionChanges = false;
      }
    },
    setLoadingBpsDetails: (state, action: PayloadAction<boolean>) => {
      state.isLoadingBpsDetails = action.payload;
    },

    // TechOps actions
    setSelectedTechopsBps: (state, action: PayloadAction<string | null>) => {
      state.selectedTechopsBps = action.payload;
      state.locateAdminTechopsBps = action.payload !== null;
    },
    setTechOpsWorkflows: (state, action: PayloadAction<TechOpsWorkflow[]>) => {
      state.techOpsWorkflows = action.payload;
      state.noDataAvailableTechopsInbox =
        action.payload.length === 1 &&
        (action.payload[0] as unknown as { result?: string }).result === 'No Data';
    },
    setTechOpsPagination: (state, action: PayloadAction<Partial<typeof state.techOpsPagination>>) => {
      state.techOpsPagination = { ...state.techOpsPagination, ...action.payload };
    },
    setLoadingTechopsDetails: (state, action: PayloadAction<boolean>) => {
      state.isLoadingTechopsDetails = action.payload;
    },

    // Profile actions
    setProfileSwitchingEnabled: (state, action: PayloadAction<boolean>) => {
      state.profileSwitchingEnabled = action.payload;
    },
    setSettingEnable: (state, action: PayloadAction<boolean>) => {
      state.settingEnable = action.payload;
    },

    // Reset state
    resetBusinessStarterState: () => initialState,

    // Go back to business process (from tasks/apps)
    goBackToBusinessProcess: (state) => {
      state.switchToQueuePage = !state.switchToQueuePage;
      state.landingPageNumber = 1;
    },
  },
});

export const {
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
  setBpaasWorkflowTabs,
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
} = businessStarterSlice.actions;

// Selectors
export const selectBusinessStarter = (state: RootState) => state.businessStarter;
export const selectLandingPageNumber = (state: RootState) => state.businessStarter.landingPageNumber;
export const selectSelectedCustomer = (state: RootState) => ({
  id: state.businessStarter.selectedCustomerId,
  name: state.businessStarter.selectedCustomerName,
});
export const selectSelectedBpsList = (state: RootState) => state.businessStarter.selectedBpsList;
export const selectIsGridView = (state: RootState) => state.businessStarter.isGridView;
export const selectSelectedInsightsTab = (state: RootState) => state.businessStarter.selectedInsightsTab;
export const selectAdminQueues = (state: RootState) => state.businessStarter.adminQueues;
export const selectTechOpsWorkflows = (state: RootState) => state.businessStarter.techOpsWorkflows;
export const selectTechOpsPagination = (state: RootState) => state.businessStarter.techOpsPagination;

export default businessStarterSlice.reducer;
