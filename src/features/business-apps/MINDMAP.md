# BusinessAppsController.js Migration Mind Map

## Origin Controller: BusinessAppsController.js (4,806 LOC)

### Feature: business-apps
```
src/features/business-apps/
├── api/
│   └── businessAppsApi.ts
│       ├── getTasksWorkflowsCount       ← $scope.taskDataCount
│       ├── loadBuQueueActions           ← $rootScope.loadQueueData
│       ├── loadInboxSearchConfig        ← $scope.loadAppsInboxSerachConfig
│       ├── loadDisplayTimeForInbox      ← $rootScope.loadAppDisplayTimeForInbox
│       ├── loadRecentWorkflows          ← $rootScope.loadAppRecentTasks
│       ├── loadPastDueWorkflows         ← $rootScope.loadAppsPastDueTasks
│       ├── loadCustomWorkflows          ← $rootScope.loadCustomTasks_Workflows
│       ├── searchRecentWorkflows        ← $scope.fetchForSearchInfo
│       └── searchPastDueWorkflows       ← $rootScope.fetchForSearchInfoPastDue
│
├── components/
│   ├── BusinessAppsView.tsx             ← Main view (BusinessApps.html)
│   ├── AppsSidebar.tsx                  ← Queue navigation sidebar
│   ├── AppsMenuTabs.tsx                 ← Business unit tabs
│   ├── AppsTimelineTabs.tsx             ← Recent/Past Due/Custom tabs
│   ├── AppsRecentView.tsx               ← AppsRecentViews.html
│   ├── AppsPastDueView.tsx              ← AppsPastDueViews.html
│   ├── AppsCustomView.tsx               ← AppsCustomViews.html
│   ├── AppsUploadView.tsx               ← UploadViews.html
│   ├── WorkflowTable.tsx                ← Reusable workflow table
│   ├── SearchBar.tsx                    ← Reusable search component
│   ├── Pagination.tsx                   ← Reusable pagination
│   └── BusinessAppsView.css             ← All styles
│
├── hooks/
│   └── useBusinessAppsState.ts
│       ├── handleSelectMenuTab          ← $scope.selectMenuTab
│       ├── handleSelectTab              ← $scope.selectTab
│       ├── handleToggleSection          ← $scope.toggleSection
│       ├── handleSwitchingByQueues      ← $scope.switchingByQueues
│       ├── handlePerformAction          ← $rootScope.performAction
│       ├── handleGoBackToBusinessProcess ← $scope.goBackToBusinessProcess
│       ├── handlePageChange             ← Pagination handlers
│       ├── handleAgingSelectTab         ← $rootScope.AgingSelectTab
│       └── processWorkflowsResponse     ← Response processing
│
├── services/
│   └── BusinessAppsService.ts
│       ├── extractDINData               ← $rootScope.extractDINData
│       ├── getNavigationPath            ← Queue-based navigation
│       ├── getDynamicPathMapping        ← $rootScope.dynamicPathMapping
│       ├── groupQueueActionsByBU        ← Queue grouping logic
│       ├── extractTimeZone              ← AppRecentExtractTimeZone
│       ├── convertTimeZone              ← AppRecentConvertTimeZone
│       ├── formatDateForApi             ← Date formatting
│       ├── getAgingFilterValue          ← Aging tab values
│       └── hasWorkflowException         ← Exception checking
│
├── store/
│   └── businessAppsSlice.ts
│       ├── State: menuTabs, workflows, pagination, dateRange...
│       ├── Actions: setMenuTabs, setWorkflows, setCurrentPage...
│       └── Selectors: selectBusinessApps, selectWorkflows...
│
├── types/
│   └── BusinessAppsTypes.ts
│       ├── Workflow, WorkflowColumn, MenuTab, TimelineTab
│       ├── QueueItem, QueueProperty, SearchConfig
│       ├── PaginationState, DateRange, UploadFile
│       └── API Input Types
│
└── index.ts                             ← Public API exports
```

## API Endpoint Mapping

| AngularJS Function | React Hook/Query | API Endpoint |
|-------------------|------------------|--------------|
| `$scope.taskDataCount` | `useGetTasksWorkflowsCountQuery` | POST /baasHome/tasksWorkflowsCount |
| `$rootScope.loadQueueData` | `useLoadBuQueueActionsQuery` | POST /baasHome/load_bu_queue_actions |
| `$scope.loadAppsInboxSerachConfig` | `useLoadInboxSearchConfigQuery` | POST /baasHome/load_inbox_serachConfig |
| `$rootScope.loadAppDisplayTimeForInbox` | `useLoadDisplayTimeForInboxQuery` | POST /baasHome/loadDisplayTimeForInbox |
| `$rootScope.loadAppRecentTasks` | `useLoadRecentWorkflowsQuery` | POST /baasHome/loadAppRecent_* |
| `$rootScope.loadAppsPastDueTasks` | `useLoadPastDueWorkflowsQuery` | POST /baasHome/loadAppPastDue_* |
| `$rootScope.loadCustomTasks_Workflows` | `useLoadCustomWorkflowsQuery` | POST /baasHome/loadCustomTasks_Workflows |
| `$scope.fetchForSearchInfo` | `useSearchRecentWorkflowsMutation` | POST /baasHome/search_app_recent_* |
| `$rootScope.fetchForSearchInfoPastDue` | `useSearchPastDueWorkflowsMutation` | POST /baasHome/search_app_pastDue_* |

## Queue-Specific API Routing

```
Queue ID | Recent API                          | Past Due API
---------|-------------------------------------|------------------------------------
qu10001  | loadAppRecent_baas                  | loadAppPastDue_baas
qu10002  | loadAppRecent_baas                  | loadAppPastDue_baas
qu10006  | loadAppRecent_baas                  | loadAppPastDue_baas
qu10010  | loadAppRecent_baas                  | loadAppPastDue_baas
qu10012  | loadAppRecent_data_Extraction       | loadAppPastDue_data_Extraction
qu10003  | loadAppRecent_smart_dataentry       | loadAppPastDue_smart_dataentry
qu10004  | loadAppRecent_smart_dataentry       | loadAppPastDue_smart_dataentry
qu10011  | loadAppRecent_smart_dataentry       | loadAppPastDue_smart_dataentry
qu10013  | loadExceptionsAppRecent             | loadExceptionsAppPastDue
qu10015  | loadDocUploadRecents                | loadDocUploadPastDue
```

## Component Hierarchy

```
BusinessAppsView
├── LoadingSpinner (when analyticsPageLoading)
├── NoDataAvailable (when !isDashboardAvailable)
└── apps-main-content
    ├── apps-header (Back to BPS button)
    ├── AppsMenuTabs (BU selection)
    └── apps-container
        ├── AppsSidebar (left - 16%)
        │   └── Queue items with expandable properties
        └── apps-main (right - 84%)
            ├── AppsUploadView (when ifMenuUploads)
            └── (when !ifMenuUploads)
                ├── AppsTimelineTabs (Recent/Past Due/Custom)
                └── apps-tab-content
                    ├── AppsRecentView (tab 0)
                    │   ├── SearchBar
                    │   ├── WorkflowTable
                    │   └── Pagination
                    ├── AppsPastDueView (tab 1)
                    │   ├── AgingTabs
                    │   ├── SearchBar
                    │   ├── WorkflowTable
                    │   └── Pagination
                    └── AppsCustomView (tab 2)
                        ├── DateRangeSelector
                        ├── SearchBar
                        ├── WorkflowTable
                        └── Pagination
```

## State Migration ($scope → Redux)

| AngularJS $scope | Redux State | Slice Action |
|-----------------|-------------|--------------|
| `$rootScope.menutabs` | `menuTabs` | `setMenuTabs` |
| `$rootScope.selectedTabIndex` | `selectedTabIndex` | `setSelectedTabIndex` |
| `$scope.selectedTab` | `selectedTab` | `setSelectedTab` |
| `$rootScope.loadBusinessQueueActions` | `buQueueActionsItems` | `setBuQueueActionsItems` |
| `$scope.expandedSections` | `expandedSections` | `toggleSection` |
| `$scope.workflows` | `workflows` | `setWorkflows` |
| `$scope.currentPage` | `pagination.currentPage` | `setCurrentPage` |
| `$scope.itemsPerPage` | `pagination.itemsPerPage` | `setItemsPerPage` |
| `$rootScope.AgingSelectedTab` | `agingSelectedTab` | `setAgingSelectedTab` |
| `$scope.noDataAvailableRecent` | `noDataAvailableRecent` | `setNoDataAvailableRecent` |
| `$rootScope.displayTimeValue` | `displayTimeValue` | `setDisplayTimeValue` |

## Key Features Migrated

1. **Tab-Based Navigation**: BU tabs and timeline tabs (Recent/Past Due/Custom)
2. **Collapsible Sidebar**: Queue hierarchy with expandable action items
3. **Workflow Table**: Clickable rows with timezone conversion
4. **Search Functionality**: Field-based search with API integration
5. **Pagination**: Server-side pagination with configurable page size
6. **Aging Filters**: 0-24hrs, 24-48hrs, >48hrs filtering for Past Due
7. **Date Range Selection**: Custom date range for Custom tab
8. **File Upload**: Drag-and-drop file upload interface
9. **Dynamic Routing**: Queue-based navigation to different views
10. **Timezone Conversion**: Workflow dates converted to user's timezone
