/**
 * BusinessAppsView Component
 * Migrated from BusinessAppsController.js
 *
 * Layout:
 * - Left Sidebar: Dynamic queues with expandable actions
 * - Main Content: Recent/Past Due/Custom tabs with workflow data
 *
 * Uses RTK Query hooks from businessAppsApi.ts for all API calls
 */
import { useState, useCallback, useMemo } from 'react';
import { useAppSelector } from '../../../app/hooks';
import {
  useLoadBuQueueActionsQuery,
} from '../api/businessAppsApi';
import type { QueueItem, QueueProperty, Workflow } from '../types/BusinessAppsTypes';

type TimelineTab = 'recent' | 'pastDue' | 'custom';

const TIMELINE_TABS: { id: TimelineTab; label: string }[] = [
  { id: 'recent', label: 'Recent' },
  { id: 'pastDue', label: 'Past Due' },
  { id: 'custom', label: 'Custom' },
];

export function BusinessAppsView() {
  const auth = useAppSelector((state) => state.auth);
  const userData = auth.user;

  // Tab states
  const [activeTimelineTab, setActiveTimelineTab] = useState<TimelineTab>('recent');

  // Sidebar states
  const [expandedQueues, setExpandedQueues] = useState<string[]>([]);
  const [selectedQueueName, setSelectedQueueName] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<QueueProperty | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search
  const [searchText, setSearchText] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');

  // Date range for Custom tab
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Workflow data (mock for now since API types are complex)
  const [workflowData, setWorkflowData] = useState<Workflow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Build base query params
  const baseParams = useMemo(() => ({
    customer_id: (userData?.customer_id as string) || '',
    bps_id: (userData?.bps_id as string) || '',
    user_id: (userData?.user_id as string) || '',
    pageNumber: 1,
    pageSize: 100,
  }), [userData]);

  // Load BU Queue Actions on page load
  const { data: buQueueActionsData, isLoading: isLoadingBuQueue } = useLoadBuQueueActionsQuery(
    baseParams,
    { skip: !userData }
  );

  // Process queue items from API response
  const queueItems = useMemo<QueueItem[]>(() => {
    if (!buQueueActionsData || !Array.isArray(buQueueActionsData)) return [];
    return buQueueActionsData;
  }, [buQueueActionsData]);

  // Toggle queue expansion
  const toggleQueueExpansion = useCallback((queueName: string) => {
    setExpandedQueues(prev =>
      prev.includes(queueName)
        ? prev.filter(q => q !== queueName)
        : [...prev, queueName]
    );
  }, []);

  // Handle action selection
  const handleActionSelect = useCallback((action: QueueProperty, queueName: string) => {
    setSelectedQueueName(queueName);
    setSelectedAction(action);
    setIsLoadingData(true);

    // Simulate loading data (actual API calls would go here)
    setTimeout(() => {
      setWorkflowData([]);
      setTotalRecords(0);
      setIsLoadingData(false);
    }, 500);
  }, []);

  // Handle timeline tab change
  const handleTimelineTabChange = useCallback((tab: TimelineTab) => {
    setActiveTimelineTab(tab);
    setCurrentPage(1);
    setWorkflowData([]);
  }, []);

  // Handle custom date load
  const handleLoadCustomData = useCallback(() => {
    if (!startDate || !endDate) return;
    setIsLoadingData(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoadingData(false);
    }, 500);
  }, [startDate, endDate]);

  // Handle search
  const handleSearch = useCallback(() => {
    if (!searchText.trim()) return;
    setIsLoadingData(true);
    // Simulate search
    setTimeout(() => {
      setIsLoadingData(false);
    }, 500);
  }, [searchText]);

  // Calculate total pages
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view apps</p>
      </div>
    );
  }

  // Render sidebar
  const renderSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Queues</h3>
      </div>

      {isLoadingBuQueue ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="py-2">
          {queueItems.map((queue, queueIdx) => (
            <div key={queueIdx} className="mb-1">
              <button
                onClick={() => toggleQueueExpansion(queue.QueueNames)}
                className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${
                  selectedQueueName === queue.QueueNames
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{queue.QueueNames}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedQueues.includes(queue.QueueNames) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedQueues.includes(queue.QueueNames) && queue.QueueProperties && (
                <div className="bg-gray-50 pl-6">
                  {queue.QueueProperties.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionSelect(action, queue.QueueNames)}
                      className={`w-full px-4 py-1.5 text-left text-xs flex items-center justify-between ${
                        selectedAction?.displayName === action.displayName && selectedQueueName === queue.QueueNames
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{action.displayName}</span>
                      {action.count > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                          {action.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {queueItems.length === 0 && (
            <p className="px-4 py-2 text-sm text-gray-500">No queues available</p>
          )}
        </div>
      )}
    </div>
  );

  // Render search bar
  const renderSearchBar = () => (
    <div className="flex items-center gap-4 mb-4">
      <select
        value={searchCategory}
        onChange={(e) => setSearchCategory(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded text-sm"
      >
        <option value="All">All</option>
        <option value="BatchID">Batch ID</option>
        <option value="TransactionID">Transaction ID</option>
      </select>
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search..."
        className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded text-sm"
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        Search
      </button>
    </div>
  );

  // Render pagination
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
        <span>Total: {totalRecords}</span>
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

  // Render main content
  const renderMainContent = () => (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-light text-blue-600">
          <span className="text-blue-800 font-semibold">one</span>base
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Selected TimeZone: Asia/Calcutta - {new Date().toISOString().split('T')[0]}</span>
          <span className="text-blue-600">{userData?.user_name || 'Digital User'} ▼</span>
        </div>
      </div>

      {/* Timeline Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-4">
        {TIMELINE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTimelineTabChange(tab.id)}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTimelineTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Custom tab date range */}
      {activeTimelineTab === 'custom' && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
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
              onClick={handleLoadCustomData}
              disabled={!startDate || !endDate}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Load Data
            </button>
          </div>
        </div>
      )}

      {/* Search bar */}
      {renderSearchBar()}

      {/* Content area */}
      {!selectedAction ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          Select a queue action from the sidebar to view workflows
        </div>
      ) : isLoadingData ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : workflowData.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          No workflows found for "{selectedAction.displayName}"
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Queue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {workflowData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
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
                  <td className="px-4 py-3 text-sm text-gray-900">{item.BatchID || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.TransactionID || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.Queue || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.ActivityDate || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full bg-gray-100">
      {renderSidebar()}
      {renderMainContent()}
    </div>
  );
}

export default BusinessAppsView;
