/**
 * BusinessStarter Page
 * Customer/BPS selection and queue management
 */
import { NavigationShellView } from '../features/navigation';
import { BusinessStarterView } from '../features/business-starter/components/BusinessStarterView';

export const BusinessStarterPage: React.FC = () => {
  return (
    <NavigationShellView>
      <BusinessStarterView />
    </NavigationShellView>
  );
};

export default BusinessStarterPage;
