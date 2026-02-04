/**
 * Business Starter Types
 * Strongly typed models replacing AngularJS $scope patterns
 * Origin: BusinessStarterController.js
 */

// Customer/Partner Types
export interface Customer {
  customer_id: string;
  customer_name: string;
  customer_logo?: string;
  bps_list: BusinessProcess[];
  visible_status?: boolean;
  isSelected?: boolean;
}

export interface BusinessProcess {
  bps_id: string;
  bps_desc: string;
  bps_logo?: string;
  contract_start_date: string;
  contract_end_date: string;
  lobtype?: string;
  bu_list?: BusinessUnit[];
  visible_status?: boolean;
}

export interface BusinessUnit {
  bu_id: string;
  bu_desc: string;
  contract_start_date: string;
  contract_end_date: string;
  dept_list?: Department[];
  visible_status?: boolean;
  isSelected?: boolean;
}

export interface Department {
  dept_id: string;
  dept_desc: string;
  visible_status?: boolean;
  deptQueues?: Queue[][];
}

export interface Queue {
  queue_id: string;
  custom_queue_name: string;
  customer_id: string;
  bps_id: string;
  bu_id: string;
  dept_id?: string;
  tps_id?: string;
  user_id?: string;
  isAnalyticsQueue?: '0' | '1';
  default_schema_fields?: Record<string, unknown> | string;
  visible_status?: boolean;
  menuList?: MenuItem[];
}

export interface MenuItem {
  menu_item: string;
  menu_display: string;
  menu_display_icon: string;
  menu_count: number;
}

// Dashboard Types
export interface CustomerDashboardData {
  title: string;
  tableHeaders: TableHeader[];
  CustomerData: CustomerPerformance[];
}

export interface TableHeader {
  name: string;
  enable: boolean;
  sequenceOrder?: number;
}

export interface CustomerPerformance {
  customer_id: string;
  customer_name: string;
  performance: 'good' | 'average' | 'poor';
  bpsList: BpsPerformance[];
}

export interface BpsPerformance {
  bps_id: string;
  bps_desc: string;
  availability: number;
  last_login_time: string;
  slaScore?: number;
  ticket_counts?: number;
}

// Admin Settings Types
export interface AdminSettingQueue {
  queue_id: string;
  custom_queue_name: string;
  isEnable: boolean;
  isMailEnable: boolean;
  qValidityDate?: Date;
  expanded?: boolean;
  hasQueueChanges?: boolean;
  hasUserChanges?: boolean;
  hasMenuChanges?: boolean;
  hasActionChanges?: boolean;
  UsersAssigned?: UserAssignment[];
}

export interface UserAssignment {
  userName: string;
  isEnable: boolean;
  userValidityDate?: Date;
  showDetails?: boolean;
  menuAssigned?: MenuAssignment[];
  actionAssigned?: ActionAssignment[];
}

export interface MenuAssignment {
  menuDisplayName: string;
  isEnable: boolean;
  userValidityDate?: Date;
  hasChanged?: boolean;
}

export interface ActionAssignment {
  displayName: string;
  isEnable: boolean;
  userValidityDate?: Date;
}

// TechOps Types
export interface TechOpsWorkflow {
  workflow_status: string;
  queue_btime: string;
  uin: string;
  DIN: string;
  extracted_file_name: string;
  lob_servicedashboard?: string;
  thisFiledemography?: {
    uploadId: string;
  };
}

export interface TechOpsInboxResponse {
  workflows: TechOpsWorkflow[];
  totalCount: number;
}

// Pagination Types
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

// Tab Types
export interface InsightTab {
  title: string;
  enable_label: number;
  BPaaS_Workflow_TabsConfigs?: string;
}

// Business Starter State
export interface BusinessStarterState {
  // Landing page
  landingPageNumber: number;
  switchToQueuePage: boolean;
  loadingAfterSignIn: boolean;
  analyticsPageLoading: boolean;
  isTabLoading: boolean;

  // Customer/Partner selection
  selectedCustomerId: string | null;
  selectedCustomerName: string | null;
  selectedCustomerList: Customer[];
  businessPartnerList: Record<string, BusinessProcess[]>;
  businessProcessList: Record<string, BusinessUnit[]>;

  // Business Process selection
  selectedBusinessProcessId: string | null;
  selectedBusinessProcess: string | null;
  selectedBpsList: BusinessProcess[][];

  // Business Unit selection
  selectedBuIndex: number;
  selectedBuList: BusinessUnit[];
  businessQueueList: Queue[];
  businessQueueGrid: Queue[][];

  // Search filters
  searchBUInput: string;
  searchDepartments: string;
  searchQueues: string;
  searchInput: string;
  superSearch: string;

  // View state
  isGridView: boolean;
  selectedInsightsTab: number;
  insightsTabs: InsightTab[];
  // Raw BPaaSWorkflowTabs from sign-in response[2] - index 0 = super company tabs, index 1 = non-super
  bpaasWorkflowTabs: any[];

  // Dashboard data
  customerDashboardData: CustomerDashboardData | null;

  // Admin settings
  selectedBps: string | null;
  locateAdminBps: boolean;
  adminQueues: AdminSettingQueue[];
  isLoadingBpsDetails: boolean;

  // TechOps
  selectedTechopsBps: string | null;
  locateAdminTechopsBps: boolean;
  techOpsWorkflows: TechOpsWorkflow[];
  techOpsPagination: PaginationState;
  isLoadingTechopsDetails: boolean;
  noDataAvailableTechopsInbox: boolean;

  // Profile
  profileSwitchingEnabled: boolean;
  settingEnable: boolean;
}

// API Input Types
export interface LoadQueueMenuStatusInput {
  customer_id: string;
  bps_id: string;
  bu_id: string;
  tps_id?: string;
  dept_id?: string;
  queue_id?: string;
  user_id: string;
}

export interface AdminSettingInput {
  customer_id: string;
  bps_id: string;
}

export interface EnableDisableInput {
  customer_id: string;
  bps_id: string;
  queueid: string;
  userid: string;
  tableName: string;
  EnableOrDisable: '0' | '1';
  processName?: string;
}

export interface EnableDisableMenuInput {
  customer_id: string;
  bps_id: string;
  queue_id: string;
  user_id: string;
  displayName: string;
  isActionEnabled: boolean;
  expiryDate?: Date | null;
}

export interface TechOpsInboxInput {
  customer_id: string;
  bps_id: string;
  exceptiontype: string;
  minlimit: number;
  maxlimit: number;
}
