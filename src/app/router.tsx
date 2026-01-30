/**
 * Routing Configuration (React Router v6)
 * Route composition with guards
 * Migrated from AngularJS $routeProvider
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './hooks';
import { selectIsAuthenticated } from '../features/authentication/store/authSlice';

// Pages
import { LoginPage } from '../pages/LoginPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ForgotUsernamePage } from '../pages/ForgotUsernamePage';
import { PasswordSetupPage } from '../pages/PasswordSetupPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';

/**
 * Protected route wrapper
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * Public route wrapper (redirects to home if already authenticated)
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/BusinessHomeViews" replace />;
  }

  return <>{children}</>;
};

/**
 * Application routes
 */
export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/forgot-username" element={<PublicRoute><ForgotUsernamePage /></PublicRoute>} />
      <Route path="/password-setup" element={<PasswordSetupPage />} />

      {/* Protected Routes */}
      <Route path="/BusinessHomeViews" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/BusinessTasks" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/BusinessApps" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/Admin" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/Setting" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/SLADashBoard" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

      {/* Terms of Service */}
      <Route path="/TermsofService" element={<HomePage />} />

      {/* 404 */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
