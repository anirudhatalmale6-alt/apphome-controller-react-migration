/**
 * App Settings Redux Slice
 * State management for admin settings and user management
 * Origin: AppSettingPage.js $scope and $rootScope variables
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type {
  AppSettingsState,
  SettingConfig,
  ExistingUser,
  ReviewUser,
  CorporationProfile,
  DateFormatItem,
  UserFormData,
  UserFieldResources,
} from '../types/AppSettingsTypes';

const initialState: AppSettingsState = {
  // Loading
  isLoading: false,
  isLoadingState: false,

  // Active tabs
  settingSelectedTab: 0,
  activeUniqueTab: 'Setting',
  activeSection: 'users',

  // Setting config
  settingConfig: null,
  successMessage: '',

  // Date format
  displayDateFormat: '',
  dateFormats: [],

  // Time format
  timeFormatValue: '',
  timeFormatLabel: '12 Hours',

  // Timezone
  displayTimeZone: '',
  formattedCurrentTime: '',
  formattedNewTime: '',

  // Corp profile
  corporationProfile: { industry: '' },
  isCropping: false,

  // Remote key
  remoteKeySuccess: '',
  remoteKeyError: '',

  // User management
  existingUserList: [],
  existingTotalItems: 0,
  existingTotalPages: 1,
  currentPageExisting: 1,
  itemsPerPageExisting: 10,

  // Review users
  reviewUserList: [],
  reviewTotalItems: 0,
  reviewTotalPages: 1,
  currentPageReview: 1,
  itemsPerPageReview: 10,
  checkExcelUserData: [],
  forValidateUserData: [],

  // User form
  showForm: false,
  isEditing: false,
  editingUserId: '',
  activeEditType: '',
  userFormData: null,
  formErrors: {},
  formSubmitted: false,

  // User field resources
  userFieldResources: null,

  // Selection
  selectedUserIds: [],
  reviewSelectedUserIds: [],

  // Error
  error: null,
};

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState,
  reducers: {
    // ─── Loading ───
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoadingState: (state, action: PayloadAction<boolean>) => {
      state.isLoadingState = action.payload;
    },

    // ─── Tabs ───
    setSettingSelectedTab: (state, action: PayloadAction<number>) => {
      state.settingSelectedTab = action.payload;
    },
    setActiveUniqueTab: (state, action: PayloadAction<string>) => {
      state.activeUniqueTab = action.payload;
    },
    setActiveSection: (state, action: PayloadAction<'users' | 'bulk'>) => {
      state.activeSection = action.payload;
    },

    // ─── Setting Config ───
    setSettingConfig: (state, action: PayloadAction<SettingConfig | null>) => {
      state.settingConfig = action.payload;
    },
    setSuccessMessage: (state, action: PayloadAction<string>) => {
      state.successMessage = action.payload;
    },

    // ─── Date Format ───
    setDisplayDateFormat: (state, action: PayloadAction<string>) => {
      state.displayDateFormat = action.payload;
    },
    setDateFormats: (state, action: PayloadAction<DateFormatItem[]>) => {
      state.dateFormats = action.payload;
    },

    // ─── Time Format ───
    setTimeFormatValue: (state, action: PayloadAction<string>) => {
      state.timeFormatValue = action.payload;
    },
    setTimeFormatLabel: (state, action: PayloadAction<string>) => {
      state.timeFormatLabel = action.payload;
    },

    // ─── Timezone ───
    setDisplayTimeZone: (state, action: PayloadAction<string>) => {
      state.displayTimeZone = action.payload;
    },
    setFormattedCurrentTime: (state, action: PayloadAction<string>) => {
      state.formattedCurrentTime = action.payload;
    },
    setFormattedNewTime: (state, action: PayloadAction<string>) => {
      state.formattedNewTime = action.payload;
    },

    // ─── Corp Profile ───
    setCorporationProfile: (state, action: PayloadAction<CorporationProfile>) => {
      state.corporationProfile = action.payload;
    },
    updateCorporationField: (state, action: PayloadAction<{ key: string; value: any }>) => {
      (state.corporationProfile as any)[action.payload.key] = action.payload.value;
    },
    setIsCropping: (state, action: PayloadAction<boolean>) => {
      state.isCropping = action.payload;
    },

    // ─── Remote Key ───
    setRemoteKeySuccess: (state, action: PayloadAction<string>) => {
      state.remoteKeySuccess = action.payload;
    },
    setRemoteKeyError: (state, action: PayloadAction<string>) => {
      state.remoteKeyError = action.payload;
    },

    // ─── User Management ───
    setExistingUserList: (state, action: PayloadAction<ExistingUser[]>) => {
      state.existingUserList = action.payload;
    },
    setExistingTotalItems: (state, action: PayloadAction<number>) => {
      state.existingTotalItems = action.payload;
      state.existingTotalPages = Math.ceil(action.payload / state.itemsPerPageExisting) || 1;
    },
    setCurrentPageExisting: (state, action: PayloadAction<number>) => {
      state.currentPageExisting = action.payload;
    },

    // ─── Review Users ───
    setReviewUserList: (state, action: PayloadAction<ReviewUser[]>) => {
      state.reviewUserList = action.payload;
    },
    setReviewTotalItems: (state, action: PayloadAction<number>) => {
      state.reviewTotalItems = action.payload;
      state.reviewTotalPages = Math.ceil(action.payload / state.itemsPerPageReview) || 1;
    },
    setCurrentPageReview: (state, action: PayloadAction<number>) => {
      state.currentPageReview = action.payload;
    },
    setCheckExcelUserData: (state, action: PayloadAction<any[]>) => {
      state.checkExcelUserData = action.payload;
    },
    setForValidateUserData: (state, action: PayloadAction<any[]>) => {
      state.forValidateUserData = action.payload;
    },

    // ─── User Form ───
    setShowForm: (state, action: PayloadAction<boolean>) => {
      state.showForm = action.payload;
    },
    setIsEditing: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
    },
    setEditingUserId: (state, action: PayloadAction<string>) => {
      state.editingUserId = action.payload;
    },
    setActiveEditType: (state, action: PayloadAction<'existing' | 'review' | ''>) => {
      state.activeEditType = action.payload;
    },
    setUserFormData: (state, action: PayloadAction<UserFormData | null>) => {
      state.userFormData = action.payload;
    },
    setFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.formErrors = action.payload;
    },
    setFormSubmitted: (state, action: PayloadAction<boolean>) => {
      state.formSubmitted = action.payload;
    },

    // ─── User Field Resources ───
    setUserFieldResources: (state, action: PayloadAction<UserFieldResources | null>) => {
      state.userFieldResources = action.payload;
    },

    // ─── Selection ───
    setSelectedUserIds: (state, action: PayloadAction<string[]>) => {
      state.selectedUserIds = action.payload;
    },
    toggleUserSelection: (state, action: PayloadAction<string>) => {
      const idx = state.selectedUserIds.indexOf(action.payload);
      if (idx > -1) {
        state.selectedUserIds.splice(idx, 1);
      } else {
        state.selectedUserIds.push(action.payload);
      }
    },
    toggleAllUsers: (state) => {
      if (state.selectedUserIds.length === state.existingUserList.length) {
        state.selectedUserIds = [];
      } else {
        state.selectedUserIds = state.existingUserList.map((u) => u.user_id);
      }
    },
    setReviewSelectedUserIds: (state, action: PayloadAction<string[]>) => {
      state.reviewSelectedUserIds = action.payload;
    },
    toggleReviewUserSelection: (state, action: PayloadAction<string>) => {
      const idx = state.reviewSelectedUserIds.indexOf(action.payload);
      if (idx > -1) {
        state.reviewSelectedUserIds.splice(idx, 1);
      } else {
        state.reviewSelectedUserIds.push(action.payload);
      }
    },
    toggleAllReviewUsers: (state) => {
      if (state.reviewSelectedUserIds.length === state.reviewUserList.length) {
        state.reviewSelectedUserIds = [];
      } else {
        state.reviewSelectedUserIds = state.reviewUserList.map((u) => u.user_id);
      }
    },

    // ─── Error ───
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // ─── Reset ───
    resetAppSettingsState: () => initialState,
  },
});

export const {
  // Loading
  setLoading,
  setLoadingState,
  // Tabs
  setSettingSelectedTab,
  setActiveUniqueTab,
  setActiveSection,
  // Setting Config
  setSettingConfig,
  setSuccessMessage,
  // Date Format
  setDisplayDateFormat,
  setDateFormats,
  // Time Format
  setTimeFormatValue,
  setTimeFormatLabel,
  // Timezone
  setDisplayTimeZone,
  setFormattedCurrentTime,
  setFormattedNewTime,
  // Corp Profile
  setCorporationProfile,
  updateCorporationField,
  setIsCropping,
  // Remote Key
  setRemoteKeySuccess,
  setRemoteKeyError,
  // User Management
  setExistingUserList,
  setExistingTotalItems,
  setCurrentPageExisting,
  // Review Users
  setReviewUserList,
  setReviewTotalItems,
  setCurrentPageReview,
  setCheckExcelUserData,
  setForValidateUserData,
  // User Form
  setShowForm,
  setIsEditing,
  setEditingUserId,
  setActiveEditType,
  setUserFormData,
  setFormErrors,
  setFormSubmitted,
  // User Field Resources
  setUserFieldResources,
  // Selection
  setSelectedUserIds,
  toggleUserSelection,
  toggleAllUsers,
  setReviewSelectedUserIds,
  toggleReviewUserSelection,
  toggleAllReviewUsers,
  // Error
  setError,
  // Reset
  resetAppSettingsState,
} = appSettingsSlice.actions;

// ─── Selectors ───
export const selectAppSettings = (state: RootState) => state.appSettings;
export const selectSettingConfig = (state: RootState) => state.appSettings.settingConfig;
export const selectExistingUserList = (state: RootState) => state.appSettings.existingUserList;
export const selectReviewUserList = (state: RootState) => state.appSettings.reviewUserList;
export const selectShowForm = (state: RootState) => state.appSettings.showForm;
export const selectIsEditing = (state: RootState) => state.appSettings.isEditing;
export const selectUserFieldResources = (state: RootState) => state.appSettings.userFieldResources;
export const selectSelectedUserIds = (state: RootState) => state.appSettings.selectedUserIds;
export const selectActiveUniqueTab = (state: RootState) => state.appSettings.activeUniqueTab;
export const selectActiveSection = (state: RootState) => state.appSettings.activeSection;
export const selectSettingSelectedTab = (state: RootState) => state.appSettings.settingSelectedTab;
export const selectIsLoading = (state: RootState) => state.appSettings.isLoading;

export default appSettingsSlice.reducer;
