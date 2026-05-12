/**
 * Business Exception Redux Slice
 * State management for data entry exception processing workflow
 * Origin: BusinessExceptionController.js $scope and $rootScope variables
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type {
  BusinessExceptionState,
  ExceptionTicket,
  CropCoordinates,
  PageWiseExtraction,
  TableExtractionInputs,
  ColumnHeader,
  IXSDDataHeader,
  IXSDField,
  ComplexTypeField,
  WorkflowActionConfig,
  ClassificationInfo,
  MediaConfigData,
  FormSize,
  GenericMXSD,
} from '../types/BusinessExceptionTypes';

const defaultTableExtractionInputs: TableExtractionInputs = {
  columnHeaders: [],
  skipIndexText: '',
  skipIndexTextList: [],
  isSkipIndexTextActive: false,
  canTableAreaCrop: false,
  tableAreaPosition: {},
  isSkipIndexColumnEditing: false,
  isUniqueColumnEditing: false,
  uniqueIndexOnly: false,
  isTableAreaCropped: false,
};

const initialState: BusinessExceptionState = {
  // Loading states
  isLoading: false,
  isExtracting: false,
  isWorkflowProcessing: false,

  // Exception context
  selectException: null,
  fromController: '',

  // Media / Document
  downloadStream: '',
  filepath: '',
  totalPages: 1,
  currentPage: 1,
  currentPageNew: 1,
  newPageNumber: 1,
  pdfExactWidth: 0,
  pdfExactHeight: 0,
  imgWidth: 0,
  imgHeight: 0,

  // Form Size
  formSize: { size_name: 'A4', width: '876', Height: '900' },

  // JCrop state
  jCropToolIsActive: false,
  jCropLineItemIsActive: false,
  coordinatesPositions: { x: 0, y: 0, w: 0, h: 0 },

  // Page-wise extraction
  pageWiseExtraction: {
    1: { tableExtractionInputs: { ...defaultTableExtractionInputs } },
  },

  // iXSD Data
  ixsdDataHeaders: [],
  selectedIXSDDataObject: null,
  selectedDataJson: null,
  selectedDataException: {},
  emptySelectedDataJson: null,
  bundleDesign: null,
  iXSDFieldsFormat: null,
  flipDataJson: null,

  // Extraction state
  selectedField: null,
  selectedIndex: -1,
  currentHeaderIndex: 0,
  focusedField: '',
  expectedData: '',
  isExtractedDataChanged: false,

  // Line item state
  lineItemForDataEntry: [],
  genericLineItem: [],
  showDataEntryForm: false,
  selectedFormElementIndex: 1,
  totalLineItemOfCurrentPage: 0,
  selectedComplexTypeLabel: '',
  currentLineItemRowNo: 0,

  // MXSD state
  genericMxsd: null,
  preparedMxsd: null,
  prepMxsdForPartial: null,

  // Business field selection
  selectedComplexTypeFields: [],
  tableColumnIndex: 0,
  selectedTableColumn: '',
  selectedTableField: null,

  // Workflow
  workflowActionStarted: false,
  workflowActionConfigData: [],
  isWorkflowActionPageOpened: false,
  ixsdSelectionDiv: false,
  normalDataEntryFormView: true,

  // Classification
  classificationInfo: [],

  // Media config
  mediaConfigData: [],
  currentMedia: '',
  tfsUin: '',
  ixsdId: '',
  ixsdBeanPath: '',

  // Service
  serviceDashboard: null,
  lookupCatalog: {},
  queueCatalog: [],

  // Date / Currency formats
  selectedDateFormats: [],
  selectedCurrencyFormats: [],

  // Config process
  configProcessStep: 1,

  // Error
  error: null,
};

const businessExceptionSlice = createSlice({
  name: 'businessException',
  initialState,
  reducers: {
    // ─── Loading States ───
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setExtracting: (state, action: PayloadAction<boolean>) => {
      state.isExtracting = action.payload;
    },
    setWorkflowProcessing: (state, action: PayloadAction<boolean>) => {
      state.isWorkflowProcessing = action.payload;
    },

    // ─── Exception Context ───
    setSelectException: (state, action: PayloadAction<ExceptionTicket | null>) => {
      state.selectException = action.payload;
    },
    setFromController: (state, action: PayloadAction<string>) => {
      state.fromController = action.payload;
    },

    // ─── Media / Document ───
    setDownloadStream: (state, action: PayloadAction<string>) => {
      state.downloadStream = action.payload;
    },
    setFilepath: (state, action: PayloadAction<string>) => {
      state.filepath = action.payload;
    },
    setTotalPages: (state, action: PayloadAction<number>) => {
      state.totalPages = action.payload;
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
    setPdfExactWidth: (state, action: PayloadAction<number>) => {
      state.pdfExactWidth = action.payload;
    },
    setPdfExactHeight: (state, action: PayloadAction<number>) => {
      state.pdfExactHeight = action.payload;
    },
    setImgDimensions: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.imgWidth = action.payload.width;
      state.imgHeight = action.payload.height;
    },

    // ─── Form Size ───
    setFormSize: (state, action: PayloadAction<FormSize>) => {
      state.formSize = action.payload;
    },

    // ─── JCrop State ───
    setJCropToolIsActive: (state, action: PayloadAction<boolean>) => {
      state.jCropToolIsActive = action.payload;
    },
    setJCropLineItemIsActive: (state, action: PayloadAction<boolean>) => {
      state.jCropLineItemIsActive = action.payload;
    },
    setCoordinatesPositions: (state, action: PayloadAction<CropCoordinates>) => {
      state.coordinatesPositions = action.payload;
    },

    // ─── Page-wise Extraction ───
    setPageWiseExtraction: (state, action: PayloadAction<PageWiseExtraction>) => {
      state.pageWiseExtraction = action.payload;
    },
    initPageExtraction: (state, action: PayloadAction<number>) => {
      const page = action.payload;
      if (!state.pageWiseExtraction[page]) {
        state.pageWiseExtraction[page] = {
          tableExtractionInputs: { ...defaultTableExtractionInputs },
        };
      }
    },
    setTableExtractionInputs: (state, action: PayloadAction<{ page: number; inputs: TableExtractionInputs }>) => {
      const { page, inputs } = action.payload;
      if (!state.pageWiseExtraction[page]) {
        state.pageWiseExtraction[page] = { tableExtractionInputs: inputs };
      } else {
        state.pageWiseExtraction[page].tableExtractionInputs = inputs;
      }
    },
    updateColumnHeaders: (state, action: PayloadAction<{ page: number; columnHeaders: ColumnHeader[] }>) => {
      const { page, columnHeaders } = action.payload;
      if (state.pageWiseExtraction[page]) {
        state.pageWiseExtraction[page].tableExtractionInputs.columnHeaders = columnHeaders;
      }
    },
    addColumnHeader: (state, action: PayloadAction<{ page: number; header: ColumnHeader }>) => {
      const { page, header } = action.payload;
      if (state.pageWiseExtraction[page]) {
        state.pageWiseExtraction[page].tableExtractionInputs.columnHeaders.push(header);
      }
    },
    removeColumnHeader: (state, action: PayloadAction<{ page: number; index: number }>) => {
      const { page, index } = action.payload;
      if (state.pageWiseExtraction[page]) {
        state.pageWiseExtraction[page].tableExtractionInputs.columnHeaders.splice(index, 1);
      }
    },
    setTableAreaPosition: (state, action: PayloadAction<{ page: number; position: any }>) => {
      const { page, position } = action.payload;
      if (state.pageWiseExtraction[page]) {
        state.pageWiseExtraction[page].tableExtractionInputs.tableAreaPosition = position;
        state.pageWiseExtraction[page].tableExtractionInputs.isTableAreaCropped =
          Object.keys(position).filter((k: string) => k !== 'page').length > 0;
      }
    },
    setCanTableAreaCrop: (state, action: PayloadAction<{ page: number; value: boolean }>) => {
      const { page, value } = action.payload;
      if (state.pageWiseExtraction[page]) {
        state.pageWiseExtraction[page].tableExtractionInputs.canTableAreaCrop = value;
      }
    },
    setIsSkipIndexTextActive: (state, action: PayloadAction<{ page: number; value: boolean }>) => {
      const { page, value } = action.payload;
      if (state.pageWiseExtraction[page]) {
        state.pageWiseExtraction[page].tableExtractionInputs.isSkipIndexTextActive = value;
      }
    },
    addSkipIndexText: (state, action: PayloadAction<{ page: number; text: string }>) => {
      const { page, text } = action.payload;
      if (state.pageWiseExtraction[page]) {
        state.pageWiseExtraction[page].tableExtractionInputs.skipIndexTextList.push(text);
      }
    },
    removeSkipIndexText: (state, action: PayloadAction<{ page: number; index: number }>) => {
      const { page, index } = action.payload;
      if (state.pageWiseExtraction[page]) {
        state.pageWiseExtraction[page].tableExtractionInputs.skipIndexTextList.splice(index, 1);
      }
    },
    clearTableExtraction: (state, action: PayloadAction<number>) => {
      const page = action.payload;
      state.pageWiseExtraction[page] = {
        tableExtractionInputs: { ...defaultTableExtractionInputs },
      };
      state.jCropLineItemIsActive = false;
    },

    // ─── iXSD Data ───
    setIxsdDataHeaders: (state, action: PayloadAction<IXSDDataHeader[]>) => {
      state.ixsdDataHeaders = action.payload;
    },
    setSelectedIXSDDataObject: (state, action: PayloadAction<IXSDDataHeader | null>) => {
      state.selectedIXSDDataObject = action.payload;
    },
    setSelectedDataJson: (state, action: PayloadAction<any>) => {
      state.selectedDataJson = action.payload;
    },
    setSelectedDataException: (state, action: PayloadAction<any>) => {
      state.selectedDataException = action.payload;
    },
    setEmptySelectedDataJson: (state, action: PayloadAction<any>) => {
      state.emptySelectedDataJson = action.payload;
    },
    setBundleDesign: (state, action: PayloadAction<any>) => {
      state.bundleDesign = action.payload;
    },
    setIXSDFieldsFormat: (state, action: PayloadAction<any>) => {
      state.iXSDFieldsFormat = action.payload;
    },
    setFlipDataJson: (state, action: PayloadAction<any>) => {
      state.flipDataJson = action.payload;
    },

    // ─── Extraction State ───
    setSelectedField: (state, action: PayloadAction<IXSDField | null>) => {
      state.selectedField = action.payload;
    },
    setSelectedIndex: (state, action: PayloadAction<number>) => {
      state.selectedIndex = action.payload;
    },
    setCurrentHeaderIndex: (state, action: PayloadAction<number>) => {
      state.currentHeaderIndex = action.payload;
    },
    setFocusedField: (state, action: PayloadAction<string>) => {
      state.focusedField = action.payload;
    },
    setExpectedData: (state, action: PayloadAction<string>) => {
      state.expectedData = action.payload;
    },
    setIsExtractedDataChanged: (state, action: PayloadAction<boolean>) => {
      state.isExtractedDataChanged = action.payload;
    },

    // ─── Line Item State ───
    setLineItemForDataEntry: (state, action: PayloadAction<IXSDField[]>) => {
      state.lineItemForDataEntry = action.payload;
    },
    setGenericLineItem: (state, action: PayloadAction<IXSDField[]>) => {
      state.genericLineItem = action.payload;
    },
    setShowDataEntryForm: (state, action: PayloadAction<boolean>) => {
      state.showDataEntryForm = action.payload;
    },
    setSelectedFormElementIndex: (state, action: PayloadAction<number>) => {
      state.selectedFormElementIndex = action.payload;
    },
    setTotalLineItemOfCurrentPage: (state, action: PayloadAction<number>) => {
      state.totalLineItemOfCurrentPage = action.payload;
    },
    setSelectedComplexTypeLabel: (state, action: PayloadAction<string>) => {
      state.selectedComplexTypeLabel = action.payload;
    },
    setCurrentLineItemRowNo: (state, action: PayloadAction<number>) => {
      state.currentLineItemRowNo = action.payload;
    },

    // ─── MXSD State ───
    setGenericMxsd: (state, action: PayloadAction<GenericMXSD | null>) => {
      state.genericMxsd = action.payload;
    },
    setPreparedMxsd: (state, action: PayloadAction<GenericMXSD | null>) => {
      state.preparedMxsd = action.payload;
    },
    setPrepMxsdForPartial: (state, action: PayloadAction<GenericMXSD | null>) => {
      state.prepMxsdForPartial = action.payload;
    },

    // ─── Business Field Selection ───
    setSelectedComplexTypeFields: (state, action: PayloadAction<ComplexTypeField[]>) => {
      state.selectedComplexTypeFields = action.payload;
    },
    setTableColumnIndex: (state, action: PayloadAction<number>) => {
      state.tableColumnIndex = action.payload;
    },
    setSelectedTableColumn: (state, action: PayloadAction<string>) => {
      state.selectedTableColumn = action.payload;
    },
    setSelectedTableField: (state, action: PayloadAction<ColumnHeader | null>) => {
      state.selectedTableField = action.payload;
    },

    // ─── Workflow ───
    setWorkflowActionStarted: (state, action: PayloadAction<boolean>) => {
      state.workflowActionStarted = action.payload;
    },
    setWorkflowActionConfigData: (state, action: PayloadAction<WorkflowActionConfig[]>) => {
      state.workflowActionConfigData = action.payload;
    },
    setIsWorkflowActionPageOpened: (state, action: PayloadAction<boolean>) => {
      state.isWorkflowActionPageOpened = action.payload;
    },
    setIxsdSelectionDiv: (state, action: PayloadAction<boolean>) => {
      state.ixsdSelectionDiv = action.payload;
    },
    setNormalDataEntryFormView: (state, action: PayloadAction<boolean>) => {
      state.normalDataEntryFormView = action.payload;
    },

    // ─── Classification ───
    setClassificationInfo: (state, action: PayloadAction<ClassificationInfo[]>) => {
      state.classificationInfo = action.payload;
    },

    // ─── Media Config ───
    setMediaConfigData: (state, action: PayloadAction<MediaConfigData[]>) => {
      state.mediaConfigData = action.payload;
    },
    setCurrentMedia: (state, action: PayloadAction<string>) => {
      state.currentMedia = action.payload;
    },
    setTfsUin: (state, action: PayloadAction<string>) => {
      state.tfsUin = action.payload;
    },
    setIxsdId: (state, action: PayloadAction<string>) => {
      state.ixsdId = action.payload;
    },
    setIxsdBeanPath: (state, action: PayloadAction<string>) => {
      state.ixsdBeanPath = action.payload;
    },

    // ─── Service ───
    setServiceDashboard: (state, action: PayloadAction<any>) => {
      state.serviceDashboard = action.payload;
    },
    setLookupCatalog: (state, action: PayloadAction<any>) => {
      state.lookupCatalog = action.payload;
    },
    setQueueCatalog: (state, action: PayloadAction<any[]>) => {
      state.queueCatalog = action.payload;
    },

    // ─── Date / Currency Formats ───
    setSelectedDateFormats: (state, action: PayloadAction<any[]>) => {
      state.selectedDateFormats = action.payload;
    },
    setSelectedCurrencyFormats: (state, action: PayloadAction<any[]>) => {
      state.selectedCurrencyFormats = action.payload;
    },

    // ─── Config Process ───
    setConfigProcessStep: (state, action: PayloadAction<number>) => {
      state.configProcessStep = action.payload;
    },

    // ─── Error ───
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // ─── Reset ───
    resetBusinessExceptionState: () => initialState,
  },
});

export const {
  // Loading
  setLoading,
  setExtracting,
  setWorkflowProcessing,
  // Exception context
  setSelectException,
  setFromController,
  // Media
  setDownloadStream,
  setFilepath,
  setTotalPages,
  setCurrentPage,
  setCurrentPageNew,
  setNewPageNumber,
  setPdfExactWidth,
  setPdfExactHeight,
  setImgDimensions,
  // Form Size
  setFormSize,
  // JCrop
  setJCropToolIsActive,
  setJCropLineItemIsActive,
  setCoordinatesPositions,
  // Page-wise extraction
  setPageWiseExtraction,
  initPageExtraction,
  setTableExtractionInputs,
  updateColumnHeaders,
  addColumnHeader,
  removeColumnHeader,
  setTableAreaPosition,
  setCanTableAreaCrop,
  setIsSkipIndexTextActive,
  addSkipIndexText,
  removeSkipIndexText,
  clearTableExtraction,
  // iXSD Data
  setIxsdDataHeaders,
  setSelectedIXSDDataObject,
  setSelectedDataJson,
  setSelectedDataException,
  setEmptySelectedDataJson,
  setBundleDesign,
  setIXSDFieldsFormat,
  setFlipDataJson,
  // Extraction state
  setSelectedField,
  setSelectedIndex,
  setCurrentHeaderIndex,
  setFocusedField,
  setExpectedData,
  setIsExtractedDataChanged,
  // Line item
  setLineItemForDataEntry,
  setGenericLineItem,
  setShowDataEntryForm,
  setSelectedFormElementIndex,
  setTotalLineItemOfCurrentPage,
  setSelectedComplexTypeLabel,
  setCurrentLineItemRowNo,
  // MXSD
  setGenericMxsd,
  setPreparedMxsd,
  setPrepMxsdForPartial,
  // Business field selection
  setSelectedComplexTypeFields,
  setTableColumnIndex,
  setSelectedTableColumn,
  setSelectedTableField,
  // Workflow
  setWorkflowActionStarted,
  setWorkflowActionConfigData,
  setIsWorkflowActionPageOpened,
  setIxsdSelectionDiv,
  setNormalDataEntryFormView,
  // Classification
  setClassificationInfo,
  // Media config
  setMediaConfigData,
  setCurrentMedia,
  setTfsUin,
  setIxsdId,
  setIxsdBeanPath,
  // Service
  setServiceDashboard,
  setLookupCatalog,
  setQueueCatalog,
  // Formats
  setSelectedDateFormats,
  setSelectedCurrencyFormats,
  // Config
  setConfigProcessStep,
  // Error
  setError,
  // Reset
  resetBusinessExceptionState,
} = businessExceptionSlice.actions;

// ─── Selectors ───
// Use inline state type to avoid circular import with app/store.ts
export const selectBusinessException = (state: RootState) => state.businessException;
export const selectSelectException = (state: RootState) => state.businessException.selectException;
export const selectDownloadStream = (state: RootState) => state.businessException.downloadStream;
export const selectIxsdDataHeaders = (state: RootState) => state.businessException.ixsdDataHeaders;
export const selectSelectedIXSDDataObject = (state: RootState) => state.businessException.selectedIXSDDataObject;
export const selectPageWiseExtraction = (state: RootState) => state.businessException.pageWiseExtraction;
export const selectCurrentPage = (state: RootState) => state.businessException.currentPage;
export const selectIsLoading = (state: RootState) => state.businessException.isLoading;
export const selectWorkflowActionStarted = (state: RootState) => state.businessException.workflowActionStarted;
export const selectJCropLineItemIsActive = (state: RootState) => state.businessException.jCropLineItemIsActive;
export const selectShowDataEntryForm = (state: RootState) => state.businessException.showDataEntryForm;

export default businessExceptionSlice.reducer;
