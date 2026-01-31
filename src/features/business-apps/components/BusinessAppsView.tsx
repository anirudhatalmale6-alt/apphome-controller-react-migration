/**
 * BusinessAppsView Component
 * Migrated from BusinessAppsController.js
 *
 * Layout:
 * - Left Sidebar: Dynamic BU tabs with expandable Queues and Actions (from load_bu_queue_actions API)
 * - Main Content: Recent/Past Due/Custom tabs with workflow data
 *
 * Key Features:
 * - Sidebar loads dynamically from API on page load
 * - User actions in sidebar drive main content area
 * - APIs triggered only on user action or tab click (lazy loading)
 * - Dynamic page layout driven by API responses (no hardcoded UI)
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAppSelector } from '../../../app/hooks';
import {
  useLoadBuQueueActionsQuery,
  useLazyLoadWorkflowInboxMenusQuery,
  useLazyLoadInboxSearchConfigQuery,
  useLazyLoadDinDashboardQuery,
  useLazyLoadPendingListQuery,
} from '../api/businessAppsApi';
import type {
  BuQueueAction,
  ParsedQueueItem,
  QueueProperty,
  WorkflowInboxConfigItem,
} from '../types/BusinessAppsTypes';

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
  const [selectedBuTabIndex, setSelectedBuTabIndex] = useState(0);
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
  const [searchAgainst, setSearchAgainst] = useState('All');
  const [searchCategories, setSearchCategories] = useState<string[]>([]);

  // Date range for Custom tab
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Workflow data
  const [workflowData, setWorkflowData] = useState<unknown[]>([]);
  const [workflowHeaders, setWorkflowHeaders] = useState<string[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  // Build base query params
  const baseParams = useMemo(() => {
    const userDataRecord = userData as unknown as Record<string, unknown>;
    return {
      customer_id: userDataRecord?.customer_id as string || '',
      bps_id: userDataRecord?.bps_id as string || '',
      user_id: userDataRecord?.user_id as string || '',
    };
  }, [userData]);

  // Load BU Queue Actions on page load
  const { data: buQueueActionsData, isLoading: isLoadingBuQueue } = useLoadBuQueueActionsQuery(
    {
      ...baseParams,
      pageNumber: 1,
      pageSize: 100,
    },
    { skip: !userData }
  );

  // Lazy queries for inbox menus and data
  const [loadInboxMenus, { isLoading: isLoadingMenus }] = useLazyLoadWorkflowInboxMenusQuery();
  const [loadSearchConfig] = useLazyLoadInboxSearchConfigQuery();
  const [loadDinDashboard, { isLoading: isLoadingDashboard }] = useLazyLoadDinDashboardQuery();
  const [loadPendingList, { isLoading: isLoadingPending }] = useLazyLoadPendingListQuery();

  // Parse BU tabs from API response
  const buTabs = useMemo(() => {
    if (!buQueueActionsData || !Array.isArray(buQueueActionsData)) return [];

    const tabs: { title: string; bu_id: string; tps_id: string; dept_id: string }[] = [];
    const seenTitles = new Set<string>();

    buQueueActionsData.forEach((item: BuQueueAction) => {
      if (item.bu_desc && !seenTitles.has(item.bu_desc)) {
        seenTitles.add(item.bu_desc);
        tabs.push({
          title: item.bu_desc,
          bu_id: item.bu_id,
          tps_id: item.tps_id,
          dept_id: item.dept_id,
        });
      }
    });

    return tabs;
  }, [buQueueActionsData]);

  // Parse queue items for current BU tab
  const queueItems = useMemo(() => {
    if (!buQueueActionsData || !Array.isArray(buQueueActionsData) || buTabs.length === 0) return [];

    const currentBu = buTabs[selectedBuTabIndex];
    if (!currentBu) return [];

    const items: ParsedQueueItem[] = [];
    let displayIdCounter = 0;

    buQueueActionsData.forEach((buItem: BuQueueAction) => {
      if (buItem.bu_desc === currentBu.title && buItem.queue_info) {
        buItem.queue_info.forEach((queue) => {
          const queueItem: ParsedQueueItem = {
            queue_id: queue.queue_id,
            QueueNames: queue.custom_queue_name,
            QueueProperties: [],
            display_id: displayIdCounter++,
          };

          // Parse workflow_inbox_config JSON
          try {
            const configData: WorkflowInboxConfigItem[] = JSON.parse(queue.workflow_inbox_config);
            let idCounter = 0;

            configData.forEach((configItem) => {
              Object.keys(configItem).forEach((key) => {
                if (key !== 'isActionEnabled' && key !== 'displayName' && key !== 'workflowName') {
                  const actionKey: QueueProperty = {
                    bPaaS_workflow_status: key.charAt(0).toUpperCase() + key.slice(1),
                    bPaaS_workflow_id: idCounter++,
                    count: 0,
                    displayName: configItem.displayName,
                    isActionEnabled: configItem.isActionEnabled,
                    inboxHeaders: configItem[key],
                    workflowName: configItem.workflowName,
                  };
                  queueItem.QueueProperties.push(actionKey);
                }
              });
            });
          } catch (e) {
            console.error('Error parsing workflow_inbox_config:', e);
          }

          items.push(queueItem);
        });
      }
    });

    return items;
  }, [buQueueActionsData, buTabs, selectedBuTabIndex]);

  // Initialize sidebar on first load
  useEffect(() => {
    if (queueItems.length > 0 && !selectedQueueName) {
      const firstQueue = queueItems[0];
      setExpandedQueues([firstQueue.QueueNames]);
      setSelectedQueueName(firstQueue.QueueNames);

      if (firstQueue.QueueProperties.length > 0) {
        const firstAction = firstQueue.QueueProperties[0];
        setSelectedAction(firstAction);
        handleActionClick(firstQueue, firstAction);
      }
    }
  }, [queueItems]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle BU tab change
  const handleBuTabChange = useCallback((index: number) => {
    setSelectedBuTabIndex(index);
    setExpandedQueues([]);
    setSelectedQueueName(null);
    setSelectedAction(null);
    setWorkflowData([]);
    setWorkflowHeaders([]);
  }, []);

  // Handle queue expand/collapse
  const toggleQueueExpand = useCallback((queueName: string) => {
    setExpandedQueues((prev) =>
      prev.includes(queueName)
        ? prev.filter((name) => name !== queueName)
        : [...prev, queueName]
    );
  }, []);

  // Handle action click - trigger APIs
  const handleActionClick = useCallback(async (queue: ParsedQueueItem, action: QueueProperty) => {
    setSelectedQueueName(queue.QueueNames);
    setSelectedAction(action);
    setCurrentPage(1);

    const currentBu = buTabs[selectedBuTabIndex];
    if (!currentBu) return;

    const params = {
      ...baseParams,
      bu_id: currentBu.bu_id,
      queue_id: queue.queue_id,
      dept_id: currentBu.dept_id,
      tps_id: currentBu.tps_id,
      bPaaS_workflow_status: action.bPaaS_workflow_status,
      workflow_name: action.workflowName,
    };

    try {
      // Load inbox menus to get configuration
      const menuResult = await loadInboxMenus(params).unwrap();

      if (menuResult && Array.isArray(menuResult) && menuResult[0]) {
        // Extract headers from workflow_inbox_config if available
        if (menuResult[0][0]?.workflow_inbox_config) {
          const config = JSON.parse(menuResult[0][0].workflow_inbox_config);
          if (config && config.length > 0 && action.inboxHeaders) {
            const headers = Array.isArray(action.inboxHeaders)
              ? action.inboxHeaders.map((h: { column_name?: string }) => h.column_name || '')
              : [];
            setWorkflowHeaders(headers);
          }
        }
      }

      // Load search config for categories
      const searchResult = await loadSearchConfig({
        ...baseParams,
        bu_id: currentBu.bu_id,
        queue_id: queue.queue_id,
      }).unwrap();

      if (searchResult && Array.isArray(searchResult) && searchResult[0]) {
        const categories = (searchResult[0] as unknown as Array<{ column_name?: string }>).map((item) =>
          item.column_name || ''
        ).filter(Boolean);
        setSearchCategories(categories);
      }

      // Load data based on active tab
      await loadDataForTab(activeTimelineTab, queue.queue_id, action.bPaaS_workflow_status);
    } catch (error) {
      console.error('Error loading inbox data:', error);
    }
  }, [baseParams, buTabs, selectedBuTabIndex, loadInboxMenus, loadSearchConfig, activeTimelineTab]);

  // Load data for specific tab
  const loadDataForTab = useCallback(async (tab: TimelineTab, queueId: string, status: string) => {
    const currentBu = buTabs[selectedBuTabIndex];
    if (!currentBu) return;

    const params = {
      ...baseParams,
      bu_id: currentBu.bu_id,
      queue_id: queueId,
      dept_id: currentBu.dept_id,
      tps_id: currentBu.tps_id,
      bPaaS_workflow_status: status,
      itemsPerPage,
      currentPage,
    };

    try {
      let result;

      if (tab === 'recent') {
        result = await loadDinDashboard(params).unwrap();
      } else if (tab === 'pastDue') {
        result = await loadPendingList(params).unwrap();
      } else if (tab === 'custom') {
        // For custom, we need date range
        if (startDate && endDate) {
          result = await loadDinDashboard({
            ...params,
            startDate,
            endDate,
          } as any).unwrap();
        }
      }

      if (result && Array.isArray(result)) {
        // First array is data, second is usually count/metadata
        const data = result[0] || [];
        const meta = result[1] || [];

        setWorkflowData(data);
        if ((meta[0] as Record<string, unknown>)?.total_count) {
          setTotalRecords((meta[0] as Record<string, unknown>).total_count as number);
        }
      }
    } catch (error) {
      console.error('Error loading workflow data:', error);
      setWorkflowData([]);
    }
  }, [baseParams, buTabs, selectedBuTabIndex, itemsPerPage, currentPage, startDate, endDate, loadDinDashboard, loadPendingList]);

  // Handle timeline tab change
  const handleTimelineTabChange = useCallback((tab: TimelineTab) => {
    setActiveTimelineTab(tab);
    setCurrentPage(1);

    if (selectedAction && queueItems.find(q => q.QueueNames === selectedQueueName)) {
      const queue = queueItems.find(q => q.QueueNames === selectedQueueName);
      if (queue) {
        loadDataForTab(tab, queue.queue_id, selectedAction.bPaaS_workflow_status);
      }
    }
  }, [selectedAction, selectedQueueName, queueItems, loadDataForTab]);

  // Handle search
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // Trigger search API here
  }, []);

  // Handle custom date search
  const handleCustomSearch = useCallback(() => {
    if (startDate && endDate && selectedAction) {
      const queue = queueItems.find(q => q.QueueNames === selectedQueueName);
      if (queue) {
        loadDataForTab('custom', queue.queue_id, selectedAction.bPaaS_workflow_status);
      }
    }
  }, [startDate, endDate, selectedAction, selectedQueueName, queueItems, loadDataForTab]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    if (selectedAction) {
      const queue = queueItems.find(q => q.QueueNames === selectedQueueName);
      if (queue) {
        loadDataForTab(activeTimelineTab, queue.queue_id, selectedAction.bPaaS_workflow_status);
      }
    }
  }, [selectedAction, selectedQueueName, queueItems, activeTimelineTab, loadDataForTab]);

  const isLoading = isLoadingBuQueue || isLoadingMenus || isLoadingDashboard || isLoadingPending;

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view apps</p>
      </div>
    );
  }

  if (isLoadingBuQueue) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Render sidebar with dynamic queues
  const renderSidebar = () => (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-600 uppercase">Queues</h3>
      </div>

      {queueItems.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">No queues available</div>
      ) : (
        queueItems.map((queue) => (
          <div key={queue.queue_id}>
            <button
              onClick={() => toggleQueueExpand(queue.QueueNames)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-gray-50 ${
                selectedQueueName === queue.QueueNames ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 transition-transform ${expandedQueues.includes(queue.QueueNames) ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {queue.QueueNames}
              </div>
            </button>

            {expandedQueues.includes(queue.QueueNames) && queue.QueueProperties.length > 0 && (
              <div className="pl-6 bg-gray-50">
                {queue.QueueProperties.map((action) => (
                  <button
                    key={`${queue.queue_id}-${action.bPaaS_workflow_id}`}
                    onClick={() => handleActionClick(queue, action)}
                    disabled={!action.isActionEnabled}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm ${
                      selectedAction?.bPaaS_workflow_id === action.bPaaS_workflow_id &&
                      selectedQueueName === queue.QueueNames
                        ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600'
                        : action.isActionEnabled
                          ? 'text-gray-600 hover:bg-gray-100'
                          : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{action.bPaaS_workflow_status}</span>
                    {action.count > 0 && (
                      <span className="text-blue-600 font-medium">{action.count}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </aside>
  );

  // Render workflow table
  const renderWorkflowTable = () => {
    const headers = workflowHeaders.length > 0
      ? workflowHeaders
      : ['Actions', 'Activity Date', 'Batch ID', 'File Name'];

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {workflowData.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-500">
                  {isLoading ? 'Loading...' : 'No data available'}
                </td>
              </tr>
            ) : (
              workflowData.map((row: any, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50">
                  {headers.map((header, colIdx) => (
                    <td key={colIdx} className="px-4 py-3 text-sm text-gray-900">
                      {colIdx === 0 ? (
                        <div className="flex gap-2">
                          <button className="text-gray-400 hover:text-blue-600" title="Refresh">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button className="text-gray-400 hover:text-blue-600" title="Open">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        row[header.toLowerCase().replace(/ /g, '_')] || row[header] || '-'
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar with Dynamic Queues */}
      {renderSidebar()}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with BU Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-light text-blue-600">
              <span className="text-blue-800">one</span>base
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Selected TimeZone: Asia/Calcutta - {new Date().toISOString().split('T')[0]}</span>
              <span className="text-blue-600">{(userData as unknown as Record<string, unknown>)?.user_name as string || 'Digital User'} ▼</span>
            </div>
          </div>

          {/* Dynamic BU Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200">
            <nav className="flex gap-6">
              {buTabs.map((tab, index) => (
                <button
                  key={tab.bu_id}
                  onClick={() => handleBuTabChange(index)}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    selectedBuTabIndex === index
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </nav>
            <span className="text-blue-600 text-sm cursor-pointer">⟲ Business Process</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Timeline Tabs */}
          <div className="flex gap-6 mb-4 border-b border-gray-200">
            {TIMELINE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTimelineTabChange(tab.id)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTimelineTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Custom Tab Date Range */}
          {activeTimelineTab === 'custom' && (
            <div className="flex items-center gap-4 mb-4 p-4 bg-white rounded-lg shadow">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <button
                onClick={handleCustomSearch}
                className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          )}

          {/* Search Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-blue-600">
              {activeTimelineTab === 'recent' ? 'Last 10 Transactions' :
               activeTimelineTab === 'pastDue' ? 'Past Due Items' : 'Custom Search Results'}
            </h3>
            <div className="flex items-center gap-4">
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">All</button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Search Against</span>
                <select
                  value={searchAgainst}
                  onChange={(e) => setSearchAgainst(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="All">All</option>
                  {searchCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
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
          </div>

          {/* Workflow Table */}
          {renderWorkflowTable()}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>entries per page</span>
              </div>
              <span className="text-gray-500">
                Showing {workflowData.length} of {totalRecords} entries
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Go to page:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded"
                />
                <span>of {totalPages}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  «
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  ‹
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  ›
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage >= totalPages}
                  className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  »
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessAppsView;
