import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  setMenuTabs,
  setSelectedTabIndex,
  setQueueActions,
  setSelectedQueue,
  setRecentWorkflows,
  setPastDueWorkflows,
  setCustomWorkflows,
  setTasksCount,
  setCurrentPage,
  setItemsPerPage,
  setTotalItems,
  setSelectedAgingFilter,
  setSearchField,
  setSearchValue,
  setDateRange,
  addAttachment,
  removeAttachment,
  clearAttachments,
  setCurrentView,
  toggleSidebar,
  setLoadingWorkflows,
  resetBusinessApps,
} from '../store/businessAppsSlice';
import type {
  MenuTab,
  QueueAction,
  WorkflowItem,
  TasksCount,
  DateRange,
  UploadAttachment,
} from '../types/BusinessAppsTypes';

export function useBusinessAppsState() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const state = useAppSelector((state) => state.businessApps);
  const auth = useAppSelector((state) => state.auth);

  // Tab selection
  const handleSelectTab = useCallback((index: number) => {
    dispatch(setSelectedTabIndex(index));
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  // Queue selection
  const handleSelectQueue = useCallback((queue: QueueAction) => {
    dispatch(setSelectedQueue(queue));
    dispatch(setCurrentPage(1));
    dispatch(setLoadingWorkflows(true));
  }, [dispatch]);

  // View selection
  const handleChangeView = useCallback((view: 'recent' | 'pastDue' | 'custom' | 'upload') => {
    dispatch(setCurrentView(view));
    dispatch(setCurrentPage(1));
    dispatch(setSearchValue(''));
    dispatch(setSelectedAgingFilter(''));
  }, [dispatch]);

  // Pagination
  const handlePageChange = useCallback((page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(setLoadingWorkflows(true));
  }, [dispatch]);

  const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
    dispatch(setItemsPerPage(itemsPerPage));
    dispatch(setLoadingWorkflows(true));
  }, [dispatch]);

  // Aging filter
  const handleAgingFilterChange = useCallback((filter: string) => {
    dispatch(setSelectedAgingFilter(filter));
    dispatch(setCurrentPage(1));
    dispatch(setLoadingWorkflows(true));
  }, [dispatch]);

  // Search
  const handleSearch = useCallback((field: string, value: string) => {
    dispatch(setSearchField(field));
    dispatch(setSearchValue(value));
    dispatch(setCurrentPage(1));
    dispatch(setLoadingWorkflows(true));
  }, [dispatch]);

  const handleClearSearch = useCallback(() => {
    dispatch(setSearchField(''));
    dispatch(setSearchValue(''));
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  // Date range for custom view
  const handleDateRangeChange = useCallback((dateRange: DateRange) => {
    dispatch(setDateRange(dateRange));
    dispatch(setCurrentPage(1));
    dispatch(setLoadingWorkflows(true));
  }, [dispatch]);

  // File upload
  const handleAddAttachment = useCallback((file: File) => {
    const attachment: UploadAttachment = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    };
    dispatch(addAttachment(attachment));
  }, [dispatch]);

  const handleRemoveAttachment = useCallback((fileName: string) => {
    dispatch(removeAttachment(fileName));
  }, [dispatch]);

  const handleClearAttachments = useCallback(() => {
    dispatch(clearAttachments());
  }, [dispatch]);

  // Workflow action - navigate to appropriate page based on queue type
  const handleWorkflowAction = useCallback((workflow: WorkflowItem, _event: React.MouseEvent, _index: number) => {
    const queueId = workflow.queue_id;

    switch (queueId) {
      case 'qu10003':
        // Data Entry Admin
        navigate('/data-entry-admin');
        break;
      case 'qu10004':
      case 'qu10011':
        // Data Entry Page
        navigate('/data-entry');
        break;
      case 'qu10012':
        // Data Validation
        navigate('/data-validation');
        break;
      case 'qu10013':
        // TechOps Ticket
        navigate('/techops-ticket');
        break;
      default:
        // Business Compliance or other
        navigate('/business-compliance');
        break;
    }
  }, [navigate]);

  // Get current workflows based on view
  const getCurrentWorkflows = useCallback((): WorkflowItem[] => {
    switch (state.currentView) {
      case 'recent':
        return state.recentWorkflows;
      case 'pastDue':
        return state.pastDueWorkflows;
      case 'custom':
        return state.customWorkflows;
      default:
        return [];
    }
  }, [state.currentView, state.recentWorkflows, state.pastDueWorkflows, state.customWorkflows]);

  // Calculate total pages
  const getTotalPages = useCallback((): number => {
    return Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage);
  }, [state.pagination.totalItems, state.pagination.itemsPerPage]);

  // Get displayed page numbers
  const getDisplayedPages = useCallback((): number[] => {
    const totalPages = getTotalPages();
    const currentPage = state.pagination.currentPage;
    const maxDisplay = 5;
    const start = Math.max(1, currentPage - Math.floor(maxDisplay / 2));
    const end = Math.min(totalPages, start + maxDisplay - 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [getTotalPages, state.pagination.currentPage]);

  return {
    // State
    ...state,
    auth,
    // Computed
    getCurrentWorkflows,
    getTotalPages,
    getDisplayedPages,
    // Actions
    handleSelectTab,
    handleSelectQueue,
    handleChangeView,
    handlePageChange,
    handleItemsPerPageChange,
    handleAgingFilterChange,
    handleSearch,
    handleClearSearch,
    handleDateRangeChange,
    handleAddAttachment,
    handleRemoveAttachment,
    handleClearAttachments,
    handleWorkflowAction,
    // Dispatch helpers
    setMenuTabs: (tabs: MenuTab[]) => dispatch(setMenuTabs(tabs)),
    setQueueActions: (actions: QueueAction[]) => dispatch(setQueueActions(actions)),
    setRecentWorkflows: (workflows: WorkflowItem[]) => dispatch(setRecentWorkflows(workflows)),
    setPastDueWorkflows: (workflows: WorkflowItem[]) => dispatch(setPastDueWorkflows(workflows)),
    setCustomWorkflows: (workflows: WorkflowItem[]) => dispatch(setCustomWorkflows(workflows)),
    setTasksCount: (counts: TasksCount[]) => dispatch(setTasksCount(counts)),
    setTotalItems: (total: number) => dispatch(setTotalItems(total)),
    setLoadingWorkflows: (loading: boolean) => dispatch(setLoadingWorkflows(loading)),
    toggleSidebar: () => dispatch(toggleSidebar()),
    resetBusinessApps: () => dispatch(resetBusinessApps()),
  };
}
