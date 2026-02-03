/**
 * Business Starter View
 * Main component for business starter page (post-login)
 * Origin: BusinessStarterController.js + BusinessStarterPage.html
 *
 * Fixed 03-Feb:
 * - Layout no longer collapses (landingPageNumber=1 set on mount)
 * - Event-driven API lifecycle: every tab switch triggers fresh API call
 * - Lazy hooks for Dashboard, Admin Settings, TechOps
 * - Auto-select first company on load
 * - Company switch clears previous data and triggers fresh fetch
 * - Skeleton loading, empty, and error states per feedback spec
 * - Layout stability maintained during loading (minHeight containers)
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  selectBusinessStarter,
  setLandingPageNumber,
  setSelectedCustomer,
  selectPartner as selectPartnerAction,
  setSelectedBpsList,
  setSelectedInsightsTab,
  setTabLoading,
  setCustomerDashboardData,
  setSelectedBps,
  setSelectedTechopsBps,
  setInsightsTabs,
} from '../store/businessStarterSlice';
import {
  useLazyLoadCustomerDashboardQuery,
  useLazyLoadAdminSettingsQuery,
  useLazyLoadAdminTechopsQuery,
} from '../api/businessStarterApi';
import { selectAuth, updateUserContext } from '../../authentication/store/authSlice';
import { CompanySelector } from './CompanySelector';
import { InsightsTabs } from './InsightsTabs';
import { BusinessProcessGrid } from './BusinessProcessGrid';
import { AdminSettingsPanel } from './AdminSettingsPanel';
import { TechOpsInbox } from './TechOpsInbox';
import { CustomerDashboard } from './CustomerDashboard';
import { createBpsListForDisplay } from '../services/BusinessStarterService';
import type { InsightTab } from '../types/BusinessStarterTypes';
import './BusinessStarterView.css';

/**
 * Default tab configuration when none come from API
 */
const DEFAULT_TABS: InsightTab[] = [
  { title: 'Insights', enable_label: 1 },
  { title: 'Admin Settings', enable_label: 1 },
  { title: 'TechOps', enable_label: 1 },
];

export const BusinessStarterView: React.FC = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectBusinessStarter);
  const authState = useAppSelector(selectAuth);

  // Lazy query triggers (event-driven, no caching)
  const [triggerDashboard] = useLazyLoadCustomerDashboardQuery();
  const [triggerAdminSettings] = useLazyLoadAdminSettingsQuery();
  const [triggerAdminTechops] = useLazyLoadAdminTechopsQuery();

  // Local UI state
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const initRef = useRef(false);

  const {
    analyticsPageLoading,
    selectedCustomerList,
    selectedBpsList,
    selectedInsightsTab,
    insightsTabs,
    locateAdminBps,
    locateAdminTechopsBps,
    isLoadingBpsDetails,
    isLoadingTechopsDetails,
    selectedCustomerId,
    isGridView,
    businessProcessList,
  } = state;

  const tabs = insightsTabs.length > 0 ? insightsTabs : DEFAULT_TABS;

  // Determine if super company (first company = Insights/Dashboard view)
  const isSuperCompany = selectedCustomerList.length > 0 &&
    selectedCustomerList[0]?.isSelected === true;

  // ─── Credentials for API calls ───
  const userCredentials = {
    username: authState.user?.user_login_id || '',
    userpassword: '', // Not sent for dashboard/admin calls per original
  };

  // ─── Load Insights (Customer Performance Dashboard) ───
  const loadInsightsData = useCallback(async () => {
    setIsContentLoading(true);
    setErrorMessage(null);
    dispatch(setTabLoading(true));

    try {
      const result = await triggerDashboard(userCredentials, true).unwrap();
      if (result) {
        dispatch(setCustomerDashboardData(result));
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setErrorMessage('Unable to load dashboard data. Please retry.');
    } finally {
      setIsContentLoading(false);
      dispatch(setTabLoading(false));
    }
  }, [dispatch, triggerDashboard, userCredentials.username]);

  // ─── Load Admin Settings ───
  const loadAdminSettingsData = useCallback(async () => {
    setIsContentLoading(true);
    setErrorMessage(null);
    dispatch(setTabLoading(true));

    try {
      const result = await triggerAdminSettings(userCredentials, true).unwrap();
      if (result) {
        // Store in dashboard data (reused by CustomerDashboard with isAdminSettings)
        dispatch(setCustomerDashboardData(result as any));
      }
    } catch (err) {
      console.error('Failed to load admin settings:', err);
      setErrorMessage('Unable to load admin settings. Please retry.');
    } finally {
      setIsContentLoading(false);
      dispatch(setTabLoading(false));
    }
  }, [dispatch, triggerAdminSettings, userCredentials.username]);

  // ─── Load TechOps ───
  const loadTechopsData = useCallback(async () => {
    setIsContentLoading(true);
    setErrorMessage(null);
    dispatch(setTabLoading(true));

    try {
      const result = await triggerAdminTechops(userCredentials, true).unwrap();
      if (result) {
        dispatch(setCustomerDashboardData(result as any));
      }
    } catch (err) {
      console.error('Failed to load TechOps:', err);
      setErrorMessage('Unable to load TechOps data. Please retry.');
    } finally {
      setIsContentLoading(false);
      dispatch(setTabLoading(false));
    }
  }, [dispatch, triggerAdminTechops, userCredentials.username]);

  // ─── Tab Switch Handler (event-driven) ───
  const handleSelectInsightsTab = useCallback((tabIndex: number) => {
    dispatch(setSelectedInsightsTab(tabIndex));
    // Reset sub-states
    dispatch(setSelectedBps(null));
    dispatch(setSelectedTechopsBps(null));
    setErrorMessage(null);

    // Trigger appropriate API based on tab
    if (isSuperCompany) {
      switch (tabIndex) {
        case 0:
          loadInsightsData();
          break;
        case 1:
          loadAdminSettingsData();
          break;
        case 2:
          loadTechopsData();
          break;
      }
    }
    // For non-super companies, tab 0 shows BPS grid (no API needed, data from sign-in response)
  }, [dispatch, isSuperCompany, loadInsightsData, loadAdminSettingsData, loadTechopsData]);

  // ─── Company Selection Handler (event-driven) ───
  const handleSelectPartner = useCallback((index: number) => {
    const customer = selectedCustomerList[index];
    if (!customer) return;

    // Update active company state
    dispatch(selectPartnerAction(index));
    dispatch(setSelectedCustomer({ id: customer.customer_id, name: customer.customer_name }));

    // Propagate customer_id to auth user context so downstream controllers use it
    dispatch(updateUserContext({ customer_id: customer.customer_id }));

    // Reset tab to default (Insights)
    dispatch(setSelectedInsightsTab(0));
    dispatch(setSelectedBps(null));
    dispatch(setSelectedTechopsBps(null));
    setErrorMessage(null);

    // Clear previous company dataset
    dispatch(setCustomerDashboardData(null as any));

    const isFirstCompany = index === 0;

    if (isFirstCompany) {
      // Super company → load Customer Performance Dashboard
      loadInsightsData();
    } else {
      // Non-super company → show BPS grid from sign-in response
      if (customer.bps_list && customer.bps_list.length > 0) {
        // Build BPS display list from the sign-in response
        const bpsGrid: any[][] = [];
        let row: any[] = [];
        customer.bps_list.forEach((bps: any, i: number) => {
          row.push(bps);
          if ((i + 1) % 4 === 0) {
            bpsGrid.push(row);
            row = [];
          }
        });
        if (row.length > 0) bpsGrid.push(row);
        dispatch(setSelectedBpsList(bpsGrid));
      } else if (businessProcessList && Object.keys(businessProcessList).length > 0) {
        const bpsList = createBpsListForDisplay(businessProcessList);
        dispatch(setSelectedBpsList(bpsList));
      }
    }
  }, [dispatch, selectedCustomerList, businessProcessList, loadInsightsData]);

  // ─── Back navigation handlers ───
  const handleGoBackToCustomerList = useCallback(() => {
    dispatch(setSelectedBps(null));
  }, [dispatch]);

  const handleGoBackToTechopsCustomerList = useCallback(() => {
    dispatch(setSelectedTechopsBps(null));
  }, [dispatch]);

  // ─── View toggle ───
  const handleToggleGridView = useCallback(() => {
    // Dispatch handled by BusinessProcessGrid internally
  }, []);

  // ─── Retry handler ───
  const handleRetry = useCallback(() => {
    if (isSuperCompany) {
      switch (selectedInsightsTab) {
        case 0: loadInsightsData(); break;
        case 1: loadAdminSettingsData(); break;
        case 2: loadTechopsData(); break;
      }
    }
  }, [isSuperCompany, selectedInsightsTab, loadInsightsData, loadAdminSettingsData, loadTechopsData]);

  // ─── Initial mount: set landing page, default tabs, auto-select first company ───
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Set landing page to 1 so content renders
    dispatch(setLandingPageNumber(1));

    // Set default tabs if not already set
    if (insightsTabs.length === 0) {
      dispatch(setInsightsTabs(DEFAULT_TABS));
    }

    // Auto-select first company if available
    if (selectedCustomerList.length > 0) {
      const firstCustomer = selectedCustomerList[0];
      if (!selectedCustomerId) {
        dispatch(selectPartnerAction(0));
        dispatch(setSelectedCustomer({
          id: firstCustomer.customer_id,
          name: firstCustomer.customer_name,
        }));
      }

      // Load default tab (Insights → Customer Performance Dashboard)
      loadInsightsData();
    }
  }, []);

  // ─── When customer list updates (e.g. after sign-in populates it), auto-select ───
  useEffect(() => {
    if (selectedCustomerList.length > 0 && !selectedCustomerId) {
      const firstCustomer = selectedCustomerList[0];
      dispatch(selectPartnerAction(0));
      dispatch(setSelectedCustomer({
        id: firstCustomer.customer_id,
        name: firstCustomer.customer_name,
      }));
      dispatch(setLandingPageNumber(1));
      loadInsightsData();
    }
  }, [selectedCustomerList.length]);

  // ─── Skeleton Rows ───
  const renderSkeletonRows = (cols: number) => (
    Array.from({ length: 5 }).map((_, i) => (
      <tr key={`skel-${i}`}>
        {Array.from({ length: cols }).map((__, j) => (
          <td key={j} className="mt-td">
            <div style={{ height: '16px', background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
          </td>
        ))}
      </tr>
    ))
  );

  // ─── Analytics page loading (initial sign-in transition) ───
  if (analyticsPageLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #4361ee', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <label className="h4">Please Wait. Loading...</label>
        <label className="h5">Do not refresh the page or Click back button</label>
      </div>
    );
  }

  return (
    <div className="business-starter-container">
      {/* Always render the layout frame to prevent collapse */}
      <div className="landing-page-flex-container" style={{ minHeight: '80vh' }}>
        {/* Left side - Company Selector (always visible, sticky) */}
        <div className="company-selector-panel">
          <CompanySelector
            customers={selectedCustomerList}
            onSelectPartner={handleSelectPartner}
          />
        </div>

        {/* Right side - Content Panel */}
        <div className="landing-page-bps-view" style={{ flex: 1, minHeight: '70vh' }}>
          {/* Tabs (sticky, always visible) */}
          <InsightsTabs
            tabs={tabs}
            selectedTab={selectedInsightsTab}
            onSelectTab={handleSelectInsightsTab}
          />

          {/* Error Banner */}
          {errorMessage && (
            <div style={{
              margin: '12px 16px',
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#dc2626',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>{errorMessage}</span>
              <button
                onClick={handleRetry}
                style={{
                  padding: '4px 16px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Tab Content (maintain container height during loading) */}
          <div className="tab-content" style={{ minHeight: '500px', position: 'relative' }}>

            {/* Content loading skeleton overlay */}
            {isContentLoading && (
              <div style={{ padding: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {renderSkeletonRows(4)}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 0: Insights */}
            {!isContentLoading && selectedInsightsTab === 0 && (
              <>
                {isSuperCompany ? (
                  <CustomerDashboard />
                ) : (
                  <BusinessProcessGrid
                    bpsList={selectedBpsList}
                    isGridView={isGridView}
                    onToggleView={handleToggleGridView}
                  />
                )}
              </>
            )}

            {/* Tab 1: Admin Settings */}
            {!isContentLoading && selectedInsightsTab === 1 && (
              <>
                {isSuperCompany && !locateAdminBps && (
                  <CustomerDashboard isAdminSettings />
                )}
                {isSuperCompany && locateAdminBps && !isLoadingBpsDetails && (
                  <AdminSettingsPanel onBack={handleGoBackToCustomerList} />
                )}
                {isLoadingBpsDetails && (
                  <div style={{ padding: '16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {renderSkeletonRows(4)}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Tab 2: TechOps */}
            {!isContentLoading && selectedInsightsTab === 2 && (
              <>
                {isSuperCompany && !locateAdminTechopsBps && (
                  <CustomerDashboard isTechOps />
                )}
                {isSuperCompany && locateAdminTechopsBps && !isLoadingTechopsDetails && (
                  <TechOpsInbox onBack={handleGoBackToTechopsCustomerList} />
                )}
                {isLoadingTechopsDetails && (
                  <div style={{ padding: '16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {renderSkeletonRows(6)}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Empty state when no super company and no BPS data for non-super */}
            {!isContentLoading && !isSuperCompany && selectedInsightsTab === 0 && selectedBpsList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                No Business Process data available for this company.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessStarterView;
