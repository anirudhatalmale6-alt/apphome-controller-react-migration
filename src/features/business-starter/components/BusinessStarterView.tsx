/**
 * BusinessStarterView Component
 * Post-login landing page with:
 * - Left sidebar: Company checkboxes
 * - Top tabs: Insights, Admin settings, Techops
 * - Customer Performance Dashboard with table
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import { useBusinessStarterState } from '../hooks/useBusinessStarterState';

type TabType = 'insights' | 'admin' | 'techops';

const TABS: { id: TabType; label: string }[] = [
  { id: 'insights', label: 'Insights' },
  { id: 'admin', label: 'Admin settings' },
  { id: 'techops', label: 'Techops' },
];

// Sample company data
interface Company {
  id: string;
  name: string;
  selected: boolean;
}

// Sample customer performance data
interface CustomerPerformance {
  id: string;
  name: string;
  performance: 'Good' | 'Average' | 'Poor';
}

export function BusinessStarterView() {
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.auth);
  const userData = auth.user;

  const { loading } = useBusinessStarterState();

  const [activeTab, setActiveTab] = useState(0);
  const [companies, setCompanies] = useState<Company[]>([
    { id: '1', name: 'Apex Onebase', selected: true },
    { id: '2', name: 'optus intelligence Inc', selected: false },
  ]);
  const [customerFilter, setCustomerFilter] = useState('Customers');
  const [currentPage, _setCurrentPage] = useState(1);

  // Sample customer performance data
  const customers: CustomerPerformance[] = [
    { id: '1', name: 'Apex Onebase', performance: 'Good' },
    { id: '2', name: 'optus intelligence Inc', performance: 'Good' },
  ];

  const handleCompanyToggle = useCallback((companyId: string) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, selected: !c.selected } : c
      )
    );
  }, []);

  const handleView = useCallback((_customerId: string) => {
    // Navigate to BusinessHomeViews for the selected customer
    navigate('/BusinessHomeViews');
  }, [navigate]);

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to continue</p>
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

  const renderInsightsContent = () => (
    <div className="space-y-4">
      {/* Customer Performance Dashboard Header */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-medium text-gray-700">Customer Performance Dashboard</h2>
        <select
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="Customers">Customers</option>
          <option value="All">All</option>
        </select>
      </div>

      {/* Customer Performance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Customer Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Performance</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{customer.name}</td>
                <td className="px-6 py-4">
                  <span className={`text-sm ${
                    customer.performance === 'Good' ? 'text-green-600' :
                    customer.performance === 'Average' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {customer.performance}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleView(customer.id)}
                    className="px-4 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-600">
          <span>Page {currentPage} of 1</span>
          <button
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled={true}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdminContent = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-700 mb-4">Admin Settings</h2>
      <p className="text-gray-500">Admin settings content will appear here.</p>
    </div>
  );

  const renderTechopsContent = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-700 mb-4">Techops Inbox</h2>
      <p className="text-gray-500">Techops content will appear here.</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Company Selection */}
      <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-700">Company</h3>
        </div>
        <div className="p-4 space-y-3">
          {companies.map((company) => (
            <label
              key={company.id}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={company.selected}
                onChange={() => handleCompanyToggle(company.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{company.name}</span>
            </label>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-light text-blue-600">
              <span className="text-blue-800">one</span>base
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="text-blue-600">{userData?.user_name || 'Digital User'} ▼</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <nav className="flex gap-6">
            {TABS.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 0 && renderInsightsContent()}
          {activeTab === 1 && renderAdminContent()}
          {activeTab === 2 && renderTechopsContent()}
        </div>
      </div>
    </div>
  );
}

export default BusinessStarterView;
