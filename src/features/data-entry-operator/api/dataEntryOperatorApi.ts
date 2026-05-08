/**
 * Data Entry Operator RTK Query API
 * Server communication for data entry exception workflow (page splitting/classification)
 * Migrated from DataEntryOperatorController.js $http calls
 *
 * Encryption: 3 endpoints use AES-CBC (encrypt request, decrypt response)
 *             2 endpoints send plain JSON (handleDataEntryException, download_Stream_exception)
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';
import type {
  LoadDataEntryMediaInput,
  ChangeMediaPageDataEntryInput,
  ChangeMediaPageResponse,
  RotatePDFPageInput,
  HandleDataEntryExceptionInput,
  HandleDataEntryExceptionResponse,
  DownloadStreamExceptionInput,
  DownloadStreamResponse,
} from '../types/DataEntryOperatorTypes';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

// API Endpoints for Data Entry Operator
const DATA_ENTRY_ENDPOINTS = {
  LOAD_DATA_ENTRY_MEDIA_LIST: '/validationContent/load_data_entry_media_list',
  CHANGE_MEDIA_PAGE_DATA_ENTRY: '/validationInbox/changeMediaPageDataEntry',
  ROTATE_PDF_PAGE: '/validationInbox/rotatePDFPage',
  HANDLE_DATA_ENTRY_EXCEPTION: '/baasContent/handleDataEntryException',
  DOWNLOAD_STREAM_EXCEPTION: '/validationHome/download_Stream_exception',
} as const;

export const dataEntryOperatorApi = createApi({
  reducerPath: 'dataEntryOperatorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      return headers;
    },
  }),
  tagTypes: ['DataEntryMedia'],
  endpoints: (builder) => ({
    /**
     * Load data entry media list
     * Origin: $scope.load_exception_media_info (line ~1003)
     * Encrypted: YES (via validationContent)
     * Returns: [inventoryData[], iXSDConfigData[], mediaConfigData[], workflowActionConfigData[],
     *           classificationInfo[], ?, maxFileIdData[], queueInfo[], ?, queueCatalog[]]
     */
    loadDataEntryMediaList: builder.query<any, LoadDataEntryMediaInput>({
      query: (input) => ({
        url: DATA_ENTRY_ENDPOINTS.LOAD_DATA_ENTRY_MEDIA_LIST,
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
      providesTags: ['DataEntryMedia'],
    }),

    /**
     * Change media page (data entry specific - navigate to specific page)
     * Origin: $scope.changeMediaPageDataEntry (line ~930)
     * Encrypted: YES (via validationInbox)
     * Returns: [[{byteString}]] - nested array with base64 image
     */
    changeMediaPageDataEntry: builder.mutation<ChangeMediaPageResponse, ChangeMediaPageDataEntryInput>({
      query: (input) => ({
        url: DATA_ENTRY_ENDPOINTS.CHANGE_MEDIA_PAGE_DATA_ENTRY,
        method: 'POST',
        body: encryptData(input),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          const decrypted = decryptData<any>(response);
          // API returns nested array: [[{byteString}]]
          const data = Array.isArray(decrypted) && Array.isArray(decrypted[0])
            ? decrypted[0][0]
            : decrypted;
          return data as ChangeMediaPageResponse;
        } catch {
          return response as unknown as ChangeMediaPageResponse;
        }
      },
    }),

    /**
     * Rotate PDF page
     * Origin: $scope.rotatePDFPage (line ~30)
     * Encrypted: YES (via validationInbox)
     * Returns: [[{byteString}]] - rotated page image
     */
    rotatePDFPage: builder.mutation<ChangeMediaPageResponse, RotatePDFPageInput>({
      query: (input) => ({
        url: DATA_ENTRY_ENDPOINTS.ROTATE_PDF_PAGE,
        method: 'POST',
        body: encryptData(input),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          const decrypted = decryptData<any>(response);
          const data = Array.isArray(decrypted) && Array.isArray(decrypted[0])
            ? decrypted[0][0]
            : decrypted;
          return data as ChangeMediaPageResponse;
        } catch {
          return response as unknown as ChangeMediaPageResponse;
        }
      },
    }),

    /**
     * Handle data entry exception (process workflow action)
     * Origin: $scope.continueProcess (line ~479)
     * Encrypted: NO - Plain JSON (via baasContent)
     * Returns: {exceptionMsg, ...} or empty object on failure
     */
    handleDataEntryException: builder.mutation<HandleDataEntryExceptionResponse, HandleDataEntryExceptionInput>({
      query: (input) => ({
        url: DATA_ENTRY_ENDPOINTS.HANDLE_DATA_ENTRY_EXCEPTION,
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['DataEntryMedia'],
    }),

    /**
     * Download source file
     * Origin: $scope.download_stream (line ~1277)
     * Encrypted: NO - Plain JSON (via validationHome)
     * Returns: {downloadStream, downloadStreamFile}
     */
    downloadStreamException: builder.mutation<DownloadStreamResponse, DownloadStreamExceptionInput>({
      query: (input) => ({
        url: DATA_ENTRY_ENDPOINTS.DOWNLOAD_STREAM_EXCEPTION,
        method: 'POST',
        body: input,
      }),
    }),
  }),
});

export const {
  // Queries
  useLoadDataEntryMediaListQuery,
  useLazyLoadDataEntryMediaListQuery,
  // Mutations
  useChangeMediaPageDataEntryMutation,
  useRotatePDFPageMutation,
  useHandleDataEntryExceptionMutation,
  useDownloadStreamExceptionMutation,
} = dataEntryOperatorApi;
