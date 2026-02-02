/**
 * Business Apps Service
 * Business logic for business apps feature
 * Origin: BusinessAppsController.js helper functions
 */
import type {
  Workflow,
  WorkflowColumn,
  QueueItem,
  QueueProperty,
} from '../types/BusinessAppsTypes';

/**
 * Extract DIN data from workflow row
 * Origin: $rootScope.extractDINData
 */
export function extractDINData(workflow: Workflow): WorkflowColumn[] {
  return [
    {
      column_value: workflow.BatchID,
      exception_msg: {},
      dataType: 'text',
      hasExceptionList: false,
      columnLabel: 'UIN',
      displayStatus: true,
    },
    {
      column_value: workflow.Queue,
      exception_msg: {},
      dataType: 'text',
      hasExceptionList: false,
      columnLabel: 'Source File',
      displayStatus: true,
    },
    {
      column_value: workflow.TransactionID,
      exception_msg: {},
      dataType: 'text',
      hasExceptionList: false,
      columnLabel: 'DIN',
      displayStatus: true,
    },
    {
      column_value: workflow.ActivityDate,
      exception_msg: {},
      dataType: 'datetime',
      hasExceptionList: false,
      columnLabel: 'DIN Audit Time',
      displayStatus: true,
    },
    {
      column_value: 'Failed in business compliances..',
      exception_msg: {
        lineItem: [
          {
            expenseLedger: ['Expense Ledger Is Missing'],
          },
        ],
      },
      dataType: 'text',
      hasExceptionList: true,
      columnLabel: 'Exception',
      displayStatus: true,
    },
  ];
}

/**
 * Get navigation path based on queue_id
 * Origin: $rootScope.performAction switch statement
 */
export function getNavigationPath(queueId: string, bpsType?: string): string {
  if (queueId === 'qu10012' || queueId === 'qu10011') {
    return '/DataValidation';
  }

  if (queueId === 'qu10003') {
    return '/DataEntryAdmin';
  }

  if (queueId === 'qu10004' || queueId === 'qu10011') {
    return '/DataEntryPage';
  }

  if (queueId === 'qu10013') {
    return '/TechOpsTicketPreview';
  }

  if (bpsType === 'APP') {
    return '/AppDataPage';
  }

  if (bpsType === 'ERD') {
    return '/ExcelViewPage';
  }

  return '/BusinessCompliance';
}

/**
 * Get dynamic path mapping for recent items
 * Origin: $rootScope.dynamicPathMapping in performAction
 */
export function getDynamicPathMapping(queueId: string): string {
  switch (queueId) {
    case 'qu10003':
      return 'ActiveTasksDataEntryAdminPage';
    case 'qu10004':
    case 'qu10011':
      return 'ActiveTasksDataEntryPage';
    case 'qu10012':
      return 'ActiveTasksDataValidation';
    default:
      return 'ActiveTasks';
  }
}

/**
 * Group queue actions by business unit
 * Origin: Queue grouping logic in loadQueueData
 */
export function groupQueueActionsByBU(queueActions: unknown[]): QueueItem[] {
  const groupedItems: Record<string, QueueItem> = {};
  let displayId = 0;

  queueActions.forEach((action) => {
    const item = action as {
      QueueNames: string;
      queue_id: string;
      bPaaS_workflow_id: string;
      bPaaS_workflow_status: string;
      displayName: string;
      count: number;
      isActionEnabled: boolean;
    };

    if (!groupedItems[item.QueueNames]) {
      groupedItems[item.QueueNames] = {
        QueueNames: item.QueueNames,
        queue_id: item.queue_id,
        QueueProperties: [],
        display_id: displayId++,
      };
    }

    groupedItems[item.QueueNames].QueueProperties.push({
      bPaaS_workflow_id: item.bPaaS_workflow_id,
      bPaaS_workflow_status: item.bPaaS_workflow_status,
      displayName: item.displayName,
      count: item.count,
      isActionEnabled: item.isActionEnabled,
    });
  });

  return Object.values(groupedItems);
}

/**
 * Extract timezone from display time string
 * Origin: AppRecentExtractTimeZone function
 */
export function extractTimeZone(timeZoneString: string): string {
  const parts = timeZoneString.trim().split(' ');
  return parts[parts.length - 1];
}

/**
 * Convert date to target timezone
 * Origin: AppRecentConvertTimeZone function
 */
export function convertTimeZone(date: string, targetTimeZone: string): string {
  try {
    return new Date(date).toLocaleString('en-US', {
      timeZone: targetTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return date;
  }
}

/**
 * Format date for API input
 * Origin: moment formatting in controller
 */
export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get start of day for a date
 */
export function getStartOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

/**
 * Get end of day for a date
 */
export function getEndOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

/**
 * Get aging filter value from tab index
 * Origin: Aging tab selection logic
 */
export function getAgingFilterValue(tabIndex: number): string {
  switch (tabIndex) {
    case 0:
      return 'all';
    case 1:
      return '0-24';
    case 2:
      return '24-48';
    case 3:
      return '>48';
    default:
      return 'all';
  }
}

/**
 * Calculate pagination offset
 */
export function calculatePaginationOffset(page: number, itemsPerPage: number): number {
  return (page - 1) * itemsPerPage;
}

/**
 * Check if workflow has exception
 * Origin: Exception checking logic in extractDINData
 */
export function hasWorkflowException(workflow: Workflow): boolean {
  if (!workflow.ixsd_data_exception) return false;

  const exceptions = workflow.ixsd_data_exception;
  if (typeof exceptions === 'object') {
    return Object.keys(exceptions).length >= 20;
  }

  return false;
}

/**
 * Get the last exception version from workflow
 * Origin: Exception version extraction in extractDINData
 */
export function getLastExceptionVersion(workflow: Workflow): string {
  if (!workflow.ixsd_data_exception) return '0';

  const exceptions = workflow.ixsd_data_exception;
  const versions = Object.keys(exceptions);
  return versions.length > 0 ? versions[versions.length - 1] : '0';
}

/**
 * Check if object is empty
 * Origin: $scope.isEmptyJSONObject
 */
export function isEmptyObject(obj: unknown): boolean {
  if (obj === null || obj === undefined) return true;
  if (typeof obj !== 'object') return false;
  return Object.keys(obj).length === 0;
}

/**
 * Filter enabled queue properties
 */
export function filterEnabledProperties(properties: QueueProperty[]): QueueProperty[] {
  return properties.filter(prop => prop.isActionEnabled);
}
