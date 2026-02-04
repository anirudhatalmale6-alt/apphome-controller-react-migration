/**
 * BusinessHome RTK Query API
 * Migrated from BusinessHomeViews.js $http calls
 * All endpoints use AES encryption matching original AngularJS implementation
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';
import type {
  TasksWorkflowCount,
  DisplayTimeSettings,
  YTDPending30_60_90,
  BusinessException,
  SupplierExceptionCount,
  BatchInventoryOverview,
  BatchInventory30_60_90,
  InvoiceInventoryOverview,
  AgentData,
  InsightsCustomData,
  BusinessConfig,
} from '../types/BusinessHomeTypes';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

// Extended API endpoints for BusinessHome
const BUSINESS_HOME_ENDPOINTS = {
  TASKS_WORKFLOWS_COUNT: '/baasHome/tasksWorkflowsCount',
  LOAD_DISPLAY_TIME: '/baasHome/loadDisplayTimeForInbox',
  LOAD_YTD_PENDING_30_60_90: '/baasHome/load_YTD_Pending30_60_90',
  LOAD_YTD_PENDING: '/baasHome/load_YTD_Pending',
  LOAD_YTD_BUSINESS_EXCEPTIONS: '/baasHome/load_YTD_PendingBusinessExceptions',
  SEARCH_YTD_BUSINESS_EXCEPTIONS: '/baasHome/search_YTD_PendingBusinessExceptions',
  FETCH_EXCEPTION_SUPPLIER_COUNT: '/baasHome/fetch_exception_supplier_count',
  FETCH_EXCEPTION_BY_SUPPLIER: '/baasHome/fetch_exception_supplier_count_by_Supplier',
  LOAD_BUSINESS_CONFIG: '/baasHome/load_business_config',
  BATCH_INVENTORY_YTD_OVERVIEW: '/baasHome/BatchInventoryYTDOverView',
  INVENTORY_YTD_30_60_90: '/baasHome/InventoryYTD306090',
  INVOICE_INVENTORY_YTD_OVERVIEW: '/baasHome/InvoiceInventoryYTDOverView',
  FETCH_AUDIT_30_60_90: '/baasHome/fetch_audit_into_bihourly_sp_30_60_90_baas',
  SEARCH_AUDIT_30_60_90: '/baasHome/search_audit_into_bihourly_sp_30_60_90_baas',
  SEARCH_INSIGHTS_CUSTOM: '/baasHome/search_insights_custom_for_input',
  LOAD_INBOX_SEARCH_CONFIG: '/baasHome/load_inbox_serachConfig',
  LOAD_AGENT: '/baasHome/loadAgent',
};

interface BaseQueryParams {
  customer_id: string;
  bps_id: string;
  user_id: string;
}

interface PaginatedQueryParams extends BaseQueryParams {
  itemsPerPage: number;
  currentPage: number;
}

interface SearchQueryParams extends PaginatedQueryParams {
  searchText: string;
}

interface DateRangeQueryParams extends BaseQueryParams {
  startDate: string;
  endDate: string;
}

export const businessHomeApi = createApi({
  reducerPath: 'businessHomeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      return headers;
    },
  }),
  tagTypes: ['Dashboard', 'YTD', 'Exceptions', 'Inventory', 'Agents', 'Insights'],
  endpoints: (builder) => ({
    // Get tasks and workflows count
    // AngularJS: decrypt -> res[0][0].merged_json -> JSON.parse -> recent_TasksWorkflows_Counts_data -> JSON.parse
    getTasksWorkflowsCount: builder.query<TasksWorkflowCount[][], BaseQueryParams>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.TASKS_WORKFLOWS_COUNT,
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
      providesTags: ['Dashboard'],
    }),

    // Load display time settings
    // AngularJS: NO encryption - plain JSON request & response
    // Field: display_timezone (not display_time)
    getDisplayTimeSettings: builder.query<DisplayTimeSettings[][], { customer_id: string; bps_id: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.LOAD_DISPLAY_TIME,
        method: 'POST',
        body: params,
      }),
    }),

    // Load YTD pending 30/60/90 days aging
    getYTDPending30_60_90: builder.query<YTDPending30_60_90[][], BaseQueryParams & { sp_process_id: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.LOAD_YTD_PENDING_30_60_90,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['YTD'],
    }),

    // Load YTD pending general
    getYTDPending: builder.query<unknown[][], BaseQueryParams & { sp_process_id: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.LOAD_YTD_PENDING,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['YTD'],
    }),

    // Load YTD business exceptions (paginated)
    getYTDBusinessExceptions: builder.query<BusinessException[][], PaginatedQueryParams & { sp_process_id: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.LOAD_YTD_BUSINESS_EXCEPTIONS,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Exceptions'],
    }),

    // Search YTD business exceptions
    searchYTDBusinessExceptions: builder.mutation<BusinessException[][], SearchQueryParams & { sp_process_id: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.SEARCH_YTD_BUSINESS_EXCEPTIONS,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      invalidatesTags: ['Exceptions'],
    }),

    // Fetch exception supplier count
    // AngularJS: Request ENCRYPTED, Response NOT decrypted (direct res.data)
    getExceptionSupplierCount: builder.query<SupplierExceptionCount[][], BaseQueryParams & { sp_process_id: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.FETCH_EXCEPTION_SUPPLIER_COUNT,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      providesTags: ['Exceptions'],
    }),

    // Fetch exception by supplier
    // AngularJS: Request ENCRYPTED, Response NOT decrypted (decryption code commented out)
    getExceptionBySupplier: builder.query<BusinessException[][], BaseQueryParams & { sp_process_id: string; supplier_id: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.FETCH_EXCEPTION_BY_SUPPLIER,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      providesTags: ['Exceptions'],
    }),

    // Load business configuration
    getBusinessConfig: builder.query<BusinessConfig[][], BaseQueryParams>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.LOAD_BUSINESS_CONFIG,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Batch inventory YTD overview
    // AngularJS: NO encryption - plain JSON both ways
    getBatchInventoryOverview: builder.query<BatchInventoryOverview[][], BaseQueryParams & { sp_process_id: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.BATCH_INVENTORY_YTD_OVERVIEW,
        method: 'POST',
        body: params,
      }),
      providesTags: ['Inventory'],
    }),

    // Batch inventory 30/60/90 aging
    // AngularJS: NO encryption - plain JSON both ways
    getBatchInventory30_60_90: builder.query<BatchInventory30_60_90[][], BaseQueryParams & { sp_process_id: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.INVENTORY_YTD_30_60_90,
        method: 'POST',
        body: params,
      }),
      providesTags: ['Inventory'],
    }),

    // Invoice inventory YTD overview
    // AngularJS: NO encryption - plain JSON both ways
    getInvoiceInventoryOverview: builder.query<InvoiceInventoryOverview[][], BaseQueryParams & { sp_process_id: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.INVOICE_INVENTORY_YTD_OVERVIEW,
        method: 'POST',
        body: params,
      }),
      providesTags: ['Inventory'],
    }),

    // Fetch audit data 30/60/90
    getAuditData30_60_90: builder.query<unknown[][], PaginatedQueryParams & { sp_process_id: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.FETCH_AUDIT_30_60_90,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Search audit data 30/60/90
    searchAuditData30_60_90: builder.mutation<unknown[][], SearchQueryParams & { sp_process_id: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.SEARCH_AUDIT_30_60_90,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Search insights custom
    searchInsightsCustom: builder.mutation<InsightsCustomData[][], DateRangeQueryParams & { sp_process_id: string; searchInput: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.SEARCH_INSIGHTS_CUSTOM,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      invalidatesTags: ['Insights'],
    }),

    // Load inbox search configuration
    getInboxSearchConfig: builder.query<unknown[][], BaseQueryParams>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.LOAD_INBOX_SEARCH_CONFIG,
        method: 'POST',
        body: encryptData(params),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Load agent data (paginated)
    // AngularJS: NO encryption - plain JSON both ways
    getAgentData: builder.query<AgentData[][], PaginatedQueryParams & { sp_process_id: string }>({
      query: (params) => ({
        url: BUSINESS_HOME_ENDPOINTS.LOAD_AGENT,
        method: 'POST',
        body: params,
      }),
      providesTags: ['Agents'],
    }),
  }),
});

export const {
  useGetTasksWorkflowsCountQuery,
  useGetDisplayTimeSettingsQuery,
  useGetYTDPending30_60_90Query,
  useGetYTDPendingQuery,
  useGetYTDBusinessExceptionsQuery,
  useSearchYTDBusinessExceptionsMutation,
  useGetExceptionSupplierCountQuery,
  useGetExceptionBySupplierQuery,
  useGetBusinessConfigQuery,
  useGetBatchInventoryOverviewQuery,
  useLazyGetBatchInventoryOverviewQuery,
  useGetBatchInventory30_60_90Query,
  useLazyGetBatchInventory30_60_90Query,
  useGetInvoiceInventoryOverviewQuery,
  useLazyGetInvoiceInventoryOverviewQuery,
  useGetAuditData30_60_90Query,
  useLazyGetAuditData30_60_90Query,
  useSearchAuditData30_60_90Mutation,
  useSearchInsightsCustomMutation,
  useGetInboxSearchConfigQuery,
  useGetAgentDataQuery,
  useLazyGetAgentDataQuery,
} = businessHomeApi;
