# BusinessStarterController.js Migration Mind Map

## Origin Controller: BusinessStarterController.js (1,246 LOC)

### Feature: business-starter
```
src/features/business-starter/
├── api/
│   └── businessStarterApi.ts
│       ├── loadQueueMenuStatus      ← $http POST /baasHome/load_queue_menu_status
│       ├── loadCustomerDashboard    ← $rootScope.loadFetchForCustomerDashboard
│       ├── loadAdminSettings        ← $rootScope.loadFetchForAdminSetting
│       ├── loadAdminSettingsEnableDisable ← toggleEditAction → AdminSettingsEnableDisable
│       ├── enableDisableQueueUserMenu ← saveQueue, saveUsers, saveActions, toggleMailAlert
│       ├── enableDisableMenu        ← saveMenus
│       ├── loadAdminTechops         ← $rootScope.loadFetchForTechops
│       └── loadTechopsInbox         ← loadTechopsInboxPage
│
├── components/
│   ├── BusinessStarterView.tsx      ← Main view (BusinessStarterPage.html)
│   ├── CompanySelector.tsx          ← Left panel customer selection
│   ├── InsightsTabs.tsx             ← Tab navigation component
│   ├── BusinessProcessGrid.tsx      ← BPS table/grid view
│   ├── CustomerDashboard.tsx        ← Customer performance tables
│   ├── AdminSettingsPanel.tsx       ← Queue admin settings (users, menus, actions)
│   ├── TechOpsInbox.tsx             ← TechOps workflow inbox with pagination
│   ├── LoadingSpinner.tsx           ← Reusable loading indicator
│   └── BusinessStarterView.css      ← All styles from inline HTML
│
├── hooks/
│   ├── useBusinessStarterState.ts
│   │   ├── handleSelectPartner      ← $scope.selectPartner
│   │   ├── handleGroupBusinessUnit  ← $scope.groupingBusinessUnit
│   │   ├── handleFilterBusinessProcess ← $scope.filterBusinessProcess
│   │   ├── handleToggleGridView     ← $scope.SwitchView
│   │   ├── handleSelectInsightsTab  ← $scope.insightsSelectTab
│   │   ├── handleToggleEditAction   ← $scope.toggleEditAction
│   │   ├── handleToggleQueue        ← $scope.toggleQueue
│   │   ├── handleToggleMailAlert    ← $scope.toggleMailAlert
│   │   ├── calculateSLA             ← $scope.calculateSLA
│   │   └── isContractActive         ← $scope.isContactActive
│   └── usePagination                ← Pagination logic for TechOps
│
├── services/
│   └── BusinessStarterService.ts
│       ├── arrangeIntoGrid          ← Grid arrangement (4 items per row)
│       ├── filterBySearchTerm       ← Search filtering
│       ├── groupQueuesByBusinessUnit ← BU grouping
│       ├── groupQueuesByDepartment  ← Dept grouping
│       ├── groupByCustomerId        ← Customer grouping
│       ├── groupByBusinessProcessId ← BPS grouping
│       ├── isContractActive         ← Contract validation
│       ├── calculateSLAStatus       ← SLA calculation
│       ├── parseTechOpsWorkflow     ← Workflow JSON parsing
│       ├── parseDefaultSchemaFields ← Schema field parsing
│       └── getPaginationLimits      ← Pagination calculation
│
├── store/
│   └── businessStarterSlice.ts
│       ├── State: landingPageNumber, switchToQueuePage, selectedCustomerId...
│       ├── Actions: setLandingPageNumber, setSwitchToQueuePage, selectPartner...
│       └── Selectors: selectBusinessStarter, selectLandingPageNumber...
│
├── types/
│   └── BusinessStarterTypes.ts
│       ├── Customer, BusinessProcess, BusinessUnit, Department, Queue
│       ├── CustomerDashboardData, TableHeader, CustomerPerformance
│       ├── AdminSettingQueue, UserAssignment, MenuAssignment, ActionAssignment
│       ├── TechOpsWorkflow, PaginationState, InsightTab
│       └── API Input Types
│
└── index.ts                         ← Public API exports
```

## API Endpoint Mapping

| AngularJS Function | React Hook/Mutation | API Endpoint |
|-------------------|---------------------|--------------|
| `$scope.selectMyBusiness` | `useLoadQueueMenuStatusMutation` | POST /baasHome/load_queue_menu_status |
| `$rootScope.loadFetchForCustomerDashboard` | `useLoadCustomerDashboardQuery` | POST /baasHome/loadCustomerPerformanceDashboard |
| `$rootScope.loadFetchForAdminSetting` | `useLoadAdminSettingsQuery` | POST /baasHome/onebaseAdminSetting |
| `$scope.toggleEditAction` | `useLoadAdminSettingsEnableDisableQuery` | POST /baasHome/AdminSettingsEnableDisable |
| `$scope.saveQueue` | `useEnableDisableQueueUserMenuMutation` | POST /baasHome/enableOrDisableQUserMenuService |
| `$scope.saveUsers` | `useEnableDisableQueueUserMenuMutation` | POST /baasHome/enableOrDisableQUserMenuService |
| `$scope.toggleMailAlert` | `useEnableDisableQueueUserMenuMutation` | POST /baasHome/enableOrDisableQUserMenuService |
| `$scope.saveMenus` | `useEnableDisableMenuMutation` | POST /baasHome/enableOrDisableMenu |
| `$scope.saveActions` | `useEnableDisableQueueUserMenuMutation` | POST /baasHome/enableOrDisableQUserMenuService |
| `$rootScope.loadFetchForTechops` | `useLoadAdminTechopsQuery` | POST /baasHome/onebaseAdminTechops |
| `$scope.loadTechopsInboxPage` | `useLoadTechopsInboxQuery` | POST /baasHome/onebaseAdminTechopsInbox |

## Component Hierarchy

```
BusinessStarterView
├── LoadingSpinner (when analyticsPageLoading)
└── landing-page-flex-container (when landingPageNumber === 1)
    ├── CompanySelector (left panel - 15%)
    │   └── Customer checkboxes
    └── landing-page-bps-view (right panel - 85%)
        ├── InsightsTabs (tab navigation)
        └── tab-content
            ├── Tab 0: CustomerDashboard OR BusinessProcessGrid
            ├── Tab 1: CustomerDashboard (admin) → AdminSettingsPanel
            │   └── Queue sections with Users, Menus, Actions
            └── Tab 2: CustomerDashboard (techops) → TechOpsInbox
                └── Workflow table with pagination
```

## State Migration ($scope → Redux)

| AngularJS $scope | Redux State | Slice Action |
|-----------------|-------------|--------------|
| `$rootScope.landingPageNumber` | `landingPageNumber` | `setLandingPageNumber` |
| `$rootScope.switchToQueuePage` | `switchToQueuePage` | `setSwitchToQueuePage` |
| `$rootScope.selectedCustomerId` | `selectedCustomerId` | `setSelectedCustomer` |
| `$rootScope.selectedBpsList` | `selectedBpsList` | `setSelectedBpsList` |
| `$rootScope.selectedBuList` | `selectedBuList` | `setSelectedBuList` |
| `$rootScope.businessQueueList` | `businessQueueList` | `setBusinessQueueList` |
| `$scope.isGridView` | `isGridView` | `toggleGridView` |
| `$scope.selectedInsightsTab` | `selectedInsightsTab` | `setSelectedInsightsTab` |
| `$scope.queues` | `adminQueues` | `setAdminQueues` |
| `$scope.Techopsworkflows` | `techOpsWorkflows` | `setTechOpsWorkflows` |

## Key Features Migrated

1. **Multi-level Navigation**: Customer → BPS → BU → Queue selection
2. **Grid/Table View Toggle**: Business process display options
3. **Tab-based Interface**: Insights, Admin Settings, TechOps
4. **Admin Queue Management**: Enable/disable queues, users, menus, actions
5. **TechOps Inbox**: Paginated workflow table
6. **Search & Filter**: Across customers, BPS, departments, queues
7. **Real-time Updates**: Toggle switches with immediate API calls
