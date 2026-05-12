/**
 * Data Entry Operator Redux Slice
 * State management for data entry exception workflow (page splitting/classification)
 * Origin: DataEntryOperatorController.js $scope and $rootScope variables
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  DataEntryOperatorState,
  SelectedException,
  ClassificationInfo,
  PageOrderItem,
  OriginalDocPage,
  WorkflowActionConfig,
  InventoryData,
  InvoiceNumberItem,
  QueueCatalogEntry,
  NextMicroProcess,
  DocValidationResult,
} from '../types/DataEntryOperatorTypes';

const initialState: DataEntryOperatorState = {
  // Loading states
  isLoading: false,
  workflowActionStarted: false,
  isDownloading: false,
  modifyPageStream: false,

  // Exception / selected item
  selectedException: null,
  fromController: '',
  currentStatus: '',

  // PDF / media
  pdfStream: '',
  currentPage: 1,
  currentPageNew: 1,
  newPageNumber: 1,
  totalPages: 1,
  selectedPageStream: '',

  // Classification
  classificationInfo: [],
  currentPageStatus: '',
  currentPageStatusMsg: '',

  // Page order / document splitting
  pageOrderList: [],
  pageOrderListToRoute: [],
  selectedPageArray: [],
  originalDocPages: [],
  currentHeaderIndex: 0,
  invoiceNumberList: [{ inv_number: 'split_1', inv_number_display: 'Doc 1' }],
  maxFileId: 0,
  maxFileIdBackUp: 0,

  // Workflow
  workflowActionConfigData: [],
  selectedAction: null,
  selectedActionClick: '',
  selectedRabbitMq: '',
  nextMicroProcessObj: null,

  // Inventory / media config
  inventoryData: [],
  genericMxsd: null,
  currentMedia: '',
  ixsdId: '',
  ixsd_bean_path: '',
  tfs_uin: '',
  source_file: '',
  selectedDataJson: null,
  currentVersion: '',
  serviceDashboard: null,

  // Queue
  queueCatalog: [],

  // Validation result dialog
  docValidationResult: null,
  showValidationResultDialog: false,

  // Action dialog
  showActionDialog: false,

  // Sorting
  selectedPageToSort: '',
  selectedIndex: -1,
  droppedIndex: -1,

  // Page list
  showPageList: false,

  // Image dimensions
  imageResponsiveWidth: 680,
  imageResponsiveHeight: 950,

  // Error
  error: null,
};

const dataEntryOperatorSlice = createSlice({
  name: 'dataEntryOperator',
  initialState,
  reducers: {
    // ─── Loading States ───
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setWorkflowActionStarted: (state, action: PayloadAction<boolean>) => {
      state.workflowActionStarted = action.payload;
    },
    setDownloading: (state, action: PayloadAction<boolean>) => {
      state.isDownloading = action.payload;
    },
    setModifyPageStream: (state, action: PayloadAction<boolean>) => {
      state.modifyPageStream = action.payload;
    },

    // ─── Exception / Selected Item ───
    setSelectedException: (state, action: PayloadAction<SelectedException | null>) => {
      state.selectedException = action.payload;
    },
    setFromController: (state, action: PayloadAction<'apps' | 'tasks' | ''>) => {
      state.fromController = action.payload;
    },
    setCurrentStatus: (state, action: PayloadAction<string>) => {
      state.currentStatus = action.payload;
    },

    // ─── PDF / Media ───
    setPdfStream: (state, action: PayloadAction<string>) => {
      state.pdfStream = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
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
    setSelectedPageStream: (state, action: PayloadAction<string>) => {
      state.selectedPageStream = action.payload;
    },

    // ─── Classification ───
    setClassificationInfo: (state, action: PayloadAction<ClassificationInfo[]>) => {
      state.classificationInfo = action.payload;
    },
    setCurrentPageStatus: (state, action: PayloadAction<string>) => {
      state.currentPageStatus = action.payload;
    },
    setCurrentPageStatusMsg: (state, action: PayloadAction<string>) => {
      state.currentPageStatusMsg = action.payload;
    },

    // ─── Page Order / Document Splitting ───
    setPageOrderList: (state, action: PayloadAction<PageOrderItem[]>) => {
      state.pageOrderList = action.payload;
    },
    setPageOrderListToRoute: (state, action: PayloadAction<PageOrderItem[]>) => {
      state.pageOrderListToRoute = action.payload;
    },
    setSelectedPageArray: (state, action: PayloadAction<OriginalDocPage[]>) => {
      state.selectedPageArray = action.payload;
    },
    setOriginalDocPages: (state, action: PayloadAction<OriginalDocPage[]>) => {
      state.originalDocPages = action.payload;
    },
    setCurrentHeaderIndex: (state, action: PayloadAction<number>) => {
      state.currentHeaderIndex = action.payload;
    },
    setInvoiceNumberList: (state, action: PayloadAction<InvoiceNumberItem[]>) => {
      state.invoiceNumberList = action.payload;
    },
    setMaxFileId: (state, action: PayloadAction<number>) => {
      state.maxFileId = action.payload;
    },
    setMaxFileIdBackUp: (state, action: PayloadAction<number>) => {
      state.maxFileIdBackUp = action.payload;
    },

    // ─── Workflow ───
    setWorkflowActionConfigData: (state, action: PayloadAction<WorkflowActionConfig[]>) => {
      state.workflowActionConfigData = action.payload;
    },
    setSelectedAction: (state, action: PayloadAction<WorkflowActionConfig | null>) => {
      state.selectedAction = action.payload;
    },
    setSelectedActionClick: (state, action: PayloadAction<string>) => {
      state.selectedActionClick = action.payload;
    },
    setSelectedRabbitMq: (state, action: PayloadAction<string>) => {
      state.selectedRabbitMq = action.payload;
    },
    setNextMicroProcessObj: (state, action: PayloadAction<string | NextMicroProcess | null>) => {
      state.nextMicroProcessObj = action.payload;
    },

    // ─── Inventory / Media Config ───
    setInventoryData: (state, action: PayloadAction<InventoryData[]>) => {
      state.inventoryData = action.payload;
    },
    setGenericMxsd: (state, action: PayloadAction<Record<string, unknown> | null>) => {
      state.genericMxsd = action.payload;
    },
    setCurrentMedia: (state, action: PayloadAction<string>) => {
      state.currentMedia = action.payload;
    },
    setIxsdId: (state, action: PayloadAction<string>) => {
      state.ixsdId = action.payload;
    },
    setIxsdBeanPath: (state, action: PayloadAction<string>) => {
      state.ixsd_bean_path = action.payload;
    },
    setTfsUin: (state, action: PayloadAction<string>) => {
      state.tfs_uin = action.payload;
    },
    setSourceFile: (state, action: PayloadAction<string>) => {
      state.source_file = action.payload;
    },
    setSelectedDataJson: (state, action: PayloadAction<Record<string, unknown> | null>) => {
      state.selectedDataJson = action.payload;
    },
    setCurrentVersion: (state, action: PayloadAction<string>) => {
      state.currentVersion = action.payload;
    },
    setServiceDashboard: (state, action: PayloadAction<Record<string, unknown> | null>) => {
      state.serviceDashboard = action.payload;
    },

    // ─── Queue ───
    setQueueCatalog: (state, action: PayloadAction<QueueCatalogEntry[]>) => {
      state.queueCatalog = action.payload;
    },

    // ─── Validation Result Dialog ───
    setDocValidationResult: (state, action: PayloadAction<DocValidationResult | string | null>) => {
      state.docValidationResult = action.payload;
    },
    setShowValidationResultDialog: (state, action: PayloadAction<boolean>) => {
      state.showValidationResultDialog = action.payload;
    },

    // ─── Action Dialog ───
    setShowActionDialog: (state, action: PayloadAction<boolean>) => {
      state.showActionDialog = action.payload;
    },

    // ─── Sorting ───
    setSelectedPageToSort: (state, action: PayloadAction<string>) => {
      state.selectedPageToSort = action.payload;
    },
    setSelectedIndex: (state, action: PayloadAction<number>) => {
      state.selectedIndex = action.payload;
    },
    setDroppedIndex: (state, action: PayloadAction<number>) => {
      state.droppedIndex = action.payload;
    },

    // ─── Page List ───
    setShowPageList: (state, action: PayloadAction<boolean>) => {
      state.showPageList = action.payload;
    },

    // ─── Image Dimensions ───
    setImageResponsiveWidth: (state, action: PayloadAction<number>) => {
      state.imageResponsiveWidth = action.payload;
    },
    setImageResponsiveHeight: (state, action: PayloadAction<number>) => {
      state.imageResponsiveHeight = action.payload;
    },

    // ─── Error ───
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // ─── Reset ───
    resetDataEntryOperatorState: () => initialState,
  },
});

export const {
  // Loading
  setLoading,
  setWorkflowActionStarted,
  setDownloading,
  setModifyPageStream,
  // Exception
  setSelectedException,
  setFromController,
  setCurrentStatus,
  // PDF
  setPdfStream,
  setCurrentPage,
  setCurrentPageNew,
  setNewPageNumber,
  setTotalPages,
  setSelectedPageStream,
  // Classification
  setClassificationInfo,
  setCurrentPageStatus,
  setCurrentPageStatusMsg,
  // Page order
  setPageOrderList,
  setPageOrderListToRoute,
  setSelectedPageArray,
  setOriginalDocPages,
  setCurrentHeaderIndex,
  setInvoiceNumberList,
  setMaxFileId,
  setMaxFileIdBackUp,
  // Workflow
  setWorkflowActionConfigData,
  setSelectedAction,
  setSelectedActionClick,
  setSelectedRabbitMq,
  setNextMicroProcessObj,
  // Inventory
  setInventoryData,
  setGenericMxsd,
  setCurrentMedia,
  setIxsdId,
  setIxsdBeanPath,
  setTfsUin,
  setSourceFile,
  setSelectedDataJson,
  setCurrentVersion,
  setServiceDashboard,
  // Queue
  setQueueCatalog,
  // Dialogs
  setDocValidationResult,
  setShowValidationResultDialog,
  setShowActionDialog,
  // Sorting
  setSelectedPageToSort,
  setSelectedIndex,
  setDroppedIndex,
  // Page list
  setShowPageList,
  // Image
  setImageResponsiveWidth,
  setImageResponsiveHeight,
  // Error
  setError,
  // Reset
  resetDataEntryOperatorState,
} = dataEntryOperatorSlice.actions;

// ─── Selectors ───
type SliceState = { dataEntryOperator: DataEntryOperatorState };
export const selectDataEntryOperator = (state: SliceState) => state.dataEntryOperator;
export const selectSelectedException = (state: SliceState) => state.dataEntryOperator.selectedException;
export const selectPageOrderList = (state: SliceState) => state.dataEntryOperator.pageOrderList;
export const selectClassificationInfo = (state: SliceState) => state.dataEntryOperator.classificationInfo;
export const selectPdfStream = (state: SliceState) => state.dataEntryOperator.pdfStream;
export const selectWorkflowActionConfigData = (state: SliceState) => state.dataEntryOperator.workflowActionConfigData;
export const selectIsLoading = (state: SliceState) => state.dataEntryOperator.isLoading;
export const selectWorkflowActionStarted = (state: SliceState) => state.dataEntryOperator.workflowActionStarted;

export default dataEntryOperatorSlice.reducer;
