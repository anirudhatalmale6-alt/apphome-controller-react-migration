/**
 * BusinessApps RTK Query API
 * Migrated from BusinessAppsController.js $http calls
 * All endpoints use AES encryption matching original AngularJS implementation
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';
import type {
  BuQueueAction,
  WorkflowInboxMenu,
  InboxSearchConfig,
  DinDashboardData,
  DisplayTimeSettings,
  PendingListData,
  DocUploadRecent,
} from '../types/BusinessAppsTypes';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

interface BaseQueryParams {
  customer_id: string;
  bps_id: string;
  user_id: string;
}

interface PaginatedQueryParams extends BaseQueryParams {
  pageNumber: number;
  pageSize: number;
}

interface QueueQueryParams extends BaseQueryParams {
  bu_id: string;
  queue_id: string;
  dept_id?: string;
  tps_id?: string;
}

interface WorkflowInboxParams extends QueueQueryParams {
  bPaaS_workflow_status: string;
  workflow_name?: string;
}

export const businessAppsApi = createApi({
  reducerPath: 'businessAppsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      return headers;
    },
  }),
  tagTypes: ['QueueActions', 'Workflows', 'TasksCount', 'InboxMenus', 'DinDashboard'],
  endpoints: (builder) => ({
    // Load BU queue actions - called on page load to build sidebar dynamically
    loadBuQueueActions: builder.query<BuQueueAction[], PaginatedQueryParams>({
      query: (data) => ({
        url: '/baasHome/load_bu_queue_actions',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['QueueActions'],
    }),

    // Load workflow inbox menus - triggered when user clicks action in sidebar
    loadWorkflowInboxMenus: builder.query<WorkflowInboxMenu[][], WorkflowInboxParams>({
      query: (data) => ({
        url: '/baasHome/load_workflow_inbox_menus',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['InboxMenus'],
    }),

    // Load inbox search configuration
    loadInboxSearchConfig: builder.query<InboxSearchConfig[][], QueueQueryParams>({
      query: (data) => ({
        url: '/baasHome/load_inbox_serachConfig',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Load DIN dashboard data
    loadDinDashboard: builder.query<DinDashboardData[][], WorkflowInboxParams & { itemsPerPage: number; currentPage: number }>({
      query: (data) => ({
        url: '/baasHome/load_din_dashboard',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['DinDashboard'],
    }),

    // Load display time for inbox
    loadDisplayTimeForInbox: builder.query<DisplayTimeSettings[][], BaseQueryParams>({
      query: (data) => ({
        url: '/baasHome/loadDisplayTimeForInbox',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Load pending list
    loadPendingList: builder.query<PendingListData[][], WorkflowInboxParams & { itemsPerPage: number; currentPage: number }>({
      query: (data) => ({
        url: '/baasHome/load_pending_list',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Workflows'],
    }),

    // Load document upload recents
    loadDocUploadRecents: builder.query<DocUploadRecent[][], QueueQueryParams & { itemsPerPage: number; currentPage: number }>({
      query: (data) => ({
        url: '/baasHome/loadDocUploadRecents',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Workflows'],
    }),

    // Get MIME type
    getMimeType: builder.query<string, { filename: string }>({
      query: (data) => ({
        url: '/baasHome/getMimeType',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Get tasks/workflows count
    getTasksWorkflowsCount: builder.query<unknown, {
      customer_id: string;
      bps_id: string;
      user_id: string;
    }>({
      query: (data) => ({
        url: '/baasHome/tasksWorkflowsCount',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['TasksCount'],
    }),

    // Load recent workflows
    loadRecentWorkflows: builder.query<unknown, {
      customer_id: string;
      bps_id: string;
      bu_id: string;
      queue_id: string;
      user_id: string;
      pageNumber: number;
      pageSize: number;
      agingFilter?: string;
    }>({
      query: (data) => ({
        url: '/baasHome/load_recent_workflows',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Workflows'],
    }),

    // Load past due workflows
    loadPastDueWorkflows: builder.query<unknown, {
      customer_id: string;
      bps_id: string;
      bu_id: string;
      queue_id: string;
      user_id: string;
      pageNumber: number;
      pageSize: number;
    }>({
      query: (data) => ({
        url: '/baasHome/load_pastdue_workflows',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Workflows'],
    }),

    // Load custom date range workflows
    loadCustomWorkflows: builder.query<unknown, {
      customer_id: string;
      bps_id: string;
      bu_id: string;
      queue_id: string;
      user_id: string;
      startDate: string;
      endDate: string;
      pageNumber: number;
      pageSize: number;
    }>({
      query: (data) => ({
        url: '/baasHome/load_custom_workflows',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Workflows'],
    }),

    // Search workflows by field
    searchWorkflows: builder.mutation<unknown, {
      customer_id: string;
      bps_id: string;
      bu_id: string;
      queue_id: string;
      user_id: string;
      searchField: string;
      searchValue: string;
      pageNumber: number;
      pageSize: number;
    }>({
      query: (data) => ({
        url: '/baasHome/search_workflows',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Upload file
    uploadFile: builder.mutation<unknown, FormData>({
      query: (formData) => ({
        url: '/baasHome/upload_file',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Workflows'],
    }),

    // Export workflows
    exportWorkflows: builder.mutation<unknown, {
      customer_id: string;
      bps_id: string;
      bu_id: string;
      queue_id: string;
      user_id: string;
      exportType: string;
      view: string;
      dateRange?: { startDate: string; endDate: string };
    }>({
      query: (data) => ({
        url: '/baasHome/export_workflows',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),
  }),
});

export const {
  useLoadBuQueueActionsQuery,
  useLoadWorkflowInboxMenusQuery,
  useLazyLoadWorkflowInboxMenusQuery,
  useLoadInboxSearchConfigQuery,
  useLazyLoadInboxSearchConfigQuery,
  useLoadDinDashboardQuery,
  useLazyLoadDinDashboardQuery,
  useLoadDisplayTimeForInboxQuery,
  useLoadPendingListQuery,
  useLazyLoadPendingListQuery,
  useLoadDocUploadRecentsQuery,
  useLazyLoadDocUploadRecentsQuery,
  useGetMimeTypeQuery,
  useGetTasksWorkflowsCountQuery,
  useLoadRecentWorkflowsQuery,
  useLazyLoadRecentWorkflowsQuery,
  useLoadPastDueWorkflowsQuery,
  useLazyLoadPastDueWorkflowsQuery,
  useLoadCustomWorkflowsQuery,
  useLazyLoadCustomWorkflowsQuery,
  useSearchWorkflowsMutation,
  useUploadFileMutation,
  useExportWorkflowsMutation,
} = businessAppsApi;
