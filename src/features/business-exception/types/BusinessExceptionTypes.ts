/**
 * Business Exception Types
 * Strongly typed models replacing AngularJS $scope/$rootScope patterns
 * Origin: BusinessExceptionController.js
 */

// ─── JCrop / Coordinate Types ───

export interface CropCoordinates {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LabelPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface TableAreaPosition {
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  page?: number;
}

// ─── Table Extraction Types ───

export interface ColumnHeader {
  label: string;
  labelPosition: LabelPosition;
  headerMasterIndex: number;
  isTwinHeader: boolean;
  ixsdFieldName: string;
  ixsdPath: string;
  isEditMode: boolean;
  isSkipIndex: boolean;
  isUniqueColumn: boolean;
  isDiscard: boolean;
  extractedField?: string;
}

export interface TableExtractionInputs {
  columnHeaders: ColumnHeader[];
  skipIndexText: string;
  skipIndexTextList: string[];
  isSkipIndexTextActive: boolean;
  canTableAreaCrop: boolean;
  tableAreaPosition: TableAreaPosition;
  isSkipIndexColumnEditing: boolean;
  isUniqueColumnEditing: boolean;
  uniqueIndexOnly: boolean;
  isTableAreaCropped: boolean;
  isUglyColumn?: string;
}

export interface PageExtractionState {
  tableExtractionInputs: TableExtractionInputs;
}

export type PageWiseExtraction = Record<number, PageExtractionState>;

// ─── Business Field Selection Types ───

export interface ComplexTypeField {
  ixsdFieldName: string;
  ixsdAliaseName: string;
  ixsdPath: string;
  isChecked?: boolean;
}

export interface ColumnSeparation {
  selectedTableColumn: string;
  selectedTableColumnPosition: LabelPosition;
  separatedColumn: string;
  businessField: string;
  headerMasterIndex: number;
  masterHeader: boolean;
  separatedText: string;
}

export interface BusinessFieldConfig {
  businessField: string;
  isMultiHeader: boolean;
  isDiscardField: boolean;
  isSkipIndex: boolean;
  isUniqueIndex: boolean;
  columnSeparationList: ColumnSeparation[];
}

export interface TwinHeaderSeparator {
  separatorText: string;
  separatorLabel: string;
}

// ─── iXSD Data Types (shared with BusinessContent but specific to Exception) ───

export interface IXSDField {
  key: string;
  key_alias_name: string;
  value: any;
  value_of?: string;
  value_from?: string;
  value_condn?: string;
  input_type: string;
  read_only?: boolean;
  edit?: boolean;
  required?: boolean;
  key_hint?: string;
  exception_msg: any[];
  data_position?: LabelPosition;
  lookup_criteria: any[];
  lookup_table?: string;
  lookupType?: string;
  lookup_search_desc?: string;
  isExtractedDataChanged?: boolean;
  view_status?: boolean;
  visible_status?: boolean;
  field_properties?: any[];
  data_format?: any[];
  data_type?: string;
  input_box_width?: string;
  input_border?: string;
  item_index?: number;
  page?: number;
  row?: number;
  selectedItem?: any;
  querySearch?: any;
  searchText?: string;
  notify_email?: any;
  notify_sms?: any;
  notify_social?: any;
  notify_help?: any;
  notify_iot?: any;
  focus_timer?: any;
}

export interface IXSDDataHeader {
  label: string;
  header_name: string;
  ixsd_fields: IXSDField[][] | IXSDField[];
  view_style: 'object' | 'array';
  view_status: boolean;
  exception_status: boolean;
  header_status?: boolean;
}

// ─── Exception / DIN Types ───

export interface ExceptionTicket {
  din: string;
  uin: string;
  fileId: string;
  fileName: string;
  filePath: string;
  formMedia: string;
  formInputSource: string;
  exception_type: string;
  exception_ticket: string;
  exception_version: string;
  extractFileId: string;
  sourceFileId: string;
  fromController: string;
  exception_report_time?: string;
  fileDate?: string;
  filename?: string;
}

export interface MediaInventoryData {
  byteString: string;
  extracted_file_name: string;
  totalPages: number;
  pdfWidth: number;
  pdfHeight: number;
  source_file?: string;
}

export interface MediaConfigData {
  efs_uin: string;
  tfs_uin: string;
  eFS_XSD: string;
}

export interface ClassificationInfo {
  [key: string]: any;
}

export interface WorkflowActionConfig {
  process_name: string;
  process_desc: string;
  workflow_routing_json: string;
  default_channel?: number;
  isEnabled: boolean;
  tooltips: any;
}

// ─── Generic MXSD Types ───

export interface MXSDFieldData {
  label_index: number;
  data: {
    confidence: string;
    content: string;
    sequence: string;
    type: string;
    position: LabelPosition;
    page?: number;
    row?: number;
  };
  label: {
    confidence: string;
    content: string;
    sequence: string;
    type: string;
    position: LabelPosition;
  };
  page?: number;
  row?: number;
}

export interface MXSDFieldListItem {
  currency: string;
  decimal: string;
  hasCurrency: boolean;
  hasDecimal: boolean;
  name: string;
  page: string;
  ixsdFieldName: string;
  fieldType: string;
  ixsdPath: string;
  hasAnnotate: any;
  field: MXSDFieldData[][];
  headerMasterIndex: number;
  form_relation: boolean;
  seperator: string;
  isDiscard: boolean;
  isMultiHeader?: boolean;
}

export interface TableListConfig {
  name: string;
  isTableHeader: boolean;
  skip_until_text: string[];
  is_ugly_column: boolean;
  skip_until_index: string | number;
  unique_field_index: string | number;
  skip_data_column: string;
  extract_unique_index_only: boolean;
  fieldlist: MXSDFieldListItem[];
  positions: TableAreaPosition[];
  isMultiHeader?: boolean;
}

export interface GenericMXSD {
  mxsd: {
    efsuin_form: {
      page: Array<{
        fieldlist: any[];
        tablelist: TableListConfig[];
      }>;
    };
  };
}

// ─── Form Size ───

export interface FormSize {
  size_name: string;
  width: string;
  Height: string;
}

// ─── Shortcut Key Types ───

export interface ShortcutKey {
  shortcut: string;
  keys: string;
  tooltip: string;
}

// ─── API Input Types ───

export interface LoadDataEntryMediaListInput {
  customer_id: string;
  bps_id: string;
  bu_id: string;
  tps_id: string;
  uin: string;
  file_id: string;
  formMedia: string;
  extracted_file_id: string;
  source_file_id: string;
  dept_id: string;
  queue_id: string;
  user_id: string;
  exception_ticket: string;
}

export interface ChangeMediaPageDataEntryInput {
  customer_id: string;
  bps_id: string;
  bu_id: string;
  tps_id: string;
  spProcess_id: string;
  uin: string;
  source_file_id: string;
  file_id: string;
  extracted_file_id: number;
}

export interface ExtractDataFromPositionInput {
  file_location: string;
  pageNo: number;
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface HandleDataEntryExceptionInput {
  customer_id: string;
  customer_lead_id: string;
  bpaas_connector_id: string;
  bps_id: string;
  bu_id: string;
  tps_id: string;
  spProcessId: string;
  corpId: string;
  custDin: string;
  process_month: string;
  exceptionCount: number;
  microService: string;
  templaeStatus: number;
  source_file: string;
  dept_id: string;
  queue_id: string;
  dataJSON: any;
  dataExceptionJson: any;
  queue_comment: string;
  din_status: string;
  schemaBeanPath: string;
  rabbitMq: string;
  next_micro_process_code: string;
  next_micro_process_id: any;
  next_queue: string;
  next_channel: string;
  din: string;
  din_sub_index: string;
  extractFileId: number;
  din_version: string;
  fileId: string;
  fileName: string;
  filePath: string;
  fileSize: string;
  fileType: string;
  fileDate: string;
  fileIndex: number;
  form_input_source: string;
  ticketShortDesc: string;
  ticketLongDesc: string;
  ticketPriority: number;
  ticketSeverity: number;
  runningSeconds: string;
  current_channel: string;
  current_micro_process_id: string;
  current_micro_process_code: string;
  exceptionVersion: string;
  exception_channel: string;
  exception_ticket: string;
  mimeType: string;
  listIndex: number;
  preparedXSDStatus: any[];
  preparedMXSDList: any[];
  dinType: boolean;
  formMedia: string;
  form_type: string;
  uin: string;
  ixsdId: string;
  efs_uin: string;
  tfs_uin: string;
  din_assignee: string;
  user_id: string;
  serviceDashboard: any;
  isManualUser: boolean;
}

export interface LoadBundleDesignInput {
  customer_id: string;
  bps_id: string;
  bu_id: string;
  tps_id: string;
  efs_uin: string;
  tfs_uin: string;
}

export interface DownloadStreamExceptionInput {
  source_file: string;
  file_name: string;
}

// ─── API Response Types ───

export interface ExtractDataFromPositionResponse {
  data: string;
}

export interface HandleDataEntryExceptionResponse {
  preparedMXSDList: Array<{
    prepMxsd: GenericMXSD;
  }>;
  dataJSON: any;
}

export interface ChangeMediaPageDataEntryResponse {
  byteString: string;
}

// ─── State Type ───

export interface BusinessExceptionState {
  // Loading states
  isLoading: boolean;
  isExtracting: boolean;
  isWorkflowProcessing: boolean;

  // Exception context
  selectException: ExceptionTicket | null;
  fromController: string;

  // Media / Document
  downloadStream: string;
  filepath: string;
  totalPages: number;
  currentPage: number;
  currentPageNew: number;
  newPageNumber: number;
  pdfExactWidth: number;
  pdfExactHeight: number;
  imgWidth: number;
  imgHeight: number;

  // Form Size
  formSize: FormSize;

  // JCrop state
  jCropToolIsActive: boolean;
  jCropLineItemIsActive: boolean;
  coordinatesPositions: CropCoordinates;

  // Page-wise extraction
  pageWiseExtraction: PageWiseExtraction;

  // iXSD Data
  ixsdDataHeaders: IXSDDataHeader[];
  selectedIXSDDataObject: IXSDDataHeader | null;
  selectedDataJson: any;
  selectedDataException: any;
  emptySelectedDataJson: any;
  bundleDesign: any;
  iXSDFieldsFormat: any;
  flipDataJson: any;

  // Extraction state
  selectedField: IXSDField | null;
  selectedIndex: number;
  currentHeaderIndex: number;
  focusedField: string;
  expectedData: string;
  isExtractedDataChanged: boolean;

  // Line item state
  lineItemForDataEntry: IXSDField[];
  genericLineItem: IXSDField[];
  showDataEntryForm: boolean;
  selectedFormElementIndex: number;
  totalLineItemOfCurrentPage: number;
  selectedComplexTypeLabel: string;
  currentLineItemRowNo: number;

  // MXSD state
  genericMxsd: GenericMXSD | null;
  preparedMxsd: GenericMXSD | null;
  prepMxsdForPartial: GenericMXSD | null;

  // Business field selection
  selectedComplexTypeFields: ComplexTypeField[];
  tableColumnIndex: number;
  selectedTableColumn: string;
  selectedTableField: ColumnHeader | null;

  // Workflow
  workflowActionStarted: boolean;
  workflowActionConfigData: WorkflowActionConfig[];
  isWorkflowActionPageOpened: boolean;
  ixsdSelectionDiv: boolean;
  normalDataEntryFormView: boolean;

  // Classification
  classificationInfo: ClassificationInfo[];

  // Media config
  mediaConfigData: MediaConfigData[];
  currentMedia: string;
  tfsUin: string;
  ixsdId: string;
  ixsdBeanPath: string;

  // Service
  serviceDashboard: any;
  lookupCatalog: any;
  queueCatalog: any[];

  // Date / Currency formats
  selectedDateFormats: any[];
  selectedCurrencyFormats: any[];

  // Config process
  configProcessStep: number;

  // Error
  error: string | null;
}
