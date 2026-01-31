/**
 * BusinessStarter Page (BPaaSWorkflow)
 * Post-login landing page without global navigation shell
 * Contains: Company sidebar, Insights/Admin/TechOps tabs
 */
import { BusinessStarterView } from '../features/business-starter/components/BusinessStarterView';

export const BusinessStarterPage: React.FC = () => {
  // No NavigationShellView wrapper - this page has its own layout
  return <BusinessStarterView />;
};

export default BusinessStarterPage;
