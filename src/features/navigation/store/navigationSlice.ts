/**
 * Navigation Redux Slice
 * State management for navigation feature
 * Migrated from AppHomeController.js $rootScope navigation state
 */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { NavigationState, NavigationItem } from '../types/NavigationTypes';
import { DEFAULT_PATH_MAPPING, HIDDEN_ROUTES, NAVIGATION_ITEMS } from '../types/NavigationTypes';

const initialIsItemSelected = NAVIGATION_ITEMS.reduce((acc, item) => {
  acc[item] = item === 'home'; // Default: home selected
  return acc;
}, {} as Record<NavigationItem, boolean>);

const initialState: NavigationState = {
  currentPath: '/',
  selectedItem: 'home',
  isLoading: false,
  isItemSelected: initialIsItemSelected,
  isSidebarHidden: false,
  pathMapping: DEFAULT_PATH_MAPPING,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setCurrentPath: (state, action: PayloadAction<string>) => {
      state.currentPath = action.payload;
      state.isSidebarHidden = HIDDEN_ROUTES.includes(action.payload);

      // Update selected item based on path
      const matchedItem = Object.entries(state.pathMapping).find(
        ([_, path]) => path === action.payload
      );

      if (matchedItem) {
        const item = matchedItem[0] as NavigationItem;
        state.selectedItem = item;

        // Reset all, then select current
        NAVIGATION_ITEMS.forEach(navItem => {
          state.isItemSelected[navItem] = navItem === item;
        });
      }
    },

    selectItem: (state, action: PayloadAction<NavigationItem>) => {
      const item = action.payload;
      state.selectedItem = item;
      state.isLoading = true;

      // Reset all, then select current
      NAVIGATION_ITEMS.forEach(navItem => {
        state.isItemSelected[navItem] = navItem === item;
      });
    },

    updatePathMapping: (state, action: PayloadAction<{ key: string; path: string }>) => {
      state.pathMapping[action.payload.key] = action.payload.path;
    },

    resetNavigation: (state) => {
      state.isLoading = false;
    },
  },
});

export const {
  setLoading,
  setCurrentPath,
  selectItem,
  updatePathMapping,
  resetNavigation,
} = navigationSlice.actions;

export default navigationSlice.reducer;

// Selectors
export const selectNavigation = (state: { navigation: NavigationState }) => state.navigation;
export const selectCurrentPath = (state: { navigation: NavigationState }) => state.navigation.currentPath;
export const selectSelectedItem = (state: { navigation: NavigationState }) => state.navigation.selectedItem;
export const selectIsSidebarHidden = (state: { navigation: NavigationState }) => state.navigation.isSidebarHidden;
