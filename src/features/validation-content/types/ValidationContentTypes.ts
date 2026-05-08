/**
 * Validation Content Types
 * Strongly typed models replacing AngularJS $scope/$rootScope patterns
 * Origin: ValidationContentController.js
 */

// ─── DIN / Transaction Types ───

export interface SelectedDIN {
  din: string;
  uin: string;
  TransactionID: string;
  fileName: string;
  queue_btime: string;
  ixsd_id: string;
  hasException: string;
  exception_type?: string;
  efs_uin?: string;
  fromController?: 'apps' | 'tasks' | '';
}

export interface MediaConfig {
  byteString: string;
  file_path: string;
  extracted_file_path?: string;
  extracted_file_name?: string;
  page_count?: number;
  totalPages?: number;
  file_type?: string;
  media?: string;
  efs_uin?: string;
  tfs_uin?: string;
  spProcessId?: string;
  pdfWidth?: number;
  pdfHeight?: number;
  source_file?: string;
  file_id?: string;
  extracted_file_id?: string;
  form_type?: string;
  prep_mxsd?: any;
}

export interface DataPosition {
  width: number;
  height: number;
  top: number;
  left: number;
  border_bottom?: string;
}

export interface CoordinatesPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ─── iXSD Data Types ───

export interface IXSDField {
  key: string;
  key_alias_name: string;
  value: any;
  value_of?: string;
  value_from?: string;
  value_condn?: string;
  input_type: 'text' | 'textarea' | 'options' | 'multiSelect' | 'date' | 'checkbox' | 'boolean' | 'booleanButton' | 'currency' | 'decimal';
  read_only?: boolean;
  required?: boolean;
  key_hint?: string;
  exception_msg: ExceptionMessage[];
  data_position?: DataPosition;
  position?: Record<string, any>;
  lookup_criteria: LookupItem[];
  lookup_table?: string;
  lookupType?: string;
  lookup_search_desc?: string;
  isOptionFieldEdited?: boolean;
  isExtractedDataChanged?: boolean;
  editedStatus?: boolean;
  visible_status?: boolean;
  view_status?: boolean;
  valueMaxLength: number;
  valueAsArray?: string[];
  multiSelectFields?: string[];
  showdownloads?: boolean;
  complexTypeLabel?: string;
  row?: number;
  row_index?: number;
  page?: number;
  itemState?: 'D' | 'C' | 'A' | 'S' | 'M';
  hasDuplicated?: boolean;
  input_border?: string;
  input_box_width?: string;
  newItem?: boolean;
  edit?: boolean;
  item_index?: number;
  data_type?: string;
  field_properties?: any;
  data_format?: string[];
  notify_email?: string;
  notify_sms?: string;
  notify_social?: string;
  notify_help?: string;
  notify_iot?: string;
  focus_timer?: string;
  validation_on?: boolean;
  validation_msg?: any;
}

export interface IXSDDataHeader {
  header_name: string;
  label: string;
  view_style: 'object' | 'array';
  ixsd_fields: IXSDField[][];
  exception_status: boolean;
  exceptionColor: 'red' | 'orange' | '';
  visible_status?: boolean;
  showTabContent?: boolean;
  header_status?: boolean;
  view_status?: boolean;
  hasKeyToDuplicateRow?: boolean;
}

export interface ExceptionMessage {
  exception_msg: string;
  exception_type?: string;
  field_key?: string;
}

export interface LookupItem {
  lookup_id: string;
  lookup_desc: string;
  lookup_search_desc?: string;
}

export interface ExceptionDetail {
  srcfile_id: string;
  file_id: string;
  service_dashboard?: string;
  [key: string]: any;
}

// ─── Filter/Exception Types ───

export interface FilteredException {
  exception_desc: string;
  exception_count: number;
  isSelected: boolean;
  showFieldException: boolean;
  field_list: FilteredExceptionField[];
}

export interface FilteredExceptionField {
  complexType: string;
  complexTypeLabel: string;
  isSelected: boolean;
  fieldList: { key: string; rowNo: number }[];
  exception_count: number;
}

// ──�� Workflow Types ───

export interface WorkflowConfigItem {
  process_name: string;
  process_desc: string;
  workflow_routing_json: string;
  isEnabled: boolean;
  tooltip: string;
  queue_id?: string;
  channel?: string;
}

export interface WorkflowActionInput {
  assigned_queue: string;
  assigned_user: string;
  queue_comments: string;
}

// ─── Excel/EDI Types ───

export interface ExcelCellPosition {
  x: number;
  y: number;
}

export interface ExcelDataConfig {
  fields: any[][];
  [key: string]: any;
}

// ─── API Input Types ───

export interface BaseValidationParams {
  customer_id: string;
  bps_id: string;
}

export interface LoadValidationMediaInput extends BaseValidationParams {
  bu_id: string;
  tps_id: string;
  role_id: string;
  din: string;
  user_id: string;
  spProcess_id: string;
  dept_id: string;
  queue_id: string;
  ixsd_id: string;
  currentStatus: string;
  efs_uin: string;
}

export interface ChangeMediaPageInput extends BaseValidationParams {
  bu_id: string;
  tps_id: string;
  din: string;
  spProcess_id: string;
  ixsd_id: string;
  currentPage: number;
}

export interface ExtractDataFromPositionInput {
  file_location: string;
  pageNo: number;
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface StartWorkflowInput {
  customer_id: string;
  bps_id: string;
  bu_id: string;
  tps_id: string;
  spProcessId: string;
  corpId?: string;
  custDin?: string;
  declineFromWorkflow?: boolean;
  process_month: string;
  sourceFileId: string;
  fileId: string;
  fileName: string;
  fileDate: string;
  filePath: string;
  dept_id: string;
  queue_id: string;
  dataJSON: any;
  dataExceptionJson: any;
  queue_comment: string;
  din_status: string;
  dinType: string;
  keyByFullExtract: boolean;
  schemaBeanPath: string;
  next_micro_process_code: string;
  next_micro_process_id: string;
  next_queue: string;
  next_channel: string;
  din: string;
  din_sub_index: string;
  din_version: string;
  uin: string;
  ixsdId: string;
  efs_uin: string;
  tfs_uin: string;
  bpaas_connector_id: string;
  din_assignee: string;
  user_id: string;
  transactionData: any[];
  preparedMXSD: any;
  selectedDateFormats: any[];
  serviceDashboard: any;
  actionByEmployee: boolean;
  inventoryDate: string;
  formMedia: string;
  userType: boolean;
}

export interface SaveIXSDInput extends BaseValidationParams {
  bu_id: string;
  tps_id: string;
  din: string;
  version: string;
  spProcess_id: string;
  dept_id: string;
  queue_id: string;
  ixsd_id: string;
  dataJson: any;
  mediaiXSD: MediaConfig[];
}

export interface LoadBundleDesignInput extends BaseValidationParams {
  bu_id: string;
  tps_id: string;
  din: string;
  ixsd_id: string;
  efs_uin: string;
}

export interface LoadUpdateDataJsonInput {
  din: string;
  uin: string;
}

// ─── API Response Types ───

export interface LoadValidationMediaResponse {
  iXSDDataJson: any[];
  bundleDesignData: any[];
  workflowConfig: any[];
  exceptionDetails: any[];
  queueCatalog: any[];
  mediaConfig: any[];
}

export interface ChangeMediaPageResponse {
  byteString: string;
}

export interface ExtractDataResponse {
  data: string;
}

export interface WorkflowResponse {
  din: string;
  uin: string;
  din_version: string;
  din_sub_index: string;
  exceptionMsg: any[];
  next_micro_process_code?: string;
  din_status?: string;
  [key: string]: any;
}

export interface SaveIXSDResponse {
  success: boolean;
  [key: string]: any;
}

export interface UpdateDataJsonResponse {
  ixsd_data_json: string;
  ixsd_data_exception: string;
  [key: string]: any;
}

// ─── State Type ───

export interface ValidationContentState {
  // Loading states
  isLoading: boolean;
  isWorkflowProcessing: boolean;
  isSaving: boolean;

  // DIN / Transaction
  selectedDIN: SelectedDIN | null;
  selectedDinNo: string;
  selectedUinNo: string;
  currentStatus: string;
  currentVersion: string;
  currentDinSubIndex: string;

  // Media / Document
  mediaConfig: MediaConfig[];
  selectedMedia: string;
  currentMediaIndex: number;
  selectedMediaType: string;
  currentPageNew: number;
  newPageNumber: number;
  totalPages: number;
  selectedMediaSource: string;
  selectedMediaSourcePath: string;
  pdfWidth: number;
  pdfHeight: number;

  // iXSD Data
  ixsdDataHeaders: IXSDDataHeader[];
  ixsdDataHeadersBackup: IXSDDataHeader[];
  selectedDataJson: any;
  selectedExceptionJson: any;
  iXSDDataJson: any[];
  fieldFormatsFor999: any[];
  bundleDesign: any;
  prepMxsd: any;

  // Edit state
  enableEditStatus: boolean;
  enableUserInformation: boolean;
  saveProcessIsCompleted: boolean;
  isAnyLineItemDeleted: boolean;
  isNewLineItemAdded: boolean;
  isExtractedDataChanged: boolean;

  // Tab / Header selection
  selectedDataHeader: IXSDDataHeader | null;
  currentHeaderIndex: number;
  selectedIndex: number;

  // Line item
  selectedLineItemIndex: number;
  singleLineItemView: boolean;
  singleLineItemIndexToShow: number;
  selectedLineItemObj: any;

  // Workflow
  workflowActionStarted: boolean;
  fromController: 'apps' | 'tasks' | '';
  workflowConfig: WorkflowConfigItem[];
  hasExceptions: boolean;
  showExceptionSidebar: boolean;

  // Exception / Filter
  filteredException: FilteredException[];
  exceptionDetails: ExceptionDetail | null;
  isTabsFiltered: boolean;

  // Excel/EDI
  excelDataConfig: Record<string, ExcelDataConfig>;
  selectedSheet: string;
  selectedCells: ExcelCellPosition[];
  pasteTarget: ExcelCellPosition | null;
  excelClipboard: Record<string, any[]>;
  excelTrash: Record<string, any[]>;

  // JCrop
  jCropToolIsActive: boolean;
  coordinatesPositions: CoordinatesPosition | null;

  // Service
  serviceDashboard: any;
  queueCatalog: any[];

  // Error
  error: string | null;
}
