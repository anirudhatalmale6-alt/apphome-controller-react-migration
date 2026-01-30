/**
 * BusinessTasksView Component
 * Main task management view with tabs
 * Migrated from BusinessTasksController.js
 */
import { useCallback, useState } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { RecentTasksTable } from './RecentTasksTable';
import { PastDueTasksTable } from './PastDueTasksTable';
import { InsightsView } from './InsightsView';
import { TransactionHistoryModal } from './TransactionHistoryModal';
import {
  useGetRecentWorkflowsQuery,
  useSearchRecentWorkflowsMutation,
  useGetPastDueWorkflowsQuery,
  useSearchPastDueTasksMutation,
  useGetPastDueCountQuery,
  useGetYTDAuditDataQuery,
  useSearchYTDAuditDataMutation,
  useSearchInsightsCustomMutation,
  useGetDINHistoryQuery,
} from '../api/businessTasksApi';
import type { RecentWorkflow, PastDueWorkflow, DateRange, TransactionLog } from '../types/BusinessTasksTypes';

interface BusinessTasksViewProps {
  className?: string;
}

type MainTab = 'recent' | 'pastDue' | 'insights';

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: 'recent', label: 'Recent' },
  { id: 'pastDue', label: 'Past Due' },
  { id: 'insights', label: 'Insights' },
];

export const BusinessTasksView: React.FC<BusinessTasksViewProps> = ({ className = '' }) => {
  const auth = useAppSelector((state) => state.auth);
  const userData = auth.user;

  const [activeMainTab, setActiveMainTab] = useState<number>(0);
  const [activeInsightsTab, setActiveInsightsTab] = useState<number>(0);
  const [searchText, setSearchText] = useState('');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({ startDate: '', endDate: '' });

  // Pagination states
  const [recentPage, setRecentPage] = useState(1);
  const [recentItemsPerPage, setRecentItemsPerPage] = useState(10);
  const [pastDuePage, setPastDuePage] = useState(1);
  const [pastDueItemsPerPage, setPastDueItemsPerPage] = useState(10);
  const [agingPage, setAgingPage] = useState(1);

  // Transaction history modal state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedDIN, setSelectedDIN] = useState<string | null>(null);
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);

  const baseParams = {
    customer_id: userData?.customer_id || '',
    bps_id: userData?.bps_id || '',
    user_id: userData?.user_id || '',
    sp_process_id: userData?.sp_process_id || '',
    queue_id: userData?.queue_id || '',
  };

  // Queries
  const { data: recentData, isLoading: recentLoading, refetch: refetchRecent } = useGetRecentWorkflowsQuery(
    { ...baseParams, currentPage: recentPage, itemsPerPage: recentItemsPerPage },
    { skip: !userData }
  );

  const { data: pastDueData, isLoading: pastDueLoading, refetch: refetchPastDue } = useGetPastDueWorkflowsQuery(
    { ...baseParams, currentPage: pastDuePage, itemsPerPage: pastDueItemsPerPage },
    { skip: !userData }
  );

  const { data: pastDueCountData } = useGetPastDueCountQuery(baseParams, { skip: !userData });

  const { data: agingData, isLoading: agingLoading } = useGetYTDAuditDataQuery(
    { ...baseParams, currentPage: agingPage, itemsPerPage: 10 },
    { skip: !userData || activeMainTab !== 2 }
  );

  const { data: dinHistoryData, isLoading: dinHistoryLoading } = useGetDINHistoryQuery(
    { ...baseParams, din_number: selectedDIN || '' },
    { skip: !selectedDIN }
  );

  // Mutations
  const [searchRecent, { isLoading: searchingRecent }] = useSearchRecentWorkflowsMutation();
  const [searchPastDue, { isLoading: searchingPastDue }] = useSearchPastDueTasksMutation();
  const [searchAging] = useSearchYTDAuditDataMutation();
  const [searchInsightsCustom, { data: customInsightsData, isLoading: customInsightsLoading }] = useSearchInsightsCustomMutation();

  // Handlers
  const handleRecentSearch = useCallback(async (text: string) => {
    setSearchText(text);
    if (text.trim()) {
      await searchRecent({ ...baseParams, currentPage: 1, itemsPerPage: recentItemsPerPage, searchText: text });
    } else {
      refetchRecent();
    }
  }, [baseParams, recentItemsPerPage, searchRecent, refetchRecent]);

  const handlePastDueSearch = useCallback(async (text: string) => {
    setSearchText(text);
    if (text.trim()) {
      await searchPastDue({ ...baseParams, currentPage: 1, itemsPerPage: pastDueItemsPerPage, searchText: text });
    } else {
      refetchPastDue();
    }
  }, [baseParams, pastDueItemsPerPage, searchPastDue, refetchPastDue]);

  const handleAgingSearch = useCallback(async (text: string) => {
    if (text.trim()) {
      await searchAging({ ...baseParams, currentPage: 1, itemsPerPage: 10, searchText: text });
    }
  }, [baseParams, searchAging]);

  const handleCustomSearch = useCallback(async (text: string) => {
    if (customDateRange.startDate && customDateRange.endDate) {
      await searchInsightsCustom({
        ...baseParams,
        startDate: customDateRange.startDate,
        endDate: customDateRange.endDate,
        searchInput: text,
      });
    }
  }, [baseParams, customDateRange, searchInsightsCustom]);

  const handleRowClick = useCallback((workflow: RecentWorkflow | PastDueWorkflow) => {
    if ('file_name' in workflow && workflow.file_name) {
      setSelectedDIN(workflow.workflow_id);
      setShowTransactionModal(true);
    }
  }, []);

  const handleCopyFileName = useCallback((workflow: RecentWorkflow) => {
    if (workflow.file_name) {
      navigator.clipboard.writeText(workflow.file_name);
    }
  }, []);

  const handleRecentReset = useCallback(() => {
    setSearchText('');
    setRecentPage(1);
    refetchRecent();
  }, [refetchRecent]);

  const handlePastDueReset = useCallback(() => {
    setSearchText('');
    setPastDuePage(1);
    refetchPastDue();
  }, [refetchPastDue]);

  // Update transaction logs when DIN history loads
  if (dinHistoryData && dinHistoryData[0] && transactionLogs !== dinHistoryData[0]) {
    setTransactionLogs(dinHistoryData[0]);
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view tasks</p>
      </div>
    );
  }

  const currentTab = MAIN_TABS[activeMainTab]?.id || 'recent';

  return (
    <div className={`mt-[60px] px-6 py-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Task Management</h2>
        {(pastDueCountData?.[0]?.[0]?.count ?? 0) > 0 && (
          <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium">
            {pastDueCountData?.[0]?.[0]?.count ?? 0} Tasks Overdue
          </span>
        )}
      </div>

      {/* Main Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          {MAIN_TABS.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(index)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeMainTab === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.id === 'pastDue' && (pastDueCountData?.[0]?.[0]?.count ?? 0) > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                  {pastDueCountData?.[0]?.[0]?.count ?? 0}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {currentTab === 'recent' && (
          <RecentTasksTable
            data={recentData?.[0]}
            pagination={{
              currentPage: recentPage,
              itemsPerPage: recentItemsPerPage,
              totalItems: recentData?.[0]?.length || 0,
              totalPages: Math.ceil((recentData?.[0]?.length || 0) / recentItemsPerPage),
            }}
            isLoading={recentLoading || searchingRecent}
            searchText={searchText}
            onSearch={handleRecentSearch}
            onPageChange={setRecentPage}
            onItemsPerPageChange={(n) => { setRecentItemsPerPage(n); setRecentPage(1); }}
            onReset={handleRecentReset}
            onRowClick={handleRowClick}
            onCopyFileName={handleCopyFileName}
          />
        )}

        {currentTab === 'pastDue' && (
          <PastDueTasksTable
            data={pastDueData?.[0]}
            pagination={{
              currentPage: pastDuePage,
              itemsPerPage: pastDueItemsPerPage,
              totalItems: pastDueData?.[0]?.length || 0,
              totalPages: Math.ceil((pastDueData?.[0]?.length || 0) / pastDueItemsPerPage),
            }}
            isLoading={pastDueLoading || searchingPastDue}
            searchText={searchText}
            totalCount={pastDueCountData?.[0]?.[0]?.count || 0}
            onSearch={handlePastDueSearch}
            onPageChange={setPastDuePage}
            onItemsPerPageChange={(n) => { setPastDueItemsPerPage(n); setPastDuePage(1); }}
            onReset={handlePastDueReset}
            onRowClick={handleRowClick}
          />
        )}

        {currentTab === 'insights' && (
          <InsightsView
            activeSubTab={activeInsightsTab}
            onSubTabChange={setActiveInsightsTab}
            agingData={agingData?.[0]}
            agingPagination={{
              currentPage: agingPage,
              itemsPerPage: 10,
              totalItems: agingData?.[0]?.length || 0,
              totalPages: Math.ceil((agingData?.[0]?.length || 0) / 10),
            }}
            isAgingLoading={agingLoading}
            onAgingPageChange={setAgingPage}
            onAgingSearch={handleAgingSearch}
            customData={customInsightsData?.[0]}
            isCustomLoading={customInsightsLoading}
            dateRange={customDateRange}
            onDateRangeChange={setCustomDateRange}
            onCustomSearch={handleCustomSearch}
          />
        )}
      </div>

      {/* Transaction History Modal */}
      <TransactionHistoryModal
        isOpen={showTransactionModal}
        onClose={() => { setShowTransactionModal(false); setSelectedDIN(null); setTransactionLogs([]); }}
        dinNumber={selectedDIN}
        logs={transactionLogs}
        isLoading={dinHistoryLoading}
      />
    </div>
  );
};

export default BusinessTasksView;
