/**
 * Business Apps View
 * Main component for business apps page
 * Origin: BusinessAppsController.js + BusinessApps.html
 */
import React, { useEffect } from 'react';
import { useBusinessAppsState } from '../hooks/useBusinessAppsState';
import { useLazyLoadBuQueueActionsQuery, useLazyLoadDisplayTimeForInboxQuery } from '../api/businessAppsApi';
import { useAppSelector } from '../../../app/hooks';
import { selectUser } from '../../authentication/store/authSlice';
import { AppsSidebar } from './AppsSidebar';
import { AppsMenuTabs } from './AppsMenuTabs';
import { AppsTimelineTabs } from './AppsTimelineTabs';
import { AppsRecentView } from './AppsRecentView';
import { AppsPastDueView } from './AppsPastDueView';
import { AppsCustomView } from './AppsCustomView';
import { AppsUploadView } from './AppsUploadView';
import { LoadingSpinner } from '../../business-starter/components/LoadingSpinner';
import './BusinessAppsView.css';

export const BusinessAppsView: React.FC = () => {
  const user = useAppSelector(selectUser);
  const {
    analyticsPageLoading,
    appPageLoading,
    isDashboardAvailable,
    menuTabs,
    selectedTabIndex,
    selectedTab,
    tabs,
    buQueueActionsItems,
    expandedSections,
    activeItemIndex,
    ifMenuUploads,
    handleSelectMenuTab,
    handleSelectTab,
    handleToggleSection,
    handleSwitchingByQueues,
    handleGoBackToBusinessProcess,
    processQueueDataResponse,
  } = useBusinessAppsState();

  const [loadQueueData] = useLazyLoadBuQueueActionsQuery();
  const [loadDisplayTime] = useLazyLoadDisplayTimeForInboxQuery();

  // Load queue data on mount
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const result = await loadQueueData({
            customer_id: user.customer_id,
            bps_id: user.bps_id,
            user_id: user.user_id,
            pageNumber: 1,
            pageSize: 10,
          }).unwrap();

          processQueueDataResponse(result);

          // Load display time
          await loadDisplayTime({
            customer_id: user.customer_id,
            bps_id: user.bps_id,
          });
        } catch (error) {
          console.error('Failed to load queue data:', error);
        }
      };

      fetchData();
    }
  }, [user, loadQueueData, loadDisplayTime, processQueueDataResponse]);

  // Loading state
  if (analyticsPageLoading) {
    return (
      <div className="apps-loading-container">
        <LoadingSpinner />
        <label className="h4">Please Wait. Loading...</label>
        <label className="h5">Do not refresh the page or Click back button</label>
      </div>
    );
  }

  // No dashboard available
  if (!isDashboardAvailable) {
    return (
      <div className="apps-no-dashboard">
        <div className="no-dashboard-content">
          <label className="h3">
            <i className="fa fa-info-circle" /> No Dashboard is Available
          </label>
          <span
            className="refresh-link"
            onClick={() => loadQueueData({
              customer_id: user?.customer_id || '',
              bps_id: user?.bps_id || '',
              user_id: user?.user_id || '',
              pageNumber: 1,
              pageSize: 10,
            })}
          >
            <strong>Refresh Dashboard <i className="fa fa-refresh" /></strong>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="apps-main-content">
      {/* Back button */}
      <div className="apps-header">
        <button className="btn-back-to-bps" onClick={handleGoBackToBusinessProcess}>
          <i className="fa fa-chevron-circle-left" />
          <strong>Business Process</strong>
        </button>
      </div>

      {/* Menu Tabs */}
      <AppsMenuTabs
        tabs={menuTabs}
        selectedIndex={selectedTabIndex}
        onSelectTab={handleSelectMenuTab}
      />

      <div className="apps-container">
        {/* Sidebar */}
        <AppsSidebar
          queueItems={buQueueActionsItems}
          expandedSections={expandedSections}
          activeItemIndex={activeItemIndex}
          onToggleSection={handleToggleSection}
          onSelectAction={handleSwitchingByQueues}
        />

        {/* Main Content */}
        <main className="apps-main">
          {/* Upload View */}
          {ifMenuUploads && <AppsUploadView />}

          {/* Timeline Tabs & Content */}
          {!ifMenuUploads && (
            <>
              <AppsTimelineTabs
                tabs={tabs}
                selectedTab={selectedTab}
                onSelectTab={handleSelectTab}
              />

              {/* Tab Content */}
              {!appPageLoading && (
                <div className="apps-tab-content">
                  {selectedTab === 0 && <AppsRecentView />}
                  {selectedTab === 1 && <AppsPastDueView />}
                  {selectedTab === 2 && <AppsCustomView />}
                </div>
              )}

              {/* Loading overlay */}
              {appPageLoading && (
                <div className="apps-page-loading">
                  <LoadingSpinner />
                  <label className="h4">Please Wait. Loading...</label>
                  <label className="h5">Do not refresh the page or Click back button</label>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default BusinessAppsView;
