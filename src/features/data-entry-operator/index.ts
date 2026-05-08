/**
 * Data Entry Operator Feature Module
 * Barrel export for data entry exception workflow (page splitting/classification)
 */

// Components
export { DataEntryOperatorView } from './components/DataEntryOperatorView';
export { WorkflowActionDialog } from './components/WorkflowActionDialog';

// Hook
export { useDataEntryOperatorState } from './hooks/useDataEntryOperatorState';

// Store
export {
  default as dataEntryOperatorReducer,
  selectDataEntryOperator,
  selectSelectedException,
  selectPageOrderList,
  selectClassificationInfo,
  selectPdfStream,
  selectWorkflowActionConfigData,
  selectIsLoading,
  selectWorkflowActionStarted,
  setSelectedException,
  setFromController,
  setCurrentStatus,
  resetDataEntryOperatorState,
} from './store/dataEntryOperatorSlice';

// API
export {
  dataEntryOperatorApi,
  useLoadDataEntryMediaListQuery,
  useLazyLoadDataEntryMediaListQuery,
  useChangeMediaPageDataEntryMutation,
  useRotatePDFPageMutation,
  useHandleDataEntryExceptionMutation,
  useDownloadStreamExceptionMutation,
} from './api/dataEntryOperatorApi';

// Types
export type {
  SelectedException,
  ClassificationInfo,
  SelectedPage,
  PageOrderItem,
  OriginalDocPage,
  WorkflowActionConfig,
  WorkflowRoutingJson,
  NextMicroProcess,
  InventoryData,
  MediaConfigData,
  DataEntryOperatorState,
  LoadDataEntryMediaInput,
  ChangeMediaPageDataEntryInput,
  ChangeMediaPageResponse,
  RotatePDFPageInput,
  HandleDataEntryExceptionInput,
  HandleDataEntryExceptionResponse,
  DownloadStreamExceptionInput,
  DownloadStreamResponse,
} from './types/DataEntryOperatorTypes';
