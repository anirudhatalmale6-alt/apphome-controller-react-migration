/**
 * Home Page
 * Main authenticated landing page
 * Migrated from home_page.html
 */
import { useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectUser, useAuthenticationState } from '../features/authentication';
import { NavigationShellView } from '../features/navigation';
import { UserProfileView } from '../features/user-profile';

export const HomePage: React.FC = () => {
  const user = useAppSelector(selectUser);
  const { signOut } = useAuthenticationState();
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  if (!user) return null;

  return (
    <NavigationShellView>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user.user_name}
          </h1>
          <p className="text-gray-600 mt-1">
            {user.client_name || 'OneBase Platform'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-gray-900 mb-2">Tasks</h3>
            <p className="text-gray-600 text-sm">View and manage your tasks</p>
          </div>
          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-gray-900 mb-2">Apps</h3>
            <p className="text-gray-600 text-sm">Access your applications</p>
          </div>
          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">View dashboards and reports</p>
          </div>
        </div>

        {/* User Actions */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Account</h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowPasswordChange(true)}
              className="w-full text-left px-4 py-3 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium">Change Password</span>
              <p className="text-sm text-gray-500">Update your account password</p>
            </button>
            <button
              onClick={signOut}
              className="w-full text-left px-4 py-3 rounded bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
            >
              <span className="font-medium">Sign Out</span>
              <p className="text-sm text-red-600">Log out of your account</p>
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-auto">
            <UserProfileView onClose={() => setShowPasswordChange(false)} />
          </div>
        </div>
      )}
    </NavigationShellView>
  );
};

export default HomePage;
