/**
 * BusinessAppsView Component
 * Apps view with BU tabs (Capture Audit, Invoice Audit, HO, Mail Hub)
 * Left sidebar with expandable queues (Smart Sort, Manual Capture, etc.)
 * Main area with Recent/Past Due/Custom tabs and workflow table
 */
import { useState, useCallback } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { useBusinessAppsState } from '../hooks/useBusinessAppsState';

type BUTab = 'capture' | 'invoice' | 'ho' | 'mailhub';
type TimelineTab = 'recent' | 'pastDue' | 'custom';

const BU_TABS: { id: BUTab; label: string }[] = [
  { id: 'capture', label: 'Capture Audit' },
  { id: 'invoice', label: 'Invoice Audit' },
  { id: 'ho', label: 'HO' },
  { id: 'mailhub', label: 'Mail Hub' },
];

const TIMELINE_TABS: { id: TimelineTab; label: string }[] = [
  { id: 'recent', label: 'Recent' },
  { id: 'pastDue', label: 'Past Due' },
  { id: 'custom', label: 'Custom' },
];

// Queue structure for sidebar
interface QueueItem {
  id: string;
  name: string;
  count?: number;
  children?: QueueItem[];
}

const QUEUE_STRUCTURE: QueueItem[] = [
  {
    id: 'smart-sort',
    name: 'Smart Sort',
    children: [
      { id: 'audit', name: 'Audit', count: 1 },
      { id: 'pending', name: 'Pending' },
      { id: 'rejected', name: 'Rejected', count: 1 },
      { id: 'declined', name: 'Declined' },
      { id: 'processed', name: 'Processed' },
    ],
  },
  { id: 'manual-capture', name: 'Manual Capture' },
  { id: 'partial-auto', name: 'Partial Auto Capture' },
  { id: 'exception-review', name: 'Exception Review' },
];

// Sample workflow data
const SAMPLE_WORKFLOWS = [
  {
    id: '1',
    activity_date: '2026-01-30 12:25:49',
    batch_id: '20260130212241029​8',
    file_name: '04 - merged - 1T - smart sort, Data Capt...apture.pdf',
  },
];

export function BusinessAppsView() {
  const auth = useAppSelector((state) => state.auth);
  const userData = auth.user;

  const [activeBUTab, setActiveBUTab] = useState(0);
  const [activeTimelineTab, setActiveTimelineTab] = useState(0);
  const [expandedQueues, setExpandedQueues] = useState<string[]>(['smart-sort']);
  const [selectedQueue, setSelectedQueue] = useState<string | null>('audit');
  const [searchText, setSearchText] = useState('');
  const [searchAgainst, setSearchAgainst] = useState('All');
  const [showPerPage, setShowPerPage] = useState(10);
  const [_currentPage, _setCurrentPage] = useState(1);
  const [skipToPage, setSkipToPage] = useState('');

  const { loading } = useBusinessAppsState();

  const toggleQueueExpand = useCallback((queueId: string) => {
    setExpandedQueues((prev) =>
      prev.includes(queueId)
        ? prev.filter((id) => id !== queueId)
        : [...prev, queueId]
    );
  }, []);

  const handleQueueSelect = useCallback((queueId: string) => {
    setSelectedQueue(queueId);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Search logic here
  }, []);

  const handleSkipToPage = useCallback(() => {
    const page = parseInt(skipToPage);
    if (!isNaN(page) && page > 0) {
      _setCurrentPage(page);
    }
  }, [skipToPage]);

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view apps</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const renderSidebar = () => (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      {QUEUE_STRUCTURE.map((queue) => (
        <div key={queue.id}>
          {queue.children ? (
            <>
              <button
                onClick={() => toggleQueueExpand(queue.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 transition-transform ${expandedQueues.includes(queue.id) ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {queue.name}
                </div>
              </button>
              {expandedQueues.includes(queue.id) && (
                <div className="pl-6">
                  {queue.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handleQueueSelect(child.id)}
                      className={`w-full flex items-center justify-between px-4 py-2 text-sm ${
                        selectedQueue === child.id
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{child.name}</span>
                      {child.count !== undefined && (
                        <span className="text-blue-600 font-medium">{child.count}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => {
                toggleQueueExpand(queue.id);
                handleQueueSelect(queue.id);
              }}
              className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium ${
                selectedQueue === queue.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {queue.name}
            </button>
          )}
        </div>
      ))}
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar with Queues */}
      {renderSidebar()}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-light text-blue-600">
              <span className="text-blue-800">one</span>base
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Selected TimeZone: Asia/Calcutta - {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString()}</span>
              <span className="text-blue-600">{userData?.user_name || 'Digital User'} ▼</span>
            </div>
          </div>

          {/* BU Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200">
            <nav className="flex gap-6">
              {BU_TABS.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveBUTab(index)}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeBUTab === index
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
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
            {TIMELINE_TABS.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTimelineTab(index)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTimelineTab === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Last 10 Transactions Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-blue-600">Last 10 Transactions</h3>
            <div className="flex items-center gap-4">
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">All</button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Search Against</span>
                <select
                  value={searchAgainst}
                  onChange={(e) => setSearchAgainst(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option>All</option>
                  <option>Batch ID</option>
                  <option>File Name</option>
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
                {SAMPLE_WORKFLOWS.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50">
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
                    <td className="px-4 py-3 text-sm text-gray-900">{workflow.activity_date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{workflow.batch_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{workflow.file_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={showPerPage}
                  onChange={(e) => setShowPerPage(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries per page</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Go to page:</span>
                <input
                  type="text"
                  value={skipToPage}
                  onChange={(e) => setSkipToPage(e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded"
                />
                <button
                  onClick={handleSkipToPage}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
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
        </div>
      </div>
    </div>
  );
}

export default BusinessAppsView;
