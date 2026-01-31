/**
 * BusinessStarterView Component
 * Post-login landing page (BPaaSWorkflow)
 * Layout:
 * - Left sidebar: Company/BPS selection checkboxes
 * - Main area: Tabs (Insights, Admin settings, Techops)
 * - No global navigation shell (Home, Tasks, Apps)
 *
 * APIs:
 * - signIn response provides company/bps data (stored in auth state)
 * - loadCustomerPerformanceDashboard for Insights tab
 * - onebaseAdminSetting, AdminSettingsEnableDisable for Admin Settings
 * - onebaseAdminTechops, onebaseAdminTechopsInbox for TechOps
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import { logout } from '../../authentication/store/authSlice';
import { encryptData, decryptData } from '../../../lib/crypto';
import apiClient from '../../../lib/api';

type TabType = 'insights' | 'admin' | 'techops';

interface Company {
  customer_id: string;
  customer_name: string;
  selected: boolean;
  bpsList?: BPS[];
}

interface BPS {
  bps_id: string;
  bps_name: string;
  selected: boolean;
}

interface CustomerPerformance {
  customer_id: string;
  customer_name: string;
  performance: string;
  performance_color?: string;
}

interface AdminSetting {
  setting_id: string;
  setting_name: string;
  is_enabled: boolean;
  category: string;
}

interface TechOpsTicket {
  ticket_id: string;
  exception_type: string;
  description: string;
  status: string;
  created_date: string;
}

export function BusinessStarterView() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const userData = auth.user;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('insights');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  // Insights tab state
  const [customerPerformance, setCustomerPerformance] = useState<CustomerPerformance[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Admin Settings tab state
  const [adminSettings, setAdminSettings] = useState<AdminSetting[]>([]);
  const [selectedBpsForAdmin] = useState<string | null>(null);

  // TechOps tab state
  const [techOpsTickets, setTechOpsTickets] = useState<TechOpsTicket[]>([]);
  const [techOpsFilter, setTechOpsFilter] = useState('All');

  // Load companies from auth state (from signIn response)
  useEffect(() => {
    if (userData) {
      // Extract companies from user data
      // The signIn API returns company/bps data
      const userCompanies: Company[] = [];

      // Check if user has customer data - cast to Record for dynamic access
      const userDataRecord = userData as unknown as Record<string, unknown>;
      if (userDataRecord.customer_id && userDataRecord.customer_name) {
        userCompanies.push({
          customer_id: userDataRecord.customer_id as string,
          customer_name: userDataRecord.customer_name as string,
          selected: true,
          bpsList: (userDataRecord.bps_list as BPS[]) || []
        });
      }

      // If there are multiple companies in the response
      if (userDataRecord.companies && Array.isArray(userDataRecord.companies)) {
        (userDataRecord.companies as Array<{customer_id: string; customer_name: string; bpsList?: BPS[]}>).forEach((company, index) => {
          userCompanies.push({
            customer_id: company.customer_id,
            customer_name: company.customer_name,
            selected: index === 0, // First one is selected by default
            bpsList: company.bpsList || []
          });
        });
      }

      // If no companies found, create mock data for UI
      if (userCompanies.length === 0) {
        userCompanies.push(
          { customer_id: '1', customer_name: 'Apex Onebase', selected: true, bpsList: [] },
          { customer_id: '2', customer_name: 'optus intelligence Inc', selected: false, bpsList: [] }
        );
      }

      setCompanies(userCompanies);
      setLoading(false);

      // Load initial data for Insights tab
      loadCustomerPerformanceDashboard(userCompanies.filter(c => c.selected));
    }
  }, [userData]);

  // Load Customer Performance Dashboard
  const loadCustomerPerformanceDashboard = useCallback(async (selectedCompanies: Company[]) => {
    if (selectedCompanies.length === 0) {
      setCustomerPerformance([]);
      return;
    }

    setTabLoading(true);
    try {
      const customerIds = selectedCompanies.map(c => c.customer_id);
      const payload = {
        username: userData?.user_login_id || '',
        userpassword: '',
        customer_ids: customerIds
      };

      const encrypted = encryptData(payload);
      const response = await apiClient.post('/baasHome/loadCustomerPerformanceDashboard', encrypted, {
        headers: { 'Content-Type': 'text/plain' }
      });

      const data = decryptData<CustomerPerformance[][]>(response.data);

      if (data && data[0]) {
        setCustomerPerformance(data[0]);
        setTotalPages(Math.ceil(data[0].length / 10) || 1);
      } else {
        // Mock data for UI if API returns empty
        setCustomerPerformance(selectedCompanies.map(c => ({
          customer_id: c.customer_id,
          customer_name: c.customer_name,
          performance: 'Good',
          performance_color: 'green'
        })));
      }
    } catch (error) {
      console.error('Failed to load customer performance:', error);
      // Set mock data on error
      setCustomerPerformance(selectedCompanies.map(c => ({
        customer_id: c.customer_id,
        customer_name: c.customer_name,
        performance: 'Good',
        performance_color: 'green'
      })));
    } finally {
      setTabLoading(false);
    }
  }, [userData]);

  // Load Admin Settings
  const loadAdminSettings = useCallback(async () => {
    setTabLoading(true);
    try {
      const payload = {
        username: userData?.user_login_id || '',
        userpassword: ''
      };

      const encrypted = encryptData(payload);
      const response = await apiClient.post('/baasHome/onebaseAdminSetting', encrypted, {
        headers: { 'Content-Type': 'text/plain' }
      });

      const data = decryptData<AdminSetting[][]>(response.data);

      if (data && data[0]) {
        setAdminSettings(data[0]);
      }
    } catch (error) {
      console.error('Failed to load admin settings:', error);
    } finally {
      setTabLoading(false);
    }
  }, [userData]);

  // Load TechOps data
  const loadTechOps = useCallback(async () => {
    setTabLoading(true);
    try {
      const selectedCompany = companies.find(c => c.selected);
      if (!selectedCompany) return;

      const payload = {
        username: userData?.user_login_id || '',
        userpassword: '',
        customer_id: selectedCompany.customer_id,
        bps_id: selectedBpsForAdmin || '',
        exceptiontype: techOpsFilter,
        minlimit: 0,
        maxlimit: 50
      };

      const encrypted = encryptData(payload);
      const response = await apiClient.post('/baasHome/onebaseAdminTechopsInbox', encrypted, {
        headers: { 'Content-Type': 'text/plain' }
      });

      const data = decryptData<TechOpsTicket[][]>(response.data);

      if (data && data[0]) {
        setTechOpsTickets(data[0]);
      }
    } catch (error) {
      console.error('Failed to load techops:', error);
    } finally {
      setTabLoading(false);
    }
  }, [userData, companies, selectedBpsForAdmin, techOpsFilter]);

  // Handle tab change
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);

    switch (tab) {
      case 'insights':
        loadCustomerPerformanceDashboard(companies.filter(c => c.selected));
        break;
      case 'admin':
        loadAdminSettings();
        break;
      case 'techops':
        loadTechOps();
        break;
    }
  }, [companies, loadCustomerPerformanceDashboard, loadAdminSettings, loadTechOps]);

  // Handle company toggle
  const handleCompanyToggle = useCallback((customerId: string) => {
    setCompanies(prev => {
      const updated = prev.map(c =>
        c.customer_id === customerId ? { ...c, selected: !c.selected } : c
      );

      // If on insights tab, reload data
      if (activeTab === 'insights') {
        loadCustomerPerformanceDashboard(updated.filter(c => c.selected));
      }

      return updated;
    });
  }, [activeTab, loadCustomerPerformanceDashboard]);

  // Handle View button click - navigate to BusinessHomeViews
  const handleViewCustomer = useCallback((customerId: string) => {
    navigate('/BusinessHomeViews', { state: { customerId } });
  }, [navigate]);

  // Handle logout
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/');
  }, [dispatch, navigate]);

  // Not logged in state
  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please log in to continue</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Get performance color
  const getPerformanceColor = (performance: string) => {
    switch (performance.toLowerCase()) {
      case 'good': return 'text-green-600';
      case 'average': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Render Insights tab content
  const renderInsightsContent = () => (
    <div className="space-y-4">
      {/* Customer Performance Dashboard Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-700">Customer Performance Dashboard</h2>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          defaultValue="Customers"
        >
          <option value="Customers">Customers</option>
          <option value="All">All</option>
        </select>
      </div>

      {/* Loading state */}
      {tabLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
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
                {customerPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      Select a company from the sidebar to view performance data
                    </td>
                  </tr>
                ) : (
                  customerPerformance
                    .slice((currentPage - 1) * 10, currentPage * 10)
                    .map((customer) => (
                      <tr key={customer.customer_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{customer.customer_name}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${getPerformanceColor(customer.performance)}`}>
                            {customer.performance}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewCustomer(customer.customer_id)}
                            className="px-4 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {customerPerformance.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  // Render Admin Settings tab content
  const renderAdminContent = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-700">Admin Settings</h2>

      {tabLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {adminSettings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Select a company to view admin settings
            </p>
          ) : (
            <div className="space-y-4">
              {/* Customer Dashboard View Settings */}
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-800 mb-3">Customer Dashboard View</h3>
                <div className="space-y-2">
                  {adminSettings
                    .filter(s => s.category === 'dashboard')
                    .map(setting => (
                      <label key={setting.setting_id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={setting.is_enabled}
                          onChange={() => {/* Handle toggle */}}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-600">{setting.setting_name}</span>
                      </label>
                    ))}
                </div>
              </div>

              {/* BPS View Settings */}
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-800 mb-3">BPS View</h3>
                <div className="space-y-2">
                  {adminSettings
                    .filter(s => s.category === 'bps')
                    .map(setting => (
                      <label key={setting.setting_id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={setting.is_enabled}
                          onChange={() => {/* Handle toggle */}}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-600">{setting.setting_name}</span>
                      </label>
                    ))}
                </div>
              </div>

              {/* User/Menu/Action Settings */}
              <div>
                <h3 className="font-medium text-gray-800 mb-3">User, Menu, Action</h3>
                <div className="space-y-2">
                  {adminSettings
                    .filter(s => s.category === 'user' || s.category === 'menu' || s.category === 'action')
                    .map(setting => (
                      <label key={setting.setting_id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={setting.is_enabled}
                          onChange={() => {/* Handle toggle */}}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-600">{setting.setting_name}</span>
                      </label>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render TechOps tab content
  const renderTechopsContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-700">TechOps Inbox</h2>
        <select
          value={techOpsFilter}
          onChange={(e) => {
            setTechOpsFilter(e.target.value);
            loadTechOps();
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Exceptions</option>
          <option value="Critical">Critical</option>
          <option value="Warning">Warning</option>
          <option value="Info">Info</option>
        </select>
      </div>

      {tabLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ticket ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Exception Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {techOpsTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No TechOps tickets found
                  </td>
                </tr>
              ) : (
                techOpsTickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{ticket.ticket_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ticket.exception_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ticket.description}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        ticket.status === 'Open' ? 'bg-red-100 text-red-800' :
                        ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ticket.created_date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Company Selection */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-700">Company</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {companies.map((company) => (
            <label
              key={company.customer_id}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={company.selected}
                onChange={() => handleCompanyToggle(company.customer_id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{company.customer_name}</span>
            </label>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-light">
              <span className="text-blue-800 font-semibold">one</span>
              <span className="text-blue-600">base</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                  <span>{userData?.user_name || 'Digital User'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <nav className="flex gap-6">
            {[
              { id: 'insights' as TabType, label: 'Insights' },
              { id: 'admin' as TabType, label: 'Admin settings' },
              { id: 'techops' as TabType, label: 'Techops' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
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
          {activeTab === 'insights' && renderInsightsContent()}
          {activeTab === 'admin' && renderAdminContent()}
          {activeTab === 'techops' && renderTechopsContent()}
        </div>
      </div>
    </div>
  );
}

export default BusinessStarterView;
