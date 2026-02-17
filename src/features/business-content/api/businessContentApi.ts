/**
 * Business Content RTK Query API
 * Server communication for document/invoice processing workflow
 * Migrated from BusinessContentController.js $http calls
 *
 * Encryption: 12 endpoints use AES-CBC (encrypt request, decrypt response)
 *             3 endpoints send plain JSON (startWorkflow, sendExceptionNotification, infordata)
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';
import type {
  TransactionMediaInput,
  TransactionMediaResponse,
  DinHistoryInput,
  DinHistoryResponse,
  StartWorkflowInput,
  WorkflowResponse,
  LoadUpdateDataJsonInput,
  UpdateDataJsonResponse,
  CheckForNewDINInput,
  CheckForNewDINResponse,
  SaveIXSDInput,
  DownloadSourceInput,
  DownloadResponse,
  GenerateExcelInput,
  ChangeMediaPageInput,
  ChangeMediaPageResponse,
  SetNewBotCampInput,
  SetInvoiceCodingInput,
  SendNotificationInput,
  FieldLevelAuditInput,
  FieldAuditResponse,
  LoadFormAuditInput,
  FormAuditResponse,
  InfordataInput,
} from '../types/BusinessContentTypes';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

// API Endpoints for Business Content
const BUSINESS_CONTENT_ENDPOINTS = {
  LOAD_TRANSACTION_MEDIA_LIST: '/baasContent/load_transaction_media_list',
  LOAD_DIN_HISTORY: '/baasContent/load_din_history',
  START_WORKFLOW: '/baasContent/startWorkflow',
  LOAD_UPDATE_DATA_JSON: '/baasContent/loadUpdateDataJson',
  CHECK_FOR_NEW_DIN: '/baasContent/checkForNewDIN',
  SAVE_IXSD_JSON: '/baasContent/saveIXSDJSON',
  DOWNLOAD_SOURCE_FILE: '/baasContent/download_source_file',
  GENERATE_EXCEL_OUTPUT: '/baasContent/generateExcelOutput',
  CHANGE_MEDIA_PAGE: '/baasContent/changeMediaPage',
  SET_NEW_BOT_CAMP: '/baasContent/setNewBotCamp',
  SET_INVOICE_CODING: '/baasContent/setInvoiceCoding',
  SEND_EXCEPTION_NOTIFICATION: '/baasContent/sendExceptionNotification',
  FIELD_LEVEL_AUDIT: '/baasContent/fieldLevelAudit',
  LOAD_FORM_AUDIT: '/baasContent/loadFormAudit',
  INFORDATA: '/baasContent/infordata',
} as const;

export const businessContentApi = createApi({
  reducerPath: 'businessContentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      return headers;
    },
  }),
  tagTypes: ['TransactionMedia', 'DinHistory', 'IXSDData', 'FormAudit', 'FieldAudit'],
  endpoints: (builder) => ({
    /**
     * Load transaction media list
     * Origin: $rootScope.loadTransactionMediaList (line ~7269)
     * Encrypted: YES
     * Returns: [transactionData[], bundleDesign[], workflowConfig[], orgHierarchy[], lookupCatalog[]]
     */
    loadTransactionMediaList: builder.query<any, TransactionMediaInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.LOAD_TRANSACTION_MEDIA_LIST,
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
      providesTags: ['TransactionMedia'],
    }),

    /**
     * Load DIN history
     * Origin: $rootScope.load_din_history (line ~208)
     * Encrypted: YES
     * Returns: transaction history with data capture processes
     */
    loadDinHistory: builder.query<any, DinHistoryInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.LOAD_DIN_HISTORY,
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
      providesTags: ['DinHistory'],
    }),

    /**
     * Start workflow / process action
     * Origin: $scope.startWorkflow (line ~4870)
     * Encrypted: NO - Plain JSON
     * Returns: next_micro_process_code, din_status, file data, form output
     */
    startWorkflow: builder.mutation<WorkflowResponse, any>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.START_WORKFLOW,
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['TransactionMedia', 'DinHistory'],
    }),

    /**
     * Load update data JSON (reload iXSD data after workflow)
     * Origin: $rootScope.loadUpdateDataJson (line ~5140)
     * Encrypted: YES
     * Returns: ixsd_data_json, ixsd_data_exception, artifact_upload_path
     */
    loadUpdateDataJson: builder.mutation<UpdateDataJsonResponse, LoadUpdateDataJsonInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.LOAD_UPDATE_DATA_JSON,
        method: 'POST',
        body: encryptData(input),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          const decrypted = decryptData<any>(response);
          // API returns nested array: [[{ ixsd_data_json, ixsd_data_exception, artifact_upload_path }]]
          const data = Array.isArray(decrypted) && Array.isArray(decrypted[0])
            ? decrypted[0][0]
            : decrypted;
          return data as UpdateDataJsonResponse;
        } catch {
          return response as unknown as UpdateDataJsonResponse;
        }
      },
      invalidatesTags: ['IXSDData'],
    }),

    /**
     * Check for new DIN (next transaction in queue)
     * Origin: $rootScope.checkForNewDIN (line ~5219)
     * Encrypted: YES
     * Returns: new DIN details or empty (no more items)
     */
    checkForNewDIN: builder.mutation<CheckForNewDINResponse | null, CheckForNewDINInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.CHECK_FOR_NEW_DIN,
        method: 'POST',
        body: encryptData(input),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          const decrypted = decryptData<any>(response);
          // API returns nested array: [[{din, uin, ixsd_id, ...}]] or empty
          if (Array.isArray(decrypted) && Array.isArray(decrypted[0]) && decrypted[0].length > 0) {
            return decrypted[0][0] as CheckForNewDINResponse;
          }
          return null;
        } catch {
          return null;
        }
      },
    }),

    /**
     * Save iXSD JSON (save form data)
     * Origin: $scope.saveiXSD (line ~6740)
     * Encrypted: YES
     */
    saveIXSDJSON: builder.mutation<any, SaveIXSDInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.SAVE_IXSD_JSON,
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
      invalidatesTags: ['IXSDData'],
    }),

    /**
     * Download source file
     * Origin: $scope.downloadSourceFile (line ~86)
     * Encrypted: YES
     * Returns: base64 downloadStream and downloadStreamFile name
     */
    downloadSourceFile: builder.mutation<DownloadResponse, DownloadSourceInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.DOWNLOAD_SOURCE_FILE,
        method: 'POST',
        body: encryptData(input),
        headers: { 'Content-Type': 'text/plain' },
      }),
      transformResponse: (response: string) => {
        try {
          const decrypted = decryptData<any>(response);
          // API returns nested array: [[{downloadStream, downloadStreamFile}]]
          const data = Array.isArray(decrypted) && Array.isArray(decrypted[0])
            ? decrypted[0][0]
            : decrypted;
          return data as DownloadResponse;
        } catch {
          return response as unknown as DownloadResponse;
        }
      },
    }),

    /**
     * Generate Excel output
     * Origin: $scope.generateExcel (line ~154)
     * Encrypted: YES
     * Returns: base64 Excel stream and filename
     */
    generateExcelOutput: builder.mutation<DownloadResponse, GenerateExcelInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.GENERATE_EXCEL_OUTPUT,
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
          return data as DownloadResponse;
        } catch {
          return response as unknown as DownloadResponse;
        }
      },
    }),

    /**
     * Change media page (load different page of document)
     * Origin: $scope.changeMediaPage (line ~3328)
     * Encrypted: YES
     * Returns: byteString (base64 image)
     */
    changeMediaPage: builder.mutation<ChangeMediaPageResponse, ChangeMediaPageInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.CHANGE_MEDIA_PAGE,
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
     * Set new bot camp (machine learning field training)
     * Origin: $scope.setNewBotCamp (line ~2962)
     * Encrypted: YES
     */
    setNewBotCamp: builder.mutation<any, SetNewBotCampInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.SET_NEW_BOT_CAMP,
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
     * Set invoice coding (GL coding for line items)
     * Origin: $scope.setInvoiceCoding (line ~3008)
     * Encrypted: YES
     */
    setInvoiceCoding: builder.mutation<any, SetInvoiceCodingInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.SET_INVOICE_CODING,
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
     * Send exception notification email
     * Origin: $scope.sendExceptionNotification (line ~3110)
     * Encrypted: NO - Plain JSON
     */
    sendExceptionNotification: builder.mutation<any, SendNotificationInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.SEND_EXCEPTION_NOTIFICATION,
        method: 'POST',
        body: input,
      }),
    }),

    /**
     * Field level audit
     * Origin: $scope.fieldLevelAudit (line ~4260)
     * Encrypted: YES
     * Returns: [fieldAuditData[], queueCatalog[], userCatalog[]]
     */
    fieldLevelAudit: builder.mutation<any, FieldLevelAuditInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.FIELD_LEVEL_AUDIT,
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
      providesTags: ['FieldAudit'],
    }),

    /**
     * Load form audit (version comparison)
     * Origin: $scope.loadFormAudit (line ~5900)
     * Encrypted: YES
     * Returns: [formAuditData[], versionInfo[], authorMetadata[]]
     */
    loadFormAudit: builder.mutation<any, LoadFormAuditInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.LOAD_FORM_AUDIT,
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
      providesTags: ['FormAudit'],
    }),

    /**
     * Infor data lookup (PO number lookup for expense ledger)
     * Origin: $scope.infordata (line ~1288)
     * Encrypted: NO - Plain JSON
     * Returns: expense ledger lookup data
     */
    infordata: builder.mutation<any, InfordataInput>({
      query: (input) => ({
        url: BUSINESS_CONTENT_ENDPOINTS.INFORDATA,
        method: 'POST',
        body: input,
      }),
    }),
  }),
});

export const {
  // Queries
  useLoadTransactionMediaListQuery,
  useLazyLoadTransactionMediaListQuery,
  useLoadDinHistoryQuery,
  useLazyLoadDinHistoryQuery,
  // Mutations
  useStartWorkflowMutation,
  useLoadUpdateDataJsonMutation,
  useCheckForNewDINMutation,
  useSaveIXSDJSONMutation,
  useDownloadSourceFileMutation,
  useGenerateExcelOutputMutation,
  useChangeMediaPageMutation,
  useSetNewBotCampMutation,
  useSetInvoiceCodingMutation,
  useSendExceptionNotificationMutation,
  useFieldLevelAuditMutation,
  useLoadFormAuditMutation,
  useInfordataMutation,
} = businessContentApi;
