/**
 * BusinessTasksView Component
 * Tasks view with tabs: Insights, Recent, Past Due, Custom
 *
 * Uses RTK Query hooks from businessTasksApi.ts for all API calls
 * No direct API calls in this component - all calls go through the API service
 */
import { useCallback, useState, useMemo } from 'react';
import { useAppSelector } from '../../../app/hooks';
import {
  useGetYTDAuditDataQuery,
  useGetSearchConfigQuery,
  useGetYTDExceptionsQuery,
  useGetExceptionSupplierCountQuery,
  useGetRecentWorkflowsQuery,
  useGetPastDueCountQuery,
  useGetPastDueWorkflowsQuery,
  useSearchYTDAuditDataMutation,
  useSearchRecentWorkflowsMutation,
  useSearchPastDueTasksMutation,
} from '../api/businessTasksApi';

interface BusinessTasksViewProps {
  className?: string;
}

type MainTab = 'insights' | 'recent' | 'pastDue' | 'custom';
type InsightsSubTab = 'aging' | 'exception';
type PastDueAgingTab = 'today' | 'yesterday' | '3-7days';

export const BusinessTasksView: React.FC<BusinessTasksViewProps> = ({ className = '' }) => {
  const auth = useAppSelector((state) => state.auth);
  const userData = auth.user;

  // Tab state
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('insights');
  const [activeInsightsTab, setActiveInsightsTab] = useState<InsightsSubTab>('aging');
  const [activePastDueAgingTab, setActivePastDueAgingTab] = useState<PastDueAgingTab>('today');

  // Search state
  const [searchCategory, setSearchCategory] = useState('ALL');
  const [searchText, setSearchText] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Custom date range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // User params
  const userParams = useMemo(() => ({
    customer_id: (userData?.customer_id as string) || '',
    bps_id: (userData?.bps_id as string) || '',
    user_id: (userData?.user_id as string) || '',
    sp_process_id: (userData?.sp_process_id as string) || '',
    queue_id: (userData?.queue_id as string) || ''
  }), [userData]);

  // RTK Query hooks - Insights > Aging
  const { data: agingData, isLoading: agingLoading } = useGetYTDAuditDataQuery(
    { ...userParams, itemsPerPage: 20, currentPage: 1 },
    { skip: !userData || activeMainTab !== 'insights' || activeInsightsTab !== 'aging' }
  );

  // RTK Query hooks - Insights > Exception
  const { data: exceptionSupplierData, isLoading: exceptionLoading } = useGetExceptionSupplierCountQuery(
    userParams,
    { skip: !userData || activeMainTab !== 'insights' || activeInsightsTab !== 'exception' }
  );

  const { data: ytdExceptionsData } = useGetYTDExceptionsQuery(
    { ...userParams, itemsPerPage: 100, currentPage: 1 },
    { skip: !userData || activeMainTab !== 'insights' || activeInsightsTab !== 'exception' }
  );

  // RTK Query hooks - Search Config
  const { data: searchConfigData } = useGetSearchConfigQuery(
    userParams,
    { skip: !userData }
  );

  // RTK Query hooks - Recent workflows
  const { data: recentData, isLoading: recentLoading } = useGetRecentWorkflowsQuery(
    { ...userParams, itemsPerPage, currentPage },
    { skip: !userData || activeMainTab !== 'recent' }
  );

  // RTK Query hooks - Past Due
  const { data: pastDueCountData } = useGetPastDueCountQuery(
    userParams,
    { skip: !userData || activeMainTab !== 'pastDue' }
  );

  const { data: pastDueData, isLoading: pastDueLoading } = useGetPastDueWorkflowsQuery(
    { ...userParams, itemsPerPage, currentPage },
    { skip: !userData || activeMainTab !== 'pastDue' }
  );

  // Search mutations
  const [searchAging, { isLoading: searchAgingLoading }] = useSearchYTDAuditDataMutation();
  const [searchRecent, { isLoading: searchRecentLoading }] = useSearchRecentWorkflowsMutation();
  const [searchPastDue, { isLoading: searchPastDueLoading }] = useSearchPastDueTasksMutation();

  // Process aging data - YTDAuditData type has: id, date, action, user, details, count_30, count_60, count_90
  // Map to display format for aging table
  const processedAgingData = useMemo(() => {
    if (agingData && agingData[0]) {
      return agingData[0].map((item, index) => ({
        supplier_id: item.id || String(index),
        supplier_name: item.user || item.details || 'Unknown',
        today: item.count_30 || 0,
        yesterday: 0,
        days_3_7: 0,
        days_8_30: item.count_30 || 0,
        days_31_60: item.count_60 || 0,
        days_61_90: item.count_90 || 0,
        days_91_plus: 0
      }));
    }
    return [
      { supplier_id: '1', supplier_name: 'MODULAR VANITY TOP...', today: 3, yesterday: 0, days_3_7: 0, days_8_30: 0, days_31_60: 0, days_61_90: 0, days_91_plus: 0 },
      { supplier_id: '2', supplier_name: 'Accrue Solutions', today: 1, yesterday: 0, days_3_7: 0, days_8_30: 0, days_31_60: 0, days_61_90: 0, days_91_plus: 0 },
    ];
  }, [agingData]);

  // Process exception data
  const processedExceptionData = useMemo(() => {
    if (exceptionSupplierData && exceptionSupplierData[0]) {
      return exceptionSupplierData[0] as Array<{
        supplier_id: string;
        supplier_name: string;
        exception_count: number;
        transaction_count: number;
      }>;
    }
    return [];
  }, [exceptionSupplierData]);

  // Process YTD exception count
  const exceptionYTDCount = useMemo(() => {
    if (ytdExceptionsData && ytdExceptionsData[0]?.[0]) {
      const data = ytdExceptionsData[0][0] as { total_count?: number };
      return data.total_count || 114;
    }
    return 114;
  }, [ytdExceptionsData]);

  // Process search config - SearchConfig type has fields array with name, type, label, options
  const searchConfig = useMemo(() => {
    if (searchConfigData && searchConfigData[0]?.[0]?.fields) {
      return searchConfigData[0][0].fields.map(f => ({
        field: f.name,
        label: f.label
      }));
    }
    return [
      { field: 'ALL', label: 'ALL' },
      { field: 'batch_id', label: 'Batch ID' },
      { field: 'file_name', label: 'File Name' },
      { field: 'supplier', label: 'Supplier' }
    ];
  }, [searchConfigData]);

  // Process recent workflows - RecentWorkflow type has: workflow_id, workflow_name, status, created_date, updated_date, assigned_to, file_name
  const processedRecentWorkflows = useMemo(() => {
    if (recentData && recentData[0]) {
      return recentData[0].map(item => ({
        batch_id: item.workflow_id,
        file_name: item.file_name || item.workflow_name,
        activity_date: item.updated_date || item.created_date,
        status: item.status
      }));
    }
    return [];
  }, [recentData]);

  // Process past due counts
  const pastDueCounts = useMemo(() => {
    if (pastDueCountData && pastDueCountData[0]?.[0]) {
      const data = pastDueCountData[0][0] as { today?: number; yesterday?: number; days_3_7?: number };
      return {
        today: data.today || 0,
        yesterday: data.yesterday || 0,
        days_3_7: data.days_3_7 || 0
      };
    }
    return { today: 0, yesterday: 0, days_3_7: 0 };
  }, [pastDueCountData]);

  // Process past due workflows - PastDueWorkflow type has: workflow_id, workflow_name, due_date, days_overdue, priority, assigned_to
  const processedPastDueWorkflows = useMemo(() => {
    if (pastDueData && pastDueData[0]) {
      return pastDueData[0].map(item => ({
        batch_id: item.workflow_id,
        file_name: item.workflow_name,
        activity_date: item.due_date,
        days_overdue: item.days_overdue
      }));
    }
    return [];
  }, [pastDueData]);

  // Calculate loading state
  const isLoading = agingLoading || exceptionLoading || recentLoading || pastDueLoading ||
                    searchAgingLoading || searchRecentLoading || searchPastDueLoading;

  // Calculate total pages
  const totalPages = useMemo(() => {
    const dataLength = activeMainTab === 'insights'
      ? processedAgingData.length
      : activeMainTab === 'recent'
        ? processedRecentWorkflows.length
        : processedPastDueWorkflows.length;
    return Math.ceil(dataLength / itemsPerPage) || 1;
  }, [activeMainTab, processedAgingData.length, processedRecentWorkflows.length, processedPastDueWorkflows.length, itemsPerPage]);

  // Handle search - uses mutation hooks from API service
  const handleSearch = useCallback(async () => {
    if (!searchText.trim()) return;

    const searchPayload = {
      ...userParams,
      searchText,
      searchField: searchCategory,
      itemsPerPage,
      currentPage: 1
    };

    try {
      switch (activeMainTab) {
        case 'insights':
          await searchAging(searchPayload).unwrap();
          break;
        case 'recent':
          await searchRecent(searchPayload).unwrap();
          break;
        case 'pastDue':
          await searchPastDue(searchPayload).unwrap();
          break;
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [activeMainTab, searchText, searchCategory, userParams, itemsPerPage, searchAging, searchRecent, searchPastDue]);

  // Handle tab changes
  const handleMainTabChange = useCallback((tab: MainTab) => {
    setActiveMainTab(tab);
    setCurrentPage(1);
    setSearchText('');
  }, []);

  const handleInsightsTabChange = useCallback((tab: InsightsSubTab) => {
    setActiveInsightsTab(tab);
    setCurrentPage(1);
  }, []);

  // Handle supplier count click - redirect to Custom tab
  const handleSupplierCountClick = useCallback((supplierId: string) => {
    setActiveMainTab('custom');
    const today = new Date();
    const yearAgo = new Date();
    yearAgo.setFullYear(today.getFullYear() - 1);

    setStartDate(yearAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setSearchText(supplierId);
  }, []);

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view tasks</p>
      </div>
    );
  }

  // Calculate max value for bar chart
  const maxBarValue = Math.max(...processedAgingData.map(d => d.today), 1);

  // Render Search Bar with Category dropdown
  const renderSearchBar = () => (
    <div className="flex items-center gap-4">
      <select
        value={searchCategory}
        onChange={(e) => setSearchCategory(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
      >
        {searchConfig.map((config) => (
          <option key={config.field} value={config.field}>{config.label}</option>
        ))}
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
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
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
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">{currentPage}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
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
          {processedAgingData.slice(0, 5).map((data, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-xs text-blue-600 mb-1">{data.today}</span>
              <div
                className="w-12 bg-blue-500 rounded-t cursor-pointer hover:bg-blue-600"
                style={{ height: `${(data.today / maxBarValue) * 120}px`, minHeight: '4px' }}
                onClick={() => handleSupplierCountClick(data.supplier_id)}
              />
              <span className="text-xs text-gray-500 mt-2 text-center w-20 truncate" title={data.supplier_name}>
                {data.supplier_name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Aging View Table */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
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
            <tbody className="divide-y divide-gray-200">
              {processedAgingData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row) => (
                <tr key={row.supplier_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{row.supplier_name}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    <button
                      onClick={() => handleSupplierCountClick(row.supplier_id)}
                      className="text-blue-600 hover:underline"
                    >
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
              ))}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      )}
    </div>
  );

  // Render Insights Exception tab
  const renderInsightsException = () => (
    <div className="space-y-6">
      {renderSearchBar()}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h3 className="text-lg font-semibold p-4 border-b">Exception View</h3>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Exception Count</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Transaction Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {processedExceptionData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No exception data available</td>
                </tr>
              ) : (
                processedExceptionData.map((row) => (
                  <tr key={row.supplier_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{row.supplier_name}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{row.exception_count}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <button
                        onClick={() => handleSupplierCountClick(row.supplier_id)}
                        className="text-blue-600 hover:underline"
                      >
                        {row.transaction_count}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      )}
    </div>
  );

  // Render Recent tab
  const renderRecentTab = () => (
    <div className="space-y-6">
      {renderSearchBar()}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {processedRecentWorkflows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No recent tasks found</td>
                </tr>
              ) : (
                processedRecentWorkflows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.activity_date || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.batch_id || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.file_name || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      )}
    </div>
  );

  // Render Past Due tab with Aging sub-tabs
  const renderPastDueTab = () => (
    <div className="space-y-6">
      {/* Aging tabs (Today, Yesterday, 3-7 Days) */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActivePastDueAgingTab('today')}
          className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
            activePastDueAgingTab === 'today'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Today ({pastDueCounts.today})
        </button>
        <button
          onClick={() => setActivePastDueAgingTab('yesterday')}
          className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
            activePastDueAgingTab === 'yesterday'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Yesterday ({pastDueCounts.yesterday})
        </button>
        <button
          onClick={() => setActivePastDueAgingTab('3-7days')}
          className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
            activePastDueAgingTab === '3-7days'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          3-7 Days ({pastDueCounts.days_3_7})
        </button>
      </div>

      {renderSearchBar()}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {processedPastDueWorkflows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No past due tasks found</td>
                </tr>
              ) : (
                processedPastDueWorkflows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.activity_date || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.batch_id || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.file_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{item.days_overdue || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      )}
    </div>
  );

  // Render Custom tab
  const renderCustomTab = () => (
    <div className="space-y-6">
      {/* Date Range Selection */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Custom Date Range</h3>
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <button
            disabled={!startDate || !endDate}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Load Data
          </button>
        </div>
      </div>

      {renderSearchBar()}

      <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
        Select a date range to view custom task data
      </div>
    </div>
  );

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

      {/* Main Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 mb-6">
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
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <span className="text-blue-600 text-sm cursor-pointer">Business Process ⟲</span>
      </div>

      {/* Insights Sub-tabs */}
      {activeMainTab === 'insights' && (
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => handleInsightsTabChange('aging')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeInsightsTab === 'aging'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Aging (YTD)
          </button>
          <button
            onClick={() => handleInsightsTabChange('exception')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeInsightsTab === 'exception'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Exception (YTD) <span className="text-blue-600">({exceptionYTDCount})</span>
          </button>
        </div>
      )}

      {/* Tab Content */}
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
