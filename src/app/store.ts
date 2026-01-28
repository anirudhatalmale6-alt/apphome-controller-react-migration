/**
 * Redux Toolkit Store Configuration
 * Central state management - replaces AngularJS $rootScope patterns
 */
import { configureStore } from '@reduxjs/toolkit';
import { authenticationApi } from '../features/authentication/api/authenticationApi';
import { navigationApi } from '../features/navigation/api/navigationApi';
import { userProfileApi } from '../features/user-profile/api/userProfileApi';
import { applicationShellApi } from '../features/application-shell/api/applicationShellApi';
import authReducer from '../features/authentication/store/authSlice';
import navigationReducer from '../features/navigation/store/navigationSlice';
import userProfileReducer from '../features/user-profile/store/userProfileSlice';
import applicationShellReducer from '../features/application-shell/store/applicationShellSlice';

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

    // RTK Query APIs
    [authenticationApi.reducerPath]: authenticationApi.reducer,
    [navigationApi.reducerPath]: navigationApi.reducer,
    [userProfileApi.reducerPath]: userProfileApi.reducer,
    [applicationShellApi.reducerPath]: applicationShellApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in specific paths
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      authenticationApi.middleware,
      navigationApi.middleware,
      userProfileApi.middleware,
      applicationShellApi.middleware
    ),
  devTools: import.meta.env.DEV,
});

// Infer RootState and AppDispatch types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
