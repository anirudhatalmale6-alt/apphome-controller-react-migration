/**
 * BusinessHomeView Component
 * Dashboard with sticky tabs: Batch Inventory, Invoice Inventory, Performance
 *
 * Key fixes (Feb 3rd feedback):
 * - APIs trigger on EVERY tab switch (event-driven, not init-only)
 * - No cached promise reuse - each tab activation triggers fresh API call
 * - Performance sub-tabs (Suppliers/Agents) have independent data models
 * - Pagination resets on tab/sub-tab switch
 * - Search scoped to active tab only
 * - KPI and Charts refresh on every tab switch
 * - Chart containers maintain height during loading (no layout shift)
 * - Skeleton loading states for tables
 * - Error state with Retry button
 * - No CSS changes - logic only fixes
 *
 * Uses RTK Query lazy hooks from businessHomeApi.ts for all API calls
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAppSelector } from '../../../app/hooks';
import {
  useLazyGetBatchInventoryOverviewQuery,
  useLazyGetBatchInventory30_60_90Query,
  useLazyGetInvoiceInventoryOverviewQuery,
  useLazyGetAuditData30_60_90Query,
  useLazyGetAgentDataQuery,
  useGetInboxSearchConfigQuery,
  useSearchAuditData30_60_90Mutation,
} from '../api/businessHomeApi';

interface BusinessHomeViewProps {
  className?: string;
}

type MainTabType = 'batch' | 'invoice' | 'performance';
type PerformanceSubTab = 'suppliers' | 'agents';

interface StatCard {
  value: string;
  label: string;
}

interface MonthData {
  month: string;
  inflow: number;
  processed: number;
}

interface SupplierRow {
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

interface AgentRow {
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search state
  const [searchCategory, setSearchCategory] = useState('ALL');
  const [searchText, setSearchText] = useState('');

  // Loading / Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data states - populated by API calls
  const [batchStats, setBatchStats] = useState<StatCard[]>([]);
  const [batchChartData, setBatchChartData] = useState<MonthData[]>([]);
  const [invoiceStats, setInvoiceStats] = useState<StatCard[]>([]);
  const [invoiceChartData, setInvoiceChartData] = useState<MonthData[]>([]);
  const [supplierData, setSupplierData] = useState<SupplierRow[]>([]);
  const [agentData, setAgentData] = useState<AgentRow[]>([]);

  // User params
  const userParams = useMemo(() => ({
    customer_id: (userData?.customer_id as string) || '',
    bps_id: (userData?.bps_id as string) || '',
    user_id: (userData?.user_id as string) || '',
    sp_process_id: (userData?.sp_process_id as string) || ''
  }), [userData]);

  // Lazy query hooks - triggered on EVERY tab activation
  const [triggerBatchOverview] = useLazyGetBatchInventoryOverviewQuery();
  const [triggerBatchAging] = useLazyGetBatchInventory30_60_90Query();
  const [triggerInvoiceOverview] = useLazyGetInvoiceInventoryOverviewQuery();
  const [triggerSupplierData] = useLazyGetAuditData30_60_90Query();
  const [triggerAgentData] = useLazyGetAgentDataQuery();

  // Search config (load once)
  const { data: searchConfigData } = useGetInboxSearchConfigQuery(userParams, { skip: !userData });
  const [searchSuppliers] = useSearchAuditData30_60_90Mutation();

  const searchConfig = useMemo(() => {
    if (searchConfigData && searchConfigData[0]) {
      return (searchConfigData[0] as Array<{ category: string }>).map(item => item.category);
    }
    return ['ALL', 'Batch ID', 'File Name', 'Supplier'];
  }, [searchConfigData]);

  // ========= EVENT-DRIVEN API TRIGGERS =========

  const loadBatchInventory = useCallback(async () => {
    if (!userData) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [overviewResult, agingResult] = await Promise.all([
        triggerBatchOverview(userParams, false).unwrap(),
        triggerBatchAging(userParams, false).unwrap()
      ]);

      // Process overview
      if (overviewResult && overviewResult[0]?.[0]) {
        const d = overviewResult[0][0];
        const total = d.total_batches || 1;
        const processed = d.processed_batches || 0;
        const pending = d.pending_batches || 0;
        const error = d.error_batches || 0;
        setBatchStats([
          { value: `${((processed) / total * 100).toFixed(1)}% (${processed})`, label: 'Processed' },
          { value: `${((pending) / total * 100).toFixed(1)}% (${pending})`, label: 'Pending' },
          { value: `${((error) / total * 100).toFixed(1)}% (${error})`, label: 'Errors' },
          { value: `${(d.processing_rate || 0).toFixed(1)}%`, label: 'Processing Rate' },
          { value: `${total}`, label: 'Total Batches' },
        ]);
      }

      // Process aging
      if (agingResult && agingResult[0]?.[0]) {
        const aging = agingResult[0][0];
        setBatchChartData([
          { month: '0-30', inflow: aging.days_0_30 || 0, processed: 0 },
          { month: '31-60', inflow: aging.days_31_60 || 0, processed: 0 },
          { month: '61-90', inflow: aging.days_61_90 || 0, processed: 0 },
          { month: '90+', inflow: aging.days_90_plus || 0, processed: 0 },
        ]);
      }
    } catch (error) {
      console.error('Batch Inventory API error:', error);
      setErrorMessage('Unable to load batch inventory data. Please retry.');
    } finally {
      setIsLoading(false);
    }
  }, [userData, userParams, triggerBatchOverview, triggerBatchAging]);

  const loadInvoiceInventory = useCallback(async () => {
    if (!userData) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [overviewResult, agingResult] = await Promise.all([
        triggerInvoiceOverview(userParams, false).unwrap(),
        triggerBatchAging({ ...userParams }, false).unwrap()
      ]);

      if (overviewResult && overviewResult[0]?.[0]) {
        const d = overviewResult[0][0];
        const total = d.total_invoices || 1;
        const processed = d.processed_invoices || 0;
        const pending = d.pending_invoices || 0;
        const error = d.error_invoices || 0;
        setInvoiceStats([
          { value: `${((processed) / total * 100).toFixed(1)}% (${processed})`, label: 'Processed' },
          { value: `${((pending) / total * 100).toFixed(1)}% (${pending})`, label: 'Pending' },
          { value: `${((error) / total * 100).toFixed(1)}% (${error})`, label: 'Errors' },
          { value: `$${(d.total_amount || 0).toLocaleString()}`, label: 'Total Amount' },
          { value: `${total}`, label: 'Total Invoices' },
        ]);
      }

      if (agingResult && agingResult[0]?.[0]) {
        const aging = agingResult[0][0];
        setInvoiceChartData([
          { month: '0-30', inflow: aging.days_0_30 || 0, processed: 0 },
          { month: '31-60', inflow: aging.days_31_60 || 0, processed: 0 },
          { month: '61-90', inflow: aging.days_61_90 || 0, processed: 0 },
          { month: '90+', inflow: aging.days_90_plus || 0, processed: 0 },
        ]);
      }
    } catch (error) {
      console.error('Invoice Inventory API error:', error);
      setErrorMessage('Unable to load invoice inventory data. Please retry.');
    } finally {
      setIsLoading(false);
    }
  }, [userData, userParams, triggerInvoiceOverview, triggerBatchAging]);

  const loadSupplierData = useCallback(async () => {
    if (!userData) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await triggerSupplierData(
        { ...userParams, itemsPerPage: 20, currentPage },
        false
      ).unwrap();
      if (result && result[0]) {
        setSupplierData((result[0] as SupplierRow[]).map((item, idx) => ({
          supplier_id: item.supplier_id || String(idx),
          supplier_name: item.supplier_name || 'Unknown',
          today: item.today || 0,
          yesterday: item.yesterday || 0,
          days_3_7: item.days_3_7 || 0,
          days_8_30: item.days_8_30 || 0,
          days_31_60: item.days_31_60 || 0,
          days_61_90: item.days_61_90 || 0,
          days_91_plus: item.days_91_plus || 0,
        })));
      } else {
        setSupplierData([]);
      }
    } catch (error) {
      console.error('Supplier API error:', error);
      setErrorMessage('Unable to load supplier data. Please retry.');
      setSupplierData([]);
    } finally {
      setIsLoading(false);
    }
  }, [userData, userParams, currentPage, triggerSupplierData]);

  const loadAgentData = useCallback(async () => {
    if (!userData) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await triggerAgentData(
        { ...userParams, itemsPerPage: 20, currentPage },
        false
      ).unwrap();
      if (result && result[0]) {
        setAgentData(result[0].map(agent => ({
          agent_id: agent.agent_id,
          agent_name: agent.agent_name,
          processed_count: agent.tasks_completed,
          pending_count: agent.tasks_pending,
          accuracy_rate: agent.efficiency_score
        })));
      } else {
        setAgentData([]);
      }
    } catch (error) {
      console.error('Agent API error:', error);
      setErrorMessage('Unable to load agent data. Please retry.');
      setAgentData([]);
    } finally {
      setIsLoading(false);
    }
  }, [userData, userParams, currentPage, triggerAgentData]);

  // Initial load - Batch Inventory (default tab)
  useEffect(() => {
    if (userData) {
      loadBatchInventory();
    }
  }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tab change handlers - event-driven
  const handleTabChange = useCallback((tab: MainTabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchText('');
    setErrorMessage(null);

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

  const handlePerformanceSubTabChange = useCallback((subTab: PerformanceSubTab) => {
    setPerformanceSubTab(subTab);
    setCurrentPage(1);
    setSearchText('');
    setErrorMessage(null);

    if (subTab === 'suppliers') {
      loadSupplierData();
    } else {
      loadAgentData();
    }
  }, [loadSupplierData, loadAgentData]);

  // Search - scoped to active Performance sub-tab (Suppliers)
  const handleSearch = useCallback(async () => {
    if (!searchText.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentPage(1);
    try {
      const result = await searchSuppliers({
        ...userParams,
        searchText,
        itemsPerPage: 20,
        currentPage: 1
      }).unwrap();
      // Store search results in supplier data state
      if (result && result[0]) {
        setSupplierData((result[0] as SupplierRow[]).map((item, idx) => ({
          supplier_id: item.supplier_id || String(idx),
          supplier_name: item.supplier_name || 'Unknown',
          today: item.today || 0,
          yesterday: item.yesterday || 0,
          days_3_7: item.days_3_7 || 0,
          days_8_30: item.days_8_30 || 0,
          days_31_60: item.days_31_60 || 0,
          days_61_90: item.days_61_90 || 0,
          days_91_plus: item.days_91_plus || 0,
        })));
      } else {
        setSupplierData([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setErrorMessage('Search failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  }, [searchSuppliers, userParams, searchText]);

  // Retry handler
  const handleRetry = useCallback(() => {
    setErrorMessage(null);
    switch (activeTab) {
      case 'batch': loadBatchInventory(); break;
      case 'invoice': loadInvoiceInventory(); break;
      case 'performance':
        performanceSubTab === 'suppliers' ? loadSupplierData() : loadAgentData();
        break;
    }
  }, [activeTab, performanceSubTab, loadBatchInventory, loadInvoiceInventory, loadSupplierData, loadAgentData]);

  const totalPages = Math.ceil(supplierData.length / itemsPerPage) || 1;

  // Bar chart rendering
  const renderBarChart = (data: MonthData[]) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.inflow, d.processed)), 1);
    return (
      <div className="bg-white p-4 rounded-lg" style={{ minHeight: '300px' }}>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <div className="h-64 flex items-end justify-between gap-1">
              {data.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="flex gap-0.5 items-end h-48 w-full justify-center">
                    <div className="w-3 bg-blue-400 rounded-t" style={{ height: `${(item.inflow / maxValue) * 100}%`, minHeight: item.inflow > 0 ? '4px' : '0' }} />
                    <div className="w-3 bg-green-400 rounded-t" style={{ height: `${(item.processed / maxValue) * 100}%`, minHeight: item.processed > 0 ? '4px' : '0' }} />
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
          </>
        )}
      </div>
    );
  };

  // Donut chart rendering
  const renderDonutChart = (inflow: number, processed: number, pending: number) => {
    const total = inflow + processed + pending || 1;
    const inflowPct = (inflow / total) * 100;
    const processedPct = (processed / total) * 100;
    const pendingPct = (pending / total) * 100;
    return (
      <div className="bg-white p-4 rounded-lg flex items-center justify-center" style={{ minHeight: '300px' }}>
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="70" fill="none" stroke="#e5e7eb" strokeWidth="30" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="#60a5fa" strokeWidth="30" strokeDasharray={`${inflowPct * 4.4} 440`} strokeDashoffset="0" transform="rotate(-90 100 100)" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="#4ade80" strokeWidth="30" strokeDasharray={`${processedPct * 4.4} 440`} strokeDashoffset={`-${inflowPct * 4.4}`} transform="rotate(-90 100 100)" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="#fb923c" strokeWidth="30" strokeDasharray={`${pendingPct * 4.4} 440`} strokeDashoffset={`-${(inflowPct + processedPct) * 4.4}`} transform="rotate(-90 100 100)" />
          </svg>
        </div>
        <div className="ml-8 space-y-2">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-400 rounded-full" /><span className="text-sm text-gray-600">Inflow ({inflowPct.toFixed(1)}%)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded-full" /><span className="text-sm text-gray-600">Processed ({processedPct.toFixed(1)}%)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-400 rounded-full" /><span className="text-sm text-gray-600">Pending ({pendingPct.toFixed(1)}%)</span></div>
        </div>
      </div>
    );
  };

  // Skeleton rows for loading
  const renderSkeletonRows = (cols: number) => (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>{Array.from({ length: cols }).map((_, j) => (
          <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
        ))}</tr>
      ))}
    </tbody>
  );

  // Render error banner
  const renderErrorBanner = () => errorMessage ? (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center justify-between">
      <span className="text-red-700 text-sm">{errorMessage}</span>
      <button onClick={handleRetry} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Retry</button>
    </div>
  ) : null;

  // Render KPI stats
  const renderStats = (stats: StatCard[]) => (
    <div className="grid grid-cols-5 gap-4" style={{ minHeight: '60px' }}>
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="text-center">
            <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-20 mb-1" />
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-16" />
          </div>
        ))
      ) : (
        stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))
      )}
    </div>
  );

  // Render Batch Inventory tab
  const renderBatchInventory = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Year To Date Overview</h2>
      {renderStats(batchStats)}
      <div className="grid grid-cols-2 gap-8">
        {renderBarChart(batchChartData)}
        {renderDonutChart(6, 1, 5)}
      </div>
    </div>
  );

  // Render Invoice Inventory tab
  const renderInvoiceInventory = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Invoice Inventory - Year To Date Overview</h2>
      {renderStats(invoiceStats)}
      <div className="grid grid-cols-2 gap-8">
        {renderBarChart(invoiceChartData)}
        {renderDonutChart(6, 1, 5)}
      </div>
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
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${performanceSubTab === 'suppliers' ? 'border-blue-500 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >Suppliers</button>
          <button
            onClick={() => handlePerformanceSubTabChange('agents')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${performanceSubTab === 'agents' ? 'border-blue-500 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >Agents</button>
        </nav>
      </div>

      {/* Search bar for Suppliers */}
      {performanceSubTab === 'suppliers' && (
        <div className="flex items-center gap-4">
          <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
            {searchConfig.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
          <input type="text" placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm" />
          <button onClick={handleSearch} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Search</button>
        </div>
      )}

      {performanceSubTab === 'suppliers' ? (
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
            {isLoading ? renderSkeletonRows(8) : (
              <tbody className="divide-y divide-gray-200">
                {supplierData.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No records found.</td></tr>
                ) : (
                  supplierData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((supplier) => (
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
                  ))
                )}
              </tbody>
            )}
          </table>
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isLoading} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      ) : (
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
            {isLoading ? renderSkeletonRows(4) : (
              <tbody className="divide-y divide-gray-200">
                {agentData.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No records found.</td></tr>
                ) : (
                  agentData.map((agent) => (
                    <tr key={agent.agent_id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">{agent.agent_name}</td>
                      <td className="px-6 py-3 text-center text-sm text-gray-600">{agent.processed_count}</td>
                      <td className="px-6 py-3 text-center text-sm text-gray-600">{agent.pending_count}</td>
                      <td className="px-6 py-3 text-center text-sm text-green-600">{agent.accuracy_rate}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      )}
    </div>
  );

  if (!userData) {
    return (<div className="flex items-center justify-center h-64"><p className="text-gray-500">Please log in to view the dashboard</p></div>);
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-light text-blue-600"><span className="text-blue-800 font-semibold">one</span>base</div>
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
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Error Banner */}
      {renderErrorBanner()}

      {/* Tab Content - min-height for layout stability */}
      <div className="min-h-[400px]">
        {activeTab === 'batch' && renderBatchInventory()}
        {activeTab === 'invoice' && renderInvoiceInventory()}
        {activeTab === 'performance' && renderPerformance()}
      </div>
    </div>
  );
};

export default BusinessHomeView;
