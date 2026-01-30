/**
 * BusinessHomeView Component
 * Main dashboard view combining all analytics components
 * Migrated from BusinessHomeViews.js controller
 */
import { useCallback } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { useBusinessHomeState } from '../hooks/useBusinessHomeState';
import { DashboardCards } from './DashboardCards';
import { YTDPendingChart } from './YTDPendingChart';
import { ExceptionsTable } from './ExceptionsTable';
import { BatchInventoryChart, InvoiceInventoryChart } from './InventoryCharts';
import { AgentsTable } from './AgentsTable';

interface BusinessHomeViewProps {
  className?: string;
}

type TabType = 'overview' | 'exceptions' | 'batch' | 'invoice' | 'agents';

const TABS: { id: TabType; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'exceptions', label: 'Business Exceptions' },
  { id: 'batch', label: 'Batch Inventory' },
  { id: 'invoice', label: 'Invoice Inventory' },
  { id: 'agents', label: 'Agent Performance' },
];

export const BusinessHomeView: React.FC<BusinessHomeViewProps> = ({ className = '' }) => {
  const auth = useAppSelector((state) => state.auth);
  const userData = auth.user;

  const {
    activeTab,
    businessExceptionsPagination,
    agentsPagination,
    searchFilters,
    isLoading,
    isTasksLoading,
    isExceptionsLoading,
    isBatchLoading,
    isInvoiceLoading,
    isAgentsLoading,
    tasksData,
    ytdPending30_60_90Data,
    exceptionsData,
    batchOverviewData,
    batch30_60_90Data,
    invoiceOverviewData,
    agentsData,
    handleTabChange,
    handleSearch,
    handleExceptionsPageChange,
    handleExceptionsItemsPerPageChange,
    handleAgentsPageChange,
    handleAgentsItemsPerPageChange,
    handleResetFilters,
    handleRefreshDashboard,
  } = useBusinessHomeState({
    customerId: userData?.customer_id || '',
    bpsId: userData?.bps_id || '',
    userId: userData?.user_id || '',
    spProcessId: userData?.sp_process_id || '',
  });

  const renderTabContent = useCallback(() => {
    const currentTab = TABS[activeTab]?.id || 'overview';

    switch (currentTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DashboardCards data={tasksData || null} isLoading={isTasksLoading} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <YTDPendingChart
                data={ytdPending30_60_90Data?.[0] || null}
                isLoading={isLoading}
                onRefresh={handleRefreshDashboard}
              />
              <BatchInventoryChart
                overviewData={batchOverviewData || null}
                agingData={batch30_60_90Data || null}
                isLoading={isBatchLoading}
              />
            </div>
            <InvoiceInventoryChart data={invoiceOverviewData || null} isLoading={isInvoiceLoading} />
          </div>
        );

      case 'exceptions':
        return (
          <ExceptionsTable
            data={exceptionsData}
            pagination={businessExceptionsPagination}
            isLoading={isExceptionsLoading}
            searchText={searchFilters.searchText}
            onSearch={handleSearch}
            onPageChange={handleExceptionsPageChange}
            onItemsPerPageChange={handleExceptionsItemsPerPageChange}
            onReset={handleResetFilters}
          />
        );

      case 'batch':
        return (
          <BatchInventoryChart
            overviewData={batchOverviewData || null}
            agingData={batch30_60_90Data || null}
            isLoading={isBatchLoading}
          />
        );

      case 'invoice':
        return <InvoiceInventoryChart data={invoiceOverviewData || null} isLoading={isInvoiceLoading} />;

      case 'agents':
        return (
          <AgentsTable
            data={agentsData}
            pagination={agentsPagination}
            isLoading={isAgentsLoading}
            onPageChange={handleAgentsPageChange}
            onItemsPerPageChange={handleAgentsItemsPerPageChange}
          />
        );

      default:
        return null;
    }
  }, [
    activeTab,
    tasksData,
    isTasksLoading,
    ytdPending30_60_90Data,
    isLoading,
    handleRefreshDashboard,
    batchOverviewData,
    batch30_60_90Data,
    isBatchLoading,
    invoiceOverviewData,
    isInvoiceLoading,
    exceptionsData,
    businessExceptionsPagination,
    isExceptionsLoading,
    searchFilters.searchText,
    handleSearch,
    handleExceptionsPageChange,
    handleExceptionsItemsPerPageChange,
    handleResetFilters,
    agentsData,
    agentsPagination,
    isAgentsLoading,
    handleAgentsPageChange,
    handleAgentsItemsPerPageChange,
  ]);

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view the dashboard</p>
      </div>
    );
  }

  return (
    <div className={`Homecontainer mt-[60px] px-6 py-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Business Dashboard</h2>
        <button
          onClick={handleRefreshDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(index)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">{renderTabContent()}</div>
    </div>
  );
};

export default BusinessHomeView;
