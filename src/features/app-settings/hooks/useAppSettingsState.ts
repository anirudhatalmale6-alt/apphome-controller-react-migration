/**
 * App Settings State Hook
 * Orchestrates admin settings and user management workflow
 * Replaces AppSettingPage.js $scope/$rootScope methods
 */
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectAuth } from '../../authentication/store/authSlice';
import {
  selectAppSettings,
  setLoading,
  setLoadingState,
  setSettingSelectedTab,
  setActiveUniqueTab,
  setActiveSection,
  setSettingConfig,
  setSuccessMessage,
  setDisplayDateFormat,
  setDateFormats,
  setTimeFormatValue,
  setTimeFormatLabel,
  setDisplayTimeZone,
  setFormattedCurrentTime,
  setFormattedNewTime,
  setCorporationProfile,
  setIsCropping,
  setRemoteKeySuccess,
  setRemoteKeyError,
  setExistingUserList,
  setExistingTotalItems,
  setCurrentPageExisting,
  setReviewUserList,
  setReviewTotalItems,
  setCurrentPageReview,
  setCheckExcelUserData,
  setForValidateUserData,
  setShowForm,
  setIsEditing,
  setEditingUserId,
  setActiveEditType,
  setUserFormData,
  setFormErrors,
  setFormSubmitted,
  setUserFieldResources,
  setSelectedUserIds,
  toggleUserSelection,
  toggleAllUsers,
  setReviewSelectedUserIds,
  toggleReviewUserSelection,
  toggleAllReviewUsers,
  setError,
  resetAppSettingsState,
} from '../store/appSettingsSlice';
import {
  useLazyFetchSettingDataQuery,
  useUpdateInfoSettingMutation,
  useLazySettingDateFormatsQuery,
  useStoreRemoteKeyMutation,
  useSaveCorporationDetailsMutation,
  useLazyExistingUsersQuery,
  useLazyLoadReviewUsersQuery,
  useValidateExcelMutation,
  useReadExcelForUserMutation,
  useLazyUserFieldResourcesQuery,
  useUsersProcessMutation,
  useDeleteUsersMutation,
  useGrantAccessUserMutation,
} from '../api/appSettingsApi';
import {
  formatTermsDate,
  mapUserToFormData,
  mapFormDataToApiPayload,
  parseUserFieldResources,
  flagExceptionUsers,
  normalizeForGrantAccess,
  extractFormErrors,
} from '../services/AppSettingsService';
import type { ExistingUser, CorporationProfile } from '../types/AppSettingsTypes';

export function useAppSettingsState() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const settingsState = useAppSelector(selectAppSettings);

  // RTK Query hooks
  const [triggerFetchSetting] = useLazyFetchSettingDataQuery();
  const [updateInfoSetting] = useUpdateInfoSettingMutation();
  const [triggerDateFormats] = useLazySettingDateFormatsQuery();
  const [storeRemoteKey] = useStoreRemoteKeyMutation();
  const [saveCorporationDetails] = useSaveCorporationDetailsMutation();
  const [triggerExistingUsers] = useLazyExistingUsersQuery();
  const [triggerReviewUsers] = useLazyLoadReviewUsersQuery();
  const [validateExcel] = useValidateExcelMutation();
  const [readExcelForUser] = useReadExcelForUserMutation();
  const [triggerUserFieldResources] = useLazyUserFieldResourcesQuery();
  const [usersProcess] = useUsersProcessMutation();
  const [deleteUsers] = useDeleteUsersMutation();
  const [grantAccessUser] = useGrantAccessUserMutation();

  // ─── Setting Config ───

  /**
   * Load setting config (T&C, date, time, timezone data)
   * Origin: $rootScope.loadFetchForSetting (line ~71)
   */
  const loadFetchForSetting = useCallback(async () => {
    if (!user) return;
    dispatch(setLoading(true));
    try {
      const result = await triggerFetchSetting({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
      }).unwrap();
      dispatch(setSettingConfig(result));
      dispatch(setSuccessMessage(''));
    } catch (err: any) {
      dispatch(setError(err?.message || 'Failed to fetch setting data'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch, triggerFetchSetting]);

  // ─── Terms & Conditions ───

  /**
   * Accept T&C
   * Origin: $scope.accept (line ~127)
   */
  const acceptTerms = useCallback(async () => {
    if (!user) return;
    const currentTime = formatTermsDate(new Date());
    try {
      await updateInfoSetting({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
        colValue: currentTime,
        colName: 'lastupdated_termsconditions',
      }).unwrap();
      dispatch(setSuccessMessage('Thank you for accepting our Terms and Conditions.'));
      setTimeout(() => loadFetchForSetting(), 2000);
    } catch (err: any) {
      dispatch(setError(err?.message || 'Failed to accept terms'));
    }
  }, [user, dispatch, updateInfoSetting, loadFetchForSetting]);

  // ─── Date Format ───

  /**
   * Load available date formats
   * Origin: $rootScope.loadDateFormats (line ~262)
   */
  const loadDateFormats = useCallback(async () => {
    if (!user) return;
    try {
      const result = await triggerDateFormats({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
      }).unwrap();
      dispatch(setDateFormats(result || []));
    } catch (err: any) {
      dispatch(setError(err?.message || 'Failed to load date formats'));
    }
  }, [user, dispatch, triggerDateFormats]);

  /**
   * Save date format
   * Origin: $scope.saveDateFormat (line ~299)
   */
  const saveDateFormat = useCallback(async (displayDateFormat: string) => {
    if (!user) return;
    try {
      await updateInfoSetting({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
        colValue: displayDateFormat,
        colName: 'lastupdated_dateformat',
      }).unwrap();
      dispatch(setSuccessMessage('Date format saved successfully'));
      setTimeout(() => loadFetchForSetting(), 2000);
    } catch (err: any) {
      dispatch(setError(err?.message || 'Failed to save date format'));
    }
  }, [user, dispatch, updateInfoSetting, loadFetchForSetting]);

  // ─── Time Format ───

  /**
   * Save time format
   * Origin: $scope.saveTimeFormat (line ~338)
   */
  const saveTimeFormat = useCallback(async (timeValue: string) => {
    if (!user) return;
    try {
      await updateInfoSetting({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
        colValue: timeValue,
        colName: 'current_timeformat',
      }).unwrap();
      dispatch(setSuccessMessage('Time format saved successfully'));
      setTimeout(() => loadFetchForSetting(), 2000);
    } catch (err: any) {
      dispatch(setError(err?.message || 'Failed to save time format'));
    }
  }, [user, dispatch, updateInfoSetting, loadFetchForSetting]);

  // ─── Timezone ───

  /**
   * Save display timezone
   * Origin: $scope.saveTimeZone (line ~447)
   */
  const saveTimeZone = useCallback(async (displayTimeZone: string) => {
    if (!user) return;
    try {
      await updateInfoSetting({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
        colValue: displayTimeZone,
        colName: 'display_timezone',
      }).unwrap();
      dispatch(setSuccessMessage('Timezone saved successfully'));
      setTimeout(() => loadFetchForSetting(), 2000);
    } catch (err: any) {
      dispatch(setError(err?.message || 'Failed to save timezone'));
    }
  }, [user, dispatch, updateInfoSetting, loadFetchForSetting]);

  // ─── Corporation Profile ───

  /**
   * Save corporation profile (with logo)
   * Origin: $scope.saveCorporationDetailsConfig (line ~526)
   */
  const saveCorporationProfile = useCallback(async (corpProfile: CorporationProfile) => {
    if (!user) return;
    dispatch(setLoading(true));
    try {
      await saveCorporationDetails({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
        bu_id: user.bu_id,
        config_data: JSON.stringify(corpProfile),
      }).unwrap();
      dispatch(setSuccessMessage('Successfully saved!'));
      setTimeout(() => dispatch(setSuccessMessage('')), 2000);
    } catch (err: any) {
      dispatch(setSuccessMessage('Failed to save. Please try again.'));
      setTimeout(() => dispatch(setSuccessMessage('')), 2000);
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch, saveCorporationDetails]);

  // ─── Remote Key ───

  /**
   * Store remote access key
   * Origin: $scope.StoreRemoteKey (line ~614)
   */
  const storeRemoteAccessKey = useCallback(async (remoteKey: string) => {
    if (!user) return;

    if (!remoteKey) {
      dispatch(setRemoteKeyError('Remote key is required.'));
      dispatch(setRemoteKeySuccess(''));
      return;
    }
    if (remoteKey.length !== 8) {
      dispatch(setRemoteKeyError('Remote key must be exactly 8 characters.'));
      dispatch(setRemoteKeySuccess(''));
      return;
    }

    try {
      const result = await storeRemoteKey({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
        user_login_id: user.user_login_id,
        user_id: user.user_id,
        secretKey: remoteKey, // Note: in AngularJS this was encrypted via $rootScope.dataEncryption
      }).unwrap();

      if (result?.[0]?.result === 'Success') {
        dispatch(setRemoteKeySuccess('Remote key stored successfully!'));
        dispatch(setRemoteKeyError(''));
      } else {
        dispatch(setRemoteKeyError('Failed to store remote key. Try again.'));
        dispatch(setRemoteKeySuccess(''));
      }
      setTimeout(() => {
        dispatch(setRemoteKeySuccess(''));
        dispatch(setRemoteKeyError(''));
      }, 3000);
    } catch {
      dispatch(setRemoteKeyError('Error saving remote key.'));
      dispatch(setRemoteKeySuccess(''));
      setTimeout(() => dispatch(setRemoteKeyError('')), 3000);
    }
  }, [user, dispatch, storeRemoteKey]);

  // ─── User Management ───

  /**
   * Load existing users (paginated)
   * Origin: $rootScope.loadExistingUsers (line ~984)
   */
  const loadExistingUsers = useCallback(async (pageSize?: number, page?: number) => {
    if (!user) return;
    const itemsPerPage = pageSize || settingsState.itemsPerPageExisting;
    const currentPage = page || settingsState.currentPageExisting;
    dispatch(setLoadingState(true));
    try {
      const result = await triggerExistingUsers({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
        pageNumber: currentPage,
        pageSize: itemsPerPage,
      }).unwrap();

      if (result?.[0]?.[0]?.result === 'Success' || result?.[0]?.[0]?.result === 'success') {
        dispatch(setExistingUserList(result[0]));
        dispatch(setExistingTotalItems(result[1]?.[0]?.total_count || 0));
      } else if (result?.[0]?.[0]?.result === 'No Data') {
        if (currentPage > 1) {
          dispatch(setCurrentPageExisting(currentPage - 1));
          loadExistingUsers(itemsPerPage, currentPage - 1);
          return;
        }
        dispatch(setExistingUserList([]));
        dispatch(setExistingTotalItems(0));
      } else {
        dispatch(setExistingUserList([]));
      }
    } catch (err: any) {
      dispatch(setError(err?.message || 'Failed to load users'));
    } finally {
      dispatch(setLoadingState(false));
    }
  }, [user, settingsState.itemsPerPageExisting, settingsState.currentPageExisting, dispatch, triggerExistingUsers]);

  /**
   * Load review users (paginated)
   * Origin: $rootScope.loadReviewExistingUsers (line ~1091)
   */
  const loadReviewUsers = useCallback(async (pageSize?: number, page?: number) => {
    if (!user) return;
    const itemsPerPage = pageSize || settingsState.itemsPerPageReview;
    const currentPage = page || settingsState.currentPageReview;
    dispatch(setLoadingState(true));
    try {
      const result = await triggerReviewUsers({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
        pageNumber: currentPage,
        pageSize: itemsPerPage,
      }).unwrap();

      if (result?.[0]?.[0]?.result === 'Success' || result?.[0]?.[0]?.result === 'success') {
        const reviewData = (result[0] || []).map((item: any) => {
          const copy = { ...item };
          if (typeof copy.data_extract_json === 'string') {
            try { copy.data_extract_json = JSON.parse(copy.data_extract_json); } catch { copy.data_extract_json = {}; }
          }
          return copy;
        });
        dispatch(setReviewUserList(reviewData));
        dispatch(setReviewTotalItems(result[1]?.[0]?.total_count || 0));
      } else if (result?.[0]?.[0]?.result === 'No Data') {
        if (currentPage > 1) {
          dispatch(setCurrentPageReview(currentPage - 1));
          loadReviewUsers(itemsPerPage, currentPage - 1);
          return;
        }
        dispatch(setReviewUserList([]));
        dispatch(setReviewTotalItems(0));
      } else {
        dispatch(setReviewUserList([]));
      }
    } catch (err: any) {
      dispatch(setError(err?.message || 'Failed to load review users'));
    } finally {
      dispatch(setLoadingState(false));
    }
  }, [user, settingsState.itemsPerPageReview, settingsState.currentPageReview, dispatch, triggerReviewUsers]);

  /**
   * Load user field resources (dropdown options)
   * Origin: $scope.userFieldResources (line ~1385)
   */
  const loadUserFieldResources = useCallback(async () => {
    if (!user) return;
    try {
      const result = await triggerUserFieldResources({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
      }).unwrap();
      const parsed = parseUserFieldResources(result);
      dispatch(setUserFieldResources(parsed));
    } catch (err: any) {
      dispatch(setError(err?.message || 'Failed to load user field resources'));
    }
  }, [user, dispatch, triggerUserFieldResources]);

  /**
   * Validate Excel file for bulk user upload
   * Origin: $rootScope.FormByUserExcelData (line ~745)
   */
  const validateExcelForUsers = useCallback(async () => {
    if (!user) return;
    dispatch(setLoading(true));
    try {
      const result = await validateExcel({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
      }).unwrap();

      dispatch(setCheckExcelUserData(result || []));
      await loadReviewUsers(settingsState.itemsPerPageReview, settingsState.currentPageReview);

      if (result && result.length > 0) {
        const flagged = flagExceptionUsers(result);
        dispatch(setForValidateUserData(flagged));
        if (result[0]?.result !== 'Error') {
          dispatch(setActiveSection('bulk'));
        }
      } else {
        await loadExistingUsers();
      }
    } catch (err: any) {
      dispatch(setError(err?.message || 'Excel validation failed'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch, validateExcel, loadReviewUsers, loadExistingUsers, settingsState.itemsPerPageReview, settingsState.currentPageReview]);

  /**
   * Import Excel file for bulk user upload
   * Origin: AddUserDialogController $scope.choose (line ~1226)
   */
  const importExcelForUsers = useCallback(async (
    fileName: string,
    fileType: string,
    fileSize: number,
    fileContent: string
  ) => {
    if (!user) return null;
    try {
      const result = await readExcelForUser({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
        user_id: user.user_id,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        file_content: fileContent,
      }).unwrap();
      return result;
    } catch (err: any) {
      dispatch(setError(err?.message || 'Excel import failed'));
      return null;
    }
  }, [user, dispatch, readExcelForUser]);

  /**
   * Submit user form (create/update)
   * Origin: $scope.submitForm (line ~1423)
   */
  const submitUserForm = useCallback(async () => {
    if (!user || !settingsState.userFormData) return;
    dispatch(setLoadingState(true));
    try {
      const apiPayload = mapFormDataToApiPayload(settingsState.userFormData, {
        customer_id: user.customer_id,
        bps_id: user.bps_id,
        user_id: user.user_id,
      });

      await usersProcess({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
        inpuJson: apiPayload,
      }).unwrap();

      dispatch(setFormSubmitted(true));
      dispatch(setIsEditing(false));
      setTimeout(() => loadExistingUsers(), 1000);
    } catch (err: any) {
      dispatch(setError(err?.message || 'Error submitting user data'));
    } finally {
      dispatch(setLoadingState(false));
    }
  }, [user, settingsState.userFormData, dispatch, usersProcess, loadExistingUsers]);

  /**
   * Delete user(s)
   * Origin: $scope.deleteUser (line ~1647)
   */
  const deleteUser = useCallback(async (
    deleteType: 'existingDelete' | 'reviewDelete' | 'multiDelete' | 'reviewMultiDelete' | 'reviewExistingEditDelete',
    userId: string
  ) => {
    if (!user) return;
    dispatch(setLoadingState(true));
    try {
      const result = await deleteUsers({
        customer_id: user.customer_id,
        bps_id: user.bps_id,
        user_id: userId,
        deleteType,
      }).unwrap();

      if (deleteType === 'reviewDelete' || deleteType === 'reviewMultiDelete' || deleteType === 'reviewExistingEditDelete') {
        setTimeout(() => loadReviewUsers(), 150);
      } else {
        setTimeout(() => loadExistingUsers(), 150);
      }

      if (result?.length === 0) {
        dispatch(setShowForm(false));
      }
    } catch (err: any) {
      dispatch(setError(err?.message || 'Delete failed'));
    } finally {
      dispatch(setLoadingState(false));
    }
  }, [user, dispatch, deleteUsers, loadExistingUsers, loadReviewUsers]);

  /**
   * Grant access to user(s)
   * Origin: $scope.grantAccess (line ~1824)
   */
  const grantAccess = useCallback(async (userData?: Record<string, any>) => {
    if (!user) return;
    let payload: { selectedIds: Record<string, any>[] };

    if (userData) {
      payload = { selectedIds: normalizeForGrantAccess(userData) };
    } else {
      const selectedUsers = settingsState.existingUserList.filter(
        (u) => settingsState.selectedUserIds.includes(u.user_id)
      );
      if (selectedUsers.length === 0) return;
      payload = { selectedIds: selectedUsers };
    }

    try {
      const result = await grantAccessUser(payload).unwrap();
      if (result?.[0]?.result === 'Sucess') {
        // Note: "Sucess" is the actual API response (typo in original)
        dispatch(setSuccessMessage('Grant access successful'));
      } else {
        dispatch(setError('Grant access failed'));
      }
    } catch (err: any) {
      dispatch(setError(err?.message || 'Grant access failed'));
    }
  }, [user, dispatch, grantAccessUser, settingsState.existingUserList, settingsState.selectedUserIds]);

  /**
   * Edit user - map API data to form
   * Origin: $scope.editUser (line ~2250)
   */
  const editUser = useCallback((existingUser: ExistingUser, editType: 'existing' | 'review') => {
    dispatch(setEditingUserId(existingUser.user_id));
    dispatch(setActiveEditType(editType));
    const formData = mapUserToFormData(existingUser);
    dispatch(setUserFormData(formData));
    dispatch(setShowForm(true));
    dispatch(setIsEditing(true));

    // Check for validation errors
    const errors = extractFormErrors(formData as any);
    dispatch(setFormErrors(errors));
    // Clear error values from form
    Object.keys(errors).forEach((key) => {
      (formData as any)[key] = '';
    });
    dispatch(setUserFormData(formData));
  }, [dispatch]);

  /**
   * Cancel form
   * Origin: $scope.cancelForm (line ~1588)
   */
  const cancelForm = useCallback(() => {
    dispatch(setShowForm(false));
    dispatch(setUserFormData(null));
    dispatch(setIsEditing(false));
    dispatch(setFormErrors({}));
    dispatch(setFormSubmitted(false));
    dispatch(setLoadingState(true));
    setTimeout(() => {
      loadExistingUsers();
      loadReviewUsers();
      dispatch(setLoadingState(false));
    }, 1000);
  }, [dispatch, loadExistingUsers, loadReviewUsers]);

  /**
   * Switch to BpsConfiguration tab
   * Origin: $scope.loadUniqueTab (line ~715)
   */
  const loadBpsConfigTab = useCallback(() => {
    loadExistingUsers();
    loadUserFieldResources();
    loadReviewUsers();
  }, [loadExistingUsers, loadUserFieldResources, loadReviewUsers]);

  return {
    // State
    settingsState,
    user,

    // Setting config
    loadFetchForSetting,
    acceptTerms,

    // Date format
    loadDateFormats,
    saveDateFormat,

    // Time format
    saveTimeFormat,

    // Timezone
    saveTimeZone,

    // Corp profile
    saveCorporationProfile,

    // Remote key
    storeRemoteAccessKey,

    // User management
    loadExistingUsers,
    loadReviewUsers,
    loadUserFieldResources,
    loadBpsConfigTab,
    validateExcelForUsers,
    importExcelForUsers,
    submitUserForm,
    deleteUser,
    grantAccess,
    editUser,
    cancelForm,

    // Dispatch helpers (for components to update state directly)
    dispatch,
    setSettingSelectedTab,
    setActiveUniqueTab,
    setActiveSection,
    setDisplayDateFormat,
    setTimeFormatValue,
    setTimeFormatLabel,
    setDisplayTimeZone,
    setFormattedCurrentTime,
    setFormattedNewTime,
    setCorporationProfile,
    setIsCropping,
    setShowForm,
    setUserFormData,
    setFormErrors,
    setSelectedUserIds,
    toggleUserSelection,
    toggleAllUsers,
    setReviewSelectedUserIds,
    toggleReviewUserSelection,
    toggleAllReviewUsers,
    setCurrentPageExisting,
    setCurrentPageReview,
    setLoadingState,
    setSuccessMessage,
    resetAppSettingsState,
  };
}
