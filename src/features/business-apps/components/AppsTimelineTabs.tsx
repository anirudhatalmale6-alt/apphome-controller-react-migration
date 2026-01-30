import { useBusinessAppsState } from '../hooks/useBusinessAppsState';
import { AGING_FILTERS } from '../types/BusinessAppsTypes';

const VIEW_TABS = [
  { id: 'recent', label: 'Recent', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'pastDue', label: 'Past Due', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { id: 'custom', label: 'Custom', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'upload', label: 'Upload', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
] as const;

export function AppsTimelineTabs() {
  const {
    currentView,
    selectedAgingFilter,
    dateRange,
    handleChangeView,
    handleAgingFilterChange,
    handleDateRangeChange,
  } = useBusinessAppsState();

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Main View Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChangeView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Aging Filters (for Recent view) */}
      {currentView === 'recent' && (
        <div className="flex items-center gap-2 border-t border-gray-200 pt-4">
          <span className="text-sm text-gray-500">Aging:</span>
          <button
            onClick={() => handleAgingFilterChange('')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedAgingFilter === ''
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {AGING_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleAgingFilterChange(filter.value)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedAgingFilter === filter.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Date Range (for Custom view) */}
      {currentView === 'custom' && (
        <div className="flex items-center gap-4 border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">From:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                handleDateRangeChange({ ...dateRange, startDate: e.target.value })
              }
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">To:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                handleDateRangeChange({ ...dateRange, endDate: e.target.value })
              }
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              // Trigger search with date range
            }}
            className="px-4 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
