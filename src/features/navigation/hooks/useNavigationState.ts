/**
 * Navigation State Hook
 * Tracks current path, selected menu item, loading flags
 * Migrated from AppHomeController.js $rootScope.selectItem, proceedToLocation
 */
import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  selectNavigation,
  setCurrentPath,
  selectItem,
  setLoading,
  resetNavigation,
} from '../store/navigationSlice';
import type { NavigationItem } from '../types/NavigationTypes';

/**
 * Hook for managing navigation state
 */
export const useNavigationState = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = useAppSelector(selectNavigation);

  // Sync with router location
  useEffect(() => {
    dispatch(setCurrentPath(location.pathname));
  }, [location.pathname, dispatch]);

  // Handle navigation item selection
  const handleSelectItem = useCallback((item: NavigationItem) => {
    const path = navState.pathMapping[item];
    if (!path) return;

    dispatch(selectItem(item));
    navigate(path);

    // Reset loading after navigation
    setTimeout(() => {
      dispatch(resetNavigation());
    }, 100);
  }, [dispatch, navigate, navState.pathMapping]);

  // Navigate to specific path
  const navigateTo = useCallback((path: string) => {
    dispatch(setLoading(true));
    navigate(path);
    setTimeout(() => {
      dispatch(resetNavigation());
    }, 100);
  }, [dispatch, navigate]);

  // Get path for navigation item
  const getPathForItem = useCallback((item: NavigationItem): string => {
    return navState.pathMapping[item] || '/';
  }, [navState.pathMapping]);

  return {
    ...navState,
    selectItem: handleSelectItem,
    navigateTo,
    getPathForItem,
  };
};
