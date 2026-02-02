/**
 * Business Apps State Hook
 * Custom hook for managing business apps state and logic
 * Origin: BusinessAppsController.js $scope functions
 */
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  selectBusinessApps,
  setAnalyticsPageLoading,
  setAppPageLoading,
  setIsDashboardAvailable,
  setMenuTabs,
  setSelectedTabIndex,
  setSelectedTab,
  setBuQueueActionsItems,
  toggleSection,
  setActiveItemIndex,
  setQueueIdFromUI,
  setActionsFromUI,
  setWorkflows,
  setTotalItemsAppsRecents,
  setTotalItemsAppsPastDue,
  setTotalItemsAppsCustom,
  setSearchText,
  setIsSearchEnable,
  setCurrentPage,
  setItemsPerPage,
  resetPagination,
  initializeDateRange,
  setAgingSelectedTab,
  setIfMenuUploads,
  setNoDataAvailableRecent,
  setNoDataAvailablePast,
  setSelectedDIN,
  setStoredWorkflow,
  setStoredIndex,
} from '../store/businessAppsSlice';
import type {
  MenuTab,
  QueueItem,
  QueueProperty,
  Workflow,
} from '../types/BusinessAppsTypes';

/**
 * Hook to manage business apps state
 * Replaces AngularJS $scope functions
 */
export function useBusinessAppsState() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const state = useAppSelector(selectBusinessApps);

  // Menu tab selection (origin: $scope.selectMenuTab)
  const handleSelectMenuTab = useCallback((tabId: number) => {
    dispatch(setSelectedTabIndex(tabId));
  }, [dispatch]);

  // Timeline tab selection - Recent, Past Due, Custom (origin: $scope.selectTab)
  const handleSelectTab = useCallback((tabIndex: number) => {
    dispatch(setSelectedTab(tabIndex));
    dispatch(setAppPageLoading(true));
    dispatch(resetPagination());
    dispatch(setSearchText(''));
    dispatch(setIsSearchEnable(false));

    if (tabIndex === 2) {
      // Custom tab - initialize date range
      dispatch(initializeDateRange());
    }
  }, [dispatch]);

  // Toggle sidebar section (origin: $scope.toggleSection)
  const handleToggleSection = useCallback((queue: QueueItem) => {
    dispatch(toggleSection(queue.QueueNames));
  }, [dispatch]);

  // Switch by queues (origin: $scope.switchingByQueues)
  const handleSwitchingByQueues = useCallback((queue: QueueItem, property: QueueProperty, index: number) => {
    dispatch(setQueueIdFromUI(queue.queue_id));
    dispatch(setActionsFromUI(property));
    dispatch(setActiveItemIndex({ queueName: queue.QueueNames, index }));
    dispatch(setAppPageLoading(true));
    dispatch(resetPagination());
    dispatch(setSearchText(''));
    dispatch(setIsSearchEnable(false));

    // Check if it's an upload menu
    if (property.displayName.toLowerCase().includes('upload')) {
      dispatch(setIfMenuUploads(true));
    } else {
      dispatch(setIfMenuUploads(false));
    }
  }, [dispatch]);

  // Perform action on workflow (origin: $rootScope.performAction)
  const handlePerformAction = useCallback((workflow: Workflow, index: number) => {
    dispatch(setStoredWorkflow(workflow));
    dispatch(setStoredIndex(index));

    switch (workflow.queue_id) {
      case 'qu10003':
        // Open exception ticket
        dispatch(setSelectedDIN(workflow));
        navigate('/DataEntryAdmin');
        break;
      case 'qu10004':
      case 'qu10011':
        // Load data entry page
        dispatch(setSelectedDIN(workflow));
        navigate('/DataEntryPage');
        break;
      case 'qu10012':
        // Extract validation data
        dispatch(setSelectedDIN(workflow));
        navigate('/DataValidation');
        break;
      case 'qu10013':
        // Open techops ticket
        dispatch(setSelectedDIN(workflow));
        navigate('/TechOpsTicketPreview');
        break;
      default:
        // Extract DIN data
        dispatch(setSelectedDIN(workflow));
        navigate('/BusinessCompliance');
        break;
    }
  }, [dispatch, navigate]);

  // Go back to business process (origin: $scope.goBackToBusinessProcess)
  const handleGoBackToBusinessProcess = useCallback(() => {
    navigate('/BusinessStarter');
  }, [navigate]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(setAppPageLoading(true));
  }, [dispatch]);

  const handleItemsPerPageChange = useCallback((items: number) => {
    dispatch(setItemsPerPage(items));
    dispatch(setCurrentPage(1));
    dispatch(setAppPageLoading(true));
  }, [dispatch]);

  // Aging tab selection (origin: $rootScope.AgingSelectTab)
  const handleAgingSelectTab = useCallback((tabIndex: number) => {
    dispatch(setAgingSelectedTab(tabIndex));
    dispatch(setAppPageLoading(true));
    dispatch(resetPagination());
  }, [dispatch]);

  // Search handler
  const handleSearch = useCallback((searchText: string) => {
    dispatch(setSearchText(searchText));
    if (searchText.trim() === '') {
      dispatch(setIsSearchEnable(false));
    }
  }, [dispatch]);

  // Process queue data response
  const processQueueDataResponse = useCallback((response: unknown[]) => {
    if (response && Array.isArray(response) && response.length > 0) {
      const firstItem = response[0] as { result?: string };
      if (firstItem.result === 'Success') {
        dispatch(setIsDashboardAvailable(true));

        // Create menu tabs from response
        const menuTabs: MenuTab[] = [];
        let idCounter = 0;
        const seenTitles = new Set<string>();

        response.forEach((item) => {
          const queueItem = item as { bu_desc: string; bu_id: string; tps_id?: string; dept_id?: string };
          if (!seenTitles.has(queueItem.bu_desc)) {
            seenTitles.add(queueItem.bu_desc);
            menuTabs.push({
              title: queueItem.bu_desc,
              bu_id: queueItem.bu_id,
              tps_id: queueItem.tps_id,
              dept_id: queueItem.dept_id,
              menutabs_id: idCounter++,
            });
          }
        });

        dispatch(setMenuTabs(menuTabs));
        dispatch(setBuQueueActionsItems(response as QueueItem[]));
      } else {
        dispatch(setIsDashboardAvailable(false));
      }
    }
    dispatch(setAnalyticsPageLoading(false));
  }, [dispatch]);

  // Process workflows response
  const processWorkflowsResponse = useCallback((
    response: [Workflow[], { total_count?: number; exceptionCount?: string }[]],
    tabType: 'recent' | 'pastDue' | 'custom'
  ) => {
    const workflows = response[0] || [];
    const countData = response[1]?.[0];
    const totalCount = countData?.total_count || parseInt(countData?.exceptionCount || '0', 10);

    // Check for no data
    if (workflows.length === 0 ||
        (workflows.length > 0 && (workflows[0] as unknown as { result?: string }).result?.toLowerCase() === 'no data')) {
      if (tabType === 'recent') {
        dispatch(setNoDataAvailableRecent(true));
      } else if (tabType === 'pastDue') {
        dispatch(setNoDataAvailablePast(true));
      }
      dispatch(setWorkflows([]));
    } else {
      dispatch(setWorkflows(workflows));
      if (tabType === 'recent') {
        dispatch(setNoDataAvailableRecent(false));
        dispatch(setTotalItemsAppsRecents(totalCount));
      } else if (tabType === 'pastDue') {
        dispatch(setNoDataAvailablePast(false));
        dispatch(setTotalItemsAppsPastDue(totalCount));
      } else {
        dispatch(setTotalItemsAppsCustom(totalCount));
      }
    }

    dispatch(setAppPageLoading(false));
  }, [dispatch]);

  // Convert timezone for workflow dates (origin: AppRecentConvertTimeZone)
  const convertWorkflowTimeZone = useCallback((workflows: Workflow[], displayTimeValue: string): Workflow[] => {
    if (!displayTimeValue) return workflows;

    const timeZone = displayTimeValue.trim().split(' ').pop() || 'UTC';

    return workflows.map(workflow => ({
      ...workflow,
      ConvertedAppRecentActivityDate: new Date(workflow.ActivityDate).toLocaleString('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }));
  }, []);

  // Get aging value from tab index
  const getAgingValue = useCallback((tabIndex: number): string => {
    switch (tabIndex) {
      case 1:
        return '0-24';
      case 2:
        return '24-48';
      case 3:
        return '>48';
      default:
        return 'all';
    }
  }, []);

  // Computed values
  const totalPages = useMemo(() => {
    const { totalItems, itemsPerPage } = state.pagination;
    return Math.ceil(totalItems / itemsPerPage) || 1;
  }, [state.pagination]);

  const currentMenuTab = useMemo(() => {
    return state.menuTabs.find(tab => tab.menutabs_id === state.selectedTabIndex);
  }, [state.menuTabs, state.selectedTabIndex]);

  return {
    // State
    ...state,

    // Computed
    totalPages,
    currentMenuTab,

    // Actions
    handleSelectMenuTab,
    handleSelectTab,
    handleToggleSection,
    handleSwitchingByQueues,
    handlePerformAction,
    handleGoBackToBusinessProcess,
    handlePageChange,
    handleItemsPerPageChange,
    handleAgingSelectTab,
    handleSearch,

    // Data processors
    processQueueDataResponse,
    processWorkflowsResponse,
    convertWorkflowTimeZone,
    getAgingValue,
  };
}
