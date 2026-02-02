/**
 * Business Apps Types
 * Strongly typed models replacing AngularJS $scope patterns
 * Origin: BusinessAppsController.js
 */

// Workflow Types
export interface Workflow {
  BatchID: string;
  TransactionID: string;
  ActivityDate: string;
  ConvertedAppRecentActivityDate?: string;
  Queue: string;
  Actions: string;
  customer_id: string;
  bps_id: string;
  bu_id: string;
  tps_id?: string;
  dept_id?: string;
  queue_id: string;
  exception_type?: string;
  exception_ticket?: string;
  file_id?: string;
  source_file_id?: string;
  extracted_file_id?: string;
  efs_uin?: string;
  ixsd_data_exception?: Record<string, unknown>;
  result?: string;
}

export interface WorkflowColumn {
  column_value: string;
  exception_msg: Record<string, unknown>;
  dataType: string;
  hasExceptionList: boolean;
  columnLabel: string;
  displayStatus: boolean;
  exception_log?: string;
}

// Tab Types
export interface MenuTab {
  title: string;
  bu_id: string;
  tps_id?: string;
  dept_id?: string;
  menutabs_id: number;
}

export interface TimelineTab {
  title: string;
  index: number;
}

// Queue Types
export interface QueueItem {
  QueueNames: string;
  queue_id: string;
  QueueProperties: QueueProperty[];
  display_id: number;
}

export interface QueueProperty {
  bPaaS_workflow_id: string;
  bPaaS_workflow_status: string;
  displayName: string;
  count: number;
  isActionEnabled: boolean;
}

// Search Types
export interface SearchConfig {
  id: string;
  name: string;
  isActionEnabled: boolean;
}

// Pagination Types
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

// Date Range Types
export interface DateRange {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  startDateAndTime: string;
  endDateAndTime: string;
}

// Upload Types
export interface UploadFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

export interface UploadList {
  files: UploadFile[];
  totalSize: number;
}

// Aging Types
export interface AgingTab {
  title: string;
  value: string;
  index: number;
}

// Task Count Types
export interface TaskCount {
  counts: number;
  status: string;
}

// Business Apps State
export interface BusinessAppsState {
  // Loading states
  analyticsPageLoading: boolean;
  appPageLoading: boolean;
  isDashboardAvailable: boolean;
  isBusinessStarterLoaded: boolean;

  // Tab state
  menuTabs: MenuTab[];
  selectedTabIndex: number;
  selectedTab: number; // For timeline tabs (Recent, Past Due, Custom)
  tabs: TimelineTab[];

  // Queue state
  buQueueItems: QueueItem[];
  buQueueActionsItems: QueueItem[];
  expandedSections: Record<string, boolean>;
  activeItemIndex: Record<string, number>;
  queueIdFromUI: string | null;
  actionsFromUI: QueueProperty | null;

  // Workflow data
  workflows: Workflow[];
  searchRecentData: Workflow[];
  totalItemsAppsRecents: number;
  totalItemsAppsPastDue: number;
  totalItemsAppsCustom: number;

  // Search state
  searchText: string;
  searchByAll: SearchConfig[];
  selectedAction: SearchConfig | null;
  isSearchEnable: boolean;
  inputColumn: string | null;
  inputValue: string | null;

  // Pagination
  pagination: PaginationState;
  optionsPerPage: number[];

  // Date range for custom tab
  dateRange: DateRange;

  // Aging tab
  agingSelectedTab: number;
  agingTabs: AgingTab[];

  // Upload state
  attachmentList: UploadFile[];
  totalUploadSize: number;
  ifMenuUploads: boolean;

  // No data flags
  noDataAvailableRecent: boolean;
  noDataAvailablePast: boolean;
  noDataAvailableCustom: boolean;

  // Display time
  displayTimeValue: string;

  // Task counts
  tasksCountForUI: TaskCount[];

  // Selected workflow
  selectedDIN: Workflow | null;
  storedWorkflow: Workflow | null;
  storedEvent: unknown | null;
  storedIndex: number | null;
}

// API Input Types
export interface LoadQueueDataInput {
  customer_id: string;
  bps_id: string;
  user_id: string;
  pageNumber: number;
  pageSize: number;
}

export interface TaskCountInput {
  customer_id: string;
  bps_id: string;
  user_id: string;
}

export interface SearchRecentInput {
  customer_id: string;
  bps_id: string;
  bu_id: string;
  dept_id: string;
  queue_id: string;
  actionsType: string;
  user_id: string;
  searchColumn: string;
  searchInput: string;
  pageNumber: number;
  pageSize: number;
}

export interface LoadPastDueInput {
  customer_id: string;
  bps_id: string;
  bu_id: string;
  queue_id: string;
  actionsType: string;
  user_id: string;
  aging: string;
  pageNumber: number;
  pageSize: number;
}

export interface LoadCustomInput {
  customer_id: string;
  bps_id: string;
  bu_id: string;
  queue_id: string;
  actionsType: string;
  user_id: string;
  startDateTime: string;
  endDateTime: string;
  pageNumber: number;
  pageSize: number;
}

export interface SearchConfigInput {
  customer_id: string;
  bps_id: string;
  queue_id: string;
  module: string;
}

// Export config types
export interface ExportConfig {
  type: string;
  enabled: boolean;
  label: string;
}
