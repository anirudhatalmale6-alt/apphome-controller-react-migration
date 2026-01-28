/**
 * Navigation Feature Public API
 * Origin Controller: AppHomeController.js
 */

// Components
export { NavigationShellView } from './components/NavigationShellView';

// Hooks
export { useNavigationState } from './hooks/useNavigationState';

// Services
export * from './services/NavigationDecisionService';

// Types
export type * from './types/NavigationTypes';
export { DEFAULT_PATH_MAPPING, HIDDEN_ROUTES, NAVIGATION_ITEMS } from './types/NavigationTypes';

// API
export { navigationApi } from './api/navigationApi';

// Store
export {
  default as navigationReducer,
  selectNavigation,
  selectCurrentPath,
  selectSelectedItem,
  selectIsSidebarHidden,
  setCurrentPath,
  selectItem,
} from './store/navigationSlice';
