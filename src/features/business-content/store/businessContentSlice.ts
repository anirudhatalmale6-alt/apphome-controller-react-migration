/**
 * Business Content Redux Slice
 * State management for document/invoice processing workflow
 * Origin: BusinessContentController.js $scope and $rootScope variables
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type {
  BusinessContentState,
  SelectedDIN,
  MediaConfig,
  IXSDDataHeader,
  DataCaptureProcess,
  VersionAuthorInfo,
} from '../types/BusinessContentTypes';

const initialState: BusinessContentState = {
  // Loading states
  isLoading: false,
  isWorkflowProcessing: false,
  isDownloading: false,
  isSaving: false,

  // DIN / Transaction
  selectedDIN: null,
  selectedDinNo: '',
  selectedUinNo: '',
  currentStatus: '',
  currentVersion: '',

  // Media / Document
  mediaConfig: [],
  selectedMedia: '',
  currentPageNew: 1,
  newPageNumber: 1,

  // iXSD Data
  ixsdDataHeaders: [],
  selectedDataJson: null,
  selectedExceptionJson: null,
  selectedExceptionJsonBackUp: null,
  iXSDDataJson: [],
  fieldFormatsFor999: [],
  bPaaSConnector_id: '',
  spProcessId: '',

  // Edit state
  enableEditStatus: false,
  enableUserInformation: false,
  saveProcessIsCompleted: false,
  isAnyLineItemDeleted: false,
  isNewLineItemAdded: false,
  autoUpdateFields: [],

  // Line item
  selectedLineItemIndex: 0,
  singleLineItemView: false,
  lineItemIndexForAPILookUp: 0,

  // Workflow
  workflowActionStarted: false,
  fromController: '',
  selectedProcessLabel: null,
  workflowConfig: [],
  selectedMediaSource: '',
  totalPages: 1,
  hasExceptions: false,
  showExceptionSidebar: false,
  iXSDMaxVersion: 1,

  // Transaction history
  transactionDataCaptureProcess: [],
  docInfoUin: '',
  docInfoDin: '',

  // Audit
  fieldAuditData: [],
  formAuditView: false,
  formAuditResponse: null,
  formAuditDataHeaders: [],
  formAuditDataHeaders2: [],
  prevVersionAuthorInfo: null,
  newVersionAuthorInfo: null,

  // Notification
  filteredExceptionToNotify: [],

  // Lookup
  lookupCatalog: null,
  expenseLedgerAPILookUP: [],
  apiLookUpResult: [],
  apiLookUpSubResult: [],

  // Artifacts
  artifactUploadPath: '',
  attachmentList: [],

  // Service
  serviceDashboard: null,
  botCampList: [],

  // Error
  error: null,
};

const businessContentSlice = createSlice({
  name: 'businessContent',
  initialState,
  reducers: {
    // ─── Loading States ───
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setWorkflowProcessing: (state, action: PayloadAction<boolean>) => {
      state.isWorkflowProcessing = action.payload;
    },
    setDownloading: (state, action: PayloadAction<boolean>) => {
      state.isDownloading = action.payload;
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

    // ─── Media / Document ───
    setMediaConfig: (state, action: PayloadAction<MediaConfig[]>) => {
      state.mediaConfig = action.payload;
    },
    setSelectedMedia: (state, action: PayloadAction<string>) => {
      state.selectedMedia = action.payload;
    },
    setCurrentPageNew: (state, action: PayloadAction<number>) => {
      state.currentPageNew = action.payload;
    },
    setNewPageNumber: (state, action: PayloadAction<number>) => {
      state.newPageNumber = action.payload;
    },

    // ─── iXSD Data ───
    setIxsdDataHeaders: (state, action: PayloadAction<IXSDDataHeader[]>) => {
      state.ixsdDataHeaders = action.payload;
    },
    setSelectedDataJson: (state, action: PayloadAction<any>) => {
      state.selectedDataJson = action.payload;
    },
    setSelectedExceptionJson: (state, action: PayloadAction<any>) => {
      state.selectedExceptionJson = action.payload;
    },
    setSelectedExceptionJsonBackUp: (state, action: PayloadAction<any>) => {
      state.selectedExceptionJsonBackUp = action.payload;
    },
    setIXSDDataJson: (state, action: PayloadAction<any[]>) => {
      state.iXSDDataJson = action.payload;
    },
    setFieldFormatsFor999: (state, action: PayloadAction<any[]>) => {
      state.fieldFormatsFor999 = action.payload;
    },
    setBPaaSConnectorId: (state, action: PayloadAction<string>) => {
      state.bPaaSConnector_id = action.payload;
    },
    setSpProcessId: (state, action: PayloadAction<string>) => {
      state.spProcessId = action.payload;
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
    setAutoUpdateFields: (state, action: PayloadAction<string[]>) => {
      state.autoUpdateFields = action.payload;
    },
    addAutoUpdateField: (state, action: PayloadAction<string>) => {
      if (!state.autoUpdateFields.includes(action.payload)) {
        state.autoUpdateFields.push(action.payload);
      }
    },
    clearAutoUpdateFields: (state) => {
      state.autoUpdateFields = [];
    },

    // ─── Line Item ───
    setSelectedLineItemIndex: (state, action: PayloadAction<number>) => {
      state.selectedLineItemIndex = action.payload;
    },
    setSingleLineItemView: (state, action: PayloadAction<boolean>) => {
      state.singleLineItemView = action.payload;
    },
    setLineItemIndexForAPILookUp: (state, action: PayloadAction<number>) => {
      state.lineItemIndexForAPILookUp = action.payload;
    },

    // ─── Workflow ───
    setWorkflowActionStarted: (state, action: PayloadAction<boolean>) => {
      state.workflowActionStarted = action.payload;
    },
    setFromController: (state, action: PayloadAction<'apps' | 'tasks' | ''>) => {
      state.fromController = action.payload;
    },
    setSelectedProcessLabel: (state, action: PayloadAction<any>) => {
      state.selectedProcessLabel = action.payload;
    },
    setWorkflowConfig: (state, action: PayloadAction<any[]>) => {
      state.workflowConfig = action.payload;
    },
    setSelectedMediaSource: (state, action: PayloadAction<string>) => {
      state.selectedMediaSource = action.payload;
    },
    setTotalPages: (state, action: PayloadAction<number>) => {
      state.totalPages = action.payload;
    },
    setHasExceptions: (state, action: PayloadAction<boolean>) => {
      state.hasExceptions = action.payload;
    },
    setShowExceptionSidebar: (state, action: PayloadAction<boolean>) => {
      state.showExceptionSidebar = action.payload;
    },
    setIXSDMaxVersion: (state, action: PayloadAction<number>) => {
      state.iXSDMaxVersion = action.payload;
    },

    // ─── Transaction History ───
    setTransactionDataCaptureProcess: (state, action: PayloadAction<DataCaptureProcess[]>) => {
      state.transactionDataCaptureProcess = action.payload;
    },
    setDocInfoUin: (state, action: PayloadAction<string>) => {
      state.docInfoUin = action.payload;
    },
    setDocInfoDin: (state, action: PayloadAction<string>) => {
      state.docInfoDin = action.payload;
    },

    // ─── Audit ───
    setFieldAuditData: (state, action: PayloadAction<any[]>) => {
      state.fieldAuditData = action.payload;
    },
    setFormAuditView: (state, action: PayloadAction<boolean>) => {
      state.formAuditView = action.payload;
    },
    setFormAuditResponse: (state, action: PayloadAction<any>) => {
      state.formAuditResponse = action.payload;
    },
    setFormAuditDataHeaders: (state, action: PayloadAction<IXSDDataHeader[]>) => {
      state.formAuditDataHeaders = action.payload;
    },
    setFormAuditDataHeaders2: (state, action: PayloadAction<IXSDDataHeader[]>) => {
      state.formAuditDataHeaders2 = action.payload;
    },
    setPrevVersionAuthorInfo: (state, action: PayloadAction<any>) => {
      state.prevVersionAuthorInfo = action.payload;
    },
    setNewVersionAuthorInfo: (state, action: PayloadAction<any>) => {
      state.newVersionAuthorInfo = action.payload;
    },

    // ─── Notification ───
    setFilteredExceptionToNotify: (state, action: PayloadAction<any[]>) => {
      state.filteredExceptionToNotify = action.payload;
    },

    // ─── Lookup ───
    setLookupCatalog: (state, action: PayloadAction<any>) => {
      state.lookupCatalog = action.payload;
    },
    setExpenseLedgerAPILookUP: (state, action: PayloadAction<any[]>) => {
      state.expenseLedgerAPILookUP = action.payload;
    },
    setApiLookUpResult: (state, action: PayloadAction<any[]>) => {
      state.apiLookUpResult = action.payload;
    },
    setApiLookUpSubResult: (state, action: PayloadAction<any[]>) => {
      state.apiLookUpSubResult = action.payload;
    },

    // ─── Artifacts ───
    setArtifactUploadPath: (state, action: PayloadAction<string>) => {
      state.artifactUploadPath = action.payload;
    },
    setAttachmentList: (state, action: PayloadAction<any[]>) => {
      state.attachmentList = action.payload;
    },

    // ─── Service ───
    setServiceDashboard: (state, action: PayloadAction<any>) => {
      state.serviceDashboard = action.payload;
    },
    setBotCampList: (state, action: PayloadAction<any[]>) => {
      state.botCampList = action.payload;
    },

    // ─── Error ───
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // ─── Reset ───
    resetBusinessContentState: () => initialState,
  },
});

export const {
  // Loading
  setLoading,
  setWorkflowProcessing,
  setDownloading,
  setSaving,
  // DIN
  setSelectedDIN,
  setCurrentStatus,
  setCurrentVersion,
  // Media
  setMediaConfig,
  setSelectedMedia,
  setCurrentPageNew,
  setNewPageNumber,
  // iXSD
  setIxsdDataHeaders,
  setSelectedDataJson,
  setSelectedExceptionJson,
  setSelectedExceptionJsonBackUp,
  setIXSDDataJson,
  setFieldFormatsFor999,
  setBPaaSConnectorId,
  setSpProcessId,
  // Edit
  setEnableEditStatus,
  setEnableUserInformation,
  setSaveProcessIsCompleted,
  setIsAnyLineItemDeleted,
  setIsNewLineItemAdded,
  setAutoUpdateFields,
  addAutoUpdateField,
  clearAutoUpdateFields,
  // Line item
  setSelectedLineItemIndex,
  setSingleLineItemView,
  setLineItemIndexForAPILookUp,
  // Workflow
  setWorkflowActionStarted,
  setFromController,
  setSelectedProcessLabel,
  setWorkflowConfig,
  setSelectedMediaSource,
  setTotalPages,
  setHasExceptions,
  setShowExceptionSidebar,
  setIXSDMaxVersion,
  // Transaction history
  setTransactionDataCaptureProcess,
  setDocInfoUin,
  setDocInfoDin,
  // Audit
  setFieldAuditData,
  setFormAuditView,
  setFormAuditResponse,
  setFormAuditDataHeaders,
  setFormAuditDataHeaders2,
  setPrevVersionAuthorInfo,
  setNewVersionAuthorInfo,
  // Notification
  setFilteredExceptionToNotify,
  // Lookup
  setLookupCatalog,
  setExpenseLedgerAPILookUP,
  setApiLookUpResult,
  setApiLookUpSubResult,
  // Artifacts
  setArtifactUploadPath,
  setAttachmentList,
  // Service
  setServiceDashboard,
  setBotCampList,
  // Error
  setError,
  // Reset
  resetBusinessContentState,
} = businessContentSlice.actions;

// ─── Selectors ───
export const selectBusinessContent = (state: RootState) => state.businessContent;
export const selectSelectedDIN = (state: RootState) => state.businessContent.selectedDIN;
export const selectMediaConfig = (state: RootState) => state.businessContent.mediaConfig;
export const selectIxsdDataHeaders = (state: RootState) => state.businessContent.ixsdDataHeaders;
export const selectSelectedDataJson = (state: RootState) => state.businessContent.selectedDataJson;
export const selectEnableEditStatus = (state: RootState) => state.businessContent.enableEditStatus;
export const selectIsLoading = (state: RootState) => state.businessContent.isLoading;
export const selectIsWorkflowProcessing = (state: RootState) => state.businessContent.isWorkflowProcessing;
export const selectCurrentStatus = (state: RootState) => state.businessContent.currentStatus;
export const selectFormAuditView = (state: RootState) => state.businessContent.formAuditView;

export default businessContentSlice.reducer;
