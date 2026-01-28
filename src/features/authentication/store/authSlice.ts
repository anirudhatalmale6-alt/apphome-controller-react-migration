/**
 * Authentication Redux Slice
 * State management for authentication feature
 * Migrated from AppHomeController.js $rootScope state
 */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthenticationState, SignInResponse } from '../types/AuthenticationTypes';

const initialState: AuthenticationState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  sessionId: null,
  signedIpAddress: null,
  error: null,
  // Login flow state
  isValidUser: false,
  isMfaEnabled: false,
  isMfaVerified: false,
  showQrCode: false,
  qrCodeUrl: null,
  secretKey: null,
  // Remote key state
  showRemoteKeyModal: false,
  remoteKeyTimer: 0,
  conflictUserName: null,
  conflictUserIp: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Validate user success
    setValidUser: (state, action: PayloadAction<boolean>) => {
      state.isValidUser = action.payload;
    },

    // Set MFA status
    setMfaEnabled: (state, action: PayloadAction<boolean>) => {
      state.isMfaEnabled = action.payload;
      state.isMfaVerified = !action.payload; // If MFA not enabled, consider verified
    },

    // Set MFA verified
    setMfaVerified: (state, action: PayloadAction<boolean>) => {
      state.isMfaVerified = action.payload;
    },

    // Set QR code for MFA setup
    setQrCode: (state, action: PayloadAction<{ url: string; secret: string }>) => {
      state.showQrCode = true;
      state.qrCodeUrl = action.payload.url;
      state.secretKey = action.payload.secret;
    },

    // Hide QR code
    hideQrCode: (state) => {
      state.showQrCode = false;
    },

    // Login success
    loginSuccess: (state, action: PayloadAction<{
      user: SignInResponse;
      sessionId: string;
      signedIpAddress: string;
    }>) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload.user;
      state.sessionId = action.payload.sessionId;
      state.signedIpAddress = action.payload.signedIpAddress;
      state.error = null;
      // Reset flow state
      state.isValidUser = false;
      state.isMfaEnabled = false;
      state.isMfaVerified = false;
      state.showQrCode = false;
      state.showRemoteKeyModal = false;
    },

    // Logout
    logout: () => {
      return { ...initialState };
    },

    // Show remote key modal (concurrent login handling)
    showRemoteKeyPrompt: (state, action: PayloadAction<{ userName: string; ip: string }>) => {
      state.showRemoteKeyModal = true;
      state.conflictUserName = action.payload.userName;
      state.conflictUserIp = action.payload.ip;
      state.remoteKeyTimer = 30;
    },

    // Update remote key timer
    updateRemoteKeyTimer: (state, action: PayloadAction<number>) => {
      state.remoteKeyTimer = action.payload;
    },

    // Hide remote key modal
    hideRemoteKeyModal: (state) => {
      state.showRemoteKeyModal = false;
      state.remoteKeyTimer = 0;
      state.conflictUserName = null;
      state.conflictUserIp = null;
    },

    // Reset authentication state (for new login attempt)
    resetAuthState: (state) => {
      state.isValidUser = false;
      state.isMfaEnabled = false;
      state.isMfaVerified = false;
      state.showQrCode = false;
      state.qrCodeUrl = null;
      state.secretKey = null;
      state.error = null;
      state.showRemoteKeyModal = false;
    },
  },
});

export const {
  setLoading,
  setError,
  setValidUser,
  setMfaEnabled,
  setMfaVerified,
  setQrCode,
  hideQrCode,
  loginSuccess,
  logout,
  showRemoteKeyPrompt,
  updateRemoteKeyTimer,
  hideRemoteKeyModal,
  resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthenticationState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthenticationState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthenticationState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthenticationState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthenticationState }) => state.auth.error;
