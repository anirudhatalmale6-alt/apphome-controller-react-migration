/**
 * App Settings RTK Query API
 * Server communication for admin settings / user management
 * Migrated from AppSettingPage.js (settingViewsCtrl) $http calls
 *
 * Encryption: 2 endpoints use AES-CBC (encrypt request, decrypt response)
 *             11 endpoints send plain JSON
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';
import type {
  FetchSettingDataInput,
  UpdateInfoSettingInput,
  SettingDateFormatsInput,
  StoreRemoteKeyInput,
  SaveCorporationInput,
  ExistingUsersInput,
  LoadReviewUsersInput,
  ValidateExcelInput,
  ReadExcelInput,
  UserFieldResourcesInput,
  UsersProcessInput,
  DeleteUsersInput,
  GrantAccessInput,
  SettingConfig,
} from '../types/AppSettingsTypes';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

// API Endpoints for App Settings
const APP_SETTINGS_ENDPOINTS = {
  // Encrypted (AES-CBC)
  FETCH_SETTING_DATA: '/baasHome/fetch_setting_data',
  SAVE_CORPORATION_DETAILS: '/baasHome/saveCorporationDetailsConfig',
  // Plain JSON
  UPDATE_INFO_SETTING: '/baasHome/update_info_settingConfig',
  SETTING_DATE_FORMATS: '/baasHome/settingDateFormats',
  STORE_REMOTE_KEY: '/baasHome/storeRemoteKeySecure',
  EXISTING_USERS: '/baasContent/existingUsers',
  LOAD_REVIEW_USERS: '/baasContent/load_retrive_and_review_exceldata_user',
  VALIDATE_EXCEL: '/baasContent/validate_Excels_for_user',
  READ_EXCEL: '/baasContent/read_Excels_for_User',
  USER_FIELD_RESOURCES: '/baasContent/user_fields_resources',
  USERS_PROCESS: '/baasContent/usersProcess',
  DELETE_USERS: '/baasContent/deleteExistingUsers',
  GRANT_ACCESS: '/baasContent/grant_access_user',
} as const;

export const appSettingsApi = createApi({
  reducerPath: 'appSettingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      return headers;
    },
  }),
  tagTypes: ['SettingConfig', 'ExistingUsers', 'ReviewUsers', 'UserFieldResources'],
  endpoints: (builder) => ({
    /**
     * Fetch setting data (T&C, date format, time format, timezone, etc.)
     * Origin: $rootScope.loadFetchForSetting (line ~71)
     * Encrypted: YES
     * Returns: response[0][0] = SettingConfig object
     */
    fetchSettingData: builder.query<SettingConfig, FetchSettingDataInput>({
      query: (input) => ({
        url: APP_SETTINGS_ENDPOINTS.FETCH_SETTING_DATA,
        method: 'POST',
        body: encryptData(input),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          const decrypted = decryptData<any>(response);
          // API returns nested array: [[{settingConfig}]]
          if (Array.isArray(decrypted) && Array.isArray(decrypted[0])) {
            return decrypted[0][0] as SettingConfig;
          }
          return decrypted as SettingConfig;
        } catch {
          return response as unknown as SettingConfig;
        }
      },
      providesTags: ['SettingConfig'],
    }),

    /**
     * Update setting config (T&C, date format, time format, timezone)
     * Origin: multiple save functions (accept, saveDateFormat, saveTimeFormat, saveTimeZone)
     * Encrypted: NO - Plain JSON
     */
    updateInfoSetting: builder.mutation<any, UpdateInfoSettingInput>({
      query: (input) => ({
        url: APP_SETTINGS_ENDPOINTS.UPDATE_INFO_SETTING,
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['SettingConfig'],
    }),

    /**
     * Fetch available date formats
     * Origin: $rootScope.loadDateFormats (line ~262)
     * Encrypted: NO - Plain JSON
     * Returns: response[0][0].date_formats (JSON string of format array)
     */
    settingDateFormats: builder.query<any, SettingDateFormatsInput>({
      query: (input) => ({
        url: APP_SETTINGS_ENDPOINTS.SETTING_DATE_FORMATS,
        method: 'POST',
        body: input,
      }),
      transformResponse: (response: any) => {
        try {
          if (Array.isArray(response) && Array.isArray(response[0]) && response[0][0]?.date_formats) {
            return JSON.parse(response[0][0].date_formats);
          }
          return response;
        } catch {
          return response;
        }
      },
    }),

    /**
     * Store remote access key
     * Origin: $scope.StoreRemoteKey (line ~614)
     * Encrypted: NO - Plain JSON
     * Returns: response[0].result = "Success" | "Error"
     */
    storeRemoteKey: builder.mutation<any, StoreRemoteKeyInput>({
      query: (input) => ({
        url: APP_SETTINGS_ENDPOINTS.STORE_REMOTE_KEY,
        method: 'POST',
        body: input,
      }),
    }),

    /**
     * Save corporation details config (with logo)
     * Origin: $scope.saveCorporationDetailsConfig (line ~526)
     * Encrypted: YES
     */
    saveCorporationDetails: builder.mutation<any, SaveCorporationInput>({
      query: (input) => ({
        url: APP_SETTINGS_ENDPOINTS.SAVE_CORPORATION_DETAILS,
        method: 'POST',
        body: encryptData(input),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          return decryptData<any>(response);
        } catch {
          return response;
        }
      },
    }),

    /**
     * Fetch existing users (paginated)
     * Origin: $rootScope.loadExistingUsers (line ~984)
     * Encrypted: NO - Plain JSON
     * Returns: response[0] = user array, response[1][0].total_count
     */
    existingUsers: builder.query<any, ExistingUsersInput>({
      query: (input) => ({
        url: APP_SETTINGS_ENDPOINTS.EXISTING_USERS,
        method: 'POST',
        body: input,
      }),
      providesTags: ['ExistingUsers'],
    }),

    /**
     * Load review/validated excel users (paginated)
     * Origin: $rootScope.loadReviewExistingUsers (line ~1091)
     * Encrypted: NO - Plain JSON
     * Returns: response[0] = review user array, response[1][0].total_count
     */
    loadReviewUsers: builder.query<any, LoadReviewUsersInput>({
      query: (input) => ({
        url: APP_SETTINGS_ENDPOINTS.LOAD_REVIEW_USERS,
        method: 'POST',
        body: input,
      }),
      providesTags: ['ReviewUsers'],
    }),

    /**
     * Validate uploaded excel for users
     * Origin: $rootScope.FormByUserExcelData (line ~745)
     * Encrypted: NO - Plain JSON
     */
    validateExcel: builder.mutation<any, ValidateExcelInput>({
      query: (input) => ({
        url: APP_SETTINGS_ENDPOINTS.VALIDATE_EXCEL,
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['ReviewUsers'],
    }),

    /**
     * Read/import Excel file for user bulk upload
     * Origin: AddUserDialogController $scope.choose (line ~1226)
     * Encrypted: NO - Plain JSON
     */
    readExcelForUser: builder.mutation<any, ReadExcelInput>({
      query: (input) => ({
        url: APP_SETTINGS_ENDPOINTS.READ_EXCEL,
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['ReviewUsers'],
    }),

    /**
     * Fetch user field resources (dropdown options)
     * Origin: $scope.userFieldResources (line ~1385)
     * Encrypted: NO - Plain JSON
     * Returns: JSON string with lookup_data arrays
     */
    userFieldResources: builder.query<any, UserFieldResourcesInput>({
      query: (input) => ({
        url: APP_SETTINGS_ENDPOINTS.USER_FIELD_RESOURCES,
        method: 'POST',
        body: input,
      }),
      providesTags: ['UserFieldResources'],
    }),

    /**
     * Create/update user
     * Origin: $scope.submitForm (line ~1423)
     * Encrypted: NO - Plain JSON
     */
    usersProcess: builder.mutation<any, UsersProcessInput>({
      query: (input) => ({
        url: APP_SETTINGS_ENDPOINTS.USERS_PROCESS,
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['ExistingUsers'],
    }),

    /**
     * Delete user(s)
     * Origin: $scope.deleteUser (line ~1647)
     * Encrypted: NO - Plain JSON
     */
    deleteUsers: builder.mutation<any, DeleteUsersInput>({
      query: (input) => ({
        url: APP_SETTINGS_ENDPOINTS.DELETE_USERS,
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['ExistingUsers', 'ReviewUsers'],
    }),

    /**
     * Grant access to user(s)
     * Origin: $scope.grantAccess (line ~1824)
     * Encrypted: NO - Plain JSON
     */
    grantAccessUser: builder.mutation<any, GrantAccessInput>({
      query: (input) => ({
        url: APP_SETTINGS_ENDPOINTS.GRANT_ACCESS,
        method: 'POST',
        body: input,
      }),
    }),
  }),
});

export const {
  // Queries
  useFetchSettingDataQuery,
  useLazyFetchSettingDataQuery,
  useSettingDateFormatsQuery,
  useLazySettingDateFormatsQuery,
  useExistingUsersQuery,
  useLazyExistingUsersQuery,
  useLoadReviewUsersQuery,
  useLazyLoadReviewUsersQuery,
  useUserFieldResourcesQuery,
  useLazyUserFieldResourcesQuery,
  // Mutations
  useUpdateInfoSettingMutation,
  useStoreRemoteKeyMutation,
  useSaveCorporationDetailsMutation,
  useValidateExcelMutation,
  useReadExcelForUserMutation,
  useUsersProcessMutation,
  useDeleteUsersMutation,
  useGrantAccessUserMutation,
} = appSettingsApi;
