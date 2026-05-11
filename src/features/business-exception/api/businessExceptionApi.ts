/**
 * Business Exception RTK Query API
 * Server communication for data entry exception processing workflow
 * Migrated from BusinessExceptionController.js $http calls
 *
 * Encryption:
 *   - load_data_entry_media_list (validationContent, encrypted)
 *   - changeMediaPageDataEntry (validationInbox, encrypted)
 *   - extractDataFromPosition (validationHome, encrypted)
 *   - load_bundle_design_and_iXSD (validationContent, encrypted)
 *   - download_Stream_exception (validationHome, NOT encrypted)
 *   - handleDataEntryException (baasContent, NOT encrypted)
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';
import type {
  LoadDataEntryMediaListInput,
  ChangeMediaPageDataEntryInput,
  ChangeMediaPageDataEntryResponse,
  ExtractDataFromPositionInput,
  ExtractDataFromPositionResponse,
  HandleDataEntryExceptionInput,
  HandleDataEntryExceptionResponse,
  LoadBundleDesignInput,
  DownloadStreamExceptionInput,
} from '../types/BusinessExceptionTypes';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

// API Endpoints for Business Exception
const BUSINESS_EXCEPTION_ENDPOINTS = {
  LOAD_DATA_ENTRY_MEDIA_LIST: '/validationContent/load_data_entry_media_list',
  CHANGE_MEDIA_PAGE_DATA_ENTRY: '/validationInbox/changeMediaPageDataEntry',
  EXTRACT_DATA_FROM_POSITION: '/validationHome/extractDataFromPosition',
  HANDLE_DATA_ENTRY_EXCEPTION: '/baasContent/handleDataEntryException',
  LOAD_BUNDLE_DESIGN_AND_IXSD: '/validationContent/load_bundle_design_and_iXSD',
  DOWNLOAD_STREAM_EXCEPTION: '/validationHome/download_Stream_exception',
} as const;

export const businessExceptionApi = createApi({
  reducerPath: 'businessExceptionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      return headers;
    },
  }),
  tagTypes: ['ExceptionMedia', 'BundleDesign'],
  endpoints: (builder) => ({
    /**
     * Load data entry media list
     * Origin: $scope.load_data_entry_media_list (line ~2095)
     * Encrypted: YES
     * Returns: [inventoryData[0], iXSDConfigData[1], mediaConfigData[2],
     *           workflowActionConfig[3], classificationInfo[4], dataEntryJson[5],
     *           reserved[6], serviceDashboard[7], lookupCatalog[8], queueCatalog[9]]
     */
    loadDataEntryMediaList: builder.query<any, LoadDataEntryMediaListInput>({
      query: (input) => ({
        url: BUSINESS_EXCEPTION_ENDPOINTS.LOAD_DATA_ENTRY_MEDIA_LIST,
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
      providesTags: ['ExceptionMedia'],
    }),

    /**
     * Change media page (data entry screen page navigation)
     * Origin: $scope.changeMediaPageDataEntry (line ~2831)
     * Encrypted: YES
     * Returns: [[{byteString}]]
     */
    changeMediaPageDataEntry: builder.mutation<ChangeMediaPageDataEntryResponse, ChangeMediaPageDataEntryInput>({
      query: (input) => ({
        url: BUSINESS_EXCEPTION_ENDPOINTS.CHANGE_MEDIA_PAGE_DATA_ENTRY,
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
          return data as ChangeMediaPageDataEntryResponse;
        } catch {
          return response as unknown as ChangeMediaPageDataEntryResponse;
        }
      },
    }),

    /**
     * Extract data from cropped position (OCR)
     * Origin: $scope.extractData (line ~917)
     * Encrypted: YES
     * Returns: [{data: "extracted text"}]
     */
    extractDataFromPosition: builder.mutation<ExtractDataFromPositionResponse, ExtractDataFromPositionInput>({
      query: (input) => ({
        url: BUSINESS_EXCEPTION_ENDPOINTS.EXTRACT_DATA_FROM_POSITION,
        method: 'POST',
        body: encryptData(input),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          const decrypted = decryptData<any>(response);
          // API returns: [{data: "..."}]
          const data = Array.isArray(decrypted) ? decrypted[0] : decrypted;
          return data as ExtractDataFromPositionResponse;
        } catch {
          return response as unknown as ExtractDataFromPositionResponse;
        }
      },
    }),

    /**
     * Handle data entry exception (process workflow action with table extraction)
     * Origin: $scope.extractTable (line ~590)
     * Encrypted: NO - Plain JSON
     * Returns: {preparedMXSDList, dataJSON}
     */
    handleDataEntryException: builder.mutation<HandleDataEntryExceptionResponse, HandleDataEntryExceptionInput>({
      query: (input) => ({
        url: BUSINESS_EXCEPTION_ENDPOINTS.HANDLE_DATA_ENTRY_EXCEPTION,
        method: 'POST',
        body: input,
      }),
    }),

    /**
     * Load bundle design and iXSD
     * Origin: $scope.setBundleInfo (line ~1953)
     * Encrypted: YES
     * Returns: [[{bundle_design, data_json, data_json_with_type, flip_data_json, tfs_uin, ixsd_id, ixsd_bean_path, efs_uin}]]
     */
    loadBundleDesignAndIXSD: builder.mutation<any, LoadBundleDesignInput>({
      query: (input) => ({
        url: BUSINESS_EXCEPTION_ENDPOINTS.LOAD_BUNDLE_DESIGN_AND_IXSD,
        method: 'POST',
        body: encryptData(input),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          const decrypted = decryptData<any>(response);
          return decrypted;
        } catch {
          return response;
        }
      },
      invalidatesTags: ['BundleDesign'],
    }),

    /**
     * Download stream exception (download declined template)
     * Origin: $scope.download_stream (referenced in HTML template)
     * Encrypted: NO - Plain JSON
     * Returns: file download stream
     */
    downloadStreamException: builder.mutation<any, DownloadStreamExceptionInput>({
      query: (input) => ({
        url: BUSINESS_EXCEPTION_ENDPOINTS.DOWNLOAD_STREAM_EXCEPTION,
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
  useExtractDataFromPositionMutation,
  useHandleDataEntryExceptionMutation,
  useLoadBundleDesignAndIXSDMutation,
  useDownloadStreamExceptionMutation,
} = businessExceptionApi;
