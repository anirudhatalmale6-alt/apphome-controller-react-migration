/**
 * BusinessTasksView Component
 * Tasks view with tabs: Insights, Recent, Past Due, Custom
 * Insights subtabs: Aging (YTD), Exception (YTD)
 * Matching OneBase UI
 */
import { useCallback, useState } from 'react';
import { useAppSelector } from '../../../app/hooks';
import {
  useGetRecentWorkflowsQuery,
  useSearchRecentWorkflowsMutation,
  useGetPastDueWorkflowsQuery,
  useSearchPastDueTasksMutation,
  useGetPastDueCountQuery,
  useGetYTDAuditDataQuery,
  useSearchYTDAuditDataMutation,
  useSearchInsightsCustomMutation,
} from '../api/businessTasksApi';

interface BusinessTasksViewProps {
  className?: string;
}

type MainTab = 'insights' | 'recent' | 'pastDue' | 'custom';
type InsightsSubTab = 'aging' | 'exception';

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: 'insights', label: 'Insights' },
  { id: 'recent', label: 'Recent' },
  { id: 'pastDue', label: 'Past Due' },
  { id: 'custom', label: 'Custom' },
];

const INSIGHTS_SUBTABS: { id: InsightsSubTab; label: string }[] = [
  { id: 'aging', label: 'Aging (YTD)' },
  { id: 'exception', label: 'Exception (YTD)' },
];

// Aging table columns
const AGING_COLUMNS = ['Today', 'Yesterday', '3-7 Days', '8-30 Days', '31-60 Days', '61-90 Days', '91+ Days'];

export const BusinessTasksView: React.FC<BusinessTasksViewProps> = ({ className = '' }) => {
  const auth = useAppSelector((state) => state.auth);
  const userData = auth.user;

  const [activeMainTab, setActiveMainTab] = useState<number>(0);
  const [activeInsightsTab, setActiveInsightsTab] = useState<number>(0);
  const [searchText, setSearchText] = useState('');
  const [showPerPage, setShowPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [skipToPage, setSkipToPage] = useState('');

  const baseParams = {
    customer_id: userData?.customer_id || '',
    bps_id: userData?.bps_id || '',
    user_id: userData?.user_id || '',
    sp_process_id: userData?.sp_process_id || '',
    queue_id: userData?.queue_id || '',
  };

  // Queries
  const { data: recentData, isLoading: recentLoading } = useGetRecentWorkflowsQuery(
    { ...baseParams, currentPage, itemsPerPage: showPerPage },
    { skip: !userData || activeMainTab !== 1 }
  );

  const { data: pastDueData, isLoading: pastDueLoading } = useGetPastDueWorkflowsQuery(
    { ...baseParams, currentPage, itemsPerPage: showPerPage },
    { skip: !userData || activeMainTab !== 2 }
  );

  const { data: pastDueCountData } = useGetPastDueCountQuery(baseParams, { skip: !userData });

  const { data: _agingData, isLoading: agingLoading } = useGetYTDAuditDataQuery(
    { ...baseParams, currentPage, itemsPerPage: showPerPage },
    { skip: !userData || activeMainTab !== 0 }
  );

  // Mutations
  const [searchRecent] = useSearchRecentWorkflowsMutation();
  const [searchPastDue] = useSearchPastDueTasksMutation();
  const [searchAging] = useSearchYTDAuditDataMutation();
  const [_searchInsightsCustom, { data: _customData, isLoading: customLoading }] = useSearchInsightsCustomMutation();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const currentTab = MAIN_TABS[activeMainTab]?.id;
    if (currentTab === 'insights') {
      searchAging({ ...baseParams, currentPage: 1, itemsPerPage: showPerPage, searchText });
    } else if (currentTab === 'recent') {
      searchRecent({ ...baseParams, currentPage: 1, itemsPerPage: showPerPage, searchText });
    } else if (currentTab === 'pastDue') {
      searchPastDue({ ...baseParams, currentPage: 1, itemsPerPage: showPerPage, searchText });
    }
  }, [activeMainTab, baseParams, showPerPage, searchText, searchAging, searchRecent, searchPastDue]);

  const handleSkipToPage = useCallback(() => {
    const page = parseInt(skipToPage);
    if (!isNaN(page) && page > 0) {
      setCurrentPage(page);
    }
  }, [skipToPage]);

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view tasks</p>
      </div>
    );
  }

  const currentTab = MAIN_TABS[activeMainTab]?.id || 'insights';
  const currentInsightsTab = INSIGHTS_SUBTABS[activeInsightsTab]?.id || 'aging';

  // Sample aging data for display
  const sampleAgingData = [
    { supplier: 'MODULAR VANITY TOP...', today: 3, yesterday: 0, d3_7: 0, d8_30: 0, d31_60: 0, d61_90: 0, d91plus: 0 },
    { supplier: 'Accrue Solutions', today: 1, yesterday: 0, d3_7: 0, d8_30: 0, d31_60: 0, d61_90: 0, d91plus: 0 },
    { supplier: 'BOTTOM LINE CONSUL...', today: 1, yesterday: 0, d3_7: 0, d8_30: 0, d31_60: 0, d61_90: 0, d91plus: 0 },
    { supplier: 'TRANSEND LOGISTICS', today: 1, yesterday: 0, d3_7: 0, d8_30: 0, d31_60: 0, d61_90: 0, d91plus: 0 },
    { supplier: 'Idustan PVT LTD', today: 1, yesterday: 0, d3_7: 0, d8_30: 0, d31_60: 0, d61_90: 0, d91plus: 0 },
  ];

  const renderInsightsContent = () => {
    const maxBarValue = Math.max(...sampleAgingData.map(d => d.today), 1);

    return (
      <div className="space-y-6">
        {/* Insights Subtabs */}
        <div className="flex gap-4 border-b border-gray-200">
          {INSIGHTS_SUBTABS.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveInsightsTab(index)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeInsightsTab === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.id === 'exception' && (
                <span className="ml-1 text-blue-600">(114)</span>
              )}
            </button>
          ))}
        </div>

        {/* Search and Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm">ALL</button>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search..."
                className="px-3 py-1 border border-gray-300 rounded-l text-sm w-48"
              />
              <button type="submit" className="px-3 py-1 border border-l-0 border-gray-300 rounded-r bg-gray-50">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={showPerPage}
                onChange={(e) => setShowPerPage(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span>Skip to page:</span>
              <input
                type="text"
                value={skipToPage}
                onChange={(e) => setSkipToPage(e.target.value)}
                className="w-16 px-2 py-1 border border-gray-300 rounded"
              />
              <button
                onClick={handleSkipToPage}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                Go
              </button>
            </div>
            <div className="flex items-center gap-1">
              <span>Top</span>
              <button className="px-2 py-1 border border-gray-300 rounded">«</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
              <button className="px-2 py-1 border border-gray-300 rounded">»</button>
              <span>Bottom</span>
            </div>
          </div>
        </div>

        {/* Bar Chart for Aging YTD */}
        {currentInsightsTab === 'aging' && (
          <div className="bg-white p-4 rounded-lg">
            <div className="h-48 flex items-end justify-around gap-4">
              {sampleAgingData.map((data, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span className="text-xs text-blue-600 mb-1">{data.today}</span>
                  <div
                    className="w-12 bg-blue-500 rounded-t"
                    style={{ height: `${(data.today / maxBarValue) * 120}px`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-gray-500 mt-2 text-center w-20 truncate" title={data.supplier}>
                    {data.supplier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aging View Table */}
        <div className="bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold p-4 border-b">Aging View</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  {AGING_COLUMNS.map((col) => (
                    <th key={col} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {agingLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
                    </td>
                  </tr>
                ) : (
                  sampleAgingData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{row.supplier}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{row.today || '-'}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{row.yesterday || '-'}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{row.d3_7 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{row.d8_30 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{row.d31_60 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{row.d61_90 || '-'}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{row.d91plus || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderRecentContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search..."
            className="px-3 py-2 border border-gray-300 rounded-l text-sm w-64"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-r">Search</button>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {recentLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : (
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
              {recentData?.[0]?.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.activity_date || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.batch_id || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.file_name || '-'}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No recent tasks found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderPastDueContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-red-600 font-medium">
          {pastDueCountData?.[0]?.[0]?.count || 0} Tasks Overdue
        </span>
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search..."
            className="px-3 py-2 border border-gray-300 rounded-l text-sm w-64"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-r">Search</button>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {pastDueLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Overdue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pastDueData?.[0]?.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.task_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.due_date || '-'}</td>
                  <td className="px-4 py-3 text-sm text-red-600">{item.days_overdue || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.status || '-'}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No past due tasks found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderCustomContent = () => (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Custom Date Range</h3>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input type="date" className="px-3 py-2 border border-gray-300 rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input type="date" className="px-3 py-2 border border-gray-300 rounded" />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Search</button>
        </div>
      </div>
      {customLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
          Select a date range to view custom task data
        </div>
      )}
    </div>
  );

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-light text-blue-600">
          <span className="text-blue-800">one</span>base
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Selected TimeZone: Asia/Calcutta - {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString()}</span>
          <span className="text-blue-600">{userData?.user_name || 'Digital User'} ▼</span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {MAIN_TABS.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => { setActiveMainTab(index); setCurrentPage(1); }}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeMainTab === index
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

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {currentTab === 'insights' && renderInsightsContent()}
        {currentTab === 'recent' && renderRecentContent()}
        {currentTab === 'pastDue' && renderPastDueContent()}
        {currentTab === 'custom' && renderCustomContent()}
      </div>
    </div>
  );
};

export default BusinessTasksView;
