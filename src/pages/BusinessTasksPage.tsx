/**
 * BusinessTasks Page
 * Tasks view with Recent, Past Due, and Insights tabs
 */
import { NavigationShellView } from '../features/navigation';
import { BusinessTasksView } from '../features/business-tasks/components/BusinessTasksView';

export const BusinessTasksPage: React.FC = () => {
  return (
    <NavigationShellView>
      <BusinessTasksView />
    </NavigationShellView>
  );
};

export default BusinessTasksPage;
