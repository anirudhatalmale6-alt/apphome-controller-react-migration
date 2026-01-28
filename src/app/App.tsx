/**
 * Root Application Shell
 * Hosts global layout, renders router outlet, wraps error boundaries
 */
import { AppRouter } from './router';
import { ApplicationShellView } from '../features/application-shell';

/**
 * Main App component
 */
export const App: React.FC = () => {
  return (
    <ApplicationShellView>
      <AppRouter />
    </ApplicationShellView>
  );
};

export default App;
