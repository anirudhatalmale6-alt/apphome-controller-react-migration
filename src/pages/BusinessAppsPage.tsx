/**
 * BusinessApps Page
 * Workflow management with sidebar, menu tabs, and file upload
 */
import { NavigationShellView } from '../features/navigation';
import { BusinessAppsView } from '../features/business-apps/components/BusinessAppsView';

export const BusinessAppsPage: React.FC = () => {
  return (
    <NavigationShellView>
      <BusinessAppsView />
    </NavigationShellView>
  );
};

export default BusinessAppsPage;
