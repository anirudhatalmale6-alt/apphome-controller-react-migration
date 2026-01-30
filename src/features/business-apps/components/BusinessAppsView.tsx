import { useEffect } from 'react';
import { useBusinessAppsState } from '../hooks/useBusinessAppsState';
import { AppsSidebar } from './AppsSidebar';
import { AppsMenuTabs } from './AppsMenuTabs';
import { AppsTimelineTabs } from './AppsTimelineTabs';
import { WorkflowTable } from './WorkflowTable';
import { SearchBar } from './SearchBar';
import { AppsUploadView } from './AppsUploadView';

export function BusinessAppsView() {
  const {
    loading,
    loadingWorkflows,
    currentView,
    isSidebarCollapsed,
    selectedQueue,
    menuTabs,
    toggleSidebar,
  } = useBusinessAppsState();

  // Disable browser back button
  useEffect(() => {
    const disableBack = () => window.history.forward();
    window.onload = disableBack;
    window.onpageshow = (evt) => {
      if (evt.persisted) disableBack();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AppsSidebar />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header with BU Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Business Apps</h1>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>

          {/* BU Menu Tabs */}
          {menuTabs.length > 0 && <AppsMenuTabs />}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {selectedQueue ? (
            <>
              {/* Timeline Tabs */}
              <AppsTimelineTabs />

              {/* Search Bar (not for upload view) */}
              {currentView !== 'upload' && <SearchBar />}

              {/* Content based on view */}
              {currentView === 'upload' ? (
                <AppsUploadView />
              ) : (
                <div className="mt-4">
                  {loadingWorkflows ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                  ) : (
                    <WorkflowTable />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">Select a queue from the sidebar to view workflows</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
