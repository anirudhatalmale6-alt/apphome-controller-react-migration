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
  eventTerm?: string;
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
    // AngularJS: decrypt -> res[0][0].merged_json -> JSON.parse -> recent_TasksWorkflows_Counts_data -> JSON.parse -> [0].counts
    getTasksWorkflowsCount: builder.query<TaskCount[][], BaseQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.TASKS_WORKFLOWS_COUNT,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          const decrypted = decryptData<any>(response);
          // AngularJS deep extraction: res[0][0].merged_json
          if (decrypted?.[0]?.[0]?.merged_json) {
            const mergedJson = JSON.parse(decrypted[0][0].merged_json);
            if (mergedJson.recent_TasksWorkflows_Counts_data) {
              const countsData = JSON.parse(mergedJson.recent_TasksWorkflows_Counts_data);
              return [[countsData[0]?.counts ?? countsData]];
            }
          }
          return decrypted;
        } catch {
          return decryptData(response);
        }
      },
      providesTags: ['Tasks'],
    }),

    // Load display time settings
    // AngularJS: NO encryption - plain JSON request & response
    // Field: display_timezone (not display_time)
    getDisplayTimeSettings: builder.query<DisplayTimeSettings[][], { customer_id: string; bps_id: string }>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.LOAD_DISPLAY_TIME,
        method: 'POST',
        body: params,
      }),
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
    // AngularJS: Request ENCRYPTED, Response NOT decrypted (direct res.data)
    getExceptionSupplierCount: builder.query<SupplierExceptionCount[][], BaseQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.FETCH_EXCEPTION_SUPPLIER_COUNT,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      providesTags: ['Exceptions'],
    }),

    // Get exceptions by supplier
    // AngularJS: Request ENCRYPTED, Response NOT decrypted (decryption commented out)
    getExceptionsBySupplier: builder.query<ExceptionItem[][], BaseQueryParams & { supplier_id: string }>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.FETCH_EXCEPTION_BY_SUPPLIER,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
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
    // AngularJS: NO encryption - plain JSON both ways
    getProcessedQueueData: builder.query<ProcessedQueueData[][], PaginatedQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.LOAD_PROCESSED_QUEUE_DATA,
        method: 'POST',
        body: params,
      }),
      providesTags: ['Processed'],
    }),

    // Search processed queue data
    // AngularJS: NO encryption - plain JSON both ways
    searchProcessedQueueData: builder.mutation<ProcessedQueueData[][], SearchQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.SEARCH_PROCESSED_QUEUE_DATA,
        method: 'POST',
        body: params,
      }),
      invalidatesTags: ['Processed'],
    }),

    // Get recent workflows
    // AngularJS: decrypt -> res[0].recent_TasksWorkflows_json_data -> JSON.parse
    getRecentWorkflows: builder.query<RecentWorkflow[][], PaginatedQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.RECENT_WORKFLOWS,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          const decrypted = decryptData<any>(response);
          // Check for error/no data
          if (decrypted?.[0]?.[0]?.result && decrypted[0][0].result !== 'Success') {
            return [[]];
          }
          // AngularJS deep extraction: res[0].recent_TasksWorkflows_json_data
          if (decrypted?.[0]?.recent_TasksWorkflows_json_data) {
            const workflows = JSON.parse(decrypted[0].recent_TasksWorkflows_json_data);
            // Return [workflows, counts] structure matching view expectation
            const counts = decrypted[1] || [];
            return [workflows, counts];
          }
          // If data is already in expected array format, return as-is
          return decrypted;
        } catch {
          return decryptData(response);
        }
      },
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
    // AngularJS: decrypt -> res[0].pastDue_TasksWorkflows_json_data -> JSON.parse
    getPastDueWorkflows: builder.query<PastDueWorkflow[][], PaginatedQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.PAST_DUE_WORKFLOWS,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          const decrypted = decryptData<any>(response);
          // Check for error/no data
          if (decrypted?.[0]?.[0]?.result && decrypted[0][0].result !== 'Success') {
            return [[]];
          }
          // AngularJS deep extraction: res[0].pastDue_TasksWorkflows_json_data
          if (decrypted?.[0]?.pastDue_TasksWorkflows_json_data) {
            const workflows = JSON.parse(decrypted[0].pastDue_TasksWorkflows_json_data);
            // Counts from res[1][0].pastDue_TasksWorkflows_Counts_data
            let counts: any[] = [];
            if (decrypted?.[1]?.[0]?.pastDue_TasksWorkflows_Counts_data) {
              const countsData = JSON.parse(decrypted[1][0].pastDue_TasksWorkflows_Counts_data);
              counts = countsData;
            } else if (decrypted?.[1]) {
              counts = decrypted[1];
            }
            return [workflows, counts];
          }
          return decrypted;
        } catch {
          return decryptData(response);
        }
      },
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
    // AngularJS: decrypt -> res[0].custom_TasksWorkflows_json_data -> JSON.parse
    getCustomWorkflows: builder.query<CustomWorkflow[][], PaginatedQueryParams & DateRangeQueryParams>({
      query: (params) => ({
        url: BUSINESS_TASKS_ENDPOINTS.CUSTOM_WORKFLOWS,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          const decrypted = decryptData<any>(response);
          // Check for error/no data
          if (decrypted?.[0]?.[0]?.result && decrypted[0][0].result !== 'Success') {
            return [[]];
          }
          // AngularJS deep extraction: res[0].custom_TasksWorkflows_json_data
          if (decrypted?.[0]?.custom_TasksWorkflows_json_data) {
            const workflows = JSON.parse(decrypted[0].custom_TasksWorkflows_json_data);
            // Counts from res[1][0].custom_TasksWorkflows_Counts_data
            let counts: any[] = [];
            if (decrypted?.[1]?.[0]?.custom_TasksWorkflows_Counts_data) {
              const countsData = JSON.parse(decrypted[1][0].custom_TasksWorkflows_Counts_data);
              counts = countsData;
            } else if (decrypted?.[1]) {
              counts = decrypted[1];
            }
            return [workflows, counts];
          }
          return decrypted;
        } catch {
          return decryptData(response);
        }
      },
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
  useLazyGetTasksWorkflowsCountQuery,
  useGetDisplayTimeSettingsQuery,
  useGetYTDAuditDataQuery,
  useLazyGetYTDAuditDataQuery,
  useSearchYTDAuditDataMutation,
  useSearchInsightsCustomMutation,
  useGetSearchConfigQuery,
  useGetYTDExceptionsQuery,
  useLazyGetYTDExceptionsQuery,
  useSearchYTDExceptionsMutation,
  useGetExceptionSupplierCountQuery,
  useLazyGetExceptionSupplierCountQuery,
  useGetExceptionsBySupplierQuery,
  useGetProcessedAgingCountQuery,
  useGetProcessedQueueDataQuery,
  useSearchProcessedQueueDataMutation,
  useGetRecentWorkflowsQuery,
  useLazyGetRecentWorkflowsQuery,
  useSearchRecentWorkflowsMutation,
  useGetPastDueCountQuery,
  useLazyGetPastDueCountQuery,
  useGetPastDueWorkflowsQuery,
  useLazyGetPastDueWorkflowsQuery,
  useSearchPastDueTasksMutation,
  useGetCustomWorkflowsQuery,
  useLazyGetCustomWorkflowsQuery,
  useSearchCustomTasksMutation,
  useGetDINHistoryQuery,
} = businessTasksApi;
