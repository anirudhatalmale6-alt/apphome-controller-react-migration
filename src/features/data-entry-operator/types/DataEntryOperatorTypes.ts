/**
 * Data Entry Operator Types
 * Strongly typed models replacing AngularJS $scope/$rootScope patterns
 * Origin: DataEntryOperatorController.js
 */

// ─── Exception / Selected Item Types ───

export interface SelectedException {
  uin: string;
  sourceFileId: string;
  fileId: string;
  extractFileId: number;
  filename: string;
  filePath: string;
  fileDate: string;
  exception_type: string;
  exception_ticket: string;
  formMedia: string;
  form_type: string;
  fromController: 'apps' | 'tasks';
}

// ─── Classification Info ───

export interface ClassificationInfo {
  extracted_file_id: number;
  classification_status: number;
  efslobowner_name?: string;
  efsuin_state?: 'efsuinBegin' | 'efsuin beginEnd' | 'efsuin middle' | 'efsuinEnd';
}

// ─── Page Order / Document Splitting ───

export interface SelectedPage {
  page: number;
  isForm: boolean | string;
  extractedfileid?: number;
}

export interface PageOrderItem {
  inv_number: string;
  inv_number_desc: string;
  file_id: number;
  source_file_id: string;
  lastPageSelected: number | string;
  selectedPages: SelectedPage[];
  droppedPageStream: string;
  routeTo: 'classification' | 'deleted';
  isOpened: boolean;
  validationResult: any[];
  validationReport?: string;
  onlyClassification?: boolean;
}

export interface OriginalDocPage {
  page: number;
  isForm: string;
}

// ─── Workflow Action Config ───

export interface NextMicroProcess {
  exception_type: string;
  next_channel: string;
  next_micro: string;
  next_micro_code: string;
  next_queue: string;
  rabbit_mq: string;
}

export interface WorkflowRoutingJson {
  channel: string;
  enablesAlways: boolean;
  enabledAlways?: boolean;
  next_micro_list: NextMicroProcess[];
  queue_id: string;
  returnAfterComplete: boolean;
}

export interface WorkflowActionConfig {
  process_name: string;
  process_desc?: string;
  workflow_routing_json: string;
  exception_channel?: string;
  isEnabled: boolean;
  tooltips?: any;
}

// ─── Inventory / Media Data ───

export interface InventoryData {
  file_id: string;
  source_file: string;
  extracted_file_name: string;
  byteString: string;
  totalPages: number;
}

export interface MediaConfigData {
  eFS_XSD: string;
  efs_uin: string;
}

export interface QueueInfo {
  queue_btime: string;
  service_dashboard: string;
}

export interface MaxFileIdData {
  max_file_id: number;
}

export interface QueueCatalogEntry {
  queue_id: string;
  custom_queue_name: string;
}

export interface InvoiceNumberItem {
  inv_number: string;
  inv_number_display: string;
}

// ─── API Input Types ───

export interface LoadDataEntryMediaInput {
  customer_id: string;
  bps_id: string;
  bu_id: string;
  tps_id: string;
  uin: string;
  file_id: string;
  formMedia: string;
  extracted_file_id: number;
  source_file_id: string;
  dept_id: string;
  queue_id: string;
  user_id: string;
  exception_ticket: string;
  currentStatus: string;
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

export interface RotatePDFPageInput {
  customer_id: string;
  bps_id: string;
  bu_id: string;
  tps_id: string;
  spProcess_id: string;
  uin: string;
  source_file_id: string;
  file_id: string;
  extracted_file_id: number;
  rotate_degree: number;
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
  mediaUploaderEmailId: string;
  mediaUploaderFName: string;
  mediaUploaderLName: string;
  exceptionCount: number;
  microService: string;
  source_file: string;
  dept_id: string;
  queue_id: string;
  dataJSON: any;
  dataExceptionJson: any;
  queue_comment: string;
  exceptionTicketStatus: string;
  exceptionType: string;
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
  sourceFileId: string;
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
  preparedMXSDList: PrepMxsdListObject[];
  dinType: boolean;
  formMedia: string;
  form_type: string;
  uin: string;
  ixsdId: string;
  efs_uin: string;
  tfs_uin: string;
  din_assignee: string;
  user_id: string;
  pageOrderList: PageOrderItem[];
  classificationResult: ClassificationInfo[];
  isValidation: boolean;
  serviceDashboard: any;
}

export interface PrepMxsdListObject {
  prepMxsd: any;
  efsUin: string;
  prepMxsdStatus: string;
  sheetName: string;
  ixsdId: string;
}

export interface DownloadStreamExceptionInput {
  extracted_file_name: string;
  source_file: string;
}

// ─── API Response Types ───

export interface ChangeMediaPageResponse {
  byteString: string;
}

export interface DownloadStreamResponse {
  downloadStream: string;
  downloadStreamFile: string;
}

export interface HandleDataEntryExceptionResponse {
  exceptionMsg?: any;
  [key: string]: any;
}

// ─── Doc Validation Result ───

export interface DocValidationResult {
  [key: string]: any;
}

// ─── State Type ───

export interface DataEntryOperatorState {
  // Loading states
  isLoading: boolean;
  workflowActionStarted: boolean;
  isDownloading: boolean;
  modifyPageStream: boolean;

  // Exception / selected item
  selectedException: SelectedException | null;
  fromController: 'apps' | 'tasks' | '';
  currentStatus: string;

  // PDF / media
  pdfStream: string;
  currentPage: number;
  currentPageNew: number;
  newPageNumber: number;
  totalPages: number;
  selectedPageStream: string;

  // Classification
  classificationInfo: ClassificationInfo[];
  currentPageStatus: string;
  currentPageStatusMsg: string;

  // Page order / document splitting
  pageOrderList: PageOrderItem[];
  pageOrderListToRoute: PageOrderItem[];
  selectedPageArray: OriginalDocPage[];
  originalDocPages: OriginalDocPage[];
  currentHeaderIndex: number;
  invoiceNumberList: InvoiceNumberItem[];
  maxFileId: number;
  maxFileIdBackUp: number;

  // Workflow
  workflowActionConfigData: WorkflowActionConfig[];
  selectedAction: WorkflowActionConfig | null;
  selectedActionClick: string;
  selectedRabbitMq: string;
  nextMicroProcessObj: any;

  // Inventory / media config
  inventoryData: InventoryData[];
  genericMxsd: any;
  currentMedia: string;
  ixsdId: string;
  ixsd_bean_path: string;
  tfs_uin: string;
  source_file: string;
  selectedDataJson: any;
  currentVersion: string;
  serviceDashboard: any;

  // Queue
  queueCatalog: QueueCatalogEntry[];

  // Validation result dialog
  docValidationResult: any;
  showValidationResultDialog: boolean;

  // Action dialog
  showActionDialog: boolean;

  // Sorting
  selectedPageToSort: string;
  selectedIndex: number;
  droppedIndex: number;

  // Page list
  showPageList: boolean;

  // Image dimensions
  imageResponsiveWidth: number;
  imageResponsiveHeight: number;

  // Error
  error: string | null;
}
