# BusinessTasksController Migration Mind Map

## Source → Target Mapping

### AngularJS Controller → React Feature Module

| AngularJS Source | React Target | Notes |
|------------------|--------------|-------|
| BusinessTasksController.js | /features/business-tasks/ | Complete feature module |
| ShowTransactionLogs.html | TransactionHistoryModal.tsx | Modal dialog component |

---

## Functions Mapping

### API Calls

| AngularJS Function | API Endpoint | React Hook/Query |
|-------------------|--------------|------------------|
| `taskDataCount()` | `/baasHome/tasksWorkflowsCount` | `useGetTasksWorkflowsCountQuery` |
| `loadDisplayTimeForInbox()` | `/baasHome/loadDisplayTimeForInbox` | `useGetDisplayTimeSettingsQuery` |
| YTD audit fetch | `/baasHome/fetch_audit_into_bihourly_sp_30_60_90_baas` | `useGetYTDAuditDataQuery` |
| YTD audit search | `/baasHome/search_audit_into_bihourly_sp_30_60_90_baas` | `useSearchYTDAuditDataMutation` |
| Custom insights search | `/baasHome/search_insights_custom_for_input` | `useSearchInsightsCustomMutation` |
| Load search config | `/baasHome/load_inbox_serachConfig` | `useGetSearchConfigQuery` |
| Load YTD exceptions | `/baasHome/load_YTD_PendingBusinessExceptions` | `useGetYTDExceptionsQuery` |
| Search YTD exceptions | `/baasHome/search_YTD_PendingBusinessExceptions` | `useSearchYTDExceptionsMutation` |
| Exception supplier count | `/baasHome/fetch_exception_supplier_count` | `useGetExceptionSupplierCountQuery` |
| Exceptions by supplier | `/baasHome/fetch_exception_supplier_count_by_Supplier` | `useGetExceptionsBySupplierQuery` |
| Processed aging count | `/baasHome/processedAgingCount` | `useGetProcessedAgingCountQuery` |
| Processed queue data | `/baasHome/load_processedQMenuData` | `useGetProcessedQueueDataQuery` |
| Search processed data | `/baasHome/load_search_processedQMenuData` | `useSearchProcessedQueueDataMutation` |
| Recent workflows | `/baasHome/Tasks_RecentWorkflows` | `useGetRecentWorkflowsQuery` |
| Search recent | `/baasHome/searchRecentForInput` | `useSearchRecentWorkflowsMutation` |
| Past due count | `/baasHome/past_due_count_tasks` | `useGetPastDueCountQuery` |
| Past due workflows | `/baasHome/Tasks_PastDueWorkflows` | `useGetPastDueWorkflowsQuery` |
| Search past due | `/baasHome/search_pastDue_Tasks` | `useSearchPastDueTasksMutation` |
| Custom workflows | `/baasHome/Tasks_CustomWorkflows` | `useGetCustomWorkflowsQuery` |
| Search custom | `/baasHome/search_custom_for_tasks` | `useSearchCustomTasksMutation` |
| DIN history | `/baasContent/load_din_history` | `useGetDINHistoryQuery` |

### State Variables

| AngularJS ($scope/$rootScope) | React State |
|------------------------------|-------------|
| `$scope.currentPage` | `recentPage`, `pastDuePage`, `agingPage` |
| `$scope.itemsPerPage` | `recentItemsPerPage`, `pastDueItemsPerPage` |
| `$scope.workflows` | `recentData`, `pastDueData` from queries |
| `$scope.searchText` | `searchText` |
| `$scope.selectedInsightsTab` | `activeInsightsTab` |
| `$scope.transactionLog` | `transactionLogs` |

### Pagination Functions

| AngularJS | React |
|-----------|-------|
| `gotoFirstPage()` | Inline in table components |
| `gotoLastPage()` | Inline in table components |
| `gotoNextPage()` | Inline in table components |
| `gotoPreviousPage()` | Inline in table components |
| `gotoPage(page)` | `onPageChange(page)` prop |
| `changeItemsPerPage(n)` | `onItemsPerPageChange(n)` prop |

---

## Component Structure

```
BusinessTasksController.js (5,448 LOC)
    ↓
/features/business-tasks/
├── api/
│   └── businessTasksApi.ts        # RTK Query API (21 endpoints)
├── components/
│   ├── BusinessTasksView.tsx      # Main view with tabs
│   ├── RecentTasksTable.tsx       # Recent workflows table
│   ├── PastDueTasksTable.tsx      # Past due workflows table
│   ├── InsightsView.tsx           # Insights tab (Aging + Custom)
│   └── TransactionHistoryModal.tsx # DIN history modal
├── store/
│   └── businessTasksSlice.ts      # Redux slice for state
├── types/
│   └── BusinessTasksTypes.ts      # TypeScript interfaces
├── index.ts                       # Module exports
└── MINDMAP.md                     # This file
```

---

## UI Mapping

| AngularJS Element | React Component |
|-------------------|-----------------|
| Tab 0: Tasks (Recent) | `RecentTasksTable` |
| Tab 1: Insights | `InsightsView` |
| - Aging (YTD) sub-tab | `InsightsView` (activeSubTab=0) |
| - Custom sub-tab | `InsightsView` (activeSubTab=1) |
| Tab 2: Past Due | `PastDueTasksTable` |
| Transaction History Dialog | `TransactionHistoryModal` |
| Pagination controls | Built into each table component |

---

## Key Features Migrated

1. **Recent Workflows Tab**
   - Table with workflow data
   - Search functionality
   - Pagination (First/Prev/Next/Last + page numbers)
   - Copy file name action
   - Row click to view transaction history

2. **Past Due Tab**
   - Table with overdue workflows
   - Red badge showing overdue count
   - Days overdue highlighting
   - Priority badges
   - Search and pagination

3. **Insights Tab**
   - Sub-tabs: Aging (YTD) and Custom
   - Aging table with 30/60/90 day columns
   - Custom date range picker
   - Custom search for insights

4. **Transaction History Modal**
   - DIN number display
   - Action log table
   - Timestamp formatting
   - Action type color coding

---

## Encryption/API Notes

- All API endpoints use AES-256-CBC encryption
- Secret key: `'0123456789abcdef0123456789abcdef'` (32 bytes)
- Init vector: `'0123456789abcdef'` (16 bytes)
- Content-Type: `text/plain` for encrypted payloads
- Response format: Encrypted string → Decrypted JSON array `[[data]]`

---

## Dependencies

- `@reduxjs/toolkit` - State management & RTK Query
- `react-redux` - React bindings
- `crypto-js` - AES encryption (via lib/crypto.ts)
- `tailwindcss` - Styling

---

## Testing Checklist

- [ ] Recent workflows table loads data
- [ ] Recent workflows search works
- [ ] Recent workflows pagination works
- [ ] Past due table loads data
- [ ] Past due count badge displays
- [ ] Past due search works
- [ ] Insights aging tab loads data
- [ ] Insights custom tab date picker works
- [ ] Insights custom search works
- [ ] Transaction history modal opens
- [ ] Transaction history shows DIN data
- [ ] Tab switching works correctly
- [ ] Loading states display correctly
- [ ] Empty states display correctly
