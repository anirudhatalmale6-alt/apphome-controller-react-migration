/**
 * BusinessHomeViews Types
 * Type definitions for dashboard analytics data
 */

export interface TasksWorkflowCount {
  tasksCount: number;
  workflowsCount: number;
  pendingTasks: number;
  completedTasks: number;
  inProgressTasks: number;
}

export interface DisplayTimeSettings {
  timezone: string;
  displayFormat: string;
  offset: number;
}

export interface YTDPendingItem {
  category: string;
  count: number;
  percentage: number;
}

export interface YTDPending30_60_90 {
  today: number;
  yesterday: number;
  days_3_7: number;
  days_8_15: number;
  days_16_30: number;
  days_31_60: number;
  days_61_90: number;
  days_90_plus: number;
}

export interface BusinessException {
  id: string;
  exception_type: string;
  exception_description: string;
  supplier_name: string;
  created_date: string;
  status: string;
  priority: string;
  assigned_to: string;
}

export interface SupplierExceptionCount {
  supplier_id: string;
  supplier_name: string;
  exception_count: number;
  resolved_count: number;
  pending_count: number;
}

export interface BatchInventoryOverview {
  total_batches: number;
  processed_batches: number;
  pending_batches: number;
  error_batches: number;
  processing_rate: number;
}

export interface BatchInventory30_60_90 {
  days_0_30: number;
  days_31_60: number;
  days_61_90: number;
  days_90_plus: number;
}

export interface InvoiceInventoryOverview {
  total_invoices: number;
  processed_invoices: number;
  pending_invoices: number;
  error_invoices: number;
  total_amount: number;
}

export interface AgentData {
  agent_id: string;
  agent_name: string;
  tasks_completed: number;
  tasks_pending: number;
  avg_processing_time: number;
  efficiency_score: number;
}

export interface InsightsCustomData {
  id: string;
  metric_name: string;
  metric_value: number;
  period: string;
  trend: 'up' | 'down' | 'stable';
}

export interface BusinessConfig {
  customer_id: string;
  bps_id: string;
  business_unit: string;
  sp_process_id: string;
  queue_id: string;
  features_enabled: string[];
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  scales?: {
    x?: { title?: { display: boolean; text: string } };
    y?: { title?: { display: boolean; text: string }; beginAtZero?: boolean };
  };
  plugins?: {
    legend?: { display: boolean; position?: 'top' | 'bottom' | 'left' | 'right' };
    title?: { display: boolean; text: string };
  };
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SearchFilters {
  searchText: string;
  dateRange?: DateRange;
  status?: string;
  supplier?: string;
}
