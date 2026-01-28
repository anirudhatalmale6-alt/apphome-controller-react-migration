/**
 * ApplicationShellView Component
 * Controls global flags (loading, footer, terms)
 * Migrated from AppHomeController.js global state and layout
 */
import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectApplicationShell, setCompanyId, setIsLoginPage } from '../store/applicationShellSlice';
import { selectIsAuthenticated, selectUser } from '../../authentication/store/authSlice';

interface ApplicationShellViewProps {
  children: React.ReactNode;
}

/**
 * Application shell wrapper
 * Handles global state, company ID from URL, and layout
 */
export const ApplicationShellView: React.FC<ApplicationShellViewProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { viewFooterDiv, isLoading, corpDetails } = useAppSelector(selectApplicationShell);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  // Extract CompanyID from URL params
  useEffect(() => {
    const companyId = searchParams.get('CompanyID');
    if (companyId) {
      dispatch(setCompanyId(companyId));
    }
  }, [searchParams, dispatch]);

  // Update isLoginPage based on route
  useEffect(() => {
    const isLogin = location.pathname === '/' || location.pathname === '/login';
    dispatch(setIsLoginPage(isLogin && !isAuthenticated));
  }, [location.pathname, isAuthenticated, dispatch]);

  // Copyright year
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Header - shown when authenticated */}
      {isAuthenticated && user && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            {corpDetails?.logoData ? (
              <img src={corpDetails.logoData} alt="Logo" className="h-8" />
            ) : (
              <span className="font-bold text-xl text-gray-900">OneBase</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.user_name}
            </span>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - shown when configured */}
      {viewFooterDiv && (
        <footer className="bg-white border-t border-gray-200 px-4 py-3 text-center text-sm text-gray-500">
          <p>&copy; {currentYear} OneBase. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
};

export default ApplicationShellView;
