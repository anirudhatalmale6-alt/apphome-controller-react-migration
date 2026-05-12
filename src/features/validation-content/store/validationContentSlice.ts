/**
 * Validation Content Redux Slice
 * State management for validation workflow
 * Origin: ValidationContentController.js $scope and $rootScope variables
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  ValidationContentState,
  SelectedDIN,
  MediaConfig,
  IXSDDataHeader,
  WorkflowConfigItem,
  FilteredException,
  ExceptionDetail,
  CoordinatesPosition,
  ExcelCellPosition,
  ExcelDataConfig,
} from '../types/ValidationContentTypes';

const initialState: ValidationContentState = {
  // Loading states
  isLoading: false,
  isWorkflowProcessing: false,
  isSaving: false,

  // DIN / Transaction
  selectedDIN: null,
  selectedDinNo: '',
  selectedUinNo: '',
  currentStatus: '',
  currentVersion: '',
  currentDinSubIndex: '',

  // Media / Document
  mediaConfig: [],
  selectedMedia: '',
  currentMediaIndex: 0,
  selectedMediaType: 'PDF-EDI',
  currentPageNew: 1,
  newPageNumber: 1,
  totalPages: 1,
  selectedMediaSource: '',
  selectedMediaSourcePath: '',
  pdfWidth: 876,
  pdfHeight: 900,

  // iXSD Data
  ixsdDataHeaders: [],
  ixsdDataHeadersBackup: [],
  selectedDataJson: null,
  selectedExceptionJson: null,
  iXSDDataJson: [],
  fieldFormatsFor999: [],
  bundleDesign: null,
  prepMxsd: null,

  // Edit state
  enableEditStatus: false,
  enableUserInformation: true,
  saveProcessIsCompleted: false,
  isAnyLineItemDeleted: false,
  isNewLineItemAdded: false,
  isExtractedDataChanged: false,

  // Tab / Header selection
  selectedDataHeader: null,
  currentHeaderIndex: 0,
  selectedIndex: 0,

  // Line item
  selectedLineItemIndex: 0,
  singleLineItemView: false,
  singleLineItemIndexToShow: 0,
  selectedLineItemObj: null,

  // Workflow
  workflowActionStarted: false,
  fromController: '',
  workflowConfig: [],
  hasExceptions: false,
  showExceptionSidebar: false,

  // Exception / Filter
  filteredException: [],
  exceptionDetails: null,
  isTabsFiltered: false,

  // Excel/EDI
  excelDataConfig: {},
  selectedSheet: '',
  selectedCells: [],
  pasteTarget: null,
  excelClipboard: {},
  excelTrash: {},

  // JCrop
  jCropToolIsActive: false,
  coordinatesPositions: null,

  // Service
  serviceDashboard: null,
  queueCatalog: [],

  // Error
  error: null,
};

const validationContentSlice = createSlice({
  name: 'validationContent',
  initialState,
  reducers: {
    // ─── Loading States ───
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setWorkflowProcessing: (state, action: PayloadAction<boolean>) => {
      state.isWorkflowProcessing = action.payload;
    },
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },

    // ─── DIN / Transaction ───
    setSelectedDIN: (state, action: PayloadAction<SelectedDIN | null>) => {
      state.selectedDIN = action.payload;
      if (action.payload) {
        state.selectedDinNo = action.payload.din;
        state.selectedUinNo = action.payload.uin;
      }
    },
    setCurrentStatus: (state, action: PayloadAction<string>) => {
      state.currentStatus = action.payload;
    },
    setCurrentVersion: (state, action: PayloadAction<string>) => {
      state.currentVersion = action.payload;
    },
    setCurrentDinSubIndex: (state, action: PayloadAction<string>) => {
      state.currentDinSubIndex = action.payload;
    },

    // ─── Media / Document ───
    setMediaConfig: (state, action: PayloadAction<MediaConfig[]>) => {
      state.mediaConfig = action.payload;
    },
    setSelectedMedia: (state, action: PayloadAction<string>) => {
      state.selectedMedia = action.payload;
    },
    setCurrentMediaIndex: (state, action: PayloadAction<number>) => {
      state.currentMediaIndex = action.payload;
    },
    setSelectedMediaType: (state, action: PayloadAction<string>) => {
      state.selectedMediaType = action.payload;
    },
    setCurrentPageNew: (state, action: PayloadAction<number>) => {
      state.currentPageNew = action.payload;
    },
    setNewPageNumber: (state, action: PayloadAction<number>) => {
      state.newPageNumber = action.payload;
    },
    setTotalPages: (state, action: PayloadAction<number>) => {
      state.totalPages = action.payload;
    },
    setSelectedMediaSource: (state, action: PayloadAction<string>) => {
      state.selectedMediaSource = action.payload;
    },
    setSelectedMediaSourcePath: (state, action: PayloadAction<string>) => {
      state.selectedMediaSourcePath = action.payload;
    },
    setPdfDimensions: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.pdfWidth = action.payload.width;
      state.pdfHeight = action.payload.height;
    },

    // ─── iXSD Data ───
    setIxsdDataHeaders: (state, action: PayloadAction<IXSDDataHeader[]>) => {
      state.ixsdDataHeaders = action.payload;
    },
    setIxsdDataHeadersBackup: (state, action: PayloadAction<IXSDDataHeader[]>) => {
      state.ixsdDataHeadersBackup = action.payload;
    },
    setSelectedDataJson: (state, action: PayloadAction<any>) => {
      state.selectedDataJson = action.payload;
    },
    setSelectedExceptionJson: (state, action: PayloadAction<any>) => {
      state.selectedExceptionJson = action.payload;
    },
    setIXSDDataJson: (state, action: PayloadAction<any[]>) => {
      state.iXSDDataJson = action.payload;
    },
    setFieldFormatsFor999: (state, action: PayloadAction<any[]>) => {
      state.fieldFormatsFor999 = action.payload;
    },
    setBundleDesign: (state, action: PayloadAction<any>) => {
      state.bundleDesign = action.payload;
    },
    setPrepMxsd: (state, action: PayloadAction<any>) => {
      state.prepMxsd = action.payload;
    },

    // ─── Edit State ───
    setEnableEditStatus: (state, action: PayloadAction<boolean>) => {
      state.enableEditStatus = action.payload;
    },
    setEnableUserInformation: (state, action: PayloadAction<boolean>) => {
      state.enableUserInformation = action.payload;
    },
    setSaveProcessIsCompleted: (state, action: PayloadAction<boolean>) => {
      state.saveProcessIsCompleted = action.payload;
    },
    setIsAnyLineItemDeleted: (state, action: PayloadAction<boolean>) => {
      state.isAnyLineItemDeleted = action.payload;
    },
    setIsNewLineItemAdded: (state, action: PayloadAction<boolean>) => {
      state.isNewLineItemAdded = action.payload;
    },
    setIsExtractedDataChanged: (state, action: PayloadAction<boolean>) => {
      state.isExtractedDataChanged = action.payload;
    },

    // ─── Tab / Header Selection ───
    setSelectedDataHeader: (state, action: PayloadAction<IXSDDataHeader | null>) => {
      state.selectedDataHeader = action.payload;
    },
    setCurrentHeaderIndex: (state, action: PayloadAction<number>) => {
      state.currentHeaderIndex = action.payload;
    },
    setSelectedIndex: (state, action: PayloadAction<number>) => {
      state.selectedIndex = action.payload;
    },

    // ─── Line Item ───
    setSelectedLineItemIndex: (state, action: PayloadAction<number>) => {
      state.selectedLineItemIndex = action.payload;
    },
    setSingleLineItemView: (state, action: PayloadAction<boolean>) => {
      state.singleLineItemView = action.payload;
    },
    setSingleLineItemIndexToShow: (state, action: PayloadAction<number>) => {
      state.singleLineItemIndexToShow = action.payload;
    },
    setSelectedLineItemObj: (state, action: PayloadAction<any>) => {
      state.selectedLineItemObj = action.payload;
    },

    // ─── Workflow ───
    setWorkflowActionStarted: (state, action: PayloadAction<boolean>) => {
      state.workflowActionStarted = action.payload;
    },
    setFromController: (state, action: PayloadAction<'apps' | 'tasks' | ''>) => {
      state.fromController = action.payload;
    },
    setWorkflowConfig: (state, action: PayloadAction<WorkflowConfigItem[]>) => {
      state.workflowConfig = action.payload;
    },
    setHasExceptions: (state, action: PayloadAction<boolean>) => {
      state.hasExceptions = action.payload;
    },
    setShowExceptionSidebar: (state, action: PayloadAction<boolean>) => {
      state.showExceptionSidebar = action.payload;
    },

    // ─── Exception / Filter ───
    setFilteredException: (state, action: PayloadAction<FilteredException[]>) => {
      state.filteredException = action.payload;
    },
    setExceptionDetails: (state, action: PayloadAction<ExceptionDetail | null>) => {
      state.exceptionDetails = action.payload;
    },
    setIsTabsFiltered: (state, action: PayloadAction<boolean>) => {
      state.isTabsFiltered = action.payload;
    },

    // ─── Excel/EDI ───
    setExcelDataConfig: (state, action: PayloadAction<Record<string, ExcelDataConfig>>) => {
      state.excelDataConfig = action.payload;
    },
    setSelectedSheet: (state, action: PayloadAction<string>) => {
      state.selectedSheet = action.payload;
    },
    setSelectedCells: (state, action: PayloadAction<ExcelCellPosition[]>) => {
      state.selectedCells = action.payload;
    },
    setPasteTarget: (state, action: PayloadAction<ExcelCellPosition | null>) => {
      state.pasteTarget = action.payload;
    },
    setExcelClipboard: (state, action: PayloadAction<Record<string, any[]>>) => {
      state.excelClipboard = action.payload;
    },
    setExcelTrash: (state, action: PayloadAction<Record<string, any[]>>) => {
      state.excelTrash = action.payload;
    },

    // ─── JCrop ───
    setJCropToolIsActive: (state, action: PayloadAction<boolean>) => {
      state.jCropToolIsActive = action.payload;
    },
    setCoordinatesPositions: (state, action: PayloadAction<CoordinatesPosition | null>) => {
      state.coordinatesPositions = action.payload;
    },

    // ─── Service ───
    setServiceDashboard: (state, action: PayloadAction<any>) => {
      state.serviceDashboard = action.payload;
    },
    setQueueCatalog: (state, action: PayloadAction<any[]>) => {
      state.queueCatalog = action.payload;
    },

    // ─── Error ───
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // ─── Reset ───
    resetValidationContentState: () => initialState,
  },
});

export const {
  // Loading
  setLoading,
  setWorkflowProcessing,
  setSaving,
  // DIN
  setSelectedDIN,
  setCurrentStatus,
  setCurrentVersion,
  setCurrentDinSubIndex,
  // Media
  setMediaConfig,
  setSelectedMedia,
  setCurrentMediaIndex,
  setSelectedMediaType,
  setCurrentPageNew,
  setNewPageNumber,
  setTotalPages,
  setSelectedMediaSource,
  setSelectedMediaSourcePath,
  setPdfDimensions,
  // iXSD
  setIxsdDataHeaders,
  setIxsdDataHeadersBackup,
  setSelectedDataJson,
  setSelectedExceptionJson,
  setIXSDDataJson,
  setFieldFormatsFor999,
  setBundleDesign,
  setPrepMxsd,
  // Edit
  setEnableEditStatus,
  setEnableUserInformation,
  setSaveProcessIsCompleted,
  setIsAnyLineItemDeleted,
  setIsNewLineItemAdded,
  setIsExtractedDataChanged,
  // Tab / Header
  setSelectedDataHeader,
  setCurrentHeaderIndex,
  setSelectedIndex,
  // Line item
  setSelectedLineItemIndex,
  setSingleLineItemView,
  setSingleLineItemIndexToShow,
  setSelectedLineItemObj,
  // Workflow
  setWorkflowActionStarted,
  setFromController,
  setWorkflowConfig,
  setHasExceptions,
  setShowExceptionSidebar,
  // Exception / Filter
  setFilteredException,
  setExceptionDetails,
  setIsTabsFiltered,
  // Excel/EDI
  setExcelDataConfig,
  setSelectedSheet,
  setSelectedCells,
  setPasteTarget,
  setExcelClipboard,
  setExcelTrash,
  // JCrop
  setJCropToolIsActive,
  setCoordinatesPositions,
  // Service
  setServiceDashboard,
  setQueueCatalog,
  // Error
  setError,
  // Reset
  resetValidationContentState,
} = validationContentSlice.actions;

// ─── Selectors ───
// Use inline state type instead of RootState to avoid circular dependency (store ↔ slice)
type StateWithValidationContent = { validationContent: ValidationContentState };

export const selectValidationContent = (state: StateWithValidationContent) => state.validationContent;
export const selectSelectedDIN = (state: StateWithValidationContent) => state.validationContent.selectedDIN;
export const selectMediaConfig = (state: StateWithValidationContent) => state.validationContent.mediaConfig;
export const selectIxsdDataHeaders = (state: StateWithValidationContent) => state.validationContent.ixsdDataHeaders;
export const selectSelectedDataJson = (state: StateWithValidationContent) => state.validationContent.selectedDataJson;
export const selectEnableEditStatus = (state: StateWithValidationContent) => state.validationContent.enableEditStatus;
export const selectIsLoading = (state: StateWithValidationContent) => state.validationContent.isLoading;
export const selectIsWorkflowProcessing = (state: StateWithValidationContent) => state.validationContent.isWorkflowProcessing;
export const selectCurrentStatus = (state: StateWithValidationContent) => state.validationContent.currentStatus;
export const selectWorkflowConfig = (state: StateWithValidationContent) => state.validationContent.workflowConfig;
export const selectHasExceptions = (state: StateWithValidationContent) => state.validationContent.hasExceptions;
export const selectFilteredException = (state: StateWithValidationContent) => state.validationContent.filteredException;
export const selectSelectedDataHeader = (state: StateWithValidationContent) => state.validationContent.selectedDataHeader;

export default validationContentSlice.reducer;
