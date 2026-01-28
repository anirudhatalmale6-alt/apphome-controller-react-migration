/**
 * Navigation Decision Service
 * Resolves destination paths and navigation rules
 * Migrated from AppHomeController.js path mapping and guard logic
 */
import type { NavigationItem } from '../types/NavigationTypes';
import { DEFAULT_PATH_MAPPING } from '../types/NavigationTypes';

/**
 * Resolves the destination path for a navigation item
 * @param item - Navigation item key
 * @param customMapping - Optional custom path mapping
 */
export const resolveDestinationPath = (
  item: NavigationItem,
  customMapping?: Record<string, string>
): string => {
  const mapping = { ...DEFAULT_PATH_MAPPING, ...customMapping };
  return mapping[item] || '/';
};

/**
 * Determines the navigation item from a path
 * @param path - Current path
 * @param customMapping - Optional custom path mapping
 */
export const getItemFromPath = (
  path: string,
  customMapping?: Record<string, string>
): NavigationItem | null => {
  const mapping = { ...DEFAULT_PATH_MAPPING, ...customMapping };

  const entry = Object.entries(mapping).find(([_, p]) => p === path);
  return entry ? (entry[0] as NavigationItem) : null;
};

/**
 * Checks if navigation should be blocked (e.g., unsaved changes)
 * @param hasUnsavedChanges - Whether there are unsaved changes
 * @param currentPath - Current path
 * @param targetPath - Target path
 */
export const shouldBlockNavigation = (
  hasUnsavedChanges: boolean,
  currentPath: string,
  _targetPath: string
): boolean => {
  if (!hasUnsavedChanges) return false;

  const protectedPaths = [
    '/BusinessCompliance',
    '/ActiveTasks',
    '/ActiveTasksDataEntryAdminPage',
    '/ActiveTasksDataEntryPage',
    '/ActiveTasksDataValidation',
  ];

  return protectedPaths.includes(currentPath);
};

/**
 * Gets the default homepage based on user role
 * @param isDevops - Whether user is devops
 */
export const getDefaultHomepage = (isDevops: boolean): NavigationItem => {
  return isDevops ? 'analytics' : 'home';
};

/**
 * Builds initial navigation selection state
 * @param isDevops - Whether user is devops
 */
export const buildInitialSelection = (isDevops: boolean): Record<NavigationItem, boolean> => {
  const defaultItem = getDefaultHomepage(isDevops);

  return {
    home: defaultItem === 'home',
    tasks: false,
    apps: false,
    analytics: defaultItem === 'analytics',
    recent: false,
    help: false,
    rules: false,
    create: false,
    setting: false,
    admin: false,
  };
};
