/**
 * BusinessHomeView Component
 * Dashboard with sticky tabs: Batch Inventory, Invoice Inventory, Performance
 *
 * API calls per tab (lazy loaded on tab click):
 * - Batch Inventory: InventoryYTD306090, BatchInventoryYTDOverView
 * - Invoice Inventory: InventoryYTD306090, InvoiceInventoryYTDOverView
 * - Performance > Supplier: fetch_audit_into_bihourly_sp_30_60_90_baas, search_...
 * - Performance > Agents: loadAgent
 */
import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { encryptData, decryptData } from '../../../lib/crypto';
import apiClient from '../../../lib/api';

interface BusinessHomeViewProps {
  className?: string;
}

type MainTabType = 'batch' | 'invoice' | 'performance';
type PerformanceSubTab = 'suppliers' | 'agents';

// Stats card data structure
interface StatCard {
  value: string;
  label: string;
}

// Chart data structures
interface MonthData {
  month: string;
  inflow: number;
  processed: number;
}

interface SupplierData {
  supplier_id: string;
  supplier_name: string;
  today: number;
  yesterday: number;
  days_3_7: number;
  days_8_30: number;
  days_31_60: number;
  days_61_90: number;
  days_91_plus: number;
}

interface AgentData {
  agent_id: string;
  agent_name: string;
  processed_count: number;
  pending_count: number;
  accuracy_rate: number;
}

export const BusinessHomeView: React.FC<BusinessHomeViewProps> = ({ className = '' }) => {
  const auth = useAppSelector((state) => state.auth);
  const userData = auth.user;

  // Tab state
  const [activeTab, setActiveTab] = useState<MainTabType>('batch');
  const [performanceSubTab, setPerformanceSubTab] = useState<PerformanceSubTab>('suppliers');

  // Loading states
  const [tabLoading, setTabLoading] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());

  // Data states
  const [batchStats, setBatchStats] = useState<StatCard[]>([]);
  const [batchMonthData, setBatchMonthData] = useState<MonthData[]>([]);
  const [invoiceStats, setInvoiceStats] = useState<StatCard[]>([]);
  const [invoiceMonthData, setInvoiceMonthData] = useState<MonthData[]>([]);
  const [supplierData, setSupplierData] = useState<SupplierData[]>([]);
  const [agentData, setAgentData] = useState<AgentData[]>([]);

  // Search state
  const [searchCategory, setSearchCategory] = useState('ALL');
  const [_searchText, setSearchText] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search config from API
  const [searchConfig, setSearchConfig] = useState<string[]>([]);

  // User params for API calls
  const userParams = {
    customer_id: (userData?.customer_id as string) || '',
    bps_id: (userData?.bps_id as string) || '',
    user_id: (userData?.user_id as string) || '',
    sp_process_id: (userData?.sp_process_id as string) || ''
  };

  // Load search config on mount
  useEffect(() => {
    const loadSearchConfig = async () => {
      try {
        const payload = encryptData(userParams);
        const response = await apiClient.post('/baasHome/load_inbox_serachConfig', payload, {
          headers: { 'Content-Type': 'text/plain' }
        });
        const data = decryptData<Array<{category: string}[]>>(response.data);
        if (data && data[0]) {
          setSearchConfig(data[0].map(item => item.category));
        }
      } catch (error) {
        console.error('Failed to load search config:', error);
        setSearchConfig(['ALL', 'Batch ID', 'File Name', 'Supplier']);
      }
    };

    if (userData) {
      loadSearchConfig();
    }
  }, [userData]);

  // Load Batch Inventory data
  const loadBatchInventory = useCallback(async () => {
    if (loadedTabs.has('batch')) return;

    setTabLoading(true);
    try {
      const payload = encryptData(userParams);

      // Parallel API calls
      const [overviewRes, agingRes] = await Promise.all([
        apiClient.post('/baasHome/BatchInventoryYTDOverView', payload, { headers: { 'Content-Type': 'text/plain' } }),
        apiClient.post('/baasHome/InventoryYTD306090', payload, { headers: { 'Content-Type': 'text/plain' } })
      ]);

      const overviewData = decryptData<Array<{
        processed_same_day?: number;
        processed_same_week?: number;
        processed_same_month?: number;
        posted_on_time?: number;
        backlog?: number;
        total?: number;
      }[]>>(overviewRes.data);

      const agingData = decryptData<Array<MonthData[]>>(agingRes.data);

      // Process overview stats
      if (overviewData && overviewData[0]?.[0]) {
        const d = overviewData[0][0];
        const total = d.total || 1;
        setBatchStats([
          { value: `${((d.processed_same_day || 0) / total * 100).toFixed(1)}% (${d.processed_same_day || 0})`, label: 'Processed Same Day' },
          { value: `${((d.processed_same_week || 0) / total * 100).toFixed(1)}% (${d.processed_same_week || 0})`, label: 'Processed Same Week' },
          { value: `${((d.processed_same_month || 0) / total * 100).toFixed(1)}% (${d.processed_same_month || 0})`, label: 'Processed Same Month' },
          { value: `${((d.posted_on_time || 0) / total * 100).toFixed(1)}% (${d.posted_on_time || 0})`, label: 'Posted on Time' },
          { value: `${((d.backlog || 0) / total * 100).toFixed(1)}% (${d.backlog || 0})`, label: 'Backlog' },
        ]);
      } else {
        // Default mock data
        setBatchStats([
          { value: '0% (0)', label: 'Processed Same Day' },
          { value: '0% (0)', label: 'Processed Same Week' },
          { value: '16.7% (1)', label: 'Processed Same Month' },
          { value: '16.7% (1)', label: 'Posted on Time' },
          { value: '83.3% (5)', label: 'Backlog' },
        ]);
      }

      // Process month data
      if (agingData && agingData[0]) {
        setBatchMonthData(agingData[0]);
      } else {
        // Default mock data
        setBatchMonthData([
          { month: 'Jan', inflow: 6, processed: 0 },
          { month: 'Feb', inflow: 0, processed: 0 },
          { month: 'Mar', inflow: 0, processed: 0 },
          { month: 'Apr', inflow: 0, processed: 0 },
          { month: 'May', inflow: 0, processed: 0 },
          { month: 'Jun', inflow: 0, processed: 0 },
          { month: 'Jul', inflow: 0, processed: 0 },
          { month: 'Aug', inflow: 0, processed: 0 },
          { month: 'Sep', inflow: 0, processed: 0 },
          { month: 'Oct', inflow: 0, processed: 0 },
          { month: 'Nov', inflow: 0, processed: 0 },
          { month: 'Dec', inflow: 0, processed: 0 },
        ]);
      }

      setLoadedTabs(prev => new Set(prev).add('batch'));
    } catch (error) {
      console.error('Failed to load batch inventory:', error);
    } finally {
      setTabLoading(false);
    }
  }, [loadedTabs, userParams]);

  // Load Invoice Inventory data
  const loadInvoiceInventory = useCallback(async () => {
    if (loadedTabs.has('invoice')) return;

    setTabLoading(true);
    try {
      const payload = encryptData(userParams);

      const [overviewRes, agingRes] = await Promise.all([
        apiClient.post('/baasHome/InvoiceInventoryYTDOverView', payload, { headers: { 'Content-Type': 'text/plain' } }),
        apiClient.post('/baasHome/InventoryYTD306090', payload, { headers: { 'Content-Type': 'text/plain' } })
      ]);

      const overviewData = decryptData<Array<{
        processed_same_day?: number;
        processed_same_week?: number;
        processed_same_month?: number;
        posted_on_time?: number;
        backlog?: number;
        total?: number;
      }[]>>(overviewRes.data);

      const agingData = decryptData<Array<MonthData[]>>(agingRes.data);

      if (overviewData && overviewData[0]?.[0]) {
        const d = overviewData[0][0];
        const total = d.total || 1;
        setInvoiceStats([
          { value: `${((d.processed_same_day || 0) / total * 100).toFixed(1)}% (${d.processed_same_day || 0})`, label: 'Processed Same Day' },
          { value: `${((d.processed_same_week || 0) / total * 100).toFixed(1)}% (${d.processed_same_week || 0})`, label: 'Processed Same Week' },
          { value: `${((d.processed_same_month || 0) / total * 100).toFixed(1)}% (${d.processed_same_month || 0})`, label: 'Processed Same Month' },
          { value: `${((d.posted_on_time || 0) / total * 100).toFixed(1)}% (${d.posted_on_time || 0})`, label: 'Posted on Time' },
          { value: `${((d.backlog || 0) / total * 100).toFixed(1)}% (${d.backlog || 0})`, label: 'Backlog' },
        ]);
      }

      if (agingData && agingData[0]) {
        setInvoiceMonthData(agingData[0]);
      }

      setLoadedTabs(prev => new Set(prev).add('invoice'));
    } catch (error) {
      console.error('Failed to load invoice inventory:', error);
    } finally {
      setTabLoading(false);
    }
  }, [loadedTabs, userParams]);

  // Load Supplier performance data
  const loadSupplierData = useCallback(async () => {
    if (loadedTabs.has('performance-suppliers')) return;

    setTabLoading(true);
    try {
      const payload = encryptData({
        ...userParams,
        itemsPerPage: 20,
        currentPage: 1
      });

      const response = await apiClient.post('/baasHome/fetch_audit_into_bihourly_sp_30_60_90_baas', payload, {
        headers: { 'Content-Type': 'text/plain' }
      });

      const data = decryptData<Array<SupplierData[]>>(response.data);

      if (data && data[0]) {
        setSupplierData(data[0]);
        setTotalPages(Math.ceil(data[0].length / 10) || 1);
      } else {
        // Mock data
        setSupplierData([
          { supplier_id: '1', supplier_name: 'Apex Onebase', today: 5, yesterday: 3, days_3_7: 10, days_8_30: 15, days_31_60: 8, days_61_90: 2, days_91_plus: 0 },
          { supplier_id: '2', supplier_name: 'optus intelligence Inc', today: 2, yesterday: 1, days_3_7: 5, days_8_30: 8, days_31_60: 3, days_61_90: 1, days_91_plus: 0 },
        ]);
      }

      setLoadedTabs(prev => new Set(prev).add('performance-suppliers'));
    } catch (error) {
      console.error('Failed to load supplier data:', error);
    } finally {
      setTabLoading(false);
    }
  }, [loadedTabs, userParams]);

  // Load Agent performance data
  const loadAgentData = useCallback(async () => {
    if (loadedTabs.has('performance-agents')) return;

    setTabLoading(true);
    try {
      const payload = encryptData({
        ...userParams,
        itemsPerPage: 20,
        currentPage: 1
      });

      const response = await apiClient.post('/baasHome/loadAgent', payload, {
        headers: { 'Content-Type': 'text/plain' }
      });

      const data = decryptData<Array<AgentData[]>>(response.data);

      if (data && data[0]) {
        setAgentData(data[0]);
      } else {
        // Mock data
        setAgentData([
          { agent_id: '1', agent_name: 'Agent Smith', processed_count: 150, pending_count: 12, accuracy_rate: 98.5 },
          { agent_id: '2', agent_name: 'Agent Johnson', processed_count: 120, pending_count: 8, accuracy_rate: 97.2 },
        ]);
      }

      setLoadedTabs(prev => new Set(prev).add('performance-agents'));
    } catch (error) {
      console.error('Failed to load agent data:', error);
    } finally {
      setTabLoading(false);
    }
  }, [loadedTabs, userParams]);

  // Load data on initial mount (default tab only)
  useEffect(() => {
    if (userData && activeTab === 'batch') {
      loadBatchInventory();
    }
  }, [userData]);

  // Handle main tab change
  const handleTabChange = useCallback((tab: MainTabType) => {
    setActiveTab(tab);
    setCurrentPage(1);

    // Clear previous tab data to avoid stale state
    switch (tab) {
      case 'batch':
        loadBatchInventory();
        break;
      case 'invoice':
        loadInvoiceInventory();
        break;
      case 'performance':
        if (performanceSubTab === 'suppliers') {
          loadSupplierData();
        } else {
          loadAgentData();
        }
        break;
    }
  }, [performanceSubTab, loadBatchInventory, loadInvoiceInventory, loadSupplierData, loadAgentData]);

  // Handle performance sub-tab change
  const handlePerformanceSubTabChange = useCallback((subTab: PerformanceSubTab) => {
    setPerformanceSubTab(subTab);
    setCurrentPage(1);

    if (subTab === 'suppliers') {
      loadSupplierData();
    } else {
      loadAgentData();
    }
  }, [loadSupplierData, loadAgentData]);

  // Handle search
  const handleSearch = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setTabLoading(true);
    try {
      const payload = encryptData({
        ...userParams,
        searchText: text,
        searchCategory,
        itemsPerPage: 20,
        currentPage: 1
      });

      const response = await apiClient.post('/baasHome/search_audit_into_bihourly_sp_30_60_90_baas', payload, {
        headers: { 'Content-Type': 'text/plain' }
      });

      const data = decryptData<Array<SupplierData[]>>(response.data);

      if (data && data[0]) {
        setSupplierData(data[0]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setTabLoading(false);
    }
  }, [userParams, searchCategory]);

  // Calculate max value for bar chart scaling
  const getMaxValue = (data: MonthData[]) => Math.max(...data.map(d => Math.max(d.inflow, d.processed)), 1);

  // Render bar chart
  const renderBarChart = (data: MonthData[]) => {
    const maxValue = getMaxValue(data);
    return (
      <div className="bg-white p-4 rounded-lg">
        <div className="h-64 flex items-end justify-between gap-1">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex gap-0.5 items-end h-48 w-full justify-center">
                <div
                  className="w-3 bg-blue-400 rounded-t"
                  style={{ height: `${(item.inflow / maxValue) * 100}%`, minHeight: item.inflow > 0 ? '4px' : '0' }}
                />
                <div
                  className="w-3 bg-green-400 rounded-t"
                  style={{ height: `${(item.processed / maxValue) * 100}%`, minHeight: item.processed > 0 ? '4px' : '0' }}
                />
              </div>
              {item.inflow > 0 && <span className="text-xs text-blue-500 -mt-1">{item.inflow}</span>}
              <span className="text-xs text-gray-500 mt-1">{item.month}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded" />
            <span className="text-sm text-gray-600">Inflow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded" />
            <span className="text-sm text-gray-600">Processed</span>
          </div>
        </div>
      </div>
    );
  };

  // Render donut chart
  const renderDonutChart = (inflow: number, processed: number, pending: number) => {
    const total = inflow + processed + pending || 1;
    const inflowPct = (inflow / total) * 100;
    const processedPct = (processed / total) * 100;
    const pendingPct = (pending / total) * 100;

    return (
      <div className="bg-white p-4 rounded-lg flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="70" fill="none" stroke="#e5e7eb" strokeWidth="30" />
            <circle
              cx="100" cy="100" r="70"
              fill="none" stroke="#60a5fa" strokeWidth="30"
              strokeDasharray={`${inflowPct * 4.4} 440`}
              strokeDashoffset="0"
              transform="rotate(-90 100 100)"
            />
            <circle
              cx="100" cy="100" r="70"
              fill="none" stroke="#4ade80" strokeWidth="30"
              strokeDasharray={`${processedPct * 4.4} 440`}
              strokeDashoffset={`-${inflowPct * 4.4}`}
              transform="rotate(-90 100 100)"
            />
            <circle
              cx="100" cy="100" r="70"
              fill="none" stroke="#fb923c" strokeWidth="30"
              strokeDasharray={`${pendingPct * 4.4} 440`}
              strokeDashoffset={`-${(inflowPct + processedPct) * 4.4}`}
              transform="rotate(-90 100 100)"
            />
          </svg>
        </div>
        <div className="ml-8 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full" />
            <span className="text-sm text-gray-600">Inflow ({inflowPct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full" />
            <span className="text-sm text-gray-600">Processed ({processedPct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full" />
            <span className="text-sm text-gray-600">Pending ({pendingPct.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    );
  };

  // Render Batch Inventory tab
  const renderBatchInventory = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Year To Date Overview</h2>

      {tabLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-5 gap-4">
            {batchStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8">
            {renderBarChart(batchMonthData)}
            {renderDonutChart(6, 1, 5)}
          </div>
        </>
      )}
    </div>
  );

  // Render Invoice Inventory tab
  const renderInvoiceInventory = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Invoice Inventory - Year To Date Overview</h2>

      {tabLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-5 gap-4">
            {invoiceStats.length > 0 ? invoiceStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            )) : batchStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8">
            {renderBarChart(invoiceMonthData.length > 0 ? invoiceMonthData : batchMonthData)}
            {renderDonutChart(6, 1, 5)}
          </div>
        </>
      )}
    </div>
  );

  // Render Performance tab
  const renderPerformance = () => (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => handlePerformanceSubTabChange('suppliers')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              performanceSubTab === 'suppliers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Suppliers
          </button>
          <button
            onClick={() => handlePerformanceSubTabChange('agents')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              performanceSubTab === 'agents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Agents
          </button>
        </nav>
      </div>

      {/* Search bar for Suppliers */}
      {performanceSubTab === 'suppliers' && (
        <div className="flex items-center gap-4">
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            {searchConfig.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch((e.target as HTMLInputElement).value)}
            className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Search..."]') as HTMLInputElement;
              if (input) handleSearch(input.value);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      )}

      {tabLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : performanceSubTab === 'suppliers' ? (
        /* Suppliers table */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Supplier</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Today</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Yesterday</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">3-7 Days</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">8-30 Days</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">31-60 Days</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">61-90 Days</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">91+ Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {supplierData.slice((currentPage - 1) * 10, currentPage * 10).map((supplier) => (
                <tr key={supplier.supplier_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{supplier.supplier_name}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{supplier.today}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{supplier.yesterday}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{supplier.days_3_7}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{supplier.days_8_30}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{supplier.days_31_60}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{supplier.days_61_90}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{supplier.days_91_plus}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Agents table */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Agent Name</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Processed</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Pending</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Accuracy Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {agentData.map((agent) => (
                <tr key={agent.agent_id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">{agent.agent_name}</td>
                  <td className="px-6 py-3 text-center text-sm text-gray-600">{agent.processed_count}</td>
                  <td className="px-6 py-3 text-center text-sm text-gray-600">{agent.pending_count}</td>
                  <td className="px-6 py-3 text-center text-sm text-green-600">{agent.accuracy_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'batch':
        return renderBatchInventory();
      case 'invoice':
        return renderInvoiceInventory();
      case 'performance':
        return renderPerformance();
      default:
        return null;
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view the dashboard</p>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-light text-blue-600">
          <span className="text-blue-800 font-semibold">one</span>base
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Selected TimeZone: Asia/Calcutta - {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString()}</span>
          <span className="text-blue-600">{userData?.user_name || 'Digital User'} ▼</span>
        </div>
      </div>

      {/* Sticky Tabs */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {[
            { id: 'batch' as MainTabType, label: 'Batch Inventory' },
            { id: 'invoice' as MainTabType, label: 'Invoice Inventory' },
            { id: 'performance' as MainTabType, label: 'Performance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
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

      {/* Tab Content */}
      <div className="min-h-[400px]">{renderTabContent()}</div>
    </div>
  );
};

export default BusinessHomeView;
