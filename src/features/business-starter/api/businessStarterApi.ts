/**
 * Business Starter RTK Query API
 * Server communication and caching for business starter
 * Migrated from BusinessStarterController.js $http calls
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';
import type {
  CustomerDashboardData,
  AdminSettingQueue,
  TechOpsWorkflow,
  LoadQueueMenuStatusInput,
  AdminSettingInput,
  EnableDisableInput,
  EnableDisableMenuInput,
  TechOpsInboxInput,
} from '../types/BusinessStarterTypes';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

// API Endpoints for Business Starter
const BUSINESS_STARTER_ENDPOINTS = {
  LOAD_QUEUE_MENU_STATUS: '/baasHome/load_queue_menu_status',
  CUSTOMER_PERFORMANCE_DASHBOARD: '/baasHome/loadCustomerPerformanceDashboard',
  ADMIN_SETTING: '/baasHome/onebaseAdminSetting',
  ADMIN_SETTINGS_ENABLE_DISABLE: '/baasHome/AdminSettingsEnableDisable',
  ENABLE_DISABLE_Q_USER_MENU: '/baasHome/enableOrDisableQUserMenuService',
  ENABLE_DISABLE_MENU: '/baasHome/enableOrDisableMenu',
  ADMIN_TECHOPS: '/baasHome/onebaseAdminTechops',
  TECHOPS_INBOX: '/baasHome/onebaseAdminTechopsInbox',
};

export const businessStarterApi = createApi({
  reducerPath: 'businessStarterApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      return headers;
    },
  }),
  tagTypes: ['BusinessStarter', 'AdminSettings', 'TechOps', 'Queue'],
  endpoints: (builder) => ({
    /**
     * Load queue menu status
     * Origin: $scope.selectMyBusiness -> load_queue_menu_status
     */
    loadQueueMenuStatus: builder.mutation<unknown[][], LoadQueueMenuStatusInput>({
      query: (input) => ({
        url: BUSINESS_STARTER_ENDPOINTS.LOAD_QUEUE_MENU_STATUS,
        method: 'POST',
        body: encryptData(input),
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    /**
     * Load customer performance dashboard
     * Origin: $rootScope.loadFetchForCustomerDashboard
     */
    loadCustomerDashboard: builder.query<CustomerDashboardData, { username: string; userpassword: string }>({
      query: (input) => ({
        url: BUSINESS_STARTER_ENDPOINTS.CUSTOMER_PERFORMANCE_DASHBOARD,
        method: 'POST',
        body: input,
      }),
      providesTags: ['BusinessStarter'],
    }),

    /**
     * Load admin settings
     * Origin: $rootScope.loadFetchForAdminSetting
     */
    loadAdminSettings: builder.query<{ title: string; tableHeaders: unknown[]; CustomerData: unknown[] }, { username: string; userpassword: string }>({
      query: (input) => ({
        url: BUSINESS_STARTER_ENDPOINTS.ADMIN_SETTING,
        method: 'POST',
        body: input,
      }),
      providesTags: ['AdminSettings'],
    }),

    /**
     * Load admin settings enable/disable for BPS
     * Origin: $scope.toggleEditAction -> AdminSettingsEnableDisable
     */
    loadAdminSettingsEnableDisable: builder.query<AdminSettingQueue[], AdminSettingInput>({
      query: (input) => ({
        url: BUSINESS_STARTER_ENDPOINTS.ADMIN_SETTINGS_ENABLE_DISABLE,
        method: 'POST',
        body: input,
      }),
      providesTags: ['Queue'],
    }),

    /**
     * Enable/disable queue, user, menu, or service
     * Origin: $scope.saveQueue, $scope.saveUsers, $scope.saveActions, $scope.toggleMailAlert
     */
    enableDisableQueueUserMenu: builder.mutation<unknown, EnableDisableInput>({
      query: (input) => ({
        url: BUSINESS_STARTER_ENDPOINTS.ENABLE_DISABLE_Q_USER_MENU,
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['Queue'],
    }),

    /**
     * Enable/disable menu
     * Origin: $scope.saveMenus
     */
    enableDisableMenu: builder.mutation<unknown, EnableDisableMenuInput>({
      query: (input) => ({
        url: BUSINESS_STARTER_ENDPOINTS.ENABLE_DISABLE_MENU,
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['Queue'],
    }),

    /**
     * Load admin techops
     * Origin: $rootScope.loadFetchForTechops
     */
    loadAdminTechops: builder.query<{ title: string; tableHeaders: unknown[]; CustomerData: unknown[] }, { username: string; userpassword: string }>({
      query: (input) => ({
        url: BUSINESS_STARTER_ENDPOINTS.ADMIN_TECHOPS,
        method: 'POST',
        body: input,
      }),
      providesTags: ['TechOps'],
    }),

    /**
     * Load techops inbox with pagination
     * Origin: $scope.loadTechopsInboxPage
     */
    loadTechopsInbox: builder.query<[TechOpsWorkflow[], { exceptionCount: string }[]], TechOpsInboxInput>({
      query: (input) => ({
        url: BUSINESS_STARTER_ENDPOINTS.TECHOPS_INBOX,
        method: 'POST',
        body: input,
      }),
      providesTags: ['TechOps'],
    }),
  }),
});

export const {
  useLoadQueueMenuStatusMutation,
  useLoadCustomerDashboardQuery,
  useLazyLoadCustomerDashboardQuery,
  useLoadAdminSettingsQuery,
  useLazyLoadAdminSettingsQuery,
  useLoadAdminSettingsEnableDisableQuery,
  useLazyLoadAdminSettingsEnableDisableQuery,
  useEnableDisableQueueUserMenuMutation,
  useEnableDisableMenuMutation,
  useLoadAdminTechopsQuery,
  useLazyLoadAdminTechopsQuery,
  useLoadTechopsInboxQuery,
  useLazyLoadTechopsInboxQuery,
} = businessStarterApi;
