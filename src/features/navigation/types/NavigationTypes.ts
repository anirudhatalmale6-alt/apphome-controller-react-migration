/**
 * Navigation Types
 * Types for menu items, paths, navigation context
 * Origin: AppHomeController.js $rootScope.pathMapping, isItemSelected
 */

export type NavigationItem =
  | 'home'
  | 'tasks'
  | 'apps'
  | 'admin'
  | 'analytics'
  | 'recent'
  | 'help'
  | 'rules'
  | 'create'
  | 'setting';

export interface PathMapping {
  [key: string]: string;
}

export interface NavigationState {
  currentPath: string;
  selectedItem: NavigationItem | '';
  isLoading: boolean;
  isItemSelected: Record<NavigationItem, boolean>;
  isSidebarHidden: boolean;
  pathMapping: PathMapping;
}

export const DEFAULT_PATH_MAPPING: PathMapping = {
  home: '/BusinessHomeViews',
  tasks: '/BusinessTasks',
  apps: '/BusinessApps',
  admin: '/Admin',
  help: '/help',
  rules: '/rules',
  create: '/create',
  setting: '/Setting',
  recent: '/ActiveTasks',
};

export const HIDDEN_ROUTES = [
  '/SLADashBoard',
  '/ExcelViewPage',
];

export const NAVIGATION_ITEMS: NavigationItem[] = [
  'home', 'tasks', 'apps', 'admin', 'analytics', 'recent', 'help', 'rules', 'create', 'setting'
];

export interface NavigationAction {
  item: NavigationItem;
  path: string;
}
