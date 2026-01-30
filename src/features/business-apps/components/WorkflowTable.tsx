import { useBusinessAppsState } from '../hooks/useBusinessAppsState';
import { Pagination } from './Pagination';

const HEADERS = [
  { key: 'BatchID', label: 'Batch ID' },
  { key: 'TransactionID', label: 'Transaction ID' },
  { key: 'Queue', label: 'Queue' },
  { key: 'ActivityDate', label: 'Activity Date' },
  { key: 'Actions', label: 'Status' },
];

export function WorkflowTable() {
  const {
    getCurrentWorkflows,
    handleWorkflowAction,
    currentView,
  } = useBusinessAppsState();

  const workflows = getCurrentWorkflows();

  if (workflows.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500">No workflows found</p>
        <p className="text-sm text-gray-400 mt-1">
          {currentView === 'custom'
            ? 'Try selecting a different date range'
            : 'Check back later for new workflows'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {HEADERS.map((header) => (
                <th
                  key={header.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {workflows.map((workflow, index) => (
              <tr
                key={`${workflow.BatchID}-${workflow.TransactionID}-${index}`}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {workflow.BatchID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {workflow.TransactionID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {workflow.Queue}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {workflow.ActivityDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      workflow.Actions.toLowerCase() === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : workflow.Actions.toLowerCase() === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : workflow.Actions.toLowerCase() === 'exception'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {workflow.Actions}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={(e) => handleWorkflowAction(workflow, e, index)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination />
    </div>
  );
}
