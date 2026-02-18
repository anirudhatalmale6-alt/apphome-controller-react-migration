/**
 * BusinessTasksView Component
 * Tasks view with tabs: Insights, Recent, Past Due, Custom
 *
 * Key fixes (Feb 3rd feedback):
 * - APIs trigger on EVERY tab click (event-driven, not init-only)
 * - No cached promise reuse - each tab activation triggers fresh API call
 * - All Past Due sub-tabs present: Today, Yesterday, 3-7, 8-30, 31-60, 61-90, 91+
 * - Safe JSON handling to prevent "Unexpected end of JSON input"
 * - Pagination resets on tab switch
 * - Search state resets on tab switch
 * - No CSS changes - logic only fixes
 *
 * Uses RTK Query lazy hooks from businessTasksApi.ts for all API calls
 */
import { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import { setSelectedDIN, setCurrentStatus, setFromController } from '../../business-content/store/businessContentSlice';
import type { SelectedDIN } from '../../business-content/types/BusinessContentTypes';
import {
  useLazyGetYTDAuditDataQuery,
  useGetSearchConfigQuery,
  useLazyGetYTDExceptionsQuery,
  useLazyGetExceptionSupplierCountQuery,
  useLazyGetRecentWorkflowsQuery,
  useLazyGetPastDueCountQuery,
  useLazyGetPastDueWorkflowsQuery,
  useLazyGetCustomWorkflowsQuery,
  useSearchYTDAuditDataMutation,
  useSearchRecentWorkflowsMutation,
  useSearchPastDueTasksMutation,
  useSearchCustomTasksMutation,
} from '../api/businessTasksApi';

interface BusinessTasksViewProps {
  className?: string;
}

type MainTab = 'insights' | 'recent' | 'pastDue' | 'custom';
type InsightsSubTab = 'aging' | 'exception';
type PastDueTimeBucket = 'today' | 'yesterday' | '3-7days' | '8-30days' | '31-60days' | '61-90days' | '91+days';

// Data types for local state mapping
interface AgingData {
  supplier_id: string;
  supplier_name: string;
  today: number;
  yesterday: number;
  days_3_7: number;
  days_8_30: number;
  days_31_60: number;
  days_61_90: number;
  days_91_plus: number;
}

interface ExceptionData {
  supplier_id: string;
  supplier_name: string;
  exception_count: number;
  transaction_count: number;
}

interface ExceptionReasonData {
  reason: string;
  supplier_count: number;
  transaction_count: number;
  occurrence_count: number;
}

interface WorkflowItem {
  batch_id: string;
  transaction_id?: string;
  document_id?: string;
  file_name: string;
  activity_date: string;
  status?: string;
  queue?: string;
  action?: string;
  days_overdue?: number;
}

interface SearchConfigItem {
  field: string;
  label: string;
}

const PAST_DUE_TIME_BUCKETS: { id: PastDueTimeBucket; label: string; param: string }[] = [
  { id: 'today', label: 'Today', param: 'today' },
  { id: 'yesterday', label: 'Yesterday', param: 'yesterday' },
  { id: '3-7days', label: '3-7 Days', param: '3-7' },
  { id: '8-30days', label: '8-30 Days', param: '8-30' },
  { id: '31-60days', label: '31-60 Days', param: '31-60' },
  { id: '61-90days', label: '61-90 Days', param: '61-90' },
  { id: '91+days', label: '91+ Days', param: '91+' },
];

export const BusinessTasksView: React.FC<BusinessTasksViewProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const userData = auth.user;

  // Tab state
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('insights');
  const [activeInsightsTab, setActiveInsightsTab] = useState<InsightsSubTab>('aging');
  const [activePastDueBucket, setActivePastDueBucket] = useState<PastDueTimeBucket>('today');

  // Search state
  const [searchCategory, setSearchCategory] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<WorkflowItem[] | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Custom date range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Loading / Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data states - populated by API calls
  const [agingDataState, setAgingDataState] = useState<AgingData[]>([]);
  const [exceptionSupplierState, setExceptionSupplierState] = useState<ExceptionData[]>([]);
  const [exceptionReasonsState, setExceptionReasonsState] = useState<ExceptionReasonData[]>([]);
  const [recentWorkflowsState, setRecentWorkflowsState] = useState<WorkflowItem[]>([]);
  const [pastDueWorkflowsState, setPastDueWorkflowsState] = useState<WorkflowItem[]>([]);
  const [pastDueCounts, setPastDueCounts] = useState<Record<string, number>>({});
  const [customWorkflowsState, setCustomWorkflowsState] = useState<WorkflowItem[]>([]);

  // User params for API calls
  const userParams = useMemo(() => ({
    customer_id: (userData?.customer_id as string) || '',
    bps_id: (userData?.bps_id as string) || '',
    user_id: (userData?.user_id as string) || '',
    sp_process_id: (userData?.sp_process_id as string) || '',
    queue_id: (userData?.queue_id as string) || ''
  }), [userData]);

  // Handle Open DIN - navigate to BusinessContent/PDFLoadingPage
  // Origin: AngularJS open icon click → $rootScope.selectedDIN → navigate to PDFLoadingPage
  const handleOpenDIN = useCallback((item: WorkflowItem) => {
    const din: SelectedDIN = {
      din: item.document_id || item.transaction_id || '',
      uin: '',
      TransactionID: item.transaction_id || item.document_id || '',
      fileName: item.file_name || '',
      queue_btime: item.activity_date || '',
      ixsd_id: '',
      hasException: '',
    };
    dispatch(setSelectedDIN(din));
    dispatch(setCurrentStatus(item.status || ''));
    dispatch(setFromController('tasks'));
    navigate('/PDFLoadingPage');
  }, [dispatch, navigate]);

  // RTK Query LAZY hooks - triggered explicitly on every tab activation
  const [triggerAging] = useLazyGetYTDAuditDataQuery();
  const [triggerExceptionSupplier] = useLazyGetExceptionSupplierCountQuery();
  const [triggerYTDExceptions] = useLazyGetYTDExceptionsQuery();
  const [triggerRecent] = useLazyGetRecentWorkflowsQuery();
  const [triggerPastDueCount] = useLazyGetPastDueCountQuery();
  const [triggerPastDue] = useLazyGetPastDueWorkflowsQuery();
  const [triggerCustom] = useLazyGetCustomWorkflowsQuery();

  // Search Config (always load once - this is a config, not data)
  const { data: searchConfigData } = useGetSearchConfigQuery(
    userParams,
    { skip: !userData }
  );

  // Search mutations
  const [searchAging] = useSearchYTDAuditDataMutation();
  const [searchRecent] = useSearchRecentWorkflowsMutation();
  const [searchPastDue] = useSearchPastDueTasksMutation();
  const [searchCustom] = useSearchCustomTasksMutation();

  // Process search config
  const searchConfig = useMemo<SearchConfigItem[]>(() => {
    if (searchConfigData && searchConfigData[0]) {
      const config = searchConfigData[0];
      try {
        if (Array.isArray(config) && config.length > 0) {
          const firstItem = config[0] as { fields?: Array<{ name: string; label: string }> };
          if (firstItem.fields) {
            return firstItem.fields.map(f => ({
              field: f.name,
              label: f.label
            }));
          }
          return config.map((item: unknown) => {
            const i = item as { field?: string; name?: string; label?: string };
            return {
              field: i.field || i.name || '',
              label: i.label || i.name || ''
            };
          });
        }
      } catch {
        // Safe fallback on JSON parse error
      }
    }
    return [
      { field: 'ALL', label: 'ALL' },
      { field: 'batch_id', label: 'Batch ID' },
      { field: 'file_name', label: 'File Name' },
      { field: 'supplier', label: 'Supplier' }
    ];
  }, [searchConfigData]);

  // ========= EVENT-DRIVEN API TRIGGERS =========
  // Each function triggers a FRESH API call - no caching, no init-only guards

  const loadAgingData = useCallback(async () => {
    if (!userData) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await triggerAging(
        { ...userParams, itemsPerPage: 100, currentPage: 1 },
        false // preferCacheValue = false to force fresh API call on every trigger
      ).unwrap();
      if (result && result[0]) {
        setAgingDataState(result[0].map((item, index) => ({
          supplier_id: item.id || String(index),
          supplier_name: item.user || item.details || 'Unknown',
          today: item.count_30 || 0,
          yesterday: 0,
          days_3_7: 0,
          days_8_30: item.count_30 || 0,
          days_31_60: item.count_60 || 0,
          days_61_90: item.count_90 || 0,
          days_91_plus: 0
        })));
      } else {
        setAgingDataState([]);
      }
    } catch (error) {
      console.error('Aging API error:', error);
      setErrorMessage('Unable to load aging data. Please retry.');
      setAgingDataState([]);
    } finally {
      setIsLoading(false);
    }
  }, [userData, userParams, triggerAging]);

  const loadExceptionData = useCallback(async () => {
    if (!userData) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [supplierResult, reasonsResult] = await Promise.all([
        triggerExceptionSupplier(userParams, false).unwrap(),
        triggerYTDExceptions({ ...userParams, itemsPerPage: 100, currentPage: 1 }, false).unwrap()
      ]);

      if (supplierResult && supplierResult[0]) {
        setExceptionSupplierState(supplierResult[0].map(item => ({
          supplier_id: item.supplier_id,
          supplier_name: item.supplier_name,
          exception_count: item.exception_count,
          transaction_count: item.exception_count
        })));
      } else {
        setExceptionSupplierState([]);
      }

      if (reasonsResult && reasonsResult[0]) {
        // Map exception items to reason-based aggregation
        const reasonMap: Record<string, ExceptionReasonData> = {};
        reasonsResult[0].forEach(item => {
          const key = item.exception_type || 'Unknown';
          if (!reasonMap[key]) {
            reasonMap[key] = { reason: key, supplier_count: 0, transaction_count: 0, occurrence_count: 0 };
          }
          reasonMap[key].supplier_count++;
          reasonMap[key].transaction_count++;
          reasonMap[key].occurrence_count++;
        });
        setExceptionReasonsState(Object.values(reasonMap));
      } else {
        setExceptionReasonsState([]);
      }
    } catch (error) {
      console.error('Exception API error:', error);
      setErrorMessage('Unable to load exception data. Please retry.');
      setExceptionSupplierState([]);
      setExceptionReasonsState([]);
    } finally {
      setIsLoading(false);
    }
  }, [userData, userParams, triggerExceptionSupplier, triggerYTDExceptions]);

  const loadRecentData = useCallback(async () => {
    if (!userData) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await triggerRecent(
        { ...userParams, itemsPerPage: 100, currentPage: 1 },
        false
      ).unwrap();
      if (result && result[0]) {
        setRecentWorkflowsState(result[0].map(item => ({
          batch_id: item.workflow_id,
          transaction_id: item.workflow_id,
          file_name: item.file_name || item.workflow_name,
          activity_date: item.updated_date || item.created_date,
          status: item.status,
          queue: item.assigned_to
        })));
      } else {
        setRecentWorkflowsState([]);
      }
    } catch (error) {
      console.error('Recent API error:', error);
      setErrorMessage('Unable to load recent data. Please retry.');
      setRecentWorkflowsState([]);
    } finally {
      setIsLoading(false);
    }
  }, [userData, userParams, triggerRecent]);

  const loadPastDueData = useCallback(async (bucket?: PastDueTimeBucket) => {
    if (!userData) return;
    setIsLoading(true);
    setErrorMessage(null);
    // Use the passed bucket or fall back to active
    const currentBucket = bucket || activePastDueBucket;
    // Map bucket to API eventTerm parameter
    const bucketConfig = PAST_DUE_TIME_BUCKETS.find(b => b.id === currentBucket);
    const eventTerm = bucketConfig?.param || 'today';

    try {
      // Load both counts and workflows (pass eventTerm for bucket filtering)
      const [countResult, workflowResult] = await Promise.all([
        triggerPastDueCount(userParams, false).unwrap(),
        triggerPastDue(
          { ...userParams, eventTerm, itemsPerPage: 100, currentPage: 1 },
          false
        ).unwrap()
      ]);

      // Process counts
      if (countResult && countResult[0]?.[0]) {
        const data = countResult[0][0] as Record<string, unknown>;
        setPastDueCounts({
          today: Number(data.today || data.count || 0),
          yesterday: Number(data.yesterday || 0),
          '3-7': Number(data.days_3_7 || data['3-7'] || 0),
          '8-30': Number(data.days_8_30 || data['8-30'] || 0),
          '31-60': Number(data.days_31_60 || data['31-60'] || 0),
          '61-90': Number(data.days_61_90 || data['61-90'] || 0),
          '91+': Number(data.days_91_plus || data['91+'] || 0),
        });
      }

      // Process workflows - filter by time bucket
      if (workflowResult && workflowResult[0]) {
        setPastDueWorkflowsState(workflowResult[0].map(item => ({
          batch_id: item.workflow_id,
          file_name: item.workflow_name,
          activity_date: item.due_date,
          days_overdue: item.days_overdue,
          queue: item.assigned_to
        })));
      } else {
        setPastDueWorkflowsState([]);
      }
    } catch (error) {
      console.error('Past Due API error:', error);
      setErrorMessage('Unable to load past due data. Please retry.');
      setPastDueWorkflowsState([]);
    } finally {
      setIsLoading(false);
    }
  }, [userData, userParams, activePastDueBucket, triggerPastDueCount, triggerPastDue]);

  const loadCustomData = useCallback(async () => {
    if (!userData || !startDate || !endDate) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await triggerCustom(
        { ...userParams, startDate, endDate, itemsPerPage: 100, currentPage: 1 },
        false
      ).unwrap();
      if (result && result[0]) {
        setCustomWorkflowsState(result[0].map(item => ({
          batch_id: item.workflow_id,
          file_name: item.workflow_name,
          activity_date: item.created_date,
          status: item.status
        })));
      } else {
        setCustomWorkflowsState([]);
      }
    } catch (error) {
      console.error('Custom API error:', error);
      setErrorMessage('Unable to load custom data. Please retry.');
      setCustomWorkflowsState([]);
    } finally {
      setIsLoading(false);
    }
  }, [userData, userParams, startDate, endDate, triggerCustom]);

  // ========= INITIAL LOAD =========
  // Load default tab (Insights > Aging) on mount
  useEffect(() => {
    if (userData) {
      loadAgingData();
    }
  }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ========= TAB EVENT HANDLERS =========
  // Every tab click triggers fresh API call - no caching

  const handleMainTabChange = useCallback((tab: MainTab) => {
    setActiveMainTab(tab);
    setCurrentPage(1);
    setSearchText('');
    setSearchResults(null);
    setErrorMessage(null);

    // Event-driven API trigger for each tab
    switch (tab) {
      case 'insights':
        if (activeInsightsTab === 'aging') {
          loadAgingData();
        } else {
          loadExceptionData();
        }
        break;
      case 'recent':
        loadRecentData();
        break;
      case 'pastDue':
        loadPastDueData();
        break;
      case 'custom':
        // Custom tab: API triggered on date submit
        break;
    }
  }, [activeInsightsTab, loadAgingData, loadExceptionData, loadRecentData, loadPastDueData]);

  const handleInsightsTabChange = useCallback((tab: InsightsSubTab) => {
    setActiveInsightsTab(tab);
    setCurrentPage(1);
    setSearchResults(null);
    setErrorMessage(null);

    // Trigger API on every sub-tab click
    if (tab === 'aging') {
      loadAgingData();
    } else {
      loadExceptionData();
    }
  }, [loadAgingData, loadExceptionData]);

  const handlePastDueBucketChange = useCallback((bucket: PastDueTimeBucket) => {
    setActivePastDueBucket(bucket);
    setCurrentPage(1);
    setSearchResults(null);
    setErrorMessage(null);

    // Trigger API on every time bucket click
    loadPastDueData(bucket);
  }, [loadPastDueData]);

  // Handle custom date load
  const handleLoadCustomData = useCallback(() => {
    if (startDate && endDate) {
      setCurrentPage(1);
      setSearchResults(null);
      loadCustomData();
    }
  }, [startDate, endDate, loadCustomData]);

  // Handle supplier count click - redirect to Custom tab with supplier filter
  const handleSupplierCountClick = useCallback((supplierId: string) => {
    setActiveMainTab('custom');
    const today = new Date();
    const yearAgo = new Date();
    yearAgo.setFullYear(today.getFullYear() - 1);
    setStartDate(yearAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setSearchText(supplierId);
    // Trigger custom load after state updates
    setTimeout(() => loadCustomData(), 0);
  }, [loadCustomData]);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    setErrorMessage(null);
    switch (activeMainTab) {
      case 'insights':
        activeInsightsTab === 'aging' ? loadAgingData() : loadExceptionData();
        break;
      case 'recent':
        loadRecentData();
        break;
      case 'pastDue':
        loadPastDueData();
        break;
      case 'custom':
        loadCustomData();
        break;
    }
  }, [activeMainTab, activeInsightsTab, loadAgingData, loadExceptionData, loadRecentData, loadPastDueData, loadCustomData]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchText.trim()) {
      setSearchResults(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    const searchPayload = {
      ...userParams,
      searchText,
      searchField: searchCategory,
      itemsPerPage: 100,
      currentPage: 1
    };

    try {
      let result;
      switch (activeMainTab) {
        case 'insights':
          result = await searchAging(searchPayload).unwrap();
          break;
        case 'recent':
          result = await searchRecent(searchPayload).unwrap();
          if (result && result[0]) {
            setSearchResults(result[0].map(item => ({
              batch_id: item.workflow_id,
              transaction_id: item.workflow_id,
              file_name: item.file_name || item.workflow_name,
              activity_date: item.updated_date || item.created_date,
              status: item.status,
              queue: item.assigned_to
            })));
          }
          break;
        case 'pastDue':
          result = await searchPastDue(searchPayload).unwrap();
          if (result && result[0]) {
            setSearchResults(result[0].map(item => ({
              batch_id: item.workflow_id,
              file_name: item.workflow_name,
              activity_date: item.due_date,
              days_overdue: item.days_overdue,
              queue: item.assigned_to
            })));
          }
          break;
        case 'custom':
          result = await searchCustom({ ...searchPayload, startDate, endDate }).unwrap();
          if (result && result[0]) {
            setSearchResults(result[0].map(item => ({
              batch_id: item.workflow_id,
              file_name: item.workflow_name,
              activity_date: item.created_date,
              status: item.status
            })));
          }
          break;
      }
      setCurrentPage(1);
    } catch (error) {
      console.error('Search failed:', error);
      setErrorMessage('Search failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  }, [activeMainTab, searchText, searchCategory, userParams, startDate, endDate, searchAging, searchRecent, searchPastDue, searchCustom]);

  // Get current display data based on active tab
  const getCurrentData = useCallback((): WorkflowItem[] => {
    if (searchResults) return searchResults;

    switch (activeMainTab) {
      case 'recent':
        return recentWorkflowsState;
      case 'pastDue':
        return pastDueWorkflowsState;
      case 'custom':
        return customWorkflowsState;
      default:
        return [];
    }
  }, [activeMainTab, searchResults, recentWorkflowsState, pastDueWorkflowsState, customWorkflowsState]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    const dataLength = activeMainTab === 'insights'
      ? agingDataState.length
      : getCurrentData().length;
    return Math.ceil(dataLength / itemsPerPage) || 1;
  }, [activeMainTab, agingDataState.length, getCurrentData, itemsPerPage]);

  // Calculate max value for bar chart
  const maxBarValue = Math.max(...agingDataState.map(d => d.today + d.days_3_7 + d.days_8_30 + d.days_31_60 + d.days_61_90 + d.days_91_plus), 1);

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view tasks</p>
      </div>
    );
  }

  // Render error banner
  const renderErrorBanner = () => errorMessage ? (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center justify-between">
      <span className="text-red-700 text-sm">{errorMessage}</span>
      <button onClick={handleRetry} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
        Retry
      </button>
    </div>
  ) : null;

  // Render loading skeleton rows
  const renderSkeletonRows = (cols: number) => (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  // Render Search Bar with Category dropdown
  const renderSearchBar = () => (
    <div className="flex items-center gap-4">
      <select
        value={searchCategory}
        onChange={(e) => setSearchCategory(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
      >
        {searchConfig.length > 0 ? searchConfig.map((config) => (
          <option key={config.field} value={config.field}>{config.label}</option>
        )) : (
          <>
            <option value="ALL">ALL</option>
            <option value="batch_id">Batch ID</option>
            <option value="file_name">File Name</option>
            <option value="supplier">Supplier</option>
          </>
        )}
      </select>
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search..."
        className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
      />
      <button
        onClick={handleSearch}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        Search
      </button>
    </div>
  );

  // Render pagination controls
  const renderPagination = () => (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <div className="flex items-center gap-4 text-sm">
        <span>Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="px-2 py-1 border border-gray-300 rounded"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1 || isLoading}
          className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">{currentPage}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || isLoading}
          className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  // Render Insights Aging tab
  const renderInsightsAging = () => (
    <div className="space-y-6">
      {renderSearchBar()}

      {/* Bar Chart */}
      <div className="bg-white p-4 rounded-lg">
        <div className="h-48 flex items-end justify-around gap-4">
          {agingDataState.slice(0, 5).map((data, index) => {
            const total = data.today + data.days_3_7 + data.days_8_30 + data.days_31_60 + data.days_61_90 + data.days_91_plus;
            return (
              <div key={index} className="flex flex-col items-center">
                <span className="text-xs text-blue-600 mb-1">{total}</span>
                <div
                  className="w-12 bg-blue-500 rounded-t cursor-pointer hover:bg-blue-600"
                  style={{ height: `${(total / maxBarValue) * 120}px`, minHeight: '4px' }}
                  onClick={() => handleSupplierCountClick(data.supplier_id)}
                />
                <span className="text-xs text-gray-500 mt-2 text-center w-20 truncate" title={data.supplier_name}>
                  {data.supplier_name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aging View Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-semibold p-4 border-b">Aging View</h3>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Today</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Yesterday</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">3-7 Days</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">8-30 Days</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">31-60 Days</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">61-90 Days</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">91+ Days</th>
            </tr>
          </thead>
          {isLoading ? renderSkeletonRows(8) : (
            <tbody className="divide-y divide-gray-200">
              {agingDataState.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No records found.</td></tr>
              ) : (
                agingDataState.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row) => (
                  <tr key={row.supplier_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{row.supplier_name}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <button onClick={() => handleSupplierCountClick(row.supplier_id)} className="text-blue-600 hover:underline">
                        {row.today || '-'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{row.yesterday || '-'}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{row.days_3_7 || '-'}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{row.days_8_30 || '-'}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{row.days_31_60 || '-'}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{row.days_61_90 || '-'}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{row.days_91_plus || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
        {renderPagination()}
      </div>
    </div>
  );

  // Render Insights Exception tab - split layout: Left chart, Right table
  const renderInsightsException = () => (
    <div className="space-y-6">
      {renderSearchBar()}

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Supplier-wise Exception Chart */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h3 className="text-lg font-semibold p-4 border-b">Supplier-wise Exception Chart</h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="p-4">
              <div className="h-48 flex items-end justify-around gap-2">
                {exceptionSupplierState.slice(0, 10).map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <span className="text-xs text-orange-600 mb-1">{data.exception_count}</span>
                    <div
                      className="w-full max-w-[24px] bg-orange-500 rounded-t cursor-pointer hover:bg-orange-600"
                      style={{
                        height: `${(data.exception_count / Math.max(...exceptionSupplierState.map(d => d.exception_count), 1)) * 120}px`,
                        minHeight: '4px'
                      }}
                      onClick={() => handleSupplierCountClick(data.supplier_id)}
                    />
                    <span className="text-xs text-gray-500 mt-1 text-center truncate w-full" title={data.supplier_name}>
                      {data.supplier_name.slice(0, 8)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Exception Reasons Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h3 className="text-lg font-semibold p-4 border-b">Exception Reasons</h3>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exception Reason</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Transaction</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Occurrence</th>
              </tr>
            </thead>
            {isLoading ? renderSkeletonRows(4) : (
              <tbody className="divide-y divide-gray-200">
                {exceptionReasonsState.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No records found.</td></tr>
                ) : (
                  exceptionReasonsState.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{row.reason}</td>
                      <td className="px-4 py-3 text-sm text-center text-blue-600 cursor-pointer hover:underline">{row.supplier_count}</td>
                      <td className="px-4 py-3 text-sm text-center text-blue-600 cursor-pointer hover:underline">{row.transaction_count}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{row.occurrence_count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
          {renderPagination()}
        </div>
      </div>
    </div>
  );

  // Render workflow table (shared by Recent, Past Due, Custom)
  const renderWorkflowTable = (data: WorkflowItem[], showDaysOverdue = false) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Queue</th>
            {showDaysOverdue && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Overdue</th>
            )}
          </tr>
        </thead>
        {isLoading ? renderSkeletonRows(showDaysOverdue ? 7 : 6) : (
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={showDaysOverdue ? 7 : 6} className="px-4 py-8 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-blue-600" title="View">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-blue-600" title="Open" onClick={() => handleOpenDIN(item)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.activity_date || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.batch_id || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.transaction_id || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.file_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.queue || item.action || '-'}</td>
                  {showDaysOverdue && (
                    <td className="px-4 py-3 text-sm text-red-600">{item.days_overdue || '-'}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        )}
      </table>
      {renderPagination()}
    </div>
  );

  // Render Recent tab
  const renderRecentTab = () => {
    const displayData = searchResults || recentWorkflowsState;
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-800">Last 10 Transactions</h3>
        {renderSearchBar()}
        {renderWorkflowTable(displayData)}
      </div>
    );
  };

  // Render Past Due tab with ALL time bucket sub-tabs
  const renderPastDueTab = () => {
    const displayData = searchResults || pastDueWorkflowsState;
    return (
      <div className="space-y-6">
        {/* Timeline Filter sub-tabs - ALL 7 buckets */}
        <div className="flex gap-2 border-b border-gray-200 flex-wrap">
          {PAST_DUE_TIME_BUCKETS.map((bucket) => (
            <button
              key={bucket.id}
              onClick={() => handlePastDueBucketChange(bucket.id)}
              className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activePastDueBucket === bucket.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {bucket.label} ({pastDueCounts[bucket.param] || 0})
            </button>
          ))}
        </div>

        {renderSearchBar()}
        {renderWorkflowTable(displayData, true)}
      </div>
    );
  };

  // Render Custom tab
  const renderCustomTab = () => {
    const displayData = searchResults || customWorkflowsState;
    return (
      <div className="space-y-6">
        {/* Date Range Selection */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex gap-4 items-end flex-wrap">
            <div>
              <label className="block text-sm text-gray-600 mb-1">From Date</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">To Date</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <button
              onClick={handleLoadCustomData}
              disabled={!startDate || !endDate || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </div>

        {renderSearchBar()}

        {customWorkflowsState.length === 0 && !isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            Select a date range and click Submit to view data
          </div>
        ) : (
          renderWorkflowTable(displayData)
        )}
      </div>
    );
  };

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-light text-blue-600">
          <span className="text-blue-800 font-semibold">one</span>base
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Selected TimeZone: Asia/Calcutta - {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString()}</span>
          <span className="text-blue-600">{userData?.user_name || 'Digital User'} ▼</span>
        </div>
      </div>

      {/* Main Tabs - Sticky */}
      <div className="sticky top-0 bg-white z-10 flex items-center justify-between border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {[
            { id: 'insights' as MainTab, label: 'Insights' },
            { id: 'recent' as MainTab, label: 'Recent' },
            { id: 'pastDue' as MainTab, label: 'Past Due' },
            { id: 'custom' as MainTab, label: 'Custom' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleMainTabChange(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeMainTab === tab.id
                  ? 'border-blue-500 text-blue-600 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <span className="text-blue-600 text-sm cursor-pointer">Business Process ⟲</span>
      </div>

      {/* Insights Sub-tabs - Sticky */}
      {activeMainTab === 'insights' && (
        <div className="sticky top-[41px] bg-white z-10 flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => handleInsightsTabChange('aging')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeInsightsTab === 'aging'
                ? 'border-blue-500 text-blue-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Aging (YTD)
          </button>
          <button
            onClick={() => handleInsightsTabChange('exception')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeInsightsTab === 'exception'
                ? 'border-blue-500 text-blue-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Exception (YTD)
          </button>
        </div>
      )}

      {/* Error Banner */}
      {renderErrorBanner()}

      {/* Tab Content - maintains min-height for layout stability */}
      <div className="min-h-[400px]">
        {activeMainTab === 'insights' && activeInsightsTab === 'aging' && renderInsightsAging()}
        {activeMainTab === 'insights' && activeInsightsTab === 'exception' && renderInsightsException()}
        {activeMainTab === 'recent' && renderRecentTab()}
        {activeMainTab === 'pastDue' && renderPastDueTab()}
        {activeMainTab === 'custom' && renderCustomTab()}
      </div>
    </div>
  );
};

export default BusinessTasksView;
