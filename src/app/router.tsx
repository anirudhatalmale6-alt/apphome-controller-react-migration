/**
 * Routing Configuration (React Router v6)
 * Route composition with guards
 * Migrated from AngularJS $routeProvider
 *
 * Fixed 03-Feb:
 * - Added /forgot-username route (was missing, causing 404)
 * - Added resolveHomepage() to map AngularJS role_homepage values to React routes
 * - Case-insensitive route matching for role_homepage
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

// Features
import { BusinessStarterView } from '../features/business-starter';
import { BusinessAppsView } from '../features/business-apps';
import { BusinessHomeView } from '../features/business-home';
import { BusinessTasksView } from '../features/business-tasks';
import { PDFLoadingView } from '../features/business-content';
import { NavigationShellView } from '../features/navigation';

/**
 * Map any role_homepage value from the sign-in API to a valid React route.
 * The AngularJS app navigated to `/{role_homepage}` directly.
 * This ensures all known values (including legacy naming) resolve correctly.
 */
export function resolveHomepage(roleHomepage: string): string {
  if (!roleHomepage) return '/BusinessStarter';

  // Normalise for lookup (trim, lowercase)
  const key = roleHomepage.trim().toLowerCase();

  const ROUTE_MAP: Record<string, string> = {
    // Direct React route names (most common)
    businessstarter: '/BusinessStarter',
    businesshomeviews: '/BusinessHomeViews',
    businesstasks: '/BusinessTasks',
    businessapps: '/BusinessApps',
    admin: '/Admin',
    setting: '/Setting',
    sladashboard: '/SLADashBoard',
    serviceanalytics: '/ServiceAnalytics',
    help: '/help',
    termsofservice: '/TermsofService',

    // AngularJS primary route - this is the most common value returned by the sign-in API
    bpaasworkflow: '/BusinessStarter',

    // Legacy AngularJS controller/page names that may still come from the API
    businessstarterctrl: '/BusinessStarter',
    businessstarterpage: '/BusinessStarter',
    businessstartercontroller: '/BusinessStarter',
    businesshomeviewscontroller: '/BusinessHomeViews',
    businesstaskscontroller: '/BusinessTasks',
    businessappscontroller: '/BusinessApps',

    // Business Content / PDF Loading
    pdfloadingpage: '/PDFLoadingPage',
    businesscontent: '/BusinessContent',
    businesscontentcontroller: '/PDFLoadingPage',

    // Workflow action page routes
    dataentryadmin: '/DataEntryAdmin',
    dataentrypage: '/DataEntryPage',
    datavalidation: '/DataValidation',
    techopsticketpreview: '/TechOpsTicketPreview',
    businesscompliance: '/BusinessCompliance',
    activetasksdataentryadminpage: '/ActiveTasksDataEntryAdminPage',
    activetasksdataentrypage: '/ActiveTasksDataEntryPage',
    activetasksdatavalidation: '/ActiveTasksDataValidation',

    // Short aliases from $rootScope.pathMapping
    home: '/BusinessHomeViews',
    tasks: '/BusinessTasks',
    apps: '/BusinessApps',
    recent: '/BusinessTasks',
    activetasks: '/BusinessTasks',
  };

  // Exact match (case-insensitive)
  if (ROUTE_MAP[key]) return ROUTE_MAP[key];

  // If the value already starts with '/', treat it as a path and check it exists
  if (roleHomepage.startsWith('/')) {
    const knownPaths = Object.values(ROUTE_MAP);
    if (knownPaths.includes(roleHomepage)) return roleHomepage;
  }

  // Last resort: prepend '/' and use as-is (original behaviour)
  return `/${roleHomepage}`;
}

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
    return <Navigate to="/BusinessStarter" replace />;
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
      <Route path="/BPaaSWorkflow" element={<ProtectedRoute><BusinessStarterView /></ProtectedRoute>} />
      <Route path="/BusinessStarter" element={<ProtectedRoute><BusinessStarterView /></ProtectedRoute>} />
      <Route path="/BusinessHomeViews" element={<ProtectedRoute><NavigationShellView><BusinessHomeView /></NavigationShellView></ProtectedRoute>} />
      <Route path="/BusinessTasks" element={<ProtectedRoute><NavigationShellView><BusinessTasksView /></NavigationShellView></ProtectedRoute>} />
      <Route path="/BusinessApps" element={<ProtectedRoute><NavigationShellView><BusinessAppsView /></NavigationShellView></ProtectedRoute>} />
      <Route path="/PDFLoadingPage" element={<ProtectedRoute><NavigationShellView><PDFLoadingView /></NavigationShellView></ProtectedRoute>} />
      <Route path="/BusinessContent" element={<ProtectedRoute><NavigationShellView><PDFLoadingView /></NavigationShellView></ProtectedRoute>} />
      {/* Workflow Action Pages (navigated from BusinessApps queue actions) */}
      <Route path="/DataEntryAdmin" element={<ProtectedRoute><NavigationShellView><HomePage /></NavigationShellView></ProtectedRoute>} />
      <Route path="/DataEntryPage" element={<ProtectedRoute><NavigationShellView><HomePage /></NavigationShellView></ProtectedRoute>} />
      <Route path="/DataValidation" element={<ProtectedRoute><NavigationShellView><HomePage /></NavigationShellView></ProtectedRoute>} />
      <Route path="/TechOpsTicketPreview" element={<ProtectedRoute><NavigationShellView><HomePage /></NavigationShellView></ProtectedRoute>} />
      <Route path="/BusinessCompliance" element={<ProtectedRoute><NavigationShellView><HomePage /></NavigationShellView></ProtectedRoute>} />
      <Route path="/ActiveTasksDataEntryAdminPage" element={<ProtectedRoute><NavigationShellView><HomePage /></NavigationShellView></ProtectedRoute>} />
      <Route path="/ActiveTasksDataEntryPage" element={<ProtectedRoute><NavigationShellView><HomePage /></NavigationShellView></ProtectedRoute>} />
      <Route path="/ActiveTasksDataValidation" element={<ProtectedRoute><NavigationShellView><HomePage /></NavigationShellView></ProtectedRoute>} />

      <Route path="/Admin" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/Setting" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/SLADashBoard" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/ServiceAnalytics" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
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
