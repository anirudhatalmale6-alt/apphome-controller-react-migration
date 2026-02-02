/**
 * PastDueTasksTable Component
 * Past due workflows table with pagination and search
 * Migrated from BusinessTasksController.js Tasks_PastDueWorkflows
 */
import { useState } from 'react';
import type { PastDueWorkflow, PaginationState } from '../types/BusinessTasksTypes';

interface PastDueTasksTableProps {
  data: PastDueWorkflow[] | undefined;
  pagination: PaginationState;
  isLoading: boolean;
  searchText: string;
  totalCount: number;
  onSearch: (text: string) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onReset: () => void;
  onRowClick?: (workflow: PastDueWorkflow) => void;
}

export const PastDueTasksTable: React.FC<PastDueTasksTableProps> = ({
  data,
  pagination,
  isLoading,
  searchText,
  totalCount,
  onSearch,
  onPageChange,
  onItemsPerPageChange,
  onReset,
  onRowClick,
}) => {
  const [localSearchText, setLocalSearchText] = useState(searchText);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearchText);
  };

  const handleReset = () => {
    setLocalSearchText('');
    onReset();
  };

  const { currentPage, itemsPerPage, totalItems, totalPages } = pagination;
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header with count badge */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-700">Past Due Workflows</h3>
            {totalCount > 0 && (
              <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
                {totalCount} Overdue
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {[5, 10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={localSearchText}
            onChange={(e) => setLocalSearchText(e.target.value)}
            placeholder="Search past due tasks..."
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#fce4ec] sticky top-0">
            <tr>
              <th className="text-left p-2 border-b border-gray-300">Workflow ID</th>
              <th className="text-left p-2 border-b border-gray-300">Name</th>
              <th className="text-left p-2 border-b border-gray-300">Due Date</th>
              <th className="text-right p-2 border-b border-gray-300">Days Overdue</th>
              <th className="text-left p-2 border-b border-gray-300">Priority</th>
              <th className="text-left p-2 border-b border-gray-300">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="p-2 border-b border-gray-200">
                      <div className="h-4 bg-gray-200 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data && data.length > 0 ? (
              data.map((workflow, index) => (
                <tr
                  key={workflow.workflow_id || index}
                  className="hover:bg-red-50 cursor-pointer"
                  onClick={() => onRowClick?.(workflow)}
                >
                  <td className="p-2 border-b border-gray-200 text-blue-600">{workflow.workflow_id}</td>
                  <td className="p-2 border-b border-gray-200">{workflow.workflow_name}</td>
                  <td className="p-2 border-b border-gray-200">{formatDate(workflow.due_date)}</td>
                  <td className="p-2 border-b border-gray-200 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      workflow.days_overdue > 7 ? 'bg-red-100 text-red-700' :
                      workflow.days_overdue > 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {workflow.days_overdue} days
                    </span>
                  </td>
                  <td className="p-2 border-b border-gray-200">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(workflow.priority)}`}>
                      {workflow.priority}
                    </span>
                  </td>
                  <td className="p-2 border-b border-gray-200">{workflow.assigned_to}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No past due workflows found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {totalItems} entries
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            First
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Prev
          </button>
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            if (page > totalPages) return null;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  page === currentPage
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default PastDueTasksTable;
