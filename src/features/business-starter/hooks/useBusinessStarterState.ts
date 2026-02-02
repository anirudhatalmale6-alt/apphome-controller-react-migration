/**
 * Business Starter State Hook
 * Custom hook for managing business starter state and logic
 * Origin: BusinessStarterController.js $scope functions
 */
import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  selectBusinessStarter,
  setLandingPageNumber,
  setSwitchToQueuePage,
  setLoadingAfterSignIn,
  setTabLoading,
  setSelectedCustomer,
  selectPartner as selectPartnerAction,
  setSelectedBpsList,
  setSelectedBuIndex,
  setSelectedBuList,
  setBusinessQueueList,
  setSearchInput,
  setSuperSearch,
  toggleGridView,
  setSelectedInsightsTab,
  setSelectedBps,
  toggleQueueExpanded,
  updateQueueEnable,
  updateQueueMailEnable,
  clearQueueChanges,
  setLoadingBpsDetails,
  setSelectedTechopsBps,
  setTechOpsWorkflows,
  setTechOpsPagination,
  setLoadingTechopsDetails,
  goBackToBusinessProcess,
} from '../store/businessStarterSlice';
import type {
  Customer,
  BusinessProcess,
  BusinessUnit,
  Queue,
  TechOpsWorkflow,
} from '../types/BusinessStarterTypes';

/**
 * Hook to manage business starter state
 * Replaces AngularJS $scope functions
 */
export function useBusinessStarterState() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectBusinessStarter);

  // Landing page actions
  const handleSetLandingPage = useCallback((page: number) => {
    dispatch(setLandingPageNumber(page));
  }, [dispatch]);

  const handleSwitchToQueuePage = useCallback((value: boolean) => {
    dispatch(setSwitchToQueuePage(value));
  }, [dispatch]);

  const handleGoBackToBusinessProcess = useCallback(() => {
    dispatch(goBackToBusinessProcess());
  }, [dispatch]);

  // Customer selection
  const handleSelectPartner = useCallback((index: number) => {
    dispatch(selectPartnerAction(index));
    const customer = state.selectedCustomerList[index];
    if (customer) {
      dispatch(setSelectedCustomer({ id: customer.customer_id, name: customer.customer_name }));
    }
  }, [dispatch, state.selectedCustomerList]);

  const handleSelectCustomer = useCallback((customer: Customer) => {
    dispatch(setSelectedCustomer({ id: customer.customer_id, name: customer.customer_name }));
  }, [dispatch]);

  // Business process grouping (origin: $scope.groupingBusinessUnit)
  const handleGroupBusinessUnit = useCallback((buList: Queue[]) => {
    dispatch(setLoadingAfterSignIn(true));
    dispatch(setBusinessQueueList(buList));

    // Group by business unit
    const selectedBuList: BusinessUnit[] = [];
    const groupByBu: Record<string, Queue[]> = {};

    buList.forEach(item => {
      const buId = item.bu_id;
      if (!groupByBu[buId]) {
        groupByBu[buId] = [];
      }
      groupByBu[buId].push(item);
    });

    let buLoopIndex = 0;
    for (const bu in groupByBu) {
      const queues = groupByBu[bu];
      const firstQueue = queues[0];

      const buInput: BusinessUnit = {
        bu_id: bu,
        bu_desc: (firstQueue as unknown as { bu_desc: string }).bu_desc || '',
        contract_start_date: (firstQueue as unknown as { contract_start_date: string }).contract_start_date || '',
        contract_end_date: (firstQueue as unknown as { contract_end_date: string }).contract_end_date || '',
        visible_status: true,
        isSelected: buLoopIndex === 0,
        dept_list: [],
      };

      // Group by department
      const groupByDept: Record<string, Queue[]> = {};
      queues.forEach(item => {
        const deptId = item.dept_id || 'default';
        if (!groupByDept[deptId]) {
          groupByDept[deptId] = [];
        }
        groupByDept[deptId].push(item);
      });

      for (const dept in groupByDept) {
        const deptQueues = groupByDept[dept];
        const firstDeptQueue = deptQueues[0];

        // Create queue grid (4 items per row)
        const deptQueueGrid: Queue[][] = [];
        let queueRow: Queue[] = [];

        deptQueues.forEach((item, index) => {
          item.visible_status = true;
          queueRow.push(item);
          if ((index + 1) % 4 === 0) {
            deptQueueGrid.push(queueRow);
            queueRow = [];
          }
        });
        if (queueRow.length > 0) {
          deptQueueGrid.push(queueRow);
        }

        buInput.dept_list!.push({
          dept_id: dept,
          dept_desc: (firstDeptQueue as unknown as { dept_desc: string }).dept_desc || '',
          visible_status: true,
          deptQueues: deptQueueGrid,
        });
      }

      selectedBuList.push(buInput);
      buLoopIndex++;
    }

    dispatch(setSelectedBuList(selectedBuList));
    dispatch(setSelectedBuIndex(0));
  }, [dispatch]);

  // Business process search filter
  const handleFilterBusinessProcess = useCallback((searchInput: string) => {
    const filteredBpsList: BusinessProcess[][] = [];
    let bpsRow: BusinessProcess[] = [];
    let index = 0;

    for (const bps in state.businessProcessList) {
      const processes = state.businessProcessList[bps];
      if (processes && processes.length > 0) {
        const firstProcess = processes[0];
        const bpsDesc = (firstProcess as unknown as { bps_desc: string }).bps_desc || '';

        if (bpsDesc.toLowerCase().includes(searchInput.toLowerCase())) {
          const bpsInput: BusinessProcess = {
            bps_id: bps,
            bps_desc: bpsDesc,
            bps_logo: (firstProcess as unknown as { bps_logo?: string }).bps_logo,
            contract_start_date: (firstProcess as unknown as { contract_start_date: string }).contract_start_date || '',
            contract_end_date: (firstProcess as unknown as { contract_end_date: string }).contract_end_date || '',
            lobtype: (firstProcess as unknown as { lobtype?: string }).lobtype,
            bu_list: processes as unknown as BusinessUnit[],
            visible_status: true,
          };

          bpsRow.push(bpsInput);
          index++;

          if (index % 4 === 0) {
            filteredBpsList.push(bpsRow);
            bpsRow = [];
          }
        }
      }
    }

    if (bpsRow.length > 0) {
      filteredBpsList.push(bpsRow);
    }

    dispatch(setSelectedBpsList(filteredBpsList));
  }, [dispatch, state.businessProcessList]);

  // View toggle
  const handleToggleGridView = useCallback(() => {
    dispatch(toggleGridView());
  }, [dispatch]);

  // Tab selection
  const handleSelectInsightsTab = useCallback((tab: number) => {
    dispatch(setSelectedInsightsTab(tab));
    dispatch(setTabLoading(true));
  }, [dispatch]);

  // Admin settings actions
  const handleToggleEditAction = useCallback((bpsId: string, _customerId: string) => {
    if (state.selectedBps === bpsId) {
      dispatch(setSelectedBps(null));
    } else {
      dispatch(setSelectedBps(bpsId));
      dispatch(setLoadingBpsDetails(true));
    }
  }, [dispatch, state.selectedBps]);

  const handleToggleQueue = useCallback((queueId: string) => {
    dispatch(toggleQueueExpanded(queueId));
  }, [dispatch]);

  const handleUpdateQueueEnable = useCallback((queueId: string, isEnable: boolean) => {
    dispatch(updateQueueEnable({ queueId, isEnable }));
  }, [dispatch]);

  const handleToggleMailAlert = useCallback((queueId: string) => {
    const queue = state.adminQueues.find(q => q.queue_id === queueId);
    if (queue) {
      dispatch(updateQueueMailEnable({ queueId, isMailEnable: !queue.isMailEnable }));
    }
  }, [dispatch, state.adminQueues]);

  const handleClearQueueChanges = useCallback((queueId: string) => {
    dispatch(clearQueueChanges(queueId));
  }, [dispatch]);

  // TechOps actions
  const handleToggleTechopsEditAction = useCallback((bpsId: string, _customerId: string) => {
    if (state.selectedTechopsBps === bpsId) {
      dispatch(setSelectedTechopsBps(null));
    } else {
      dispatch(setSelectedTechopsBps(bpsId));
      dispatch(setLoadingTechopsDetails(true));
    }
  }, [dispatch, state.selectedTechopsBps]);

  const handleSetTechOpsWorkflows = useCallback((workflows: TechOpsWorkflow[]) => {
    dispatch(setTechOpsWorkflows(workflows));
  }, [dispatch]);

  const handleSetTechOpsPagination = useCallback((pagination: Partial<typeof state.techOpsPagination>) => {
    dispatch(setTechOpsPagination(pagination));
  }, [dispatch]);

  // Back navigation
  const handleGoBackToCustomerList = useCallback(() => {
    dispatch(setSelectedBps(null));
  }, [dispatch]);

  const handleGoBackToTechopsCustomerList = useCallback(() => {
    dispatch(setSelectedTechopsBps(null));
  }, [dispatch]);

  // Search actions
  const handleSetSearchInput = useCallback((value: string) => {
    dispatch(setSearchInput(value));
  }, [dispatch]);

  const handleSetSuperSearch = useCallback((value: string) => {
    dispatch(setSuperSearch(value));
  }, [dispatch]);

  // Computed values
  const isAnyQueueExpanded = useMemo(() => {
    return state.adminQueues.some(q => q.expanded);
  }, [state.adminQueues]);

  const totalTechopsPages = useMemo(() => {
    return Math.ceil(state.techOpsPagination.totalItems / state.techOpsPagination.itemsPerPage);
  }, [state.techOpsPagination.totalItems, state.techOpsPagination.itemsPerPage]);

  // SLA calculation (origin: $scope.calculateSLA)
  const calculateSLA = useCallback((score: number): string => {
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Good';
    if (score >= 70) return 'Good';
    return 'Good';
  }, []);

  // Contract status check (origin: $scope.isContactActive)
  const isContractActive = useCallback((endDate: string): boolean => {
    const today = new Date();
    const contractEnd = new Date(endDate);
    return today < contractEnd;
  }, []);

  return {
    // State
    ...state,

    // Computed
    isAnyQueueExpanded,
    totalTechopsPages,

    // Actions
    handleSetLandingPage,
    handleSwitchToQueuePage,
    handleGoBackToBusinessProcess,
    handleSelectPartner,
    handleSelectCustomer,
    handleGroupBusinessUnit,
    handleFilterBusinessProcess,
    handleToggleGridView,
    handleSelectInsightsTab,
    handleToggleEditAction,
    handleToggleQueue,
    handleUpdateQueueEnable,
    handleToggleMailAlert,
    handleClearQueueChanges,
    handleToggleTechopsEditAction,
    handleSetTechOpsWorkflows,
    handleSetTechOpsPagination,
    handleGoBackToCustomerList,
    handleGoBackToTechopsCustomerList,
    handleSetSearchInput,
    handleSetSuperSearch,

    // Utilities
    calculateSLA,
    isContractActive,
  };
}

/**
 * Hook for pagination logic
 * Origin: $scope pagination functions in BusinessStarterController.js
 */
export function usePagination(totalItems: number, itemsPerPage: number) {
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage) || 1;
  }, [totalItems, itemsPerPage]);

  const getDisplayedPages = useCallback((currentPage: number, maxDisplay = 5) => {
    const start = Math.max(1, currentPage - Math.floor(maxDisplay / 2));
    const end = Math.min(totalPages, start + maxDisplay - 1);

    const displayed: number[] = [];
    for (let i = start; i <= end; i++) {
      displayed.push(i);
    }
    return displayed;
  }, [totalPages]);

  return {
    totalPages,
    getDisplayedPages,
  };
}
