/**
 * Application Shell RTK Query API
 * Migrated from AppHomeController.js global API calls
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';
import { API_ENDPOINTS } from '../../../lib/api';
import type { CorpDetails, TimeZoneInfo } from '../types/ApplicationShellTypes';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

export const applicationShellApi = createApi({
  reducerPath: 'applicationShellApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      return headers;
    },
  }),
  tagTypes: ['Corp', 'Config', 'Settings'],
  endpoints: (builder) => ({
    // Get corp details
    getCorpDetails: builder.query<CorpDetails, { companyID: string }>({
      query: ({ companyID }) => ({
        url: API_ENDPOINTS.CORP_DETAILS,
        method: 'POST',
        body: { companyID },
      }),
      providesTags: ['Corp'],
    }),

    // Load business config
    loadBusinessConfig: builder.mutation<unknown, { customer_id: string; bps_id: string }>({
      query: (input) => ({
        url: API_ENDPOINTS.LOAD_BUSINESS_CONFIG,
        method: 'POST',
        body: encryptData(input),
      }),
      transformResponse: (response: string) => decryptData(response),
      invalidatesTags: ['Config'],
    }),

    // Load settings
    loadSettings: builder.query<unknown, { customer_id: string; bps_id: string }>({
      query: (input) => ({
        url: API_ENDPOINTS.LOAD_SETTING,
        method: 'POST',
        body: input,
      }),
      providesTags: ['Settings'],
    }),

    // Load display time for inbox
    loadDisplayTime: builder.query<{ display_timezone: string }, { customer_id: string; bps_id: string }>({
      query: (input) => ({
        url: API_ENDPOINTS.LOAD_DISPLAY_TIME,
        method: 'POST',
        body: input,
      }),
    }),

    // Fetch timezone details
    fetchTimezoneDetails: builder.mutation<unknown, TimeZoneInfo>({
      query: (input) => ({
        url: API_ENDPOINTS.FETCH_TIMEZONE,
        method: 'POST',
        body: input,
      }),
    }),

    // Update timezone details
    updateTimezoneDetails: builder.mutation<unknown, { customer_id: string; bps_id: string; dataJson: unknown }>({
      query: (input) => ({
        url: API_ENDPOINTS.UPDATE_TIMEZONE,
        method: 'POST',
        body: input,
      }),
    }),
  }),
});

export const {
  useGetCorpDetailsQuery,
  useLoadBusinessConfigMutation,
  useLoadSettingsQuery,
  useLoadDisplayTimeQuery,
  useFetchTimezoneDetailsMutation,
  useUpdateTimezoneDetailsMutation,
} = applicationShellApi;
