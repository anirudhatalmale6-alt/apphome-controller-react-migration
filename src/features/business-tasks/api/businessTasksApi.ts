/**
 * BusinessTasks RTK Query API
 * Migrated from BusinessTasksController.js $http calls
 * All endpoints use AES encryption matching original AngularJS implementation
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';
import type {
  TaskCount,
  DisplayTimeSettings,
  YTDAuditData,
  InsightsCustomData,
  SearchConfig,
  ExceptionItem,
  SupplierExceptionCount,
  AgingCount,
  ProcessedQueueData,
  RecentWorkflow,
  PastDueWorkflow,
  CustomWorkflow,
  TransactionLog,
} from '../types/BusinessTasksTypes';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

// API endpoints from BusinessTasksController.js
const BUSINESS_TASKS_ENDPOINTS = {
  TASKS_WORKFLOWS_COUNT: '/baasHome/tasksWorkflowsCount',
  LOAD_DISPLAY_TIME: '/baasHome/loadDisplayTimeForInbox',
  FETCH_YTD_AUDIT: '/baasHome/fetch_audit_into_bihourly_sp_30_60_90_baas',
  SEARCH_YTD_AUDIT: '/baasHome/search_audit_into_bihourly_sp_30_60_90_baas',
  SEARCH_INSIGHTS_CUSTOM: '/baasHome/search_insights_custom_for_input',
  LOAD_SEARCH_CONFIG: '/baasHome/load_inbox_serachConfig',
  LOAD_YTD_EXCEPTIONS: '/baasHome/load_YTD_PendingBusinessExceptions',
  SEARCH_YTD_EXCEPTIONS: '/baasHome/search_YTD_PendingBusinessExceptions',
  FETCH_EXCEPTION_SUPPLIER_COUNT: '/baasHome/fetch_exception_supplier_count',
  FETCH_EXCEPTION_BY_SUPPLIER: '/baasHome/fetch_exception_supplier_count_by_Supplier',
  FETCH_EXCEPTION_ONLY_COUNT: '/baasHome/fetch_exception_supplier_only_count',
  PROCESSED_AGING_COUNT: '/baasHome/processedAgingCount',
  LOAD_PROCESSED_QUEUE_DATA: '/baasHome/load_processedQMenuData',
  SEARCH_PROCESSED_QUEUE_DATA: '/baasHome/load_search_processedQMenuData',
  RECENT_WORKFLOWS: '/baasHome/Tasks_RecentWorkflows',
  SEARCH_RECENT: '/baasHome/searchRecentForInput',
  PAST_DUE_COUNT: '/baasHome/past_due_count_tasks',
  PAST_DUE_WORKFLOWS: '/baasHome/Tasks_PastDueWorkflows',
  SEARCH_PAST_DUE: '/baasHome/search_pastDue_Tasks',
  CUSTOM_WORKFLOWS: '/baasHome/Tasks_CustomWorkflows',
  SEARCH_CUSTOM: '/baasHome/search_custom_for_tasks',
  LOAD_DIN_HISTORY: '/baasContent/load_din_history',
};

interface BaseQueryParams {
  customer_id: string;
  bps_id: string;
  user_id: string;
  sp_process_id?: string;
  queue_id?: string;
}

interface PaginatedQueryParams extends BaseQueryParams {
  itemsPerPage: number;
  currentPage: number;
}

interface SearchQueryParams extends PaginatedQueryParams {
  searchText: string;
  searchField?: string;
}

interface DateRangeQueryParams extends BaseQueryParams {
  startDate: string;
  endDate: string;
}

export const businessTasksApi = createApi({
  reducerPath: 'businessTasksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      return headers;
    },
  }),
  tagTypes: ['Tasks', 'Recent', 'PastDue', 'Insights', 'Exceptions', 'Processed'],
  endpoints: (builder) => ({
    // Get task and workflow counts
    getTasksWorkflowsCount: builder.query<TaskCount[][], BaseQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.TASKS_WORKFLOWS_COUNT,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Tasks'],
    }),

    // Load display time settings
    getDisplayTimeSettings: builder.query<DisplayTimeSettings[][], BaseQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.LOAD_DISPLAY_TIME,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Fetch YTD audit data (30/60/90 days)
    getYTDAuditData: builder.query<YTDAuditData[][], PaginatedQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.FETCH_YTD_AUDIT,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Insights'],
    }),

    // Search YTD audit data
    searchYTDAuditData: builder.mutation<YTDAuditData[][], SearchQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.SEARCH_YTD_AUDIT,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      invalidatesTags: ['Insights'],
    }),

    // Search custom insights
    searchInsightsCustom: builder.mutation<InsightsCustomData[][], DateRangeQueryParams & { searchInput: string }>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.SEARCH_INSIGHTS_CUSTOM,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      invalidatesTags: ['Insights'],
    }),

    // Load search configuration
    getSearchConfig: builder.query<SearchConfig[][], BaseQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.LOAD_SEARCH_CONFIG,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Load YTD business exceptions
    getYTDExceptions: builder.query<ExceptionItem[][], PaginatedQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.LOAD_YTD_EXCEPTIONS,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Exceptions'],
    }),

    // Search YTD exceptions
    searchYTDExceptions: builder.mutation<ExceptionItem[][], SearchQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.SEARCH_YTD_EXCEPTIONS,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      invalidatesTags: ['Exceptions'],
    }),

    // Get exception supplier counts
    getExceptionSupplierCount: builder.query<SupplierExceptionCount[][], BaseQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.FETCH_EXCEPTION_SUPPLIER_COUNT,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Exceptions'],
    }),

    // Get exceptions by supplier
    getExceptionsBySupplier: builder.query<ExceptionItem[][], BaseQueryParams & { supplier_id: string }>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.FETCH_EXCEPTION_BY_SUPPLIER,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Exceptions'],
    }),

    // Get processed aging count
    getProcessedAgingCount: builder.query<AgingCount[][], BaseQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.PROCESSED_AGING_COUNT,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Processed'],
    }),

    // Load processed queue data
    getProcessedQueueData: builder.query<ProcessedQueueData[][], PaginatedQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.LOAD_PROCESSED_QUEUE_DATA,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Processed'],
    }),

    // Search processed queue data
    searchProcessedQueueData: builder.mutation<ProcessedQueueData[][], SearchQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.SEARCH_PROCESSED_QUEUE_DATA,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      invalidatesTags: ['Processed'],
    }),

    // Get recent workflows
    getRecentWorkflows: builder.query<RecentWorkflow[][], PaginatedQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.RECENT_WORKFLOWS,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Recent'],
    }),

    // Search recent workflows
    searchRecentWorkflows: builder.mutation<RecentWorkflow[][], SearchQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.SEARCH_RECENT,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      invalidatesTags: ['Recent'],
    }),

    // Get past due task count
    getPastDueCount: builder.query<{ count: number }[][], BaseQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.PAST_DUE_COUNT,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['PastDue'],
    }),

    // Get past due workflows
    getPastDueWorkflows: builder.query<PastDueWorkflow[][], PaginatedQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.PAST_DUE_WORKFLOWS,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['PastDue'],
    }),

    // Search past due tasks
    searchPastDueTasks: builder.mutation<PastDueWorkflow[][], SearchQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.SEARCH_PAST_DUE,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      invalidatesTags: ['PastDue'],
    }),

    // Get custom workflows
    getCustomWorkflows: builder.query<CustomWorkflow[][], PaginatedQueryParams & DateRangeQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.CUSTOM_WORKFLOWS,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Search custom tasks
    searchCustomTasks: builder.mutation<CustomWorkflow[][], SearchQueryParams & DateRangeQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.SEARCH_CUSTOM,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Load DIN/transaction history
    getDINHistory: builder.query<TransactionLog[][], { din_number: string } & BaseQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.LOAD_DIN_HISTORY,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),
  }),
});

export const {
  useGetTasksWorkflowsCountQuery,
  useGetDisplayTimeSettingsQuery,
  useGetYTDAuditDataQuery,
  useSearchYTDAuditDataMutation,
  useSearchInsightsCustomMutation,
  useGetSearchConfigQuery,
  useGetYTDExceptionsQuery,
  useSearchYTDExceptionsMutation,
  useGetExceptionSupplierCountQuery,
  useGetExceptionsBySupplierQuery,
  useGetProcessedAgingCountQuery,
  useGetProcessedQueueDataQuery,
  useSearchProcessedQueueDataMutation,
  useGetRecentWorkflowsQuery,
  useSearchRecentWorkflowsMutation,
  useGetPastDueCountQuery,
  useGetPastDueWorkflowsQuery,
  useSearchPastDueTasksMutation,
  useGetCustomWorkflowsQuery,
  useSearchCustomTasksMutation,
  useGetDINHistoryQuery,
} = businessTasksApi;
