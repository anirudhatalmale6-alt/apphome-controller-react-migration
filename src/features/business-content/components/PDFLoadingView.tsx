/**
 * PDF Loading View (Main Business Content Page)
 * Integrates: WorkflowContent toolbar, split-panel (DocumentViewer + IXSDDataGrid),
 *             FilterByException sidebar, FormAudit overlay
 * Origin: PDFLoadingPage.html + WorkflowContent.html + BusinessContentController.js
 */
import React, { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useBusinessContentState } from '../hooks/useBusinessContentState';
import {
  selectBusinessContent,
  setEnableEditStatus,
  setSingleLineItemView,
  setSelectedLineItemIndex,
  setFormAuditView,
  setShowExceptionSidebar,
} from '../store/businessContentSlice';
import { WorkflowContent, type WorkflowAction } from './WorkflowContent';
import { DocumentViewer } from './DocumentViewer';
import { IXSDDataGrid } from './IXSDDataGrid';
import { FilterByException, type FilteredException } from './FilterByException';
import { FormAudit } from './FormAudit';
import { hasUnsavedChanges, getFilteredExceptions, buildMediaUrl } from '../services/BusinessContentService';

export const PDFLoadingView: React.FC = () => {
  const dispatch = useAppDispatch();
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
    handleGetFilteredExceptions,
  } = useBusinessContentState();

  // ─── Initialize: Load transaction media on mount ───
  useEffect(() => {
    if (contentState.selectedDIN) {
      handleLoadTransactionMedia(contentState.selectedDIN);
      handleLoadDinHistory();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Toolbar Callbacks ───
  const handleGoHome = useCallback(() => {
    if (hasUnsavedChanges(contentState.ixsdDataHeaders)) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
    }
    handleNavigateBack(contentState.fromController);
  }, [contentState.ixsdDataHeaders, contentState.fromController, handleNavigateBack]);

  const handleChangeMedia = useCallback((index: number) => {
    if (contentState.mediaConfig[index]) {
      const media = contentState.mediaConfig[index];
      if (media.byteString) {
        // Dispatch media change - the hook will handle it
      }
    }
  }, [contentState.mediaConfig]);

  const handlePageChangeDirection = useCallback((direction: 'up' | 'down') => {
    const newPage = direction === 'up' ? contentState.currentPageNew - 1 : contentState.currentPageNew + 1;
    const filePath = contentState.mediaConfig.length > 0 ? contentState.mediaConfig[0].file_path : '';
    handleChangeMediaPage(newPage, filePath);
  }, [contentState.currentPageNew, contentState.mediaConfig, handleChangeMediaPage]);

  const handlePageInputChange = useCallback((page: number) => {
    const filePath = contentState.mediaConfig.length > 0 ? contentState.mediaConfig[0].file_path : '';
    handleChangeMediaPage(page, filePath);
  }, [contentState.mediaConfig, handleChangeMediaPage]);

  const handleToggleEdit = useCallback(() => {
    dispatch(setEnableEditStatus(!contentState.enableEditStatus));
  }, [contentState.enableEditStatus, dispatch]);

  const handleSave = useCallback(async () => {
    const success = await handleSaveIXSD();
    if (success) {
      dispatch(setEnableEditStatus(false));
    }
  }, [handleSaveIXSD, dispatch]);

  const handleFilterExceptions = useCallback(() => {
    dispatch(setShowExceptionSidebar(!contentState.showExceptionSidebar));
  }, [contentState.showExceptionSidebar, dispatch]);

  const handleFormAudit = useCallback(() => {
    dispatch(setFormAuditView(true));
    // Trigger initial version comparison
    const maxVer = contentState.iXSDMaxVersion || 1;
    handleLoadFormAudit(String(Math.max(1, maxVer - 1)), String(maxVer));
  }, [dispatch, contentState.iXSDMaxVersion, handleLoadFormAudit]);

  const handleProcessDocument = useCallback((action: WorkflowAction) => {
    handleStartWorkflow(action);
  }, [handleStartWorkflow]);

  const handleUploadArtifact = useCallback(() => {
    // Artifact upload - placeholder for file upload dialog
    console.log('[BusinessContent] Artifact upload triggered');
  }, []);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges(contentState.ixsdDataHeaders)) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
    }
    handleNavigateBack(contentState.fromController);
  }, [contentState.ixsdDataHeaders, contentState.fromController, handleNavigateBack]);

  // ─── Line Item ───
  const handleToggleSingleLineView = useCallback(() => {
    dispatch(setSingleLineItemView(!contentState.singleLineItemView));
  }, [contentState.singleLineItemView, dispatch]);

  const handleSelectLineItem = useCallback((index: number) => {
    dispatch(setSelectedLineItemIndex(index));
  }, [dispatch]);

  const handleBotCamp = useCallback((complexType: string, field: any) => {
    handleSetNewBotCamp(complexType, field.key, field.value, '');
  }, [handleSetNewBotCamp]);

  // ─── Exception Filter ───
  const handleFilterTabs = useCallback((selected: FilteredException[]) => {
    // Filter tabs based on selected exceptions
    console.log('[BusinessContent] Filter tabs:', selected.map((s) => s.exception_desc));
    dispatch(setShowExceptionSidebar(false));
  }, [dispatch]);

  const handleRemoveFilter = useCallback(() => {
    dispatch(setShowExceptionSidebar(false));
  }, [dispatch]);

  const handleNotifyException = useCallback((exceptionDesc: string) => {
    console.log('[BusinessContent] Notify exception:', exceptionDesc);
  }, []);

  // ─── Form Audit ───
  const handleSearchVersions = useCallback((minVer: number, maxVer: number) => {
    handleLoadFormAudit(String(minVer), String(maxVer));
  }, [handleLoadFormAudit]);

  const handleCloseFormAudit = useCallback(() => {
    dispatch(setFormAuditView(false));
  }, [dispatch]);

  // ─── Derived Values ───
  const totalPages = contentState.mediaConfig.length > 0
    ? contentState.mediaConfig[0].page_count || 1
    : 1;

  const filePath = contentState.mediaConfig.length > 0
    ? contentState.mediaConfig[0].file_path
    : '';

  // Build filtered exception list for the sidebar
  const filteredExceptionList: FilteredException[] = React.useMemo(() => {
    const exceptions = handleGetFilteredExceptions();
    const grouped: Record<string, FilteredException> = {};
    exceptions.forEach((exc) => {
      const desc = typeof exc.exception_msg === 'string' ? exc.exception_msg : (exc.exception_msg || 'Unknown');
      if (!grouped[desc]) {
        grouped[desc] = {
          exception_desc: desc,
          exception_count: 0,
          isSelected: false,
          showFieldException: false,
          field_list: [],
        };
      }
      grouped[desc].exception_count++;
    });
    return Object.values(grouped);
  }, [handleGetFilteredExceptions]);

  return (
    <WorkflowContent
      selectedDinNo={contentState.selectedDIN?.din || ''}
      selectedUinNo={contentState.selectedDIN?.uin || ''}
      currentVersion={contentState.currentVersion}
      selectedMediaSource={contentState.selectedMediaSource || contentState.selectedDIN?.fileName || ''}
      queueBtime={contentState.selectedDIN?.queue_btime || ''}
      currentStatus={contentState.currentStatus}
      mediaConfig={contentState.mediaConfig}
      currentPage={contentState.currentPageNew}
      totalPages={totalPages}
      workflowConfig={contentState.workflowConfig || []}
      selectedProcessLabel={contentState.selectedProcessLabel}
      hasExceptions={contentState.hasExceptions || filteredExceptionList.length > 0}
      enableEditStatus={contentState.enableEditStatus}
      isLoading={contentState.isLoading}
      isWorkflowProcessing={contentState.isWorkflowProcessing}
      onGoHome={handleGoHome}
      onChangeMedia={handleChangeMedia}
      onPageChange={handlePageChangeDirection}
      onPageInputChange={handlePageInputChange}
      onFilterExceptions={handleFilterExceptions}
      onFormAudit={handleFormAudit}
      onProcessDocument={handleProcessDocument}
      onEnableFieldAudit={handleToggleEdit}
      onDownloadSource={handleDownloadSourceFile}
      onGenerateExcel={handleGenerateExcel}
      onSave={handleSave}
      onUploadArtifact={handleUploadArtifact}
      onClose={handleClose}
    >
      {/* Main split panel */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 150px)' }}>
        {/* Left panel: Document Viewer (50%) */}
        <div style={{ flex: '0 0 50%', borderRight: '1px solid #ddd', overflow: 'auto' }}>
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

        {/* Right panel: iXSD Data Grid (50%) */}
        <div style={{ flex: '0 0 50%', overflow: 'auto' }}>
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
        <div style={{
          display: 'flex', gap: '8px', padding: '8px 16px',
          backgroundColor: '#f5f5f5', borderTop: '1px solid #ddd', flexWrap: 'wrap',
        }}>
          <strong>Transaction History:</strong>
          {contentState.transactionDataCaptureProcess.map((process, idx) => (
            <span key={idx} style={{
              padding: '2px 8px', borderRadius: '4px', fontSize: '12px',
              backgroundColor: process.status === 'completed' ? '#c8e6c9' : '#fff9c4',
            }}>
              {process.microProcess}
              {process.startDate && <small> ({process.startDate})</small>}
            </span>
          ))}
        </div>
      )}

      {/* Error display */}
      {contentState.error && (
        <div style={{
          padding: '8px 16px', backgroundColor: '#ffebee', color: '#c62828',
          borderTop: '1px solid #ef9a9a',
        }}>
          <i className="fa fa-exclamation-circle" /> {contentState.error}
        </div>
      )}

      {/* Exception Sidebar */}
      <FilterByException
        filteredException={filteredExceptionList}
        isOpen={contentState.showExceptionSidebar}
        onClose={() => dispatch(setShowExceptionSidebar(false))}
        onFilterTabs={handleFilterTabs}
        onRemoveFilter={handleRemoveFilter}
        onNotifyException={handleNotifyException}
      />

      {/* Form Audit Overlay */}
      <FormAudit
        isOpen={contentState.formAuditView}
        isLoading={false}
        maxVersion={contentState.iXSDMaxVersion}
        version1Headers={contentState.formAuditDataHeaders}
        version1AuthorInfo={contentState.prevVersionAuthorInfo}
        version2Headers={contentState.formAuditDataHeaders2}
        version2AuthorInfo={contentState.newVersionAuthorInfo}
        onSearchVersions={handleSearchVersions}
        onClose={handleCloseFormAudit}
      />
    </WorkflowContent>
  );
};

export default PDFLoadingView;
