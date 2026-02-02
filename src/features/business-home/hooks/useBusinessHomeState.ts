/**
 * BusinessHome State Hook
 * Custom hook for managing business dashboard state
 * Migrated from BusinessHomeViews.js controller logic
 */
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  useGetTasksWorkflowsCountQuery,
  useGetDisplayTimeSettingsQuery,
  useGetYTDPending30_60_90Query,
  useGetYTDBusinessExceptionsQuery,
  useSearchYTDBusinessExceptionsMutation,
  useGetBatchInventoryOverviewQuery,
  useGetBatchInventory30_60_90Query,
  useGetInvoiceInventoryOverviewQuery,
  useGetAgentDataQuery,
} from '../api/businessHomeApi';
import {
  setDashboardAvailable,
  setHomePageLoading,
  setActiveTab,
  setTasksCount,
  setBusinessExceptionsPagination,
  setAgentsPagination,
  setSearchText,
  setDateRange,
  setSelectedSpProcessId,
  resetFilters,
} from '../store/businessHomeSlice';
import type { DateRange } from '../types/BusinessHomeTypes';

interface UseBusinessHomeStateParams {
  customerId: string;
  bpsId: string;
  userId: string;
  spProcessId?: string;
}

export const useBusinessHomeState = (params: UseBusinessHomeStateParams) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.businessHome);

  const baseParams = {
    customer_id: params.customerId,
    bps_id: params.bpsId,
    user_id: params.userId,
  };

  const spParams = {
    ...baseParams,
    sp_process_id: params.spProcessId || state.selectedSpProcessId || '',
  };

  // Queries
  const {
    data: tasksData,
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useGetTasksWorkflowsCountQuery(baseParams, {
    skip: !params.customerId,
  });

  const {
    data: displayTimeData,
    isLoading: displayTimeLoading,
  } = useGetDisplayTimeSettingsQuery(baseParams, {
    skip: !params.customerId,
  });

  const {
    data: ytdPending30_60_90Data,
    isLoading: ytdPendingLoading,
    refetch: refetchYTDPending,
  } = useGetYTDPending30_60_90Query(spParams, {
    skip: !spParams.sp_process_id,
  });

  const {
    data: exceptionsData,
    isLoading: exceptionsLoading,
    refetch: refetchExceptions,
  } = useGetYTDBusinessExceptionsQuery(
    {
      ...spParams,
      currentPage: state.businessExceptionsPagination.currentPage,
      itemsPerPage: state.businessExceptionsPagination.itemsPerPage,
    },
    { skip: !spParams.sp_process_id }
  );

  const {
    data: batchOverviewData,
    isLoading: batchOverviewLoading,
  } = useGetBatchInventoryOverviewQuery(spParams, {
    skip: !spParams.sp_process_id,
  });

  const {
    data: batch30_60_90Data,
    isLoading: batch30_60_90Loading,
  } = useGetBatchInventory30_60_90Query(spParams, {
    skip: !spParams.sp_process_id,
  });

  const {
    data: invoiceOverviewData,
    isLoading: invoiceOverviewLoading,
  } = useGetInvoiceInventoryOverviewQuery(spParams, {
    skip: !spParams.sp_process_id,
  });

  const {
    data: agentsData,
    isLoading: agentsLoading,
    refetch: refetchAgents,
  } = useGetAgentDataQuery(
    {
      ...spParams,
      currentPage: state.agentsPagination.currentPage,
      itemsPerPage: state.agentsPagination.itemsPerPage,
    },
    { skip: !spParams.sp_process_id }
  );

  // Mutations
  const [searchExceptions, { isLoading: searchingExceptions }] = useSearchYTDBusinessExceptionsMutation();

  // Effects
  useEffect(() => {
    const isLoading = tasksLoading || displayTimeLoading || ytdPendingLoading;
    dispatch(setHomePageLoading(isLoading));
  }, [tasksLoading, displayTimeLoading, ytdPendingLoading, dispatch]);

  useEffect(() => {
    if (tasksData?.[0]?.[0]) {
      dispatch(setTasksCount(tasksData[0][0]));
      dispatch(setDashboardAvailable(true));
    }
  }, [tasksData, dispatch]);

  // Action handlers
  const handleTabChange = useCallback(
    (tabIndex: number) => {
      dispatch(setActiveTab(tabIndex));
    },
    [dispatch]
  );

  const handleSearch = useCallback(
    async (searchText: string) => {
      dispatch(setSearchText(searchText));
      if (searchText.trim()) {
        await searchExceptions({
          ...spParams,
          currentPage: 1,
          itemsPerPage: state.businessExceptionsPagination.itemsPerPage,
          searchText,
        });
      } else {
        refetchExceptions();
      }
    },
    [dispatch, searchExceptions, spParams, state.businessExceptionsPagination.itemsPerPage, refetchExceptions]
  );

  const handleDateRangeChange = useCallback(
    (dateRange: DateRange | undefined) => {
      dispatch(setDateRange(dateRange));
    },
    [dispatch]
  );

  const handleExceptionsPageChange = useCallback(
    (page: number) => {
      dispatch(setBusinessExceptionsPagination({ currentPage: page }));
    },
    [dispatch]
  );

  const handleExceptionsItemsPerPageChange = useCallback(
    (itemsPerPage: number) => {
      dispatch(setBusinessExceptionsPagination({ itemsPerPage, currentPage: 1 }));
    },
    [dispatch]
  );

  const handleAgentsPageChange = useCallback(
    (page: number) => {
      dispatch(setAgentsPagination({ currentPage: page }));
    },
    [dispatch]
  );

  const handleAgentsItemsPerPageChange = useCallback(
    (itemsPerPage: number) => {
      dispatch(setAgentsPagination({ itemsPerPage, currentPage: 1 }));
    },
    [dispatch]
  );

  const handleSpProcessChange = useCallback(
    (spProcessId: string) => {
      dispatch(setSelectedSpProcessId(spProcessId));
    },
    [dispatch]
  );

  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
    refetchExceptions();
  }, [dispatch, refetchExceptions]);

  const handleRefreshDashboard = useCallback(() => {
    refetchTasks();
    refetchYTDPending();
    refetchExceptions();
    refetchAgents();
  }, [refetchTasks, refetchYTDPending, refetchExceptions, refetchAgents]);

  return {
    // State
    ...state,

    // Loading states
    isLoading: state.homePageLoading,
    isTasksLoading: tasksLoading,
    isExceptionsLoading: exceptionsLoading || searchingExceptions,
    isBatchLoading: batchOverviewLoading || batch30_60_90Loading,
    isInvoiceLoading: invoiceOverviewLoading,
    isAgentsLoading: agentsLoading,

    // Data
    tasksData: tasksData?.[0]?.[0],
    displayTimeData: displayTimeData?.[0]?.[0],
    ytdPending30_60_90Data: ytdPending30_60_90Data?.[0],
    exceptionsData: exceptionsData?.[0],
    batchOverviewData: batchOverviewData?.[0]?.[0],
    batch30_60_90Data: batch30_60_90Data?.[0]?.[0],
    invoiceOverviewData: invoiceOverviewData?.[0]?.[0],
    agentsData: agentsData?.[0],

    // Actions
    handleTabChange,
    handleSearch,
    handleDateRangeChange,
    handleExceptionsPageChange,
    handleExceptionsItemsPerPageChange,
    handleAgentsPageChange,
    handleAgentsItemsPerPageChange,
    handleSpProcessChange,
    handleResetFilters,
    handleRefreshDashboard,
  };
};

export default useBusinessHomeState;
