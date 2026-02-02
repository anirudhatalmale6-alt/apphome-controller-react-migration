/**
 * Business Starter View
 * Main component for business starter page
 * Origin: BusinessStarterController.js + BusinessStarterPage.html
 */
import React from 'react';
import { useBusinessStarterState } from '../hooks/useBusinessStarterState';
import { CompanySelector } from './CompanySelector';
import { InsightsTabs } from './InsightsTabs';
import { BusinessProcessGrid } from './BusinessProcessGrid';
import { AdminSettingsPanel } from './AdminSettingsPanel';
import { TechOpsInbox } from './TechOpsInbox';
import { CustomerDashboard } from './CustomerDashboard';
import { LoadingSpinner } from './LoadingSpinner';
import './BusinessStarterView.css';

export const BusinessStarterView: React.FC = () => {
  const {
    landingPageNumber,
    switchToQueuePage,
    analyticsPageLoading,
    isTabLoading,
    selectedCustomerList,
    selectedBpsList,
    selectedInsightsTab,
    insightsTabs,
    locateAdminBps,
    locateAdminTechopsBps,
    isLoadingBpsDetails,
    isLoadingTechopsDetails,
    selectedCustomerId,
    handleSelectPartner,
    handleToggleGridView,
    handleSelectInsightsTab,
    handleGoBackToCustomerList,
    handleGoBackToTechopsCustomerList,
    isGridView,
  } = useBusinessStarterState();

  // Customer ID check (for showing different views)
  const isOptusCustomer = selectedCustomerId === '1';

  if (analyticsPageLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <label className="h4">Please Wait. Loading...</label>
        <label className="h5">Do not refresh the page or Click back button</label>
      </div>
    );
  }

  return (
    <div className="business-starter-container">
      {landingPageNumber === 1 && !switchToQueuePage && (
        <div className="landing-page-flex-container">
          {/* Left side - Company Selector */}
          <div className="company-selector-panel">
            <CompanySelector
              customers={selectedCustomerList}
              onSelectPartner={handleSelectPartner}
            />
          </div>

          {/* Right side - Content Panel */}
          <div className="landing-page-bps-view">
            {/* Tabs */}
            <InsightsTabs
              tabs={insightsTabs}
              selectedTab={selectedInsightsTab}
              onSelectTab={handleSelectInsightsTab}
            />

            {/* Tab Loading Overlay */}
            {isTabLoading && (
              <div className="tab-loading-overlay">
                <div className="spinner" />
                <p>Loading, please wait...</p>
              </div>
            )}

            {/* Tab Content */}
            {!isTabLoading && (
              <div className="tab-content">
                {/* Tab 0: Insights / Business Process Subscription */}
                {selectedInsightsTab === 0 && (
                  <>
                    {isOptusCustomer ? (
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
                {selectedInsightsTab === 1 && (
                  <>
                    {isOptusCustomer && !locateAdminBps && (
                      <CustomerDashboard isAdminSettings />
                    )}
                    {isOptusCustomer && locateAdminBps && !isLoadingBpsDetails && (
                      <AdminSettingsPanel onBack={handleGoBackToCustomerList} />
                    )}
                    {isLoadingBpsDetails && (
                      <div className="loading-overlay-bps">
                        <div className="spinner-bps" />
                        <p>Loading BPS details...</p>
                      </div>
                    )}
                  </>
                )}

                {/* Tab 2: Admin TechOps */}
                {selectedInsightsTab === 2 && (
                  <>
                    {isOptusCustomer && !locateAdminTechopsBps && (
                      <CustomerDashboard isTechOps />
                    )}
                    {isOptusCustomer && locateAdminTechopsBps && !isLoadingTechopsDetails && (
                      <TechOpsInbox onBack={handleGoBackToTechopsCustomerList} />
                    )}
                    {isLoadingTechopsDetails && (
                      <div className="loading-overlay-bps">
                        <div className="spinner-bps" />
                        <p>Loading Inbox...</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessStarterView;
