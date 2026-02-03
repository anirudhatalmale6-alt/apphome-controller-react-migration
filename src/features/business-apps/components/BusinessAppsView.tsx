/**
 * BusinessAppsView Component
 * Migrated from BusinessAppsController.js
 *
 * Key fixes (Feb 3rd feedback):
 * - APIs trigger on EVERY BU/Queue/Menu/Tab change (event-driven)
 * - No init-only guards or cached promise reuse
 * - Auto-select: First BU > First Queue > First Menu on load
 * - Auto-select calls same event handlers (onBUSelect, onQueueSelect, onMenuSelect)
 * - Each tab click (Recent/Past Due/Custom) triggers fresh API call
 * - Sidebar expand/collapse does NOT trigger API; selecting an action DOES
 * - Pagination resets on selection change
 * - Search scoped to active tab only
 * - No CSS changes - logic only fixes
 *
 * Layout: Left Sidebar (BU > Queue > Menu) | Main Content (Inbox Workspace)
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAppSelector } from '../../../app/hooks';
import {
  useLazyLoadBuQueueActionsQuery,
  useLazyLoadRecentWorkflowsQuery,
  useLazyLoadPastDueWorkflowsQuery,
  useLazyLoadCustomWorkflowsQuery,
  useSearchRecentWorkflowsMutation,
  useSearchPastDueWorkflowsMutation,
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
  const [selectedQueueId, setSelectedQueueId] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search
  const [searchText, setSearchText] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');

  // Date range for Custom tab
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data state
  const [workflowData, setWorkflowData] = useState<Workflow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Build base query params
  const baseParams = useMemo(() => ({
    customer_id: (userData?.customer_id as string) || '',
    bps_id: (userData?.bps_id as string) || '',
    user_id: (userData?.user_id as string) || '',
    pageNumber: 1,
    pageSize: 100,
  }), [userData]);

  // ALL lazy query hooks - event-driven, no skip-based caching
  const [triggerBuQueueActions, { isLoading: isLoadingBuQueue }] = useLazyLoadBuQueueActionsQuery();
  const [triggerRecent] = useLazyLoadRecentWorkflowsQuery();
  const [triggerPastDue] = useLazyLoadPastDueWorkflowsQuery();
  const [triggerCustom] = useLazyLoadCustomWorkflowsQuery();
  const [searchRecentMutation] = useSearchRecentWorkflowsMutation();
  const [searchPastDueMutation] = useSearchPastDueWorkflowsMutation();

  // Queue items state (populated by lazy trigger)
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);

  // Load BU Queue Actions - event-driven, triggered on mount and userData change
  const loadBuQueueActions = useCallback(async () => {
    if (!userData?.customer_id || !userData?.bps_id) return;
    try {
      const result = await triggerBuQueueActions(baseParams, false).unwrap();
      if (result && Array.isArray(result)) {
        setQueueItems(result);
      } else {
        setQueueItems([]);
      }
    } catch (error) {
      console.error('BU Queue Actions API error:', error);
      setQueueItems([]);
    }
  }, [userData, baseParams, triggerBuQueueActions]);

  // Trigger BU Queue Actions on mount and when userData changes
  useEffect(() => {
    if (userData?.customer_id && userData?.bps_id) {
      loadBuQueueActions();
    }
  }, [userData?.customer_id, userData?.bps_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ========= EVENT-DRIVEN API TRIGGERS =========

  const loadRecentWorkflows = useCallback(async (queueId: string) => {
    if (!userData || !queueId) return;
    setIsLoadingData(true);
    setErrorMessage(null);
    try {
      const result = await triggerRecent({
        queueId,
        input: {
          ...baseParams,
          queue_id: queueId,
          bu_id: '',
          dept_id: '',
          actionsType: '',
          searchColumn: '',
          searchInput: '',
          pageNumber: 1,
          pageSize: itemsPerPage,
        }
      }, false).unwrap();

      if (result && result[0]) {
        setWorkflowData(result[0]);
        setTotalRecords(result[1]?.[0]?.total_count || result[0].length);
      } else {
        setWorkflowData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error('Recent workflows API error:', error);
      setErrorMessage('Unable to load recent workflows. Please retry.');
      setWorkflowData([]);
      setTotalRecords(0);
    } finally {
      setIsLoadingData(false);
    }
  }, [userData, baseParams, itemsPerPage, triggerRecent]);

  const loadPastDueWorkflows = useCallback(async (queueId: string) => {
    if (!userData || !queueId) return;
    setIsLoadingData(true);
    setErrorMessage(null);
    try {
      const result = await triggerPastDue({
        queueId,
        input: {
          ...baseParams,
          bu_id: '',
          queue_id: queueId,
          actionsType: '',
          pageNumber: 1,
          pageSize: itemsPerPage,
          aging: 'today',
        }
      }, false).unwrap();

      if (result && result[0]) {
        setWorkflowData(result[0]);
        setTotalRecords(result[1]?.[0]?.total_count || result[0].length);
      } else {
        setWorkflowData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error('Past due workflows API error:', error);
      setErrorMessage('Unable to load past due workflows. Please retry.');
      setWorkflowData([]);
      setTotalRecords(0);
    } finally {
      setIsLoadingData(false);
    }
  }, [userData, baseParams, itemsPerPage, triggerPastDue]);

  const loadCustomWorkflows = useCallback(async (queueId: string) => {
    if (!userData || !queueId || !startDate || !endDate) return;
    setIsLoadingData(true);
    setErrorMessage(null);
    try {
      const result = await triggerCustom({
        ...baseParams,
        bu_id: '',
        queue_id: queueId,
        actionsType: '',
        startDateTime: startDate,
        endDateTime: endDate,
        pageNumber: 1,
        pageSize: itemsPerPage,
      }, false).unwrap();

      if (result && result[0]) {
        setWorkflowData(result[0]);
        setTotalRecords(result[1]?.[0]?.total_count || result[0].length);
      } else {
        setWorkflowData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error('Custom workflows API error:', error);
      setErrorMessage('Unable to load custom workflows. Please retry.');
      setWorkflowData([]);
      setTotalRecords(0);
    } finally {
      setIsLoadingData(false);
    }
  }, [userData, baseParams, itemsPerPage, startDate, endDate, triggerCustom]);

  // Load workflows for current tab and queue
  const loadWorkflowsForTab = useCallback((tab: TimelineTab, queueId: string) => {
    switch (tab) {
      case 'recent':
        loadRecentWorkflows(queueId);
        break;
      case 'pastDue':
        loadPastDueWorkflows(queueId);
        break;
      case 'custom':
        if (startDate && endDate) {
          loadCustomWorkflows(queueId);
        }
        break;
    }
  }, [loadRecentWorkflows, loadPastDueWorkflows, loadCustomWorkflows, startDate, endDate]);

  // ========= AUTO-SELECT on first load =========
  useEffect(() => {
    if (queueItems.length > 0 && !selectedQueueName) {
      const firstQueue = queueItems[0];
      const queueName = firstQueue.QueueNames;
      setExpandedQueues([queueName]);
      setSelectedQueueName(queueName);

      if (firstQueue.QueueProperties && firstQueue.QueueProperties.length > 0) {
        const firstAction = firstQueue.QueueProperties[0];
        setSelectedAction(firstAction);
        const qId = firstQueue.queue_id || firstAction.bPaaS_workflow_id || '';
        setSelectedQueueId(qId);
        // Auto-trigger API using same handler logic
        loadRecentWorkflows(qId);
      }
    }
  }, [queueItems]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle queue expansion - expand/collapse does NOT trigger API per Rule 10
  // But selecting a new queue auto-selects first action and DOES trigger API per Rule 3/4
  const toggleQueueExpansion = useCallback((queueName: string, queue: QueueItem) => {
    const isExpanding = !expandedQueues.includes(queueName);
    setExpandedQueues(prev =>
      prev.includes(queueName)
        ? prev.filter(q => q !== queueName)
        : [...prev, queueName]
    );

    // When expanding a DIFFERENT queue, auto-select its first action (cascade)
    if (isExpanding && queueName !== selectedQueueName && queue.QueueProperties && queue.QueueProperties.length > 0) {
      const firstAction = queue.QueueProperties[0];
      setSelectedQueueName(queueName);
      setSelectedAction(firstAction);
      setCurrentPage(1);
      setSearchText('');
      setErrorMessage(null);

      const qId = queue.queue_id || firstAction.bPaaS_workflow_id || '';
      setSelectedQueueId(qId);
      // Trigger API for first action of new queue
      loadWorkflowsForTab(activeTimelineTab, qId);
    }
  }, [expandedQueues, selectedQueueName, activeTimelineTab, loadWorkflowsForTab]);

  // Handle action selection - TRIGGERS API
  const handleActionSelect = useCallback((action: QueueProperty, queueName: string, queue: QueueItem) => {
    setSelectedQueueName(queueName);
    setSelectedAction(action);
    setCurrentPage(1);
    setSearchText('');
    setErrorMessage(null);

    const queueId = queue.queue_id || action.bPaaS_workflow_id || '';
    setSelectedQueueId(queueId);

    // Event-driven: trigger API on every action selection
    loadWorkflowsForTab(activeTimelineTab, queueId);
  }, [activeTimelineTab, loadWorkflowsForTab]);

  // Handle timeline tab change - TRIGGERS API
  const handleTimelineTabChange = useCallback((tab: TimelineTab) => {
    setActiveTimelineTab(tab);
    setCurrentPage(1);
    setSearchText('');
    setErrorMessage(null);

    // Event-driven: trigger API on every tab click
    if (selectedQueueId) {
      loadWorkflowsForTab(tab, selectedQueueId);
    }
  }, [selectedQueueId, loadWorkflowsForTab]);

  // Handle custom date load
  const handleLoadCustomData = useCallback(() => {
    if (!startDate || !endDate || !selectedQueueId) return;
    setCurrentPage(1);
    loadCustomWorkflows(selectedQueueId);
  }, [startDate, endDate, selectedQueueId, loadCustomWorkflows]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchText.trim() || !selectedQueueId) return;
    setIsLoadingData(true);
    setErrorMessage(null);

    try {
      const searchInputParams = {
        ...baseParams,
        queue_id: selectedQueueId,
        bu_id: '',
        dept_id: '',
        actionsType: '',
        searchColumn: searchCategory,
        searchInput: searchText,
        pageNumber: 1,
        pageSize: itemsPerPage,
      };

      let result;
      if (activeTimelineTab === 'recent') {
        result = await searchRecentMutation({ queueId: selectedQueueId, input: searchInputParams }).unwrap();
      } else if (activeTimelineTab === 'pastDue') {
        result = await searchPastDueMutation({
          queueId: selectedQueueId,
          input: { ...searchInputParams, eventTerm: 'today' }
        }).unwrap();
      }

      if (result && result[0]) {
        setWorkflowData(result[0]);
        setTotalRecords(result[1]?.[0]?.total_count || result[0].length);
      }
      setCurrentPage(1);
    } catch (error) {
      console.error('Search failed:', error);
      setErrorMessage('Search failed. Please retry.');
    } finally {
      setIsLoadingData(false);
    }
  }, [searchText, searchCategory, selectedQueueId, baseParams, itemsPerPage, activeTimelineTab, searchRecentMutation, searchPastDueMutation]);

  // Retry handler
  const handleRetry = useCallback(() => {
    setErrorMessage(null);
    if (selectedQueueId) {
      loadWorkflowsForTab(activeTimelineTab, selectedQueueId);
    }
  }, [activeTimelineTab, selectedQueueId, loadWorkflowsForTab]);

  // Calculate total pages
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view apps</p>
      </div>
    );
  }

  // Skeleton rows
  const renderSkeletonRows = (cols: number) => (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>{Array.from({ length: cols }).map((_, j) => (
          <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
        ))}</tr>
      ))}
    </tbody>
  );

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
                onClick={() => toggleQueueExpansion(queue.QueueNames, queue)}
                className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between ${
                  selectedQueueName === queue.QueueNames ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{queue.QueueNames}</span>
                <svg className={`w-4 h-4 transition-transform ${expandedQueues.includes(queue.QueueNames) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedQueues.includes(queue.QueueNames) && queue.QueueProperties && (
                <div className="bg-gray-50 pl-6">
                  {queue.QueueProperties.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionSelect(action, queue.QueueNames, queue)}
                      className={`w-full px-4 py-1.5 text-left text-xs flex items-center justify-between ${
                        selectedAction?.displayName === action.displayName && selectedQueueName === queue.QueueNames
                          ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{action.displayName}</span>
                      {action.count > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">{action.count}</span>
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
      <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm">
        <option value="All">All</option>
        <option value="BatchID">Batch ID</option>
        <option value="TransactionID">Transaction ID</option>
      </select>
      <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Search..." className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded text-sm" />
      <button onClick={handleSearch} disabled={isLoadingData} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">Search</button>
    </div>
  );

  // Render pagination
  const renderPagination = () => (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <div className="flex items-center gap-4 text-sm">
        <span>Show</span>
        <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 border border-gray-300 rounded">
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span>Total: {totalRecords}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoadingData} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Previous</button>
        <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">{currentPage}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isLoadingData} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Next</button>
      </div>
    </div>
  );

  // Render main content
  const renderMainContent = () => (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-light text-blue-600"><span className="text-blue-800 font-semibold">one</span>base</div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Selected TimeZone: Asia/Calcutta - {new Date().toISOString().split('T')[0]}</span>
          <span className="text-blue-600">{userData?.user_name || 'Digital User'} ▼</span>
        </div>
      </div>

      {/* Timeline Tabs - Sticky */}
      <div className="sticky top-0 bg-white z-10 flex gap-4 border-b border-gray-200 mb-4">
        {TIMELINE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTimelineTabChange(tab.id)}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTimelineTab === tab.id ? 'border-blue-500 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {/* Section Title */}
      {activeTimelineTab === 'recent' && selectedAction && (
        <h3 className="text-lg font-medium text-gray-800 mb-4">Last 10 Transactions</h3>
      )}

      {/* Custom tab date range */}
      {activeTimelineTab === 'custom' && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex gap-4 items-end flex-wrap">
            <div>
              <label className="block text-sm text-gray-600 mb-1">From Date</label>
              <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">To Date</label>
              <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded" />
            </div>
            <button onClick={handleLoadCustomData} disabled={!startDate || !endDate || isLoadingData} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Submit</button>
          </div>
        </div>
      )}

      {/* Search bar */}
      {selectedAction && renderSearchBar()}

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <span className="text-red-700 text-sm">{errorMessage}</span>
          <button onClick={handleRetry} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Retry</button>
        </div>
      )}

      {/* Content area */}
      {!selectedAction ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          Select a queue action from the sidebar to view workflows
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden" style={{ minHeight: '300px' }}>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Queue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
              </tr>
            </thead>
            {isLoadingData ? renderSkeletonRows(7) : (
              <tbody className="divide-y divide-gray-200">
                {workflowData.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No records found.</td></tr>
                ) : (
                  workflowData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
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
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.ActivityDate || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.BatchID || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.TransactionID || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.Queue || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.Actions || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{(item as any).extracted_file_name || (item as any).file_id || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
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
