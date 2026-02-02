/**
 * Business Starter Service
 * Business logic for business starter feature
 * Origin: BusinessStarterController.js helper functions
 */
import type {
  Queue,
  BusinessUnit,
  BusinessProcess,
  Customer,
  TechOpsWorkflow,
} from '../types/BusinessStarterTypes';

/**
 * Groups queues into rows of 4 for grid display
 * Origin: Queue grid arrangement logic in BusinessStarterController.js
 */
export function arrangeIntoGrid<T>(items: T[], itemsPerRow = 4): T[][] {
  const grid: T[][] = [];
  let row: T[] = [];

  items.forEach((item, index) => {
    row.push(item);
    if ((index + 1) % itemsPerRow === 0) {
      grid.push(row);
      row = [];
    }
  });

  if (row.length > 0) {
    grid.push(row);
  }

  return grid;
}

/**
 * Filters items by search term
 * Origin: $scope.filterBusinessProcess, $scope.filterBusinessPartner
 */
export function filterBySearchTerm<T extends { visible_status?: boolean }>(
  items: T[],
  searchTerm: string,
  getSearchField: (item: T) => string
): T[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return items.map(item => ({ ...item, visible_status: true }));
  }

  const term = searchTerm.trim().toLowerCase();
  return items
    .map(item => ({
      ...item,
      visible_status: getSearchField(item).toLowerCase().includes(term),
    }))
    .filter(item => item.visible_status);
}

/**
 * Groups business queues by business unit ID
 * Origin: $scope.groupingBusinessUnit
 */
export function groupQueuesByBusinessUnit(queues: Queue[]): Record<string, Queue[]> {
  return queues.reduce((acc, queue) => {
    const buId = queue.bu_id;
    if (!acc[buId]) {
      acc[buId] = [];
    }
    acc[buId].push(queue);
    return acc;
  }, {} as Record<string, Queue[]>);
}

/**
 * Groups queues by department ID
 * Origin: Dept grouping logic in groupingBusinessUnit
 */
export function groupQueuesByDepartment(queues: Queue[]): Record<string, Queue[]> {
  return queues.reduce((acc, queue) => {
    const deptId = queue.dept_id || 'default';
    if (!acc[deptId]) {
      acc[deptId] = [];
    }
    acc[deptId].push(queue);
    return acc;
  }, {} as Record<string, Queue[]>);
}

/**
 * Groups business processes by customer ID
 * Origin: Business partner list grouping
 */
export function groupByCustomerId<T extends { customer_id: string }>(
  items: T[]
): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const customerId = item.customer_id;
    if (!acc[customerId]) {
      acc[customerId] = [];
    }
    acc[customerId].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Groups items by business process ID
 * Origin: Business process list grouping
 */
export function groupByBusinessProcessId<T extends { bps_id: string }>(
  items: T[]
): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const bpsId = item.bps_id;
    if (!acc[bpsId]) {
      acc[bpsId] = [];
    }
    acc[bpsId].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Checks if a contract is active based on end date
 * Origin: $scope.isContactActive
 */
export function isContractActive(endDate: string): boolean {
  const today = new Date();
  const contractEnd = new Date(endDate);
  return today < contractEnd;
}

/**
 * Calculates SLA status based on score
 * Origin: $scope.calculateSLA
 */
export function calculateSLAStatus(score: number): 'Excellent' | 'Good' | 'Average' | 'Poor' {
  if (score >= 95) return 'Excellent';
  if (score >= 85) return 'Good';
  if (score >= 70) return 'Average';
  return 'Poor';
}

/**
 * Parses TechOps workflow data
 * Origin: Workflow parsing in loadTechopsInboxPage
 */
export function parseTechOpsWorkflow(workflow: TechOpsWorkflow): TechOpsWorkflow {
  if (workflow.lob_servicedashboard) {
    try {
      const lobData = JSON.parse(workflow.lob_servicedashboard);
      if (lobData.Filedemography && lobData.Filedemography.uploadId) {
        return {
          ...workflow,
          thisFiledemography: lobData.Filedemography,
        };
      }
    } catch {
      console.error('Invalid lob_servicedashboard JSON');
    }
  }
  return workflow;
}

/**
 * Parses default schema fields from string to object
 * Origin: default_schema_fields parsing logic
 */
export function parseDefaultSchemaFields(
  fields: string | Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!fields) return {};
  if (typeof fields === 'object') return fields;
  try {
    return JSON.parse(fields);
  } catch {
    return {};
  }
}

/**
 * Creates customer list from business partner data
 * Origin: Customer list creation in startMyBusiness
 */
export function createCustomerListFromPartners(
  businessPartnerList: Record<string, BusinessProcess[]>
): Customer[] {
  return Object.entries(businessPartnerList).map(([customerId, processes], index) => ({
    customer_id: customerId,
    customer_name: (processes[0] as unknown as { customer_name: string }).customer_name || '',
    customer_logo: (processes[0] as unknown as { customer_logo?: string }).customer_logo,
    bps_list: processes,
    visible_status: true,
    isSelected: index === 0,
  }));
}

/**
 * Creates business process list for display
 * Origin: BPS list creation in selectCustomer
 */
export function createBpsListForDisplay(
  businessProcessList: Record<string, BusinessUnit[]>
): BusinessProcess[][] {
  const bpsList: BusinessProcess[][] = [];
  let bpsRow: BusinessProcess[] = [];
  let index = 0;

  for (const bpsId in businessProcessList) {
    const units = businessProcessList[bpsId];
    if (units && units.length > 0) {
      const firstUnit = units[0];
      const bpsInput: BusinessProcess = {
        bps_id: bpsId,
        bps_desc: (firstUnit as unknown as { bps_desc: string }).bps_desc || '',
        bps_logo: (firstUnit as unknown as { bps_logo?: string }).bps_logo,
        contract_start_date: (firstUnit as unknown as { contract_start_date: string }).contract_start_date || '',
        contract_end_date: (firstUnit as unknown as { contract_end_date: string }).contract_end_date || '',
        lobtype: (firstUnit as unknown as { lobtype?: string }).lobtype,
        bu_list: units,
        visible_status: true,
      };

      bpsRow.push(bpsInput);
      index++;

      if (index % 4 === 0) {
        bpsList.push(bpsRow);
        bpsRow = [];
      }
    }
  }

  if (bpsRow.length > 0) {
    bpsList.push(bpsRow);
  }

  return bpsList;
}

/**
 * Gets pagination limits for API calls
 * Origin: Pagination calculation in loadTechopsInboxPage
 */
export function getPaginationLimits(
  page: number,
  itemsPerPage: number
): { minLimit: number; maxLimit: number } {
  return {
    minLimit: (page - 1) * itemsPerPage,
    maxLimit: itemsPerPage,
  };
}
