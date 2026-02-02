/**
 * User Profile RTK Query API
 * Migrated from AppHomeController.js profile-related $http calls
 * NOTE: Body is sent as plain text (encrypted string) to match AngularJS $http behavior
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';
import { API_ENDPOINTS } from '../../../lib/api';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

export const userProfileApi = createApi({
  reducerPath: 'userProfileApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      headers.set('Content-Type', 'text/plain');
      return headers;
    },
  }),
  tagTypes: ['UserProfile'],
  endpoints: (builder) => ({
    // Update user profile (password change)
    updateUserProfile: builder.mutation({
      query: (profileData) => ({
        url: API_ENDPOINTS.UPDATE_USER_PROFILE,
        method: 'POST',
        body: encryptData(profileData),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
      invalidatesTags: ['UserProfile'],
    }),

    // Request OTP for password change
    requestOtpForPasswordChange: builder.mutation({
      query: ({ user_login_id, sp_process_id }) => ({
        url: API_ENDPOINTS.OTP_RECOVER_PASSWORD,
        method: 'POST',
        body: encryptData({ user_login_id, otp_status: 3, sp_process_id }),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Verify OTP for password change
    verifyOtpForProfileUpdate: builder.mutation({
      query: ({ user_login_id, otp_value }) => ({
        url: API_ENDPOINTS.VERIFY_OTP,
        method: 'POST',
        body: encryptData({ user_login_id, otp_value }),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    // Update user activity logging
    updateUserActivityLogging: builder.mutation({
      query: (loggingData) => ({
        url: API_ENDPOINTS.UPDATE_USER_ACTIVITIES,
        method: 'POST',
        body: encryptData({ logingdata: loggingData }),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => decryptData(response),
    }),
  }),
});

export const {
  useUpdateUserProfileMutation,
  useRequestOtpForPasswordChangeMutation,
  useVerifyOtpForProfileUpdateMutation,
  useUpdateUserActivityLoggingMutation,
} = userProfileApi;
