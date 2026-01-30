import { useState } from 'react';
import { useBusinessStarterState } from '../hooks/useBusinessStarterState';

export function CustomerDashboard() {
  const { customerDashboardData, calculateSLAStatus } = useBusinessStarterState();
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const pageSize = 10;

  const filteredCustomers = customerDashboardData.filter((customer) =>
    customer.customer_name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const toggleCustomer = (customerId: string) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Customer Performance Dashboard</h3>
        <p className="text-sm text-gray-500 mt-1">
          View and manage customer performance metrics
        </p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search customers..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setCurrentPage(0);
          }}
        />
      </div>

      {/* Customer List */}
      <div className="divide-y divide-gray-200">
        {paginatedCustomers.map((customer) => (
          <div key={customer.customer_id} className="p-4">
            <div
              onClick={() => toggleCustomer(customer.customer_id)}
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 rounded"
            >
              <div className="flex items-center gap-4">
                {customer.customer_logo && (
                  <img
                    src={customer.customer_logo}
                    alt={customer.customer_name}
                    className="w-10 h-10 object-contain"
                  />
                )}
                <div>
                  <p className="font-medium">{customer.customer_name}</p>
                  <p className="text-sm text-gray-500">
                    {customer.bps_list?.length || 0} Business Process(es)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {customer.sla_score !== undefined && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">SLA Score</p>
                    <p className={`font-semibold ${
                      customer.sla_score >= 95 ? 'text-green-600' :
                      customer.sla_score >= 85 ? 'text-blue-600' : 'text-yellow-600'
                    }`}>
                      {customer.sla_score}% - {calculateSLAStatus(customer.sla_score)}
                    </p>
                  </div>
                )}
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
            </div>

            {/* Expanded BPS List */}
            {expandedCustomer === customer.customer_id && customer.bps_list && (
              <div className="mt-4 ml-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {customer.bps_list.map((bps) => (
                  <div
                    key={bps.bps_id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {bps.bps_logo && (
                        <img
                          src={bps.bps_logo}
                          alt={bps.bps_desc}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <p className="text-sm font-medium">{bps.bps_desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {currentPage * pageSize + 1} to{' '}
            {Math.min((currentPage + 1) * pageSize, filteredCustomers.length)} of{' '}
            {filteredCustomers.length} customers
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {paginatedCustomers.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No customers found
        </div>
      )}
    </div>
  );
}
