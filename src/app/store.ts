/**
 * Redux Toolkit Store Configuration
 * Central state management - replaces AngularJS $rootScope patterns
 *
 * Session hardening: 401/Unauthorized middleware auto-clears session and redirects
 */
import { configureStore, isRejectedWithValue } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import { authenticationApi } from '../features/authentication/api/authenticationApi';
import { navigationApi } from '../features/navigation/api/navigationApi';
import { userProfileApi } from '../features/user-profile/api/userProfileApi';
import { applicationShellApi } from '../features/application-shell/api/applicationShellApi';
import { businessStarterApi } from '../features/business-starter/api/businessStarterApi';
import { businessAppsApi } from '../features/business-apps/api/businessAppsApi';
import { businessHomeApi } from '../features/business-home/api/businessHomeApi';
import { businessTasksApi } from '../features/business-tasks/api/businessTasksApi';
import { businessContentApi } from '../features/business-content/api/businessContentApi';
import authReducer from '../features/authentication/store/authSlice';
import navigationReducer from '../features/navigation/store/navigationSlice';
import userProfileReducer from '../features/user-profile/store/userProfileSlice';
import applicationShellReducer from '../features/application-shell/store/applicationShellSlice';
import businessStarterReducer from '../features/business-starter/store/businessStarterSlice';
import businessAppsReducer from '../features/business-apps/store/businessAppsSlice';
import businessHomeReducer from '../features/business-home/store/businessHomeSlice';
import businessTasksReducer from '../features/business-tasks/store/businessTasksSlice';
import businessContentReducer from '../features/business-content/store/businessContentSlice';

/**
 * Middleware: intercept 401 Unauthorized API responses
 * Clears session and redirects to login (State 6/9 from feedback docs)
 */
const unauthorizedMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const payload = action.payload as { status?: number };
    if (payload?.status === 401) {
      // Clear all client storage
      try { localStorage.clear(); } catch { /* */ }
      try { sessionStorage.clear(); } catch { /* */ }
      // Redirect to login
      window.location.href = '/';
    }
  }
  return next(action);
};

/**
 * Configured Redux store with RTK Query APIs
 * Migrated from $rootScope and $scope state management
 */
export const store = configureStore({
  reducer: {
    // Feature slices
    auth: authReducer,
    navigation: navigationReducer,
    userProfile: userProfileReducer,
    applicationShell: applicationShellReducer,
    businessStarter: businessStarterReducer,
    businessApps: businessAppsReducer,
    businessHome: businessHomeReducer,
    businessTasks: businessTasksReducer,
    businessContent: businessContentReducer,

    // RTK Query APIs
    [authenticationApi.reducerPath]: authenticationApi.reducer,
    [navigationApi.reducerPath]: navigationApi.reducer,
    [userProfileApi.reducerPath]: userProfileApi.reducer,
    [applicationShellApi.reducerPath]: applicationShellApi.reducer,
    [businessStarterApi.reducerPath]: businessStarterApi.reducer,
    [businessAppsApi.reducerPath]: businessAppsApi.reducer,
    [businessHomeApi.reducerPath]: businessHomeApi.reducer,
    [businessTasksApi.reducerPath]: businessTasksApi.reducer,
    [businessContentApi.reducerPath]: businessContentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in specific paths
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      unauthorizedMiddleware,
      authenticationApi.middleware,
      navigationApi.middleware,
      userProfileApi.middleware,
      applicationShellApi.middleware,
      businessStarterApi.middleware,
      businessAppsApi.middleware,
      businessHomeApi.middleware,
      businessTasksApi.middleware,
      businessContentApi.middleware
    ),
  devTools: import.meta.env.DEV,
});

// Infer RootState and AppDispatch types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
