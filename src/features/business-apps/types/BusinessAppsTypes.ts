// BusinessApps Types
// Migrated from BusinessAppsController.js

// Response from load_bu_queue_actions API
export interface BuQueueAction {
  result?: string;
  bu_id: string;
  bu_desc: string;
  tps_id: string;
  dept_id: string;
  queue_info: QueueInfo[];
}

export interface QueueInfo {
  queue_id: string;
  custom_queue_name: string;
  workflow_inbox_config: string; // JSON string that needs parsing
}

export interface WorkflowInboxConfigItem {
  displayName: string;
  isActionEnabled: boolean;
  workflowName: string;
  [key: string]: unknown; // Dynamic action keys like "new", "pending", etc.
}

// Parsed queue action for UI rendering
export interface ParsedQueueItem {
  queue_id: string;
  QueueNames: string;
  QueueProperties: QueueProperty[];
  display_id: number;
}

export interface QueueProperty {
  bPaaS_workflow_status: string;
  bPaaS_workflow_id: number;
  count: number;
  displayName: string;
  isActionEnabled: boolean;
  inboxHeaders: unknown;
  workflowName: string;
}

// Response from load_workflow_inbox_menus API
export interface WorkflowInboxMenu {
  menu_configuration?: string;
  workflow_inbox_config?: string;
  analytics_aging?: string;
  result?: string;
}

// Response from load_inbox_serachConfig API
export interface InboxSearchConfig {
  search_config?: string;
  result?: string;
}

// Response from load_din_dashboard API
export interface DinDashboardData {
  [key: string]: unknown;
}

// Response from loadDisplayTimeForInbox API
export interface DisplayTimeSettings {
  display_time?: string;
  timezone?: string;
  result?: string;
}

// Response from load_pending_list API
export interface PendingListData {
  [key: string]: unknown;
}

// Response from loadDocUploadRecents API
export interface DocUploadRecent {
  file_id: string;
  file_name: string;
  upload_date: string;
  mime_type?: string;
  [key: string]: unknown;
}

export interface MenuTab {
  title: string;
  bu_id: string;
  tps_id: string;
  dept_id: string;
  menutabs_id: number;
}

export interface QueueAction {
  queue_id: string;
  queue_name: string;
  bu_id: string;
  bu_desc: string;
  tps_id: string;
  dept_id: string;
  customer_id: string;
  bps_id: string;
}

export interface WorkflowItem {
  BatchID: string;
  TransactionID: string;
  DocumentID?: string;
  Queue: string;
  queue_id: string;
  ActivityDate: string;
  Actions: string;
  customer_id: string;
  bps_id: string;
  bu_id: string;
  tps_id: string;
  dept_id: string;
  file_id?: string;
  source_file_id?: string;
  extracted_file_id?: string;
  efs_uin?: string;
  exception_type?: string;
  exception_ticket?: string;
  ixsd_data_exception?: Record<string, unknown>;
  fromController?: string;
  hasException?: number;
}

export interface TasksCount {
  queue_id: string;
  counts: number;
}

export interface AgingFilter {
  label: string;
  value: string;
  minHours: number;
  maxHours: number | null;
}

export interface SearchField {
  field: string;
  label: string;
  type: 'text' | 'date' | 'select';
  options?: string[];
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface UploadAttachment {
  file: File;
  name: string;
  size: number;
  type: string;
}

export interface ExportConfig {
  type: string;
  label: string;
  enabled: boolean;
}

export interface BusinessAppsState {
  // Menu tabs
  menuTabs: MenuTab[];
  selectedTabIndex: number;
  // Queue actions
  queueActions: QueueAction[];
  selectedQueue: QueueAction | null;
  // Workflows
  recentWorkflows: WorkflowItem[];
  pastDueWorkflows: WorkflowItem[];
  customWorkflows: WorkflowItem[];
  // Tasks count
  tasksCount: TasksCount[];
  // Pagination
  pagination: PaginationState;
  // Filters
  selectedAgingFilter: string;
  searchField: string;
  searchValue: string;
  // Date range for custom view
  dateRange: DateRange;
  // File upload
  attachments: UploadAttachment[];
  totalUploadSize: number;
  // Export config
  exportConfig: ExportConfig[];
  // View state
  currentView: 'recent' | 'pastDue' | 'custom' | 'upload';
  isSidebarCollapsed: boolean;
  // Loading states
  loading: boolean;
  loadingWorkflows: boolean;
  error: string | null;
}

export const AGING_FILTERS: AgingFilter[] = [
  { label: '0-24 hrs', value: '0-24', minHours: 0, maxHours: 24 },
  { label: '24-48 hrs', value: '24-48', minHours: 24, maxHours: 48 },
  { label: '>48 hrs', value: '>48', minHours: 48, maxHours: null },
];

export const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];
