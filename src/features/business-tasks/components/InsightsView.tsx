/**
 * InsightsView Component
 * Insights tab with Aging (YTD) and Custom sub-tabs
 * Migrated from BusinessTasksController.js insightsSelectTab
 */
import { useState } from 'react';
import type { YTDAuditData, InsightsCustomData, PaginationState, DateRange } from '../types/BusinessTasksTypes';

interface InsightsViewProps {
  activeSubTab: number;
  onSubTabChange: (index: number) => void;
  // Aging (YTD) data
  agingData: YTDAuditData[] | undefined;
  agingPagination: PaginationState;
  isAgingLoading: boolean;
  onAgingPageChange: (page: number) => void;
  onAgingSearch: (text: string) => void;
  // Custom insights data
  customData: InsightsCustomData[] | undefined;
  isCustomLoading: boolean;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onCustomSearch: (text: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  activeSubTab,
  onSubTabChange,
  agingData,
  agingPagination,
  isAgingLoading,
  onAgingPageChange,
  onAgingSearch,
  customData,
  isCustomLoading,
  dateRange,
  onDateRangeChange,
  onCustomSearch,
}) => {
  const [agingSearchText, setAgingSearchText] = useState('');
  const [customSearchText, setCustomSearchText] = useState('');

  const subTabs = [
    { id: 'aging', label: 'Aging (YTD)' },
    { id: 'custom', label: 'Custom' },
  ];

  const handleAgingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onAgingSearch(agingSearchText);
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onCustomSearch(customSearchText);
  };

  const { currentPage, totalItems, totalPages } = agingPagination;

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Sub-tabs */}
      <div className="border-b border-gray-200 px-4">
        <nav className="flex gap-4">
          {subTabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => onSubTabChange(index)}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeSubTab === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Aging (YTD) Tab Content */}
      {activeSubTab === 0 && (
        <div className="p-4">
          <form onSubmit={handleAgingSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              value={agingSearchText}
              onChange={(e) => setAgingSearchText(e.target.value)}
              placeholder="Search YTD audit data..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Search
            </button>
          </form>

          <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#e3f2fd] sticky top-0">
                <tr>
                  <th className="text-left p-2 border-b border-gray-300">Date</th>
                  <th className="text-left p-2 border-b border-gray-300">Action</th>
                  <th className="text-left p-2 border-b border-gray-300">User</th>
                  <th className="text-right p-2 border-b border-gray-300">30 Days</th>
                  <th className="text-right p-2 border-b border-gray-300">60 Days</th>
                  <th className="text-right p-2 border-b border-gray-300">90 Days</th>
                  <th className="text-left p-2 border-b border-gray-300">Details</th>
                </tr>
              </thead>
              <tbody>
                {isAgingLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="p-2 border-b border-gray-200">
                          <div className="h-4 bg-gray-200 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : agingData && agingData.length > 0 ? (
                  agingData.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="p-2 border-b border-gray-200">{item.date}</td>
                      <td className="p-2 border-b border-gray-200">{item.action}</td>
                      <td className="p-2 border-b border-gray-200">{item.user}</td>
                      <td className="p-2 border-b border-gray-200 text-right">{item.count_30}</td>
                      <td className="p-2 border-b border-gray-200 text-right">{item.count_60}</td>
                      <td className="p-2 border-b border-gray-200 text-right">{item.count_90}</td>
                      <td className="p-2 border-b border-gray-200 max-w-[200px] truncate">{item.details}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({totalItems} total)
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => onAgingPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-100"
              >
                Prev
              </button>
              <button
                onClick={() => onAgingPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Tab Content */}
      {activeSubTab === 1 && (
        <div className="p-4">
          {/* Date Range Selector */}
          <div className="flex gap-4 mb-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => onDateRangeChange({ ...dateRange, startDate: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => onDateRangeChange({ ...dateRange, endDate: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <form onSubmit={handleCustomSearch} className="flex gap-2 flex-1">
              <input
                type="text"
                value={customSearchText}
                onChange={(e) => setCustomSearchText(e.target.value)}
                placeholder="Search insights..."
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Custom Insights Table */}
          <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#e8f5e9] sticky top-0">
                <tr>
                  <th className="text-left p-2 border-b border-gray-300">Metric Name</th>
                  <th className="text-right p-2 border-b border-gray-300">Value</th>
                  <th className="text-left p-2 border-b border-gray-300">Period</th>
                  <th className="text-left p-2 border-b border-gray-300">Trend</th>
                </tr>
              </thead>
              <tbody>
                {isCustomLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(4)].map((_, j) => (
                        <td key={j} className="p-2 border-b border-gray-200">
                          <div className="h-4 bg-gray-200 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : customData && customData.length > 0 ? (
                  customData.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="p-2 border-b border-gray-200">{item.metric_name}</td>
                      <td className="p-2 border-b border-gray-200 text-right font-medium">{item.metric_value.toLocaleString()}</td>
                      <td className="p-2 border-b border-gray-200">{item.period}</td>
                      <td className="p-2 border-b border-gray-200">
                        <span className={`inline-flex items-center gap-1 ${
                          item.trend === 'up' ? 'text-green-600' :
                          item.trend === 'down' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {item.trend === 'up' && '↑'}
                          {item.trend === 'down' && '↓'}
                          {item.trend === 'stable' && '→'}
                          {item.trend}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      Select a date range and search to view insights
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsView;
