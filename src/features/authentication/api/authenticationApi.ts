/**
 * Authentication RTK Query API
 * Server communication and caching for authentication
 * Migrated from AppHomeController.js $http calls
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData, encryptPassword } from '../../../lib/crypto';
import { API_ENDPOINTS } from '../../../lib/api';
import type {
  SignInResponse,
  LoginStatusResponse,
  ValidateUserResponse,
  ValidateOnbaseUserResponse,
  MfaCheckResponse,
  QrCodeResponse,
  VerifyCodeResponse,
  VerifyCodeInput
} from '../types/AuthenticationTypes';
import { getDeviceInfo } from '../services/AuthenticationFlowService';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

export const authenticationApi = createApi({
  reducerPath: 'authenticationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      return headers;
    },
  }),
  tagTypes: ['Auth', 'User'],
  endpoints: (builder) => ({
    // Sign in - POST /baasHome/signIn
    signIn: builder.mutation<SignInResponse[][], { username: string; password: string }>({
      query: ({ username, password }) => ({
        url: API_ENDPOINTS.SIGN_IN,
        method: 'POST',
        body: encryptData({
          username,
          password: encryptPassword(password),
          browserData: getDeviceInfo()
        }),
      }),
      transformResponse: (response: string) => decryptData<SignInResponse[][]>(response),
      invalidatesTags: ['Auth'],
    }),

    // Set login status - POST /baasHome/setLoginStatus
    setLoginStatus: builder.mutation<LoginStatusResponse[][], { username: string; remoteKey?: string }>({
      query: ({ username, remoteKey }) => {
        const deviceData = getDeviceInfo();
        return {
          url: API_ENDPOINTS.SET_LOGIN_STATUS,
          method: 'POST',
          body: encryptData({
            user_login_id: username,
            browserData: deviceData,
            IPAddress: '',
            sessionId: '',
            ip: '',
            ...(remoteKey && { remoteKey })
          }),
        };
      },
      transformResponse: (response: string) => decryptData<LoginStatusResponse[][]>(response),
    }),

    // Validate user - POST /baasHome/validateUser
    validateUser: builder.mutation<ValidateUserResponse[][], { username: string }>({
      query: ({ username }) => ({
        url: API_ENDPOINTS.VALIDATE_USER,
        method: 'POST',
        body: { username },
      }),
    }),

    // Validate onbase user - POST /baasHome/validateOnbaseUser
    validateOnbaseUser: builder.mutation<ValidateOnbaseUserResponse[][], { username: string }>({
      query: ({ username }) => ({
        url: API_ENDPOINTS.VALIDATE_ONBASE_USER,
        method: 'POST',
        body: { username },
      }),
    }),

    // Check MFA - POST /baasHome/checkMFA
    checkMfa: builder.mutation<MfaCheckResponse, { username: string }>({
      query: ({ username }) => ({
        url: API_ENDPOINTS.CHECK_MFA,
        method: 'POST',
        body: { username },
      }),
    }),

    // Get QR code for MFA setup - POST /baasHome/getQRcode
    getQrCode: builder.mutation<QrCodeResponse, { username: string }>({
      query: ({ username }) => ({
        url: API_ENDPOINTS.GET_QR_CODE,
        method: 'POST',
        body: { username },
      }),
    }),

    // Verify TOTP code - POST /baasHome/verifyCode
    verifyCode: builder.mutation<VerifyCodeResponse, VerifyCodeInput>({
      query: (input) => ({
        url: API_ENDPOINTS.VERIFY_CODE,
        method: 'POST',
        body: input,
      }),
    }),

    // Sign out - POST /baasHome/signOutFromOnebase
    signOut: builder.mutation<void, { user_login_id: string }>({
      query: (input) => ({
        url: API_ENDPOINTS.SIGN_OUT,
        method: 'POST',
        body: encryptData(input),
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Set password (new user) - POST /baasHome/setPassword
    setPassword: builder.mutation<{ result: string }[][], { userName: string; password: string }>({
      query: ({ userName, password }) => ({
        url: API_ENDPOINTS.SET_PASSWORD,
        method: 'POST',
        body: { userName, password: encryptPassword(password) },
      }),
    }),

    // Forgot username - POST /baasHome/forgotUsername
    forgotUsername: builder.mutation<{ result: string; user_login_id?: string }[][], { forgetuserid: string }>({
      query: (input) => ({
        url: API_ENDPOINTS.FORGOT_USERNAME,
        method: 'POST',
        body: encryptData(input),
      }),
      transformResponse: (response: string) => decryptData(response),
    }),
  }),
});

export const {
  useSignInMutation,
  useSetLoginStatusMutation,
  useValidateUserMutation,
  useValidateOnbaseUserMutation,
  useCheckMfaMutation,
  useGetQrCodeMutation,
  useVerifyCodeMutation,
  useSignOutMutation,
  useSetPasswordMutation,
  useForgotUsernameMutation,
} = authenticationApi;
