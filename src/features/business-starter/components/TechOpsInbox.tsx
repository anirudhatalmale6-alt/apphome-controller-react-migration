import { useState } from 'react';
import { useBusinessStarterState } from '../hooks/useBusinessStarterState';

const HEADERS = [
  { key: 'TicketStatus', label: 'Ticket Status' },
  { key: 'ActivityDate', label: 'Activity Date' },
  { key: 'BatchID', label: 'Batch ID' },
  { key: 'TransactionID', label: 'Transaction ID' },
  { key: 'DocumentID', label: 'Document ID' },
  { key: 'FileName', label: 'File Name' },
];

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

export function TechOpsInbox() {
  const {
    techopsCustomers,
    techopsWorkflows,
    techopsTotalItems,
    currentTechopsPage,
    itemsPerPageTechops,
    selectedTechopsBpsId,
    isLoadingTechopsDetails,
    handleToggleTechopsBps,
    handleTechopsPageChange,
    handleTechopsItemsPerPageChange,
  } = useBusinessStarterState();

  const [searchInput, setSearchInput] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const totalPages = Math.ceil(techopsTotalItems / itemsPerPageTechops);

  const filteredCustomers = techopsCustomers.filter((customer) =>
    customer.customer_name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleLoadInbox = (bpsId: string, customerId: string) => {
    handleToggleTechopsBps(bpsId, customerId);
    // In real implementation, use the query hook or mutation to fetch data
  };

  const getDisplayedPages = () => {
    const maxDisplay = 5;
    const start = Math.max(1, currentTechopsPage - Math.floor(maxDisplay / 2));
    const end = Math.min(totalPages, start + maxDisplay - 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">TechOps Inbox</h3>
        <p className="text-sm text-gray-500 mt-1">
          View and manage technical operations tickets
        </p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search customers..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Customer List */}
      <div className="divide-y divide-gray-200">
        {filteredCustomers.map((customer) => (
          <div key={customer.customer_id}>
            <div
              onClick={() => setExpandedCustomer(
                expandedCustomer === customer.customer_id ? null : customer.customer_id
              )}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                {customer.customer_logo && (
                  <img
                    src={customer.customer_logo}
                    alt={customer.customer_name}
                    className="w-10 h-10 object-contain"
                  />
                )}
                <p className="font-medium">{customer.customer_name}</p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedCustomer === customer.customer_id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* BPS List */}
            {expandedCustomer === customer.customer_id && customer.bps_list && (
              <div className="bg-gray-50 px-4 py-2">
                {customer.bps_list.map((bps) => (
                  <div key={bps.bps_id} className="mb-2">
                    <div
                      onClick={() => handleLoadInbox(bps.bps_id, customer.customer_id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedTechopsBpsId === bps.bps_id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-white border border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{bps.bps_desc}</p>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            selectedTechopsBpsId === bps.bps_id ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Inbox Table */}
                    {selectedTechopsBpsId === bps.bps_id && (
                      <div className="mt-2 ml-4">
                        {isLoadingTechopsDetails ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                          </div>
                        ) : techopsWorkflows.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            No tickets found
                          </div>
                        ) : (
                          <>
                            {/* Table */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      {HEADERS.map((header) => (
                                        <th
                                          key={header.key}
                                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                          {header.label}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {techopsWorkflows.map((workflow, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            workflow.TicketStatus === 'Open'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : workflow.TicketStatus === 'Resolved'
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {workflow.TicketStatus}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                          {workflow.ActivityDate}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{workflow.BatchID}</td>
                                        <td className="px-4 py-3 text-sm">{workflow.TransactionID}</td>
                                        <td className="px-4 py-3 text-sm">{workflow.DocumentID}</td>
                                        <td className="px-4 py-3 text-sm text-blue-600 hover:underline cursor-pointer">
                                          {workflow.FileName}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4 px-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Items per page:</span>
                                <select
                                  value={itemsPerPageTechops}
                                  onChange={(e) => handleTechopsItemsPerPageChange(Number(e.target.value))}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                  {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                                <span className="text-sm text-gray-500 ml-4">
                                  Total: {techopsTotalItems} items
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleTechopsPageChange(1)}
                                  disabled={currentTechopsPage === 1}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                  First
                                </button>
                                <button
                                  onClick={() => handleTechopsPageChange(currentTechopsPage - 1)}
                                  disabled={currentTechopsPage === 1}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                  Prev
                                </button>

                                {getDisplayedPages().map((page) => (
                                  <button
                                    key={page}
                                    onClick={() => handleTechopsPageChange(page)}
                                    className={`px-3 py-1 border rounded text-sm ${
                                      page === currentTechopsPage
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                ))}

                                <button
                                  onClick={() => handleTechopsPageChange(currentTechopsPage + 1)}
                                  disabled={currentTechopsPage === totalPages}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                  Next
                                </button>
                                <button
                                  onClick={() => handleTechopsPageChange(totalPages)}
                                  disabled={currentTechopsPage === totalPages}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                  Last
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No customers found
        </div>
      )}
    </div>
  );
}
