# BusinessHomeViews Migration Mind Map

## Source → Target Mapping

### AngularJS Controller → React Feature Module

| AngularJS Source | React Target | Notes |
|------------------|--------------|-------|
| BusinessHomeViews.js | /features/business-home/ | Complete feature module |
| BusinessHomeViews.html | React components | Split into multiple components |

---

## Functions Mapping

### API Calls

| AngularJS Function | API Endpoint | React Hook/Query |
|-------------------|--------------|------------------|
| `taskDataCount()` | `/baasHome/tasksWorkflowsCount` | `useGetTasksWorkflowsCountQuery` |
| `loadDisplayTimeForHome()` | `/baasHome/loadDisplayTimeForInbox` | `useGetDisplayTimeSettingsQuery` |
| `YTD_Pending_30_60_90()` | `/baasHome/load_YTD_Pending30_60_90` | `useGetYTDPending30_60_90Query` |
| `load_YTD_Pending()` | `/baasHome/load_YTD_Pending` | `useGetYTDPendingQuery` |
| `load_YTD_PendingBusinessExceptions()` | `/baasHome/load_YTD_PendingBusinessExceptions` | `useGetYTDBusinessExceptionsQuery` |
| `search_YTD_PendingBusinessExceptions()` | `/baasHome/search_YTD_PendingBusinessExceptions` | `useSearchYTDBusinessExceptionsMutation` |
| `fetch_exception_supplier_count()` | `/baasHome/fetch_exception_supplier_count` | `useGetExceptionSupplierCountQuery` |
| `BatchInvYTDOverview()` | `/baasHome/BatchInventoryYTDOverView` | `useGetBatchInventoryOverviewQuery` |
| `BatchInventoryYTD306090()` | `/baasHome/InventoryYTD306090` | `useGetBatchInventory30_60_90Query` |
| `InvoiceInvYTDOverview()` | `/baasHome/InvoiceInventoryYTDOverView` | `useGetInvoiceInventoryOverviewQuery` |
| `loadYTDAgentsData()` | `/baasHome/loadAgent` | `useGetAgentDataQuery` |

### State Variables

| AngularJS ($scope/$rootScope) | React State (Redux/Hook) |
|------------------------------|--------------------------|
| `$rootScope.isDashboardAvailable` | `state.businessHome.isDashboardAvailable` |
| `$scope.homePageLoading` | `state.businessHome.homePageLoading` |
| `$scope.analyticsPageLoading` | `state.businessHome.analyticsPageLoading` |
| `$scope.activeTab` | `state.businessHome.activeTab` |
| `$scope.tasksCountforUI` | `state.businessHome.tasksCountforUI` |
| `$rootScope.displayTimeResponse` | `state.businessHome.displayTimeResponse` |
| `$rootScope.YTD_pending_30_60_90_*` | `state.businessHome.ytdPendingData` |
| `$rootScope.YTD_responseData` | `exceptionsData` (from query) |
| `$scope.YTDBusinesscurrentPage` | `state.businessHome.businessExceptionsPagination.currentPage` |
| `$scope.YTDBusinessitemsPerPage` | `state.businessHome.businessExceptionsPagination.itemsPerPage` |
| `$rootScope.BatchInvYTDOverviewResponse` | `batchOverviewData` (from query) |
| `$scope.searchText` | `state.businessHome.searchFilters.searchText` |

### Pagination Functions

| AngularJS | React |
|-----------|-------|
| `gotoFirstPage*()` | `usePagination.gotoFirstPage()` |
| `gotoLastPage*()` | `usePagination.gotoLastPage()` |
| `gotoNextPage*()` | `usePagination.gotoNextPage()` |
| `gotoPreviousPage*()` | `usePagination.gotoPreviousPage()` |
| `gotoPage*(page)` | `usePagination.gotoPage(page)` |
| `changeItemsPerPage*(n)` | `usePagination.changeItemsPerPage(n)` |

---

## Component Structure

```
BusinessHomeViews.js (5,838 LOC)
    ↓
/features/business-home/
├── api/
│   └── businessHomeApi.ts         # RTK Query API (17 endpoints)
├── components/
│   ├── BusinessHomeView.tsx       # Main view with tabs
│   ├── DashboardCards.tsx         # Task/workflow count cards
│   ├── YTDPendingChart.tsx        # Aging chart (horizontal bars)
│   ├── ExceptionsTable.tsx        # Paginated exceptions table
│   ├── InventoryCharts.tsx        # Batch & Invoice charts
│   └── AgentsTable.tsx            # Agent performance table
├── hooks/
│   ├── useBusinessHomeState.ts    # Main state management hook
│   └── usePagination.ts           # Reusable pagination hook
├── store/
│   └── businessHomeSlice.ts       # Redux slice for state
├── types/
│   └── BusinessHomeTypes.ts       # TypeScript interfaces
├── index.ts                       # Module exports
└── MINDMAP.md                     # This file
```

---

## UI Mapping

| AngularJS HTML Element | React Component |
|-----------------------|-----------------|
| `.businessData-cards` | `DashboardCards` |
| `.chart-horizontal-bar` | `YTDPendingChart` |
| `.ExceptionsView-table` | `ExceptionsTable` |
| `.ExceptionsView-tableCard` | `ExceptionsTable` (wrapper) |
| Batch inventory section | `BatchInventoryChart` |
| Invoice inventory section | `InvoiceInventoryChart` |
| Agent performance table | `AgentsTable` |
| Tab navigation | Built into `BusinessHomeView` |

---

## Encryption/API Notes

- All API endpoints use AES-256-CBC encryption
- Secret key: `'0123456789abcdef0123456789abcdef'` (32 bytes)
- Init vector: `'0123456789abcdef'` (16 bytes)
- Content-Type: `text/plain` for encrypted payloads
- Response format: Encrypted string → Decrypted JSON array `[[data]]`

---

## Dependencies

- `@reduxjs/toolkit` - State management
- `react-redux` - React bindings
- `crypto-js` - AES encryption (via lib/crypto.ts)
- `tailwindcss` - Styling

---

## Testing Checklist

- [ ] Dashboard cards display task counts
- [ ] YTD pending chart renders aging buckets
- [ ] Exceptions table pagination works
- [ ] Exceptions search filters correctly
- [ ] Batch inventory chart shows overview + aging
- [ ] Invoice inventory shows totals
- [ ] Agent table pagination works
- [ ] Tab switching works correctly
- [ ] Refresh button refetches all data
- [ ] Loading states display correctly
- [ ] Empty states display correctly
