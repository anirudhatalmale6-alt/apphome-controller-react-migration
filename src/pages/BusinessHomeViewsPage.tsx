/**
 * BusinessHomeViews Page
 * Dashboard with charts, inventory, and performance data
 */
import { NavigationShellView } from '../features/navigation';
import { BusinessHomeView } from '../features/business-home/components/BusinessHomeView';

export const BusinessHomeViewsPage: React.FC = () => {
  return (
    <NavigationShellView>
      <BusinessHomeView />
    </NavigationShellView>
  );
};

export default BusinessHomeViewsPage;
