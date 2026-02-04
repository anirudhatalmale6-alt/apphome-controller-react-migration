/**
 * Business Apps RTK Query API
 * Server communication and caching for business apps
 * Migrated from BusinessAppsController.js $http calls
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptData, decryptData } from '../../../lib/crypto';
import type {
  Workflow,
  TaskCount,
  QueueItem,
  SearchConfig,
  LoadQueueDataInput,
  TaskCountInput,
  SearchRecentInput,
  LoadPastDueInput,
  LoadCustomInput,
  SearchConfigInput,
} from '../types/BusinessAppsTypes';

const API_BASE = import.meta.env.VITE_API_GATEWAY || '';

// API Endpoints for Business Apps
const BUSINESS_APPS_ENDPOINTS = {
  TASKS_WORKFLOWS_COUNT: '/baasHome/tasksWorkflowsCount',
  LOAD_BU_QUEUE_ACTIONS: '/baasHome/load_bu_queue_actions',
  LOAD_INBOX_SEARCH_CONFIG: '/baasHome/load_inbox_serachConfig',
  LOAD_DISPLAY_TIME: '/baasHome/loadDisplayTimeForInbox',
  // Recent search endpoints
  SEARCH_APP_RECENT_BAAS: '/baasHome/search_app_recent_baas',
  SEARCH_APP_RECENT_DATA_EXTRACTION: '/baasHome/search_app_recent_data_Extraction',
  SEARCH_APP_RECENT_SMART_DATAENTRY: '/baasHome/search_app_recent_smart_dataentry',
  SEARCH_APP_RECENT_EXCEPTIONS: '/baasHome/loadExceptionsSearchAppRecent',
  SEARCH_APP_RECENT_DOC_UPLOAD: '/baasHome/loadSerachDocUploadRecents',
  // Past due search endpoints
  SEARCH_APP_PASTDUE_BAAS: '/baasHome/search_app_pastDue_baas',
  SEARCH_APP_PASTDUE_DATA_EXTRACTION: '/baasHome/search_app_pastDue_data_extraction',
  SEARCH_APP_PASTDUE_SMART_DATAENTRY: '/baasHome/search_app_pastDue_smart_dataentry',
  SEARCH_APP_PASTDUE_EXCEPTIONS: '/baasHome/loadExceptionsSearchAppPastDue',
  SEARCH_APP_PASTDUE_DOC_UPLOAD: '/baasHome/loadSerachDocUploadPastDue',
  // Custom search endpoints
  LOAD_CUSTOM_TASKS_WORKFLOWS: '/baasHome/loadCustomTasks_Workflows',
  // Load workflows endpoints
  LOAD_APP_RECENT_BAAS: '/baasHome/loadAppRecent_baas',
  LOAD_APP_RECENT_DATA_EXTRACTION: '/baasHome/loadAppRecent_data_Extraction',
  LOAD_APP_RECENT_SMART_DATAENTRY: '/baasHome/loadAppRecent_smart_dataentry',
  LOAD_APP_RECENT_EXCEPTIONS: '/baasHome/loadExceptionsAppRecent',
  LOAD_APP_RECENT_DOC_UPLOAD: '/baasHome/loadDocUploadRecents',
  // Past due load endpoints
  LOAD_APP_PASTDUE_BAAS: '/baasHome/loadAppPastDue_baas',
  LOAD_APP_PASTDUE_DATA_EXTRACTION: '/baasHome/loadAppPastDue_data_Extraction',
  LOAD_APP_PASTDUE_SMART_DATAENTRY: '/baasHome/loadAppPastDue_smart_dataentry',
  LOAD_APP_PASTDUE_EXCEPTIONS: '/baasHome/loadExceptionsAppPastDue',
  LOAD_APP_PASTDUE_DOC_UPLOAD: '/baasHome/loadDocUploadPastDue',
};

/**
 * Get the appropriate API endpoint based on queue_id for recent workflows
 */
function getRecentApiEndpoint(queueId: string): string {
  switch (queueId) {
    case 'qu10001':
    case 'qu10006':
    case 'qu10010':
    case 'qu10002':
      return BUSINESS_APPS_ENDPOINTS.LOAD_APP_RECENT_BAAS;
    case 'qu10012':
      return BUSINESS_APPS_ENDPOINTS.LOAD_APP_RECENT_DATA_EXTRACTION;
    case 'qu10004':
    case 'qu10003':
    case 'qu10011':
      return BUSINESS_APPS_ENDPOINTS.LOAD_APP_RECENT_SMART_DATAENTRY;
    case 'qu10013':
      return BUSINESS_APPS_ENDPOINTS.LOAD_APP_RECENT_EXCEPTIONS;
    case 'qu10015':
      return BUSINESS_APPS_ENDPOINTS.LOAD_APP_RECENT_DOC_UPLOAD;
    default:
      return BUSINESS_APPS_ENDPOINTS.LOAD_APP_RECENT_BAAS;
  }
}

/**
 * Get the appropriate API endpoint based on queue_id for past due workflows
 */
function getPastDueApiEndpoint(queueId: string): string {
  switch (queueId) {
    case 'qu10001':
    case 'qu10006':
    case 'qu10010':
    case 'qu10002':
      return BUSINESS_APPS_ENDPOINTS.LOAD_APP_PASTDUE_BAAS;
    case 'qu10012':
      return BUSINESS_APPS_ENDPOINTS.LOAD_APP_PASTDUE_DATA_EXTRACTION;
    case 'qu10004':
    case 'qu10003':
    case 'qu10011':
      return BUSINESS_APPS_ENDPOINTS.LOAD_APP_PASTDUE_SMART_DATAENTRY;
    case 'qu10013':
      return BUSINESS_APPS_ENDPOINTS.LOAD_APP_PASTDUE_EXCEPTIONS;
    case 'qu10015':
      return BUSINESS_APPS_ENDPOINTS.LOAD_APP_PASTDUE_DOC_UPLOAD;
    default:
      return BUSINESS_APPS_ENDPOINTS.LOAD_APP_PASTDUE_BAAS;
  }
}

/**
 * Get the appropriate search API endpoint based on queue_id for recent
 */
function getSearchRecentApiEndpoint(queueId: string): string {
  switch (queueId) {
    case 'qu10001':
    case 'qu10006':
    case 'qu10010':
    case 'qu10002':
      return BUSINESS_APPS_ENDPOINTS.SEARCH_APP_RECENT_BAAS;
    case 'qu10012':
      return BUSINESS_APPS_ENDPOINTS.SEARCH_APP_RECENT_DATA_EXTRACTION;
    case 'qu10004':
    case 'qu10003':
    case 'qu10011':
      return BUSINESS_APPS_ENDPOINTS.SEARCH_APP_RECENT_SMART_DATAENTRY;
    case 'qu10013':
      return BUSINESS_APPS_ENDPOINTS.SEARCH_APP_RECENT_EXCEPTIONS;
    case 'qu10015':
      return BUSINESS_APPS_ENDPOINTS.SEARCH_APP_RECENT_DOC_UPLOAD;
    default:
      return BUSINESS_APPS_ENDPOINTS.SEARCH_APP_RECENT_BAAS;
  }
}

export const businessAppsApi = createApi({
  reducerPath: 'businessAppsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json;charset=utf-8');
      return headers;
    },
  }),
  tagTypes: ['BusinessApps', 'Workflows', 'TaskCount', 'QueueActions'],
  endpoints: (builder) => ({
    /**
     * Get task workflow counts
     * Origin: $scope.taskDataCount
     */
    getTasksWorkflowsCount: builder.query<TaskCount[], TaskCountInput>({
      query: (input) => ({
        url: BUSINESS_APPS_ENDPOINTS.TASKS_WORKFLOWS_COUNT,
        method: 'POST',
        body: encryptData(input),
      }),
      transformResponse: (response: string) => {
        const decrypted = decryptData<[[{ merged_json: string }]]>(response);
        const mergedJson = JSON.parse(decrypted[0][0].merged_json);
        const countsData = JSON.parse(mergedJson.recent_TasksWorkflows_Counts_data);
        return countsData[0].counts;
      },
      providesTags: ['TaskCount'],
    }),

    /**
     * Load business unit queue actions
     * Origin: $rootScope.loadQueueData + $rootScope.load_BuQueueActions
     *
     * The API returns the raw BU/Queue structure. The AngularJS code did heavy
     * client-side processing (filtering by bu_desc, parsing workflow_inbox_config JSON).
     * We replicate that here so the view receives ready-to-render QueueItem[].
     */
    loadBuQueueActions: builder.query<QueueItem[], LoadQueueDataInput>({
      query: (input) => ({
        url: BUSINESS_APPS_ENDPOINTS.LOAD_BU_QUEUE_ACTIONS,
        method: 'POST',
        body: encryptData(input),
      }),
      transformResponse: (response: string) => {
        try {
          const decrypted = decryptData<any[]>(response);
          if (!decrypted || !Array.isArray(decrypted)) return [];

          // The API may return nested arrays or a flat array of BU items
          // Each BU item has: bu_desc, bu_id, tps_id, dept_id, queue_info[]
          // queue_info items have: custom_queue_name, queue_id, workflow_inbox_config (JSON string)
          const rawItems = Array.isArray(decrypted[0]) ? decrypted[0] : decrypted;

          // Check for API error response
          if (rawItems.length > 0 && rawItems[0]?.result && rawItems[0].result !== 'Success') {
            return [];
          }

          const queueItems: QueueItem[] = [];
          let displayId = 0;

          rawItems.forEach((buItem: any) => {
            if (!buItem) return;

            // If item already has QueueNames (pre-processed), use as-is
            if (buItem.QueueNames !== undefined) {
              queueItems.push(buItem as QueueItem);
              return;
            }

            // Process raw BU item with queue_info array
            if (buItem.queue_info && Array.isArray(buItem.queue_info)) {
              buItem.queue_info.forEach((queue: any) => {
                const queueItem: QueueItem = {
                  QueueNames: queue.custom_queue_name || queue.queue_name || '',
                  queue_id: queue.queue_id || '',
                  QueueProperties: [],
                  display_id: displayId++,
                };

                // Parse workflow_inbox_config JSON string into QueueProperties
                try {
                  const configStr = queue.workflow_inbox_config;
                  if (configStr) {
                    const config = typeof configStr === 'string' ? JSON.parse(configStr) : configStr;
                    if (Array.isArray(config)) {
                      let idCounter = 0;
                      config.forEach((item: any) => {
                        for (const key in item) {
                          if (key !== 'isActionEnabled' && key !== 'displayName' && key !== 'workflowName') {
                            queueItem.QueueProperties.push({
                              bPaaS_workflow_status: key.charAt(0).toUpperCase() + key.slice(1),
                              bPaaS_workflow_id: String(idCounter++),
                              count: 0,
                              displayName: item.displayName || key,
                              isActionEnabled: item.isActionEnabled !== false,
                            });
                          }
                        }
                      });
                    }
                  }
                } catch {
                  // Safe fallback on JSON parse error
                }

                queueItems.push(queueItem);
              });
            }
          });

          return queueItems;
        } catch {
          return [];
        }
      },
      providesTags: ['QueueActions'],
    }),

    /**
     * Load inbox search configuration
     * Origin: $scope.loadAppsInboxSerachConfig
     */
    loadInboxSearchConfig: builder.query<SearchConfig[], SearchConfigInput>({
      query: (input) => ({
        url: BUSINESS_APPS_ENDPOINTS.LOAD_INBOX_SEARCH_CONFIG,
        method: 'POST',
        body: encryptData(input),
      }),
      transformResponse: (response: string) => {
        const decrypted = decryptData<[[{ search_inbox_config: string }]]>(response);
        const config = JSON.parse(decrypted[0][0].search_inbox_config);
        return config.filter((item: SearchConfig) => item.isActionEnabled === true);
      },
    }),

    /**
     * Load display time for inbox
     * Origin: $rootScope.loadAppDisplayTimeForInbox
     */
    loadDisplayTimeForInbox: builder.query<string, { customer_id: string; bps_id: string }>({
      query: (input) => ({
        url: BUSINESS_APPS_ENDPOINTS.LOAD_DISPLAY_TIME,
        method: 'POST',
        body: encryptData(input),
      }),
      transformResponse: (response: string) => {
        const decrypted = decryptData<[[{ display_time: string }]]>(response);
        return decrypted[0][0].display_time;
      },
    }),

    /**
     * Load recent workflows
     * Origin: $rootScope.loadAppRecentTasks
     */
    loadRecentWorkflows: builder.query<[Workflow[], { total_count: number }[]], {
      queueId: string;
      input: SearchRecentInput;
    }>({
      query: ({ queueId, input }) => ({
        url: getRecentApiEndpoint(queueId),
        method: 'POST',
        body: encryptData(input),
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Workflows'],
    }),

    /**
     * Load past due workflows
     * Origin: $rootScope.loadAppsPastDueTasks
     */
    loadPastDueWorkflows: builder.query<[Workflow[], { total_count: number }[]], {
      queueId: string;
      input: LoadPastDueInput;
    }>({
      query: ({ queueId, input }) => ({
        url: getPastDueApiEndpoint(queueId),
        method: 'POST',
        body: encryptData(input),
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Workflows'],
    }),

    /**
     * Load custom workflows with date range
     * Origin: $rootScope.loadCustomTasks_Workflows
     */
    loadCustomWorkflows: builder.query<[Workflow[], { total_count: number }[]], LoadCustomInput>({
      query: (input) => ({
        url: BUSINESS_APPS_ENDPOINTS.LOAD_CUSTOM_TASKS_WORKFLOWS,
        method: 'POST',
        body: encryptData(input),
      }),
      transformResponse: (response: string) => decryptData(response),
      providesTags: ['Workflows'],
    }),

    /**
     * Search recent workflows
     * Origin: $scope.fetchForSearchInfo
     */
    searchRecentWorkflows: builder.mutation<[Workflow[], { total_count: number }[]], {
      queueId: string;
      input: SearchRecentInput;
    }>({
      query: ({ queueId, input }) => ({
        url: getSearchRecentApiEndpoint(queueId),
        method: 'POST',
        body: encryptData(input),
      }),
      transformResponse: (response: string) => decryptData(response),
    }),

    /**
     * Search past due workflows
     * Origin: $rootScope.fetchForSearchInfoPastDue
     */
    searchPastDueWorkflows: builder.mutation<[Workflow[], { total_count: number }[]], {
      queueId: string;
      input: SearchRecentInput & { eventTerm: string };
    }>({
      query: ({ queueId, input }) => {
        const apiUrl = queueId === 'qu10001' || queueId === 'qu10006' || queueId === 'qu10010' || queueId === 'qu10002'
          ? BUSINESS_APPS_ENDPOINTS.SEARCH_APP_PASTDUE_BAAS
          : queueId === 'qu10012'
          ? BUSINESS_APPS_ENDPOINTS.SEARCH_APP_PASTDUE_DATA_EXTRACTION
          : queueId === 'qu10004' || queueId === 'qu10003' || queueId === 'qu10011'
          ? BUSINESS_APPS_ENDPOINTS.SEARCH_APP_PASTDUE_SMART_DATAENTRY
          : queueId === 'qu10013'
          ? BUSINESS_APPS_ENDPOINTS.SEARCH_APP_PASTDUE_EXCEPTIONS
          : BUSINESS_APPS_ENDPOINTS.SEARCH_APP_PASTDUE_DOC_UPLOAD;

        return {
          url: apiUrl,
          method: 'POST',
          body: encryptData(input),
        };
      },
      transformResponse: (response: string) => decryptData(response),
    }),
  }),
});

export const {
  useGetTasksWorkflowsCountQuery,
  useLazyGetTasksWorkflowsCountQuery,
  useLoadBuQueueActionsQuery,
  useLazyLoadBuQueueActionsQuery,
  useLoadInboxSearchConfigQuery,
  useLazyLoadInboxSearchConfigQuery,
  useLoadDisplayTimeForInboxQuery,
  useLazyLoadDisplayTimeForInboxQuery,
  useLoadRecentWorkflowsQuery,
  useLazyLoadRecentWorkflowsQuery,
  useLoadPastDueWorkflowsQuery,
  useLazyLoadPastDueWorkflowsQuery,
  useLoadCustomWorkflowsQuery,
  useLazyLoadCustomWorkflowsQuery,
  useSearchRecentWorkflowsMutation,
  useSearchPastDueWorkflowsMutation,
} = businessAppsApi;
