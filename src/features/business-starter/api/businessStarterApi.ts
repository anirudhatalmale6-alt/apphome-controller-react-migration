import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '/onebase';

export const businessStarterApi = createApi({
  reducerPath: 'businessStarterApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE }),
  tagTypes: ['QueueMenuStatus', 'CustomerDashboard', 'AdminSettings', 'TechOps'],
  endpoints: (builder) => ({
    // Load queue menu status for a business process
    loadQueueMenuStatus: builder.mutation<unknown, {
      customer_id: string;
      bps_id: string;
      bu_id: string;
      tps_id: string;
      dept_id: string;
      queue_id: string;
      user_id: string;
    }>({
      query: (data) => ({
        url: '/baasHome/load_queue_menu_status',
        method: 'POST',
        body: encryptData(data),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Load customer performance dashboard
    loadCustomerPerformanceDashboard: builder.query<unknown, {
      username: string;
      userpassword: string;
    }>({
      query: (data) => ({
        url: '/baasHome/loadCustomerPerformanceDashboard',
        method: 'POST',
        body: data,
      }),
      providesTags: ['CustomerDashboard'],
    }),

    // Load admin settings
    loadAdminSettings: builder.query<unknown, {
      username: string;
      userpassword: string;
    }>({
      query: (data) => ({
        url: '/baasHome/onebaseAdminSetting',
        method: 'POST',
        body: data,
      }),
      providesTags: ['AdminSettings'],
    }),

    // Load admin settings enable/disable for queues
    loadAdminSettingsEnableDisable: builder.mutation<unknown, {
      customer_id: string;
      bps_id: string;
    }>({
      query: (data) => ({
        url: '/baasHome/AdminSettingsEnableDisable',
        method: 'POST',
        body: data,
      }),
    }),

    // Enable or disable queue/user/menu service
    enableOrDisableService: builder.mutation<unknown, {
      customer_id: string;
      bps_id: string;
      queueid: string;
      userid: string;
      tableName: string;
      EnableOrDisable: string;
      processName: string;
    }>({
      query: (data) => ({
        url: '/baasHome/enableOrDisableQUserMenuService',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AdminSettings'],
    }),

    // Enable or disable menu
    enableOrDisableMenu: builder.mutation<unknown, {
      customer_id: string;
      bps_id: string;
      queue_id: string;
      user_id: string;
      displayName: string;
      isActionEnabled: boolean;
      expiryDate?: string | null;
    }>({
      query: (data) => ({
        url: '/baasHome/enableOrDisableMenu',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AdminSettings'],
    }),

    // Load TechOps data
    loadTechOps: builder.query<unknown, {
      username: string;
      userpassword: string;
    }>({
      query: (data) => ({
        url: '/baasHome/onebaseAdminTechops',
        method: 'POST',
        body: data,
      }),
      providesTags: ['TechOps'],
    }),

    // Load TechOps inbox with pagination
    loadTechOpsInbox: builder.query<unknown, {
      customer_id: string;
      bps_id: string;
      exceptiontype: string;
      minlimit: number;
      maxlimit: number;
    }>({
      query: (data) => ({
        url: '/baasHome/onebaseAdminTechopsInbox',
        method: 'POST',
        body: data,
      }),
      providesTags: ['TechOps'],
    }),
  }),
});

export const {
  useLoadQueueMenuStatusMutation,
  useLoadCustomerPerformanceDashboardQuery,
  useLoadAdminSettingsQuery,
  useLoadAdminSettingsEnableDisableMutation,
  useEnableOrDisableServiceMutation,
  useEnableOrDisableMenuMutation,
  useLoadTechOpsQuery,
  useLoadTechOpsInboxQuery,
} = businessStarterApi;
