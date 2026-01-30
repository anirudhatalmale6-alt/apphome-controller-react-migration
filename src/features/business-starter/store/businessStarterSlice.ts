import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  BusinessStarterState,
  Customer,
  BusinessProcess,
  BusinessUnit,
  Queue,
  CustomerPerformance,
  AdminSettingsQueue,
  TechopsWorkflow,
} from '../types/BusinessStarterTypes';

const initialState: BusinessStarterState = {
  customers: [],
  selectedCustomer: null,
  selectedCustomerId: null,
  businessProcessList: {},
  selectedBpsList: [],
  selectedBuList: [],
  selectedBuIndex: 0,
  businessQueueList: [],
  businessQueueGrid: [],
  landingPageNumber: 0,
  switchToQueuePage: false,
  currentDeptIndex: 0,
  searchBUInput: '',
  searchDepartments: '',
  searchQueues: '',
  isGridView: false,
  selectedInsightsTab: 0,
  isTabLoading: false,
  customerDashboardData: [],
  adminSettingsCustomers: [],
  adminSettingsQueues: [],
  selectedAdminBpsId: null,
  selectedAdminCustomerId: null,
  isLoadingBpsDetails: false,
  techopsCustomers: [],
  techopsWorkflows: [],
  techopsTotalItems: 0,
  currentTechopsPage: 1,
  itemsPerPageTechops: 10,
  selectedTechopsBpsId: null,
  selectedTechopsCustomerId: null,
  isLoadingTechopsDetails: false,
  loading: false,
  error: null,
};

const businessStarterSlice = createSlice({
  name: 'businessStarter',
  initialState,
  reducers: {
    setCustomers(state, action: PayloadAction<Customer[]>) {
      state.customers = action.payload;
    },
    selectCustomer(state, action: PayloadAction<Customer>) {
      state.selectedCustomer = action.payload;
      state.selectedCustomerId = action.payload.customer_id;
    },
    setBusinessProcessList(state, action: PayloadAction<Record<string, BusinessProcess[]>>) {
      state.businessProcessList = action.payload;
    },
    setSelectedBpsList(state, action: PayloadAction<BusinessProcess[][]>) {
      state.selectedBpsList = action.payload;
    },
    setSelectedBuList(state, action: PayloadAction<BusinessUnit[]>) {
      state.selectedBuList = action.payload;
    },
    setSelectedBuIndex(state, action: PayloadAction<number>) {
      state.selectedBuIndex = action.payload;
    },
    setBusinessQueueList(state, action: PayloadAction<Queue[]>) {
      state.businessQueueList = action.payload;
    },
    setBusinessQueueGrid(state, action: PayloadAction<Queue[][]>) {
      state.businessQueueGrid = action.payload;
    },
    setLandingPageNumber(state, action: PayloadAction<number>) {
      state.landingPageNumber = action.payload;
    },
    setSwitchToQueuePage(state, action: PayloadAction<boolean>) {
      state.switchToQueuePage = action.payload;
    },
    setCurrentDeptIndex(state, action: PayloadAction<number>) {
      state.currentDeptIndex = action.payload;
    },
    setSearchBUInput(state, action: PayloadAction<string>) {
      state.searchBUInput = action.payload;
    },
    setSearchDepartments(state, action: PayloadAction<string>) {
      state.searchDepartments = action.payload;
    },
    setSearchQueues(state, action: PayloadAction<string>) {
      state.searchQueues = action.payload;
    },
    toggleGridView(state) {
      state.isGridView = !state.isGridView;
    },
    setSelectedInsightsTab(state, action: PayloadAction<number>) {
      state.selectedInsightsTab = action.payload;
    },
    setIsTabLoading(state, action: PayloadAction<boolean>) {
      state.isTabLoading = action.payload;
    },
    setCustomerDashboardData(state, action: PayloadAction<CustomerPerformance[]>) {
      state.customerDashboardData = action.payload;
    },
    setAdminSettingsCustomers(state, action: PayloadAction<CustomerPerformance[]>) {
      state.adminSettingsCustomers = action.payload;
    },
    setAdminSettingsQueues(state, action: PayloadAction<AdminSettingsQueue[]>) {
      state.adminSettingsQueues = action.payload;
    },
    setSelectedAdminBps(state, action: PayloadAction<{ bpsId: string; customerId: string } | null>) {
      if (action.payload) {
        state.selectedAdminBpsId = action.payload.bpsId;
        state.selectedAdminCustomerId = action.payload.customerId;
      } else {
        state.selectedAdminBpsId = null;
        state.selectedAdminCustomerId = null;
      }
    },
    setIsLoadingBpsDetails(state, action: PayloadAction<boolean>) {
      state.isLoadingBpsDetails = action.payload;
    },
    updateQueueEnable(state, action: PayloadAction<{ queueId: string; isEnable: boolean }>) {
      const queue = state.adminSettingsQueues.find(q => q.queue_id === action.payload.queueId);
      if (queue) {
        queue.isEnable = action.payload.isEnable;
        queue.hasQueueChanges = true;
      }
    },
    updateQueueMailEnable(state, action: PayloadAction<{ queueId: string; isMailEnable: boolean }>) {
      const queue = state.adminSettingsQueues.find(q => q.queue_id === action.payload.queueId);
      if (queue) {
        queue.isMailEnable = action.payload.isMailEnable;
        queue.hasQueueChanges = true;
      }
    },
    toggleQueueExpanded(state, action: PayloadAction<string>) {
      const queue = state.adminSettingsQueues.find(q => q.queue_id === action.payload);
      if (queue) {
        queue.expanded = !queue.expanded;
      }
    },
    setTechopsCustomers(state, action: PayloadAction<CustomerPerformance[]>) {
      state.techopsCustomers = action.payload;
    },
    setTechopsWorkflows(state, action: PayloadAction<TechopsWorkflow[]>) {
      state.techopsWorkflows = action.payload;
    },
    setTechopsTotalItems(state, action: PayloadAction<number>) {
      state.techopsTotalItems = action.payload;
    },
    setCurrentTechopsPage(state, action: PayloadAction<number>) {
      state.currentTechopsPage = action.payload;
    },
    setItemsPerPageTechops(state, action: PayloadAction<number>) {
      state.itemsPerPageTechops = action.payload;
    },
    setSelectedTechopsBps(state, action: PayloadAction<{ bpsId: string; customerId: string } | null>) {
      if (action.payload) {
        state.selectedTechopsBpsId = action.payload.bpsId;
        state.selectedTechopsCustomerId = action.payload.customerId;
      } else {
        state.selectedTechopsBpsId = null;
        state.selectedTechopsCustomerId = null;
      }
    },
    setIsLoadingTechopsDetails(state, action: PayloadAction<boolean>) {
      state.isLoadingTechopsDetails = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetBusinessStarter() {
      return initialState;
    },
  },
});

export const {
  setCustomers,
  selectCustomer,
  setBusinessProcessList,
  setSelectedBpsList,
  setSelectedBuList,
  setSelectedBuIndex,
  setBusinessQueueList,
  setBusinessQueueGrid,
  setLandingPageNumber,
  setSwitchToQueuePage,
  setCurrentDeptIndex,
  setSearchBUInput,
  setSearchDepartments,
  setSearchQueues,
  toggleGridView,
  setSelectedInsightsTab,
  setIsTabLoading,
  setCustomerDashboardData,
  setAdminSettingsCustomers,
  setAdminSettingsQueues,
  setSelectedAdminBps,
  setIsLoadingBpsDetails,
  updateQueueEnable,
  updateQueueMailEnable,
  toggleQueueExpanded,
  setTechopsCustomers,
  setTechopsWorkflows,
  setTechopsTotalItems,
  setCurrentTechopsPage,
  setItemsPerPageTechops,
  setSelectedTechopsBps,
  setIsLoadingTechopsDetails,
  setLoading,
  setError,
  resetBusinessStarter,
} = businessStarterSlice.actions;

export default businessStarterSlice.reducer;
