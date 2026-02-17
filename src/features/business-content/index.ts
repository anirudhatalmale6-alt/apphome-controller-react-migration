/**
 * Business Content Feature Module
 * Document/invoice processing workflow
 * Migrated from BusinessContentController.js + PDFLoadingPage.html
 */

// Components
export { PDFLoadingView } from './components/PDFLoadingView';
export { DocumentViewer } from './components/DocumentViewer';
export { IXSDDataGrid } from './components/IXSDDataGrid';

// API
export { businessContentApi } from './api/businessContentApi';

// Store
export { default as businessContentReducer } from './store/businessContentSlice';

// Hooks
export { useBusinessContentState } from './hooks/useBusinessContentState';

// Types
export type {
  BusinessContentState,
  SelectedDIN,
  MediaConfig,
  IXSDField,
  IXSDDataHeader,
} from './types/BusinessContentTypes';
