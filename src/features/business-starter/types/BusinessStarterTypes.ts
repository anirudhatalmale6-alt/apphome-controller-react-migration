// BusinessStarter Types

export interface Customer {
  customer_id: string;
  customer_name: string;
  customer_logo?: string;
  bps_list: BusinessProcess[];
  visible_status: boolean;
  isSelected?: boolean;
}

export interface BusinessProcess {
  bps_id: string;
  bps_desc: string;
  bps_logo?: string;
  contract_start_date: string;
  contract_end_date: string;
  bu_list: BusinessUnit[];
  visible_status: boolean;
  lobtype?: string;
}

export interface BusinessUnit {
  bu_id: string;
  bu_desc: string;
  contract_start_date: string;
  contract_end_date: string;
  visible_status: boolean;
  isSelected?: boolean;
  dept_list: Department[];
}

export interface Department {
  dept_id: string;
  dept_desc: string;
  visible_status: boolean;
  deptQueues: Queue[][];
}

export interface Queue {
  queue_id: string;
  custom_queue_name: string;
  bu_id: string;
  bu_desc: string;
  bps_id: string;
  dept_id: string;
  tps_id: string;
  customer_id: string;
  isAnalyticsQueue: string;
  default_schema_fields?: string | Record<string, unknown>;
  visible_status: boolean;
  menuList?: QueueMenu[];
}

export interface QueueMenu {
  menu_item: string;
  menu_display: string;
  menu_display_icon: string;
  menu_count: number;
}

export interface QueueMenuStatus {
  bPaaS_workflow_status: string;
  dinCount: number;
  queue_id: string;
}

export interface WorkflowMenu {
  queue_id: string;
  menu_configuration: string;
}

export interface CustomerDashboardData {
  CustomerData: CustomerPerformance[];
}

export interface CustomerPerformance {
  customer_id: string;
  customer_name: string;
  customer_logo?: string;
  sla_score?: number;
  bps_list: BpsPerformance[];
}

export interface BpsPerformance {
  bps_id: string;
  bps_desc: string;
  bps_logo?: string;
}

export interface AdminSettingsQueue {
  queue_id: string;
  queue_name: string;
  isEnable: boolean;
  isMailEnable: boolean;
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
  menuAssigned?: MenuAssignment[];
  actionAssigned?: ActionAssignment[];
}

export interface MenuAssignment {
  menuDisplayName: string;
  isEnable: boolean;
  userValidityDate?: string;
  hasChanged?: boolean;
}

export interface ActionAssignment {
  displayName: string;
  isEnable: boolean;
}

export interface TechopsWorkflow {
  BatchID: string;
  TransactionID: string;
  DocumentID: string;
  ActivityDate: string;
  TicketStatus: string;
  FileName: string;
  lob_servicedashboard?: string;
  thisFiledemography?: {
    uploadId: string;
  };
}

export interface TechopsInboxResponse {
  workflows: TechopsWorkflow[];
  totalCount: number;
}

export interface InsightsTab {
  tab_name: string;
  tab_config: string;
}

export interface BusinessStarterState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  selectedCustomerId: string | null;
  businessProcessList: Record<string, BusinessProcess[]>;
  selectedBpsList: BusinessProcess[][];
  selectedBuList: BusinessUnit[];
  selectedBuIndex: number;
  businessQueueList: Queue[];
  businessQueueGrid: Queue[][];
  landingPageNumber: number;
  switchToQueuePage: boolean;
  currentDeptIndex: number;
  searchBUInput: string;
  searchDepartments: string;
  searchQueues: string;
  isGridView: boolean;
  selectedInsightsTab: number;
  isTabLoading: boolean;
  // Customer Dashboard
  customerDashboardData: CustomerPerformance[];
  // Admin Settings
  adminSettingsCustomers: CustomerPerformance[];
  adminSettingsQueues: AdminSettingsQueue[];
  selectedAdminBpsId: string | null;
  selectedAdminCustomerId: string | null;
  isLoadingBpsDetails: boolean;
  // TechOps
  techopsCustomers: CustomerPerformance[];
  techopsWorkflows: TechopsWorkflow[];
  techopsTotalItems: number;
  currentTechopsPage: number;
  itemsPerPageTechops: number;
  selectedTechopsBpsId: string | null;
  selectedTechopsCustomerId: string | null;
  isLoadingTechopsDetails: boolean;
  // Loading states
  loading: boolean;
  error: string | null;
}
