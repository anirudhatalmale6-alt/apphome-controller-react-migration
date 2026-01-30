/**
 * Forgot Username Page
 * Flow: Enter email -> API sends username to email -> Show success message
 * Migrated from AppHomeController.js forgotUserName function
 */
import { ForgotUsernameView } from '../features/authentication/components/ForgotUsernameView';

export const ForgotUsernamePage: React.FC = () => {
  return <ForgotUsernameView />;
};

export default ForgotUsernamePage;
