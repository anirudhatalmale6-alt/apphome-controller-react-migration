/**
 * Application Shell Redux Slice
 * Migrated from AppHomeController.js $rootScope global state
 */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ApplicationShellState, CorpDetails } from '../types/ApplicationShellTypes';

const initialState: ApplicationShellState = {
  isLoginPage: true,
  viewFooterDiv: true,
  isLoading: false,
  loadingAfterSignIn: false,
  companyId: null,
  isBusinessStarterLoaded: true,
  corpDetails: null,
  pageNotFound: false,
};

const applicationShellSlice = createSlice({
  name: 'applicationShell',
  initialState,
  reducers: {
    setIsLoginPage: (state, action: PayloadAction<boolean>) => {
      state.isLoginPage = action.payload;
    },
    setViewFooter: (state, action: PayloadAction<boolean>) => {
      state.viewFooterDiv = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoadingAfterSignIn: (state, action: PayloadAction<boolean>) => {
      state.loadingAfterSignIn = action.payload;
    },
    setCompanyId: (state, action: PayloadAction<string | null>) => {
      state.companyId = action.payload;
      state.isLoginPage = action.payload === null;
    },
    setCorpDetails: (state, action: PayloadAction<CorpDetails | null>) => {
      state.corpDetails = action.payload;
    },
    setPageNotFound: (state, action: PayloadAction<boolean>) => {
      state.pageNotFound = action.payload;
    },
    setBusinessStarterLoaded: (state, action: PayloadAction<boolean>) => {
      state.isBusinessStarterLoaded = action.payload;
    },
    resetShell: () => initialState,
  },
});

export const {
  setIsLoginPage,
  setViewFooter,
  setLoading,
  setLoadingAfterSignIn,
  setCompanyId,
  setCorpDetails,
  setPageNotFound,
  setBusinessStarterLoaded,
  resetShell,
} = applicationShellSlice.actions;

export default applicationShellSlice.reducer;

export const selectApplicationShell = (state: { applicationShell: ApplicationShellState }) => state.applicationShell;
export const selectIsLoginPage = (state: { applicationShell: ApplicationShellState }) => state.applicationShell.isLoginPage;
