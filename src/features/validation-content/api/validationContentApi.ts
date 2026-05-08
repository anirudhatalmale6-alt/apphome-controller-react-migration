/**
 * Validation Content RTK Query API
 * Server communication for validation workflow
 * Migrated from ValidationContentController.js $http calls
 *
 * Encryption: Most endpoints use AES-CBC (encrypt request, decrypt response)
 *             startWorkflow sends plain JSON (NOT encrypted)
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';
import type {
  LoadValidationMediaInput,
  ChangeMediaPageInput,
  ChangeMediaPageResponse,
  ExtractDataFromPositionInput,
  ExtractDataResponse,
  StartWorkflowInput,
  WorkflowResponse,
  SaveIXSDInput,
  SaveIXSDResponse,
  LoadBundleDesignInput,
  LoadUpdateDataJsonInput,
  UpdateDataJsonResponse,
} from '../types/ValidationContentTypes';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

// API Endpoints for Validation Content
const VALIDATION_ENDPOINTS = {
  LOAD_VALIDATION_MEDIA_LIST: '/validationInbox/load_validation_media_list',
  CHANGE_MEDIA_PAGE: '/validationInbox/changeMediaPage',
  EXTRACT_DATA_FROM_POSITION: '/validationHome/extractDataFromPosition',
  START_WORKFLOW: '/baasContent/startWorkflow',
  SAVE_IXSD_JSON: '/validationContent/saveIXSDJSON',
  LOAD_BUNDLE_DESIGN_AND_IXSD: '/validationContent/load_bundle_design_and_iXSD',
  LOAD_UPDATE_DATA_JSON: '/validationInbox/loadUpdateDataJson',
} as const;

export const validationContentApi = createApi({
  reducerPath: 'validationContentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      return headers;
    },
  }),
  tagTypes: ['ValidationMedia', 'ValidationData', 'BundleDesign'],
  endpoints: (builder) => ({
    /**
     * Load validation media info (main data load)
     * Origin: $scope.load_transaction_media_list (line ~3238)
     * Encrypted: YES
     * Returns: [iXSDDataJson, bundleDesignData, workflowConfig, exceptionDetails, queueCatalog, mediaConfig]
     */
    loadValidationMediaList: builder.query<any, LoadValidationMediaInput>({
      query: (input) => ({
        url: VALIDATION_ENDPOINTS.LOAD_VALIDATION_MEDIA_LIST,
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
      providesTags: ['ValidationMedia'],
    }),

    /**
     * Change media page (navigate PDF pages)
     * Origin: $scope.changeMediaPage (line ~2667)
     * Encrypted: YES
     * Returns: [[{ byteString }]]
     */
    changeMediaPage: builder.mutation<ChangeMediaPageResponse, ChangeMediaPageInput>({
      query: (input) => ({
        url: VALIDATION_ENDPOINTS.CHANGE_MEDIA_PAGE,
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
     * Extract data from PDF position (JCrop OCR)
     * Origin: $scope.extractData (line ~215)
     * Encrypted: YES
     * Returns: { data: "extracted text" }
     */
    extractDataFromPosition: builder.mutation<ExtractDataResponse, ExtractDataFromPositionInput>({
      query: (input) => ({
        url: VALIDATION_ENDPOINTS.EXTRACT_DATA_FROM_POSITION,
        method: 'POST',
        body: encryptData(input),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          return decryptData<ExtractDataResponse>(response);
        } catch {
          return response as unknown as ExtractDataResponse;
        }
      },
    }),

    /**
     * Start workflow / process action
     * Origin: $scope.continueProcess (line ~913)
     * Encrypted: NO - Plain JSON
     * Returns: workflow result with din_version, exceptionMsg, etc.
     */
    startWorkflow: builder.mutation<WorkflowResponse, any>({
      query: (input) => ({
        url: VALIDATION_ENDPOINTS.START_WORKFLOW,
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['ValidationMedia', 'ValidationData'],
    }),

    /**
     * Save iXSD JSON (save validation data)
     * Origin: $scope.saveIXSDDataAndClose (line ~2967)
     * Encrypted: YES
     */
    saveIXSDJSON: builder.mutation<SaveIXSDResponse, SaveIXSDInput>({
      query: (input) => ({
        url: VALIDATION_ENDPOINTS.SAVE_IXSD_JSON,
        method: 'POST',
        body: encryptData(input),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          return decryptData<SaveIXSDResponse>(response);
        } catch {
          return response as unknown as SaveIXSDResponse;
        }
      },
      invalidatesTags: ['ValidationData'],
    }),

    /**
     * Load bundle design and iXSD
     * Origin: $rootScope.load_bundle_design_and_iXSD (validationContent)
     * Encrypted: YES
     * Returns: bundle design configuration data
     */
    loadBundleDesignAndIXSD: builder.mutation<any, LoadBundleDesignInput>({
      query: (input) => ({
        url: VALIDATION_ENDPOINTS.LOAD_BUNDLE_DESIGN_AND_IXSD,
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
      providesTags: ['BundleDesign'],
    }),

    /**
     * Load update data JSON (reload data after validation workflow)
     * Origin: $rootScope.setDataJsonAfterValidation (line ~862)
     * Encrypted: YES
     * Returns: [[{ ixsd_data_json, ixsd_data_exception }]]
     */
    loadUpdateDataJson: builder.mutation<UpdateDataJsonResponse, LoadUpdateDataJsonInput>({
      query: (input) => ({
        url: VALIDATION_ENDPOINTS.LOAD_UPDATE_DATA_JSON,
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
          return data as UpdateDataJsonResponse;
        } catch {
          return response as unknown as UpdateDataJsonResponse;
        }
      },
      invalidatesTags: ['ValidationData'],
    }),
  }),
});

export const {
  // Queries
  useLoadValidationMediaListQuery,
  useLazyLoadValidationMediaListQuery,
  // Mutations
  useChangeMediaPageMutation,
  useExtractDataFromPositionMutation,
  useStartWorkflowMutation,
  useSaveIXSDJSONMutation,
  useLoadBundleDesignAndIXSDMutation,
  useLoadUpdateDataJsonMutation,
} = validationContentApi;
