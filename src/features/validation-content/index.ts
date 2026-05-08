/**
 * Validation Content Feature Module
 * Validation workflow for documents with exception data
 * Migrated from ValidationContentController.js + ValidationContent.html +
 *   WorkflowValidationInbox.html + PDFLoadingPage.html
 */

// Components
export { ValidationContentView } from './components/ValidationContentView';
export { WorkflowValidationInbox } from './components/WorkflowValidationInbox';
export { ValidationWorkflowDialog } from './components/ValidationWorkflowDialog';

// API
export { validationContentApi } from './api/validationContentApi';

// Store
export { default as validationContentReducer } from './store/validationContentSlice';

// Hooks
export { useValidationContentState } from './hooks/useValidationContentState';

// Types
export type {
  ValidationContentState,
  SelectedDIN,
  MediaConfig,
  IXSDField,
  IXSDDataHeader,
  FilteredException,
  WorkflowConfigItem,
  ExcelDataConfig,
  CoordinatesPosition,
} from './types/ValidationContentTypes';
