/**
 * BusinessTasksController Types
 * Type definitions for task management module
 */

export interface TaskWorkflow {
  workflow_id: string;
  task_id: string;
  task_name: string;
  status: string;
  priority: string;
  created_date: string;
  due_date: string;
  assigned_to: string;
  queue_name: string;
  file_name?: string;
  din_number?: string;
}

export interface TaskCount {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
}

export interface DisplayTimeSettings {
  timezone: string;
  displayFormat: string;
  offset: number;
}

export interface YTDAuditData {
  id: string;
  date: string;
  action: string;
  user: string;
  details: string;
  count_30: number;
  count_60: number;
  count_90: number;
}

export interface InsightsCustomData {
  id: string;
  metric_name: string;
  metric_value: number;
  period: string;
  trend: 'up' | 'down' | 'stable';
}

export interface SearchConfig {
  fields: {
    name: string;
    type: string;
    label: string;
    options?: string[];
  }[];
}

export interface ExceptionItem {
  id: string;
  exception_type: string;
  description: string;
  supplier_name: string;
  created_date: string;
  status: string;
  priority: string;
}

export interface SupplierExceptionCount {
  supplier_id: string;
  supplier_name: string;
  exception_count: number;
}

export interface AgingCount {
  days_0_30: number;
  days_31_60: number;
  days_61_90: number;
  days_90_plus: number;
}

export interface ProcessedQueueData {
  queue_id: string;
  queue_name: string;
  processed_count: number;
  pending_count: number;
  error_count: number;
}

export interface RecentWorkflow {
  workflow_id: string;
  workflow_name: string;
  status: string;
  created_date: string;
  updated_date: string;
  assigned_to: string;
  file_name?: string;
}

export interface PastDueWorkflow {
  workflow_id: string;
  workflow_name: string;
  due_date: string;
  days_overdue: number;
  priority: string;
  assigned_to: string;
}

export interface CustomWorkflow {
  workflow_id: string;
  workflow_name: string;
  custom_field_1?: string;
  custom_field_2?: string;
  status: string;
  created_date: string;
}

export interface TransactionLog {
  log_id: string;
  din_number: string;
  action: string;
  timestamp: string;
  user: string;
  details: string;
}

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  enabled: boolean;
}

export interface InsightsTab {
  id: string;
  label: string;
  type: 'aging' | 'custom' | 'exceptions';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SearchFilters {
  searchText: string;
  dateRange?: DateRange;
  status?: string;
  priority?: string;
}

export interface DINData {
  din_number: string;
  workflow_id: string;
  file_name: string;
  status: string;
  history: TransactionLog[];
}
