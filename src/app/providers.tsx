/**
 * Global Context Composition
 * Redux Provider and other app-wide context
 */
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Wraps application with all required providers
 */
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

export default Providers;
