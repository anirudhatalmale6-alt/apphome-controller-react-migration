/**
 * User Profile Redux Slice
 * Migrated from AppHomeController.js $scope.user_profile state
 */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserProfileState, UserProfile } from '../types/UserProfileTypes';

const initialState: UserProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  stepForPasswordChange: 1,
  passwordChangeInProcess: false,
};

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPasswordChangeStep: (state, action: PayloadAction<number>) => {
      state.stepForPasswordChange = action.payload;
    },
    setPasswordChangeInProcess: (state, action: PayloadAction<boolean>) => {
      state.passwordChangeInProcess = action.payload;
    },
    resetUserProfile: () => initialState,
  },
});

export const {
  setProfile,
  setLoading,
  setError,
  setPasswordChangeStep,
  setPasswordChangeInProcess,
  resetUserProfile,
} = userProfileSlice.actions;

export default userProfileSlice.reducer;

export const selectUserProfile = (state: { userProfile: UserProfileState }) => state.userProfile;
