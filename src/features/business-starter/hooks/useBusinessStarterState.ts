import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  setCustomers,
  selectCustomer,
  setBusinessProcessList,
  setSelectedBpsList,
  setSelectedBuList,
  setSelectedBuIndex,
  setBusinessQueueList,
  setLandingPageNumber,
  setSwitchToQueuePage,
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
  resetBusinessStarter,
} from '../store/businessStarterSlice';
import type {
  Customer,
  BusinessProcess,
  BusinessUnit,
  Queue,
  CustomerPerformance,
  AdminSettingsQueue,
  TechopsWorkflow,
} from '../types/BusinessStarterTypes';
import { useNavigate } from 'react-router-dom';

export function useBusinessStarterState() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const state = useAppSelector((state) => state.businessStarter);
  const auth = useAppSelector((state) => state.auth);

  // Customer selection
  const handleSelectCustomer = useCallback((customer: Customer) => {
    dispatch(selectCustomer(customer));

    // Group by bps_id
    const bpsList = customer.bps_list;
    const businessProcessList: Record<string, BusinessProcess[]> = {};
    bpsList.forEach((bp) => {
      if (!businessProcessList[bp.bps_id]) {
        businessProcessList[bp.bps_id] = [];
      }
      businessProcessList[bp.bps_id].push(bp);
    });
    dispatch(setBusinessProcessList(businessProcessList));

    // Arrange BPS list into grid (4 per row)
    const bpsGrid: BusinessProcess[][] = [];
    let row: BusinessProcess[] = [];
    bpsList.forEach((bp, index) => {
      row.push(bp);
      if ((index + 1) % 4 === 0) {
        bpsGrid.push(row);
        row = [];
      }
    });
    if (row.length > 0) {
      bpsGrid.push(row);
    }
    dispatch(setSelectedBpsList(bpsGrid));
    dispatch(setLandingPageNumber(1));
  }, [dispatch]);

  // Business unit grouping
  const handleGroupBusinessUnits = useCallback((buList: Queue[]) => {
    dispatch(setBusinessQueueList(buList));

    // Group by bu_id
    const groupByBu: Record<string, Queue[]> = {};
    buList.forEach((item) => {
      if (!groupByBu[item.bu_id]) {
        groupByBu[item.bu_id] = [];
      }
      groupByBu[item.bu_id].push(item);
    });

    // Build business unit list with departments
    const buListGrouped: BusinessUnit[] = [];
    Object.keys(groupByBu).forEach((buId, buIndex) => {
      const buItems = groupByBu[buId];
      const bu: BusinessUnit = {
        bu_id: buId,
        bu_desc: buItems[0].bu_desc,
        contract_start_date: '',
        contract_end_date: '',
        visible_status: true,
        isSelected: buIndex === 0,
        dept_list: [],
      };

      // Group by dept_id
      const groupByDept: Record<string, Queue[]> = {};
      buItems.forEach((item) => {
        if (!groupByDept[item.dept_id]) {
          groupByDept[item.dept_id] = [];
        }
        groupByDept[item.dept_id].push(item);
      });

      // Build department list with queues (4 per row)
      Object.keys(groupByDept).forEach((deptId) => {
        const deptItems = groupByDept[deptId];
        const deptQueues: Queue[][] = [];
        let queueRow: Queue[] = [];
        deptItems.forEach((queue, idx) => {
          queueRow.push({ ...queue, visible_status: true });
          if ((idx + 1) % 4 === 0) {
            deptQueues.push(queueRow);
            queueRow = [];
          }
        });
        if (queueRow.length > 0) {
          deptQueues.push(queueRow);
        }
        bu.dept_list.push({
          dept_id: deptId,
          dept_desc: deptItems[0].dept_id, // Assuming dept_desc same as dept_id
          visible_status: true,
          deptQueues,
        });
      });

      buListGrouped.push(bu);
    });

    dispatch(setSelectedBuList(buListGrouped));
    dispatch(setSelectedBuIndex(0));
    navigate('/business-home');
  }, [dispatch, navigate]);

  // Select queue and navigate
  const handleSelectQueue = useCallback((queue: Queue) => {
    dispatch(setSwitchToQueuePage(false));

    if (queue.isAnalyticsQueue === '0') {
      navigate('/business-home');
    } else if (queue.isAnalyticsQueue === '1') {
      navigate('/service-analytics');
    } else {
      navigate('/sla-dashboard');
    }
  }, [dispatch, navigate]);

  // Filter business units by search
  const getFilteredBusinessUnits = useCallback(() => {
    const { selectedBuList, searchBUInput } = state;
    if (!searchBUInput.trim()) {
      return selectedBuList;
    }
    return selectedBuList.filter((bu) =>
      bu.bu_desc.toLowerCase().includes(searchBUInput.toLowerCase())
    );
  }, [state]);

  // Filter departments by search
  const getFilteredDepartments = useCallback(() => {
    const { selectedBuList, selectedBuIndex, searchDepartments } = state;
    if (selectedBuIndex < 0 || selectedBuIndex >= selectedBuList.length) {
      return [];
    }
    const deptList = selectedBuList[selectedBuIndex]?.dept_list || [];
    if (!searchDepartments.trim()) {
      return deptList;
    }
    return deptList.filter((dept) =>
      dept.dept_desc.toLowerCase().includes(searchDepartments.toLowerCase())
    );
  }, [state]);

  // Filter queues by search
  const getFilteredQueues = useCallback((queues: Queue[][]) => {
    const { searchQueues } = state;
    if (!searchQueues.trim()) {
      return queues;
    }
    const filteredFlat = queues.flat().filter((queue) =>
      queue.custom_queue_name.toLowerCase().includes(searchQueues.toLowerCase())
    );
    // Regroup into rows of 4
    const result: Queue[][] = [];
    let row: Queue[] = [];
    filteredFlat.forEach((queue, idx) => {
      row.push(queue);
      if ((idx + 1) % 4 === 0) {
        result.push(row);
        row = [];
      }
    });
    if (row.length > 0) {
      result.push(row);
    }
    return result;
  }, [state]);

  // Insights tab selection
  const handleSelectInsightsTab = useCallback((tab: number) => {
    dispatch(setSelectedInsightsTab(tab));
    dispatch(setIsTabLoading(true));
    setTimeout(() => {
      dispatch(setIsTabLoading(false));
    }, 800);
  }, [dispatch]);

  // Admin settings - toggle queue
  const handleToggleAdminQueue = useCallback((bpsId: string, customerId: string) => {
    if (state.selectedAdminBpsId === bpsId) {
      dispatch(setSelectedAdminBps(null));
    } else {
      dispatch(setSelectedAdminBps({ bpsId, customerId }));
      dispatch(setIsLoadingBpsDetails(true));
    }
  }, [dispatch, state.selectedAdminBpsId]);

  // TechOps - toggle BPS
  const handleToggleTechopsBps = useCallback((bpsId: string, customerId: string) => {
    if (state.selectedTechopsBpsId === bpsId) {
      dispatch(setSelectedTechopsBps(null));
    } else {
      dispatch(setSelectedTechopsBps({ bpsId, customerId }));
      dispatch(setIsLoadingTechopsDetails(true));
    }
  }, [dispatch, state.selectedTechopsBpsId]);

  // TechOps pagination
  const handleTechopsPageChange = useCallback((page: number) => {
    dispatch(setCurrentTechopsPage(page));
  }, [dispatch]);

  const handleTechopsItemsPerPageChange = useCallback((itemsPerPage: number) => {
    dispatch(setItemsPerPageTechops(itemsPerPage));
    dispatch(setCurrentTechopsPage(1));
  }, [dispatch]);

  // Calculate SLA status
  const calculateSLAStatus = useCallback((score: number): string => {
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Good';
    return 'Good';
  }, []);

  // Check if contract is active
  const isContractActive = useCallback((endDate: string): boolean => {
    return new Date() < new Date(endDate);
  }, []);

  return {
    // State
    ...state,
    auth,
    // Computed
    getFilteredBusinessUnits,
    getFilteredDepartments,
    getFilteredQueues,
    calculateSLAStatus,
    isContractActive,
    // Actions
    handleSelectCustomer,
    handleGroupBusinessUnits,
    handleSelectQueue,
    handleSelectInsightsTab,
    handleToggleAdminQueue,
    handleToggleTechopsBps,
    handleTechopsPageChange,
    handleTechopsItemsPerPageChange,
    // Dispatch helpers
    setCustomers: (c: Customer[]) => dispatch(setCustomers(c)),
    setSearchBUInput: (s: string) => dispatch(setSearchBUInput(s)),
    setSearchDepartments: (s: string) => dispatch(setSearchDepartments(s)),
    setSearchQueues: (s: string) => dispatch(setSearchQueues(s)),
    toggleGridView: () => dispatch(toggleGridView()),
    setCustomerDashboardData: (d: CustomerPerformance[]) => dispatch(setCustomerDashboardData(d)),
    setAdminSettingsCustomers: (c: CustomerPerformance[]) => dispatch(setAdminSettingsCustomers(c)),
    setAdminSettingsQueues: (q: AdminSettingsQueue[]) => dispatch(setAdminSettingsQueues(q)),
    setIsLoadingBpsDetails: (l: boolean) => dispatch(setIsLoadingBpsDetails(l)),
    updateQueueEnable: (queueId: string, isEnable: boolean) => dispatch(updateQueueEnable({ queueId, isEnable })),
    updateQueueMailEnable: (queueId: string, isMailEnable: boolean) => dispatch(updateQueueMailEnable({ queueId, isMailEnable })),
    toggleQueueExpanded: (queueId: string) => dispatch(toggleQueueExpanded(queueId)),
    setTechopsCustomers: (c: CustomerPerformance[]) => dispatch(setTechopsCustomers(c)),
    setTechopsWorkflows: (w: TechopsWorkflow[]) => dispatch(setTechopsWorkflows(w)),
    setTechopsTotalItems: (t: number) => dispatch(setTechopsTotalItems(t)),
    setIsLoadingTechopsDetails: (l: boolean) => dispatch(setIsLoadingTechopsDetails(l)),
    resetBusinessStarter: () => dispatch(resetBusinessStarter()),
  };
}
