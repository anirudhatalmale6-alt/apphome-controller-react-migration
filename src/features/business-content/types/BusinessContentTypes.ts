/**
 * Business Content Types
 * Strongly typed models replacing AngularJS $scope/$rootScope patterns
 * Origin: BusinessContentController.js
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
}

export interface MediaConfig {
  byteString: string;
  file_path: string;
  page_count?: number;
  file_type?: string;
}

export interface DataPosition {
  width: string;
  height: string;
  top: string;
  left: string;
  border_bottom?: string;
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
  read_only: boolean;
  required?: boolean;
  key_hint?: string;
  exception_msg: ExceptionMessage[];
  data_position?: DataPosition;
  lookup_criteria: LookupItem[];
  lookup_table?: string;
  lookupType?: string;
  lookup_search_desc?: string;
  isOptionFieldEdited?: boolean;
  isExtractedDataChanged?: boolean;
  editedStatus?: boolean;
  visible_status?: boolean;
  valueMaxLength: number;
  valueAsArray?: string[];
  multiSelectFields?: string[];
  showdownloads?: boolean;
  complexTypeLabel?: string;
  row?: number;
  page?: number;
  itemState?: 'D' | 'C' | 'A' | 'S' | 'M';
  hasDuplicated?: boolean;
}

export interface IXSDDataHeader {
  header_name: string;
  label: string;
  view_style: 'object' | 'array';
  ixsd_fields: IXSDField[][];
  exception_status: boolean;
  exceptionColor: 'red' | 'orange' | '';
  visible_status?: boolean;
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

export interface VersionAuthorInfo {
  user_name: string;
  queue_time: string;
  showdownloads?: boolean;
  byteString?: string;
  filename?: string;
}

export interface DataCaptureProcess {
  microProcess: string;
  startDate?: string;
  endDate?: string;
  status: string;
  user_name?: string;
}

// ─── API Input Types ───

export interface BaseContentParams {
  customer_id: string;
  bps_id: string;
}

export interface TransactionMediaInput extends BaseContentParams {
  bu_id: string;
  tps_id: string;
  din: string;
  user_id: string;
  dept_id: string;
  queue_id: string;
  ixsd_id: string;
  currentStatus: string;
  hasException: string;
}

export interface DinHistoryInput extends BaseContentParams {
  bu_id: string;
  tps_id: string;
  spProcessId: string;
  user_id: string;
  din: string;
}

export interface StartWorkflowInput {
  ixsd_id: string;
  customer_id: string;
  bps_id: string;
  bu_id: string;
  tps_id: string;
  din: string;
  uin: string;
  ixsdId: string;
  efs_uin: string;
  tfs_uin: string;
  bpaas_connector_id: string;
  din_assignee: string;
  user_id: string;
  lastManualUser: string;
  transactionData: MediaConfig[];
  preparedMXML: any;
  artifactList: any[];
  inventoryDate: string;
  fileDate: string;
  serviceDashboard: any;
  lineItemIndex: string;
  apiLookUpResult: any[];
  apiLookUpSubResult: any[];
}

export interface LoadUpdateDataJsonInput {
  din: string;
  uin: string;
}

export interface CheckForNewDINInput extends BaseContentParams {
  dept_id: string;
  queue_id: string;
  din: string;
  din_status: string;
  user_id: string;
  queue_btime: string;
  openFromAnalytics?: boolean;
  din_version?: string;
}

export interface SaveIXSDInput extends BaseContentParams {
  bu_id: string;
  tps_id: string;
  din: string;
  version: string;
  spProcess_id: string;
  bPaaSConnector_id: string;
  dept_id: string;
  queue_id: string;
  ixsd_id: string;
  dataJson: any;
  exceptionJson: any;
  user_id: string;
  mediaiXSD: MediaConfig[];
  autoUpdateFields: string[];
}

export interface DownloadSourceInput {
  source_file: string;
  file_name: string;
}

export interface GenerateExcelInput extends BaseContentParams {
  bu_id: string;
  dept_id: string;
  queue_id: string;
  din: string;
}

export interface ChangeMediaPageInput extends BaseContentParams {
  bu_id: string;
  tps_id: string;
  din: string;
  spProcess_id: string;
  ixsd_id: string;
  page_number: number;
  file_path: string;
}

export interface SetNewBotCampInput extends BaseContentParams {
  bu_id: string;
  tps_id: string;
  spProcess_id: string;
  user_id: string;
  ixsd_id: string;
  tfs_uin: string;
  complexType: string;
  learning_field: string;
  learning_value: string;
}

export interface SetInvoiceCodingInput extends BaseContentParams {
  bu_id: string;
  tps_id: string;
  spProcess_id: string;
  user_id: string;
  dept_id: string;
  expense_ledger: string;
  line_item: string;
}

export interface SendNotificationInput extends BaseContentParams {
  dept_id: string;
  queue_id: string;
  toAddress: string[];
  user_id: string;
  user_name: string;
  message: string;
  subject: string;
  user_login_id: string;
  dataJSON: any;
  exceptionData: any[];
  exceptionMsg: string;
}

export interface FieldLevelAuditInput extends BaseContentParams {
  bu_id: string;
  tps_id: string;
  din: string;
  uin: string;
  complexType: string;
  rowno: number;
}

export interface LoadFormAuditInput extends BaseContentParams {
  din: string;
  uin: string;
  din_version1: string;
  din_version2: string;
}

export interface InfordataInput {
  poNum: string;
}

// ─── API Response Types ───

export interface TransactionMediaResponse {
  din: string;
  uin: string;
  bPaaS_connectorID: string;
  field_formats_for_999?: string;
  [key: string]: any;
}

export interface DinHistoryResponse {
  dataCapture: string;
  [key: string]: any;
}

export interface WorkflowResponse {
  next_micro_process_code: string;
  din_status: string;
  form_input_source?: string;
  fileName?: string;
  queue_comment?: string;
  [key: string]: any;
}

export interface CheckForNewDINResponse {
  din?: string;
  uin?: string;
  ixsd_id?: string;
  TransactionID?: string;
  fileName?: string;
  queue_btime?: string;
  hasException?: string;
  [key: string]: any;
}

export interface UpdateDataJsonResponse {
  ixsd_data_json: string;
  ixsd_data_exception: string;
  artifact_upload_path: string;
  [key: string]: any;
}

export interface DownloadResponse {
  downloadStream: string;
  downloadStreamFile: string;
}

export interface ChangeMediaPageResponse {
  byteString: string;
}

export interface FieldAuditResponse {
  [key: string]: any;
}

export interface FormAuditResponse {
  ixsd_data_json: string;
  ixsd_data_exception: string;
  max_version?: string;
  min_version?: string;
  custom_queue_name?: string;
  user_name?: string;
  queue_btime?: string;
  byteString?: string;
  showdownloads?: string;
  filename?: string;
}

// ─── Notification Types ───

export interface NotificationTemplate {
  toAddressList: string[];
  subject: string;
  message: string;
}

// ─── Form Audit Types ───

export interface VersionAuthorInfo {
  queue_name: string;
  user_name: string;
  queue_time: string;
  byteString: string;
  showdownloads: string;
  filename: string;
}

// ─── Transaction History Types ───

export interface DataCaptureProcess {
  microProcess: string;
  startDate: string;
  endDate: string;
  status: string;
}

// ─── State Type ───

export interface BusinessContentState {
  // Loading states
  isLoading: boolean;
  isWorkflowProcessing: boolean;
  isDownloading: boolean;
  isSaving: boolean;

  // DIN / Transaction
  selectedDIN: SelectedDIN | null;
  selectedDinNo: string;
  selectedUinNo: string;
  currentStatus: string;
  currentVersion: string;

  // Media / Document
  mediaConfig: MediaConfig[];
  selectedMedia: string;
  currentPageNew: number;
  newPageNumber: number;

  // iXSD Data
  ixsdDataHeaders: IXSDDataHeader[];
  selectedDataJson: any;
  selectedExceptionJson: any;
  selectedExceptionJsonBackUp: any;
  iXSDDataJson: any[];
  fieldFormatsFor999: any[];
  bPaaSConnector_id: string;
  spProcessId: string;

  // Edit state
  enableEditStatus: boolean;
  enableUserInformation: boolean;
  saveProcessIsCompleted: boolean;
  isAnyLineItemDeleted: boolean;
  isNewLineItemAdded: boolean;
  autoUpdateFields: string[];

  // Line item
  selectedLineItemIndex: number;
  singleLineItemView: boolean;
  lineItemIndexForAPILookUp: number;

  // Workflow
  workflowActionStarted: boolean;
  fromController: 'apps' | 'tasks' | '';
  selectedProcessLabel: any;
  workflowConfig: any[];
  selectedMediaSource: string;
  totalPages: number;
  hasExceptions: boolean;
  showExceptionSidebar: boolean;
  iXSDMaxVersion: number;

  // Transaction history
  transactionDataCaptureProcess: DataCaptureProcess[];
  docInfoUin: string;
  docInfoDin: string;

  // Audit
  fieldAuditData: any[];
  formAuditView: boolean;
  formAuditResponse: any;
  formAuditDataHeaders: IXSDDataHeader[];
  formAuditDataHeaders2: IXSDDataHeader[];
  prevVersionAuthorInfo: VersionAuthorInfo | null;
  newVersionAuthorInfo: VersionAuthorInfo | null;

  // Notification
  filteredExceptionToNotify: any[];

  // Lookup
  lookupCatalog: any;
  expenseLedgerAPILookUP: any[];
  apiLookUpResult: any[];
  apiLookUpSubResult: any[];

  // Artifacts
  artifactUploadPath: string;
  attachmentList: any[];

  // Service
  serviceDashboard: any;
  botCampList: any[];

  // Error
  error: string | null;
}
