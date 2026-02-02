/**
 * ExceptionsTable Component
 * Business exceptions table with pagination and search
 * Migrated from BusinessHomeViews.js load_YTD_PendingBusinessExceptions
 */
import { useState } from 'react';
import type { BusinessException, PaginationState } from '../types/BusinessHomeTypes';

interface ExceptionsTableProps {
  data: BusinessException[] | undefined;
  pagination: PaginationState;
  isLoading: boolean;
  searchText: string;
  onSearch: (text: string) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onReset: () => void;
}

export const ExceptionsTable: React.FC<ExceptionsTableProps> = ({
  data,
  pagination,
  isLoading,
  searchText,
  onSearch,
  onPageChange,
  onItemsPerPageChange,
  onReset,
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
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header with search */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Business Exceptions</h3>
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
            placeholder="Search exceptions..."
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
      <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#deebf7] sticky top-0">
            <tr>
              <th className="text-left p-2 border-b border-gray-300">ID</th>
              <th className="text-left p-2 border-b border-gray-300">Type</th>
              <th className="text-left p-2 border-b border-gray-300">Description</th>
              <th className="text-left p-2 border-b border-gray-300">Supplier</th>
              <th className="text-left p-2 border-b border-gray-300">Date</th>
              <th className="text-left p-2 border-b border-gray-300">Status</th>
              <th className="text-left p-2 border-b border-gray-300">Priority</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="p-2 border-b border-gray-200">
                      <div className="h-4 bg-gray-200 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data && data.length > 0 ? (
              data.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  <td className="p-2 border-b border-gray-200">{item.id}</td>
                  <td className="p-2 border-b border-gray-200">{item.exception_type}</td>
                  <td className="p-2 border-b border-gray-200 max-w-[200px] truncate" title={item.exception_description}>
                    {item.exception_description}
                  </td>
                  <td className="p-2 border-b border-gray-200">{item.supplier_name}</td>
                  <td className="p-2 border-b border-gray-200">{item.created_date}</td>
                  <td className="p-2 border-b border-gray-200">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === 'Resolved'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2 border-b border-gray-200">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.priority === 'High'
                          ? 'bg-red-100 text-red-700'
                          : item.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No exceptions found
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

export default ExceptionsTable;
