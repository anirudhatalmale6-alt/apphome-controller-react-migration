import { useEffect } from 'react';
import { useBusinessStarterState } from '../hooks/useBusinessStarterState';
import { CustomerSelector } from './CustomerSelector';
import { BusinessProcessGrid } from './BusinessProcessGrid';
import { BusinessUnitSelector } from './BusinessUnitSelector';
import { InsightsTabs } from './InsightsTabs';

export function BusinessStarterView() {
  const {
    landingPageNumber,
    customers,
    selectedBpsList,
    switchToQueuePage,
    loading,
    selectedInsightsTab,
  } = useBusinessStarterState();

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
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Insights Tabs - Always visible at top */}
        <InsightsTabs />

        {/* Content based on selected insights tab */}
        {selectedInsightsTab === 0 && (
          <>
            {/* Landing page - Customer or BPS selection */}
            {landingPageNumber === 0 && customers.length > 1 && (
              <CustomerSelector />
            )}

            {landingPageNumber === 1 && selectedBpsList.length > 0 && (
              <BusinessProcessGrid />
            )}

            {/* Queue selection page */}
            {switchToQueuePage && (
              <BusinessUnitSelector />
            )}
          </>
        )}
      </div>
    </div>
  );
}
