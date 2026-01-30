/**
 * BusinessHomeView Component
 * Dashboard with Batch Inventory, Invoice Inventory, Performance tabs
 * Year To Date Overview with stats cards, bar chart, and donut chart
 */
import { useState, useCallback } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { useBusinessHomeState } from '../hooks/useBusinessHomeState';

interface BusinessHomeViewProps {
  className?: string;
}

type TabType = 'batch' | 'invoice' | 'performance';

const TABS: { id: TabType; label: string }[] = [
  { id: 'batch', label: 'Batch Inventory' },
  { id: 'invoice', label: 'Invoice Inventory' },
  { id: 'performance', label: 'Performance' },
];

// Stats card data structure
interface StatCard {
  value: string;
  label: string;
}

// Mock data for demonstration - will be replaced by API data
const STATS_CARDS: StatCard[] = [
  { value: '0% (0)', label: 'Processed Same Day' },
  { value: '0% (0)', label: 'Processed Same Week' },
  { value: '16.7% (1)', label: 'Processed Same Month' },
  { value: '16.7% (1)', label: 'Posted on Time' },
  { value: '83.3% (5)', label: 'Backlog' },
];

// Bar chart data structure
interface MonthData {
  month: string;
  inflow: number;
  processed: number;
}

const MONTH_DATA: MonthData[] = [
  { month: 'Jan', inflow: 6, processed: 0 },
  { month: 'Feb', inflow: 0, processed: 0 },
  { month: 'Mar', inflow: 0, processed: 0 },
  { month: 'Apr', inflow: 0, processed: 0 },
  { month: 'May', inflow: 0, processed: 0 },
  { month: 'Jun', inflow: 0, processed: 0 },
  { month: 'Jul', inflow: 0, processed: 0 },
  { month: 'Aug', inflow: 0, processed: 0 },
  { month: 'Sep', inflow: 0, processed: 0 },
  { month: 'Oct', inflow: 0, processed: 0 },
  { month: 'Nov', inflow: 0, processed: 0 },
  { month: 'Dec', inflow: 0, processed: 0 },
];

export const BusinessHomeView: React.FC<BusinessHomeViewProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState(0);
  const auth = useAppSelector((state) => state.auth);
  const userData = auth.user;

  const {
    isLoading,
    isBatchLoading: _isBatchLoading,
    isInvoiceLoading,
    batchOverviewData: _batchOverviewData,
    batch30_60_90Data: _batch30_60_90Data,
    invoiceOverviewData,
    handleRefreshDashboard: _handleRefreshDashboard,
  } = useBusinessHomeState({
    customerId: userData?.customer_id || '',
    bpsId: userData?.bps_id || '',
    userId: userData?.user_id || '',
    spProcessId: userData?.sp_process_id || '',
  });

  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  // Calculate max value for bar chart scaling
  const maxValue = Math.max(...MONTH_DATA.map(d => Math.max(d.inflow, d.processed)), 1);

  const renderBatchInventory = () => (
    <div className="space-y-6">
      {/* Year To Date Overview Header */}
      <h2 className="text-xl font-semibold text-gray-800">Year To Date Overview</h2>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-5 gap-4">
        {STATS_CARDS.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-lg">
          <div className="h-64 flex items-end justify-between gap-1">
            {MONTH_DATA.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="flex gap-0.5 items-end h-48 w-full justify-center">
                  {/* Inflow bar */}
                  <div
                    className="w-3 bg-blue-400 rounded-t"
                    style={{ height: `${(data.inflow / maxValue) * 100}%`, minHeight: data.inflow > 0 ? '4px' : '0' }}
                  />
                  {/* Processed bar */}
                  <div
                    className="w-3 bg-green-400 rounded-t"
                    style={{ height: `${(data.processed / maxValue) * 100}%`, minHeight: data.processed > 0 ? '4px' : '0' }}
                  />
                </div>
                {data.inflow > 0 && (
                  <span className="text-xs text-blue-500 -mt-1">{data.inflow}</span>
                )}
                <span className="text-xs text-gray-500 mt-1">{data.month}</span>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded" />
              <span className="text-sm text-gray-600">Inflow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded" />
              <span className="text-sm text-gray-600">Processed</span>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-4 rounded-lg flex items-center justify-center">
          <div className="relative">
            {/* SVG Donut Chart */}
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle cx="100" cy="100" r="70" fill="none" stroke="#e5e7eb" strokeWidth="30" />
              {/* Inflow segment (50% - blue) */}
              <circle
                cx="100" cy="100" r="70"
                fill="none" stroke="#60a5fa" strokeWidth="30"
                strokeDasharray="220 440"
                strokeDashoffset="0"
                transform="rotate(-90 100 100)"
              />
              {/* Processed segment (8.3% - green) */}
              <circle
                cx="100" cy="100" r="70"
                fill="none" stroke="#4ade80" strokeWidth="30"
                strokeDasharray="37 440"
                strokeDashoffset="-220"
                transform="rotate(-90 100 100)"
              />
              {/* Pending segment (41.7% - orange) */}
              <circle
                cx="100" cy="100" r="70"
                fill="none" stroke="#fb923c" strokeWidth="30"
                strokeDasharray="183 440"
                strokeDashoffset="-257"
                transform="rotate(-90 100 100)"
              />
            </svg>
            {/* Labels */}
            <div className="absolute top-2 right-0 text-xs">
              <span className="text-gray-600">5</span>
              <div className="text-gray-500">(41.7%)</div>
            </div>
            <div className="absolute bottom-8 right-0 text-xs">
              <span className="text-gray-600">6</span>
              <div className="text-gray-500">(50%)</div>
            </div>
            <div className="absolute bottom-0 left-8 text-xs">
              <span className="text-gray-600">1</span>
              <div className="text-gray-500">(8.3%)</div>
            </div>
          </div>
          {/* Donut Legend */}
          <div className="ml-8 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full" />
              <span className="text-sm text-gray-600">Inflow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full" />
              <span className="text-sm text-gray-600">Processed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvoiceInventory = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Invoice Inventory</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500">Invoice inventory data will be displayed here based on API response.</p>
        {isInvoiceLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : invoiceOverviewData ? (
          <pre className="mt-4 text-sm">{JSON.stringify(invoiceOverviewData, null, 2)}</pre>
        ) : (
          <p className="mt-4 text-gray-400">No data available</p>
        )}
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Performance</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500">Performance metrics will be displayed here based on API response.</p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    const currentTab = TABS[activeTab]?.id || 'batch';
    switch (currentTab) {
      case 'batch':
        return renderBatchInventory();
      case 'invoice':
        return renderInvoiceInventory();
      case 'performance':
        return renderPerformance();
      default:
        return null;
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view the dashboard</p>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header with timezone and user */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-light text-blue-600">
          <span className="text-blue-800">one</span>base
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Selected TimeZone: Asia/Calcutta - {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString()}</span>
          <span className="text-blue-600">{userData?.user_name || 'Digital User'} ▼</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
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

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Tab Content */}
      <div className="min-h-[400px]">{renderTabContent()}</div>
    </div>
  );
};

export default BusinessHomeView;
