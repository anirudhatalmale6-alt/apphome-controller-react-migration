/**
 * AgentsTable Component
 * Agent performance data with pagination
 * Migrated from BusinessHomeViews.js loadYTDAgentsData
 */
import type { AgentData, PaginationState } from '../types/BusinessHomeTypes';

interface AgentsTableProps {
  data: AgentData[] | undefined;
  pagination: PaginationState;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export const AgentsTable: React.FC<AgentsTableProps> = ({
  data,
  pagination,
  isLoading,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const { currentPage, itemsPerPage, totalItems, totalPages } = pagination;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">Agent Performance</h3>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Show:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#deebf7] sticky top-0">
            <tr>
              <th className="text-left p-2 border-b border-gray-300">Agent ID</th>
              <th className="text-left p-2 border-b border-gray-300">Agent Name</th>
              <th className="text-right p-2 border-b border-gray-300">Completed</th>
              <th className="text-right p-2 border-b border-gray-300">Pending</th>
              <th className="text-right p-2 border-b border-gray-300">Avg Time (min)</th>
              <th className="text-right p-2 border-b border-gray-300">Efficiency</th>
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
              data.map((agent, index) => (
                <tr key={agent.agent_id || index} className="hover:bg-gray-50">
                  <td className="p-2 border-b border-gray-200">{agent.agent_id}</td>
                  <td className="p-2 border-b border-gray-200">{agent.agent_name}</td>
                  <td className="p-2 border-b border-gray-200 text-right">{agent.tasks_completed?.toLocaleString()}</td>
                  <td className="p-2 border-b border-gray-200 text-right">{agent.tasks_pending?.toLocaleString()}</td>
                  <td className="p-2 border-b border-gray-200 text-right">{agent.avg_processing_time?.toFixed(1)}</td>
                  <td className="p-2 border-b border-gray-200 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            agent.efficiency_score >= 80
                              ? 'bg-green-500'
                              : agent.efficiency_score >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(agent.efficiency_score, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{agent.efficiency_score}%</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No agent data available
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

export default AgentsTable;
