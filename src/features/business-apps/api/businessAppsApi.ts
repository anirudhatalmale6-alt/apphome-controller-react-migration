import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '/onebase';

export const businessAppsApi = createApi({
  reducerPath: 'businessAppsApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE }),
  tagTypes: ['QueueActions', 'Workflows', 'TasksCount'],
  endpoints: (builder) => ({
    // Load BU queue actions
    loadBuQueueActions: builder.query<unknown, {
      customer_id: string;
      bps_id: string;
      user_id: string;
      pageNumber: number;
      pageSize: number;
    }>({
      query: (data) => ({
        url: '/baasHome/load_bu_queue_actions',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['QueueActions'],
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
  useGetTasksWorkflowsCountQuery,
  useLoadRecentWorkflowsQuery,
  useLoadPastDueWorkflowsQuery,
  useLoadCustomWorkflowsQuery,
  useSearchWorkflowsMutation,
  useUploadFileMutation,
  useExportWorkflowsMutation,
} = businessAppsApi;
