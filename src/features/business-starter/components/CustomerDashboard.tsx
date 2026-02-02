/**
 * Customer Dashboard Component
 * Displays customer performance dashboard with expandable BPS details
 * Origin: BusinessStarterPage.html - mt-table sections for insights, admin, techops
 */
import React, { useState, useMemo } from 'react';
import { useBusinessStarterState, usePagination } from '../hooks/useBusinessStarterState';
import type { CustomerPerformance } from '../types/BusinessStarterTypes';

interface CustomerDashboardProps {
  isAdminSettings?: boolean;
  isTechOps?: boolean;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  isAdminSettings = false,
  isTechOps = false,
}) => {
  const {
    customerDashboardData,
    superSearch,
    handleSetSuperSearch,
    handleToggleEditAction,
    handleToggleTechopsEditAction,
    calculateSLA,
  } = useBusinessStarterState();

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerPerformance | null>(null);
  const pageSize = 10;

  // Filter customers by search
  const filteredCustomers = useMemo(() => {
    const customers = customerDashboardData?.CustomerData || [];
    if (!superSearch) return customers;
    return customers.filter((c: CustomerPerformance) =>
      c.customer_name.toLowerCase().includes(superSearch.toLowerCase())
    );
  }, [customerDashboardData?.CustomerData, superSearch]);

  const { totalPages } = usePagination(filteredCustomers.length, pageSize);

  const paginatedCustomers = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const handleToggleCard = (customer: CustomerPerformance) => {
    setSelectedCustomer(prev =>
      prev?.customer_id === customer.customer_id ? null : customer
    );
  };

  const handleBpsAction = (bpsId: string, customerId: string) => {
    if (isAdminSettings) {
      handleToggleEditAction(bpsId, customerId);
    } else if (isTechOps) {
      handleToggleTechopsEditAction(bpsId, customerId);
    }
  };

  const title = isAdminSettings
    ? 'Admin Settings'
    : isTechOps
    ? 'TechOps'
    : customerDashboardData?.title || 'Customer Dashboard';

  return (
    <div className="customer-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <b className="dashboard-title">{title}</b>
        <div className="search-container">
          <input
            type="text"
            value={superSearch}
            onChange={(e) => handleSetSuperSearch(e.target.value)}
            placeholder="Customers"
            className="bps-searchinputs"
            autoFocus
          />
        </div>
      </div>

      {/* Table */}
      <table className="mt-table">
        <thead>
          <tr>
            <th className="mt-th">Customer Name</th>
            <th className="mt-th">Performance</th>
            <th className="mt-th">Action</th>
          </tr>
        </thead>

        <tbody className="mt-table-body">
          {paginatedCustomers.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center text-muted">
                No customers found.
              </td>
            </tr>
          ) : (
            paginatedCustomers.map((customer: CustomerPerformance) => (
              <React.Fragment key={customer.customer_id}>
                {/* Customer Row */}
                <tr className={selectedCustomer?.customer_id === customer.customer_id ? 'mt-row-highlight' : ''}>
                  <td className="mt-td">{customer.customer_name}</td>
                  <td className="mt-td">
                    <span
                      className={`mt-indicator mt-tooltip ${customer.performance}`}
                      data-title={`Performance: ${customer.performance.toUpperCase()}`}
                    >
                      Good
                    </span>
                  </td>
                  <td className="mt-td">
                    <button
                      className="mt-btn"
                      onClick={() => handleToggleCard(customer)}
                    >
                      {selectedCustomer?.customer_id === customer.customer_id ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>

                {/* Expanded BPS Details Row */}
                {selectedCustomer?.customer_id === customer.customer_id && (
                  <tr>
                    <td className="mt-td" colSpan={3}>
                      <div className="mt-card">
                        <strong>BPS Details for {customer.customer_name}:</strong>
                        <table className="mt-subtable">
                          <thead>
                            <tr>
                              <th className="mt-th">BPS Name</th>
                              <th className="mt-th">Availability</th>
                              <th className="mt-th">Last Used</th>
                              {!isTechOps && <th className="mt-th">SLA</th>}
                              {(isAdminSettings || isTechOps) && (
                                <th className="mt-th">Action</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {customer.bpsList.map((bps) => (
                              <tr key={bps.bps_id}>
                                <td className="mt-td">{bps.bps_desc}</td>
                                <td className="mt-td">{bps.availability}%</td>
                                <td className="mt-td">
                                  {new Date(bps.last_login_time).toLocaleDateString()}
                                </td>
                                {!isTechOps && (
                                  <td className="mt-td">
                                    {calculateSLA(bps.slaScore || 0)}
                                  </td>
                                )}
                                {(isAdminSettings || isTechOps) && (
                                  <td className="mt-td">
                                    <button
                                      className="mt-btn"
                                      onClick={() => handleBpsAction(bps.bps_id, customer.customer_id)}
                                    >
                                      View
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>

        {/* Pagination Footer */}
        <tfoot className="mt-footer">
          <tr>
            <td colSpan={3}>
              <div className="mt-pagination">
                <span className="mt-page-info">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <div className="mt-pagination-buttons">
                  <button
                    className="mt-pagination-btn"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className="mt-pagination-btn"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default CustomerDashboard;
