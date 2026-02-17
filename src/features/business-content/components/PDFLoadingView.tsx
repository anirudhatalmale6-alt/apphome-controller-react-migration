/**
 * PDF Loading View (Main Business Content Page)
 * Split-panel layout: Document viewer (left) + iXSD Data Grid (right)
 * Origin: PDFLoadingPage.html + BusinessContentController.js
 */
import React, { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectAuth } from '../../authentication/store/authSlice';
import { useBusinessContentState } from '../hooks/useBusinessContentState';
import {
  selectBusinessContent,
  setEnableEditStatus,
  setSingleLineItemView,
  setSelectedLineItemIndex,
  setFormAuditView,
} from '../store/businessContentSlice';
import { DocumentViewer } from './DocumentViewer';
import { IXSDDataGrid } from './IXSDDataGrid';
import { hasUnsavedChanges } from '../services/BusinessContentService';

export const PDFLoadingView: React.FC = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectAuth);
  const contentState = useAppSelector(selectBusinessContent);
  const {
    handleLoadTransactionMedia,
    handleLoadDinHistory,
    handleSaveIXSD,
    handleStartWorkflow,
    handleCheckForNewDIN,
    handleDownloadSourceFile,
    handleGenerateExcel,
    handleChangeMediaPage,
    handleAddLineItem,
    handleDeleteLineItem,
    handleUpdateFieldValue,
    handleFieldLevelAudit,
    handleLoadFormAudit,
    handleSetNewBotCamp,
    handleNavigateBack,
  } = useBusinessContentState();

  const [showFormAuditModal, setShowFormAuditModal] = useState(false);

  // ─── Initialize: Load transaction media on mount ───
  useEffect(() => {
    if (contentState.selectedDIN) {
      handleLoadTransactionMedia(contentState.selectedDIN);
      handleLoadDinHistory();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Toggle Edit Mode ───
  const handleToggleEdit = useCallback(() => {
    dispatch(setEnableEditStatus(!contentState.enableEditStatus));
  }, [contentState.enableEditStatus, dispatch]);

  // ─── Save ───
  const handleSave = useCallback(async () => {
    const success = await handleSaveIXSD();
    if (success) {
      dispatch(setEnableEditStatus(false));
    }
  }, [handleSaveIXSD, dispatch]);

  // ─── Toggle Single Line Item View ───
  const handleToggleSingleLineView = useCallback(() => {
    dispatch(setSingleLineItemView(!contentState.singleLineItemView));
  }, [contentState.singleLineItemView, dispatch]);

  // ─── Select Line Item ───
  const handleSelectLineItem = useCallback((index: number) => {
    dispatch(setSelectedLineItemIndex(index));
  }, [dispatch]);

  // ─── Bot Camp ───
  const handleBotCamp = useCallback((complexType: string, field: any) => {
    handleSetNewBotCamp(
      complexType,
      field.key,
      field.value,
      '' // tfsUin - will be available from contentState
    );
  }, [handleSetNewBotCamp]);

  // ─── Form Audit ───
  const handleFormAudit = useCallback(() => {
    setShowFormAuditModal(true);
    dispatch(setFormAuditView(true));
  }, [dispatch]);

  // ─── Back Navigation ───
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges(contentState.ixsdDataHeaders)) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirm) return;
    }
    handleNavigateBack(contentState.fromController);
  }, [contentState.ixsdDataHeaders, contentState.fromController, handleNavigateBack]);

  // ─── Total pages from media config ───
  const totalPages = contentState.mediaConfig.length > 0
    ? contentState.mediaConfig[0].page_count || 1
    : 1;

  const filePath = contentState.mediaConfig.length > 0
    ? contentState.mediaConfig[0].file_path
    : '';

  return (
    <div className="pdf-loading-page">
      {/* Header bar */}
      <div className="content-header">
        <div className="header-left">
          <button className="btn btn-sm" onClick={handleBack} title="Back">
            <i className="fa fa-arrow-left" /> Back
          </button>
          <span className="din-info">
            DIN: <strong>{contentState.selectedDIN?.din || ''}</strong>
          </span>
          <span className="status-badge">
            Status: {contentState.currentStatus}
          </span>
        </div>
        <div className="header-right">
          {contentState.enableEditStatus ? (
            <>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleSave}
                disabled={contentState.isSaving}
              >
                <i className="fa fa-save" />
                {contentState.isSaving ? ' Saving...' : ' Save'}
              </button>
              <button className="btn btn-sm" onClick={handleToggleEdit}>
                <i className="fa fa-times" /> Cancel Edit
              </button>
            </>
          ) : (
            <button className="btn btn-sm" onClick={handleToggleEdit}>
              <i className="fa fa-pencil" /> Edit
            </button>
          )}
          <button className="btn btn-sm" onClick={handleFormAudit} title="Form Audit">
            <i className="fa fa-history" /> Audit
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {contentState.isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <i className="fa fa-spinner fa-spin fa-3x" />
            <p>Loading...</p>
          </div>
        </div>
      )}

      {/* Workflow processing overlay */}
      {contentState.isWorkflowProcessing && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <i className="fa fa-cog fa-spin fa-3x" />
            <p>Processing workflow...</p>
          </div>
        </div>
      )}

      {/* Main split panel */}
      <div className="content-split-panel">
        {/* Left panel: Document Viewer */}
        <div className="panel-left">
          <DocumentViewer
            selectedMedia={contentState.selectedMedia}
            currentPage={contentState.currentPageNew}
            totalPages={totalPages}
            isLoading={contentState.isLoading}
            onPageChange={handleChangeMediaPage}
            onDownloadSource={handleDownloadSourceFile}
            onGenerateExcel={handleGenerateExcel}
            filePath={filePath}
            isDownloading={contentState.isDownloading}
          />
        </div>

        {/* Right panel: iXSD Data Grid */}
        <div className="panel-right">
          <IXSDDataGrid
            headers={contentState.ixsdDataHeaders}
            enableEdit={contentState.enableEditStatus}
            selectedLineItemIndex={contentState.selectedLineItemIndex}
            singleLineItemView={contentState.singleLineItemView}
            onFieldChange={handleUpdateFieldValue}
            onAddLineItem={handleAddLineItem}
            onDeleteLineItem={handleDeleteLineItem}
            onSelectLineItem={handleSelectLineItem}
            onToggleSingleLineView={handleToggleSingleLineView}
            onFieldAudit={handleFieldLevelAudit}
            onBotCamp={handleBotCamp}
          />
        </div>
      </div>

      {/* Transaction History Bar */}
      {contentState.transactionDataCaptureProcess.length > 0 && (
        <div className="transaction-history-bar">
          <strong>Transaction History:</strong>
          {contentState.transactionDataCaptureProcess.map((process, idx) => (
            <span key={idx} className={`history-step ${process.status}`}>
              {process.microProcess}
              {process.startDate && (
                <small> ({process.startDate})</small>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Error display */}
      {contentState.error && (
        <div className="error-banner">
          <i className="fa fa-exclamation-circle" /> {contentState.error}
        </div>
      )}
    </div>
  );
};

export default PDFLoadingView;
