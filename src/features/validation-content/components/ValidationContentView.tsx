/**
 * Validation Content View (Main Validation Page)
 * Split panel: PDF viewer left, data tabs right
 * Origin: ValidationContent.html + PDFLoadingPage.html + ValidationContentController.js
 */
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useValidationContentState } from '../hooks/useValidationContentState';
import {
  selectValidationContent,
  setSingleLineItemView,
  setShowExceptionSidebar,
  setCurrentStatus,
} from '../store/validationContentSlice';
import {
  selectSelectedDIN as selectBusinessSelectedDIN,
  selectCurrentStatus as selectBusinessCurrentStatus,
} from '../../business-content/store/businessContentSlice';
import { WorkflowValidationInbox } from './WorkflowValidationInbox';
import { ValidationWorkflowDialog } from './ValidationWorkflowDialog';
import type { IXSDDataHeader, IXSDField, ExceptionMessage, WorkflowConfigItem, MediaConfig } from '../types/ValidationContentTypes';

// ─── Inline Styles (dark toolbar theme) ───
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: '#263238',
    color: '#fff',
    minHeight: '48px',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toolbarBtn: {
    padding: '4px 12px',
    border: '1px solid #546e7a',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#eceff1',
    cursor: 'pointer',
    fontSize: '12px',
  },
  toolbarBtnActive: {
    padding: '4px 12px',
    border: '1px solid #26a69a',
    borderRadius: '4px',
    backgroundColor: '#26a69a',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
  },
  toolbarBtnDisabled: {
    padding: '4px 12px',
    border: '1px solid #37474f',
    borderRadius: '4px',
    backgroundColor: '#37474f',
    color: '#78909c',
    cursor: 'not-allowed',
    fontSize: '12px',
  },
  splitPanel: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  leftPanel: {
    flex: '0 0 50%',
    borderRight: '1px solid #ddd',
    overflow: 'auto',
    position: 'relative' as const,
    backgroundColor: '#eceff1',
  },
  rightPanel: {
    flex: '0 0 50%',
    overflow: 'auto',
    backgroundColor: '#fff',
  },
  pdfImage: {
    width: '100%',
    display: 'block',
  },
  pageNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
  },
  pageInput: {
    width: '40px',
    padding: '2px 4px',
    border: '1px solid #546e7a',
    borderRadius: '3px',
    backgroundColor: '#37474f',
    color: '#eceff1',
    textAlign: 'center' as const,
    fontSize: '12px',
  },
  tabContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '2px',
    padding: '8px',
    backgroundColor: '#eceff1',
    borderBottom: '1px solid #cfd8dc',
  },
  tab: {
    padding: '6px 12px',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    fontSize: '12px',
    backgroundColor: '#fff',
    border: '1px solid #cfd8dc',
    borderBottom: 'none',
  },
  tabActive: {
    padding: '6px 12px',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    fontSize: '12px',
    backgroundColor: '#263238',
    color: '#fff',
    border: '1px solid #263238',
    borderBottom: 'none',
  },
  tabException: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginLeft: '4px',
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '13px',
  },
  fieldLabel: {
    flex: '0 0 180px',
    fontWeight: 500,
    color: '#37474f',
    fontSize: '12px',
  },
  fieldInput: {
    flex: 1,
    padding: '4px 8px',
    border: '1px solid #cfd8dc',
    borderRadius: '3px',
    fontSize: '13px',
  },
  loadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 10,
  },
  errorBar: {
    padding: '8px 16px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderTop: '1px solid #ef9a9a',
    fontSize: '13px',
  },
  workflowActions: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap' as const,
  },
  dinInfo: {
    fontSize: '11px',
    color: '#b0bec5',
  },
};

export const ValidationContentView: React.FC = () => {
  const dispatch = useAppDispatch();
  const contentState = useAppSelector(selectValidationContent);
  const businessContentDIN = useAppSelector(selectBusinessSelectedDIN);
  const businessContentStatus = useAppSelector(selectBusinessCurrentStatus);
  const {
    handleLoadValidationMedia,
    handleChangePageNumber,
    handleGoToPage,
    handleChangeSelectedMedia,
    handleStartWorkflow,
    handleSaveIXSD,
    handleSetDataHeader,
    handleChangeLineItemView,
    handleFilterByException,
    checkIsAnyFieldEdited,
    handleNavigateBack,
    user,
  } = useValidationContentState();

  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<WorkflowConfigItem | null>(null);
  const [pageInputValue, setPageInputValue] = useState('1');

  // ─── Initialize: Load validation media on mount ───
  useEffect(() => {
    if (contentState.selectedDIN) {
      handleLoadValidationMedia(contentState.selectedDIN);
    } else if (businessContentDIN && businessContentDIN.din) {
      // When navigating from BusinessApps/BusinessTasks, the DIN lives in
      // the businessContent slice. Bridge it into the validationContent slice.
      if (businessContentStatus) {
        dispatch(setCurrentStatus(businessContentStatus));
      }
      const validationDIN: import('../types/ValidationContentTypes').SelectedDIN = {
        din: businessContentDIN.din,
        uin: businessContentDIN.uin,
        TransactionID: businessContentDIN.TransactionID,
        fileName: businessContentDIN.fileName,
        queue_btime: businessContentDIN.queue_btime,
        ixsd_id: businessContentDIN.ixsd_id,
        hasException: businessContentDIN.hasException,
      };
      handleLoadValidationMedia(validationDIN);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync page input with current page
  useEffect(() => {
    setPageInputValue(String(contentState.currentPageNew));
  }, [contentState.currentPageNew]);

  // ─── Toolbar Handlers ───
  const handleGoHome = useCallback(() => {
    if (checkIsAnyFieldEdited() && !contentState.saveProcessIsCompleted) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
    }
    handleNavigateBack();
  }, [checkIsAnyFieldEdited, contentState.saveProcessIsCompleted, handleNavigateBack]);

  const handleSave = useCallback(async () => {
    await handleSaveIXSD();
  }, [handleSaveIXSD]);

  const handlePageInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(pageInputValue, 10);
      if (page > 0 && page <= contentState.totalPages) {
        handleGoToPage(page);
      } else {
        alert(`There is no page numbered ${pageInputValue} in this document.`);
        setPageInputValue(String(contentState.currentPageNew));
      }
    }
  }, [pageInputValue, contentState.totalPages, contentState.currentPageNew, handleGoToPage]);

  const handleProcessDocument = useCallback((process: WorkflowConfigItem) => {
    setSelectedProcess(process);
    setShowWorkflowDialog(true);
  }, []);

  const handleWorkflowConfirm = useCallback(async (comments: string) => {
    if (!selectedProcess || !user || !contentState.selectedDIN) return;

    setShowWorkflowDialog(false);

    const routingJson = JSON.parse(selectedProcess.workflow_routing_json);
    const nextMicroConfig = routingJson[0]?.next_micro_list?.find(
      (ele: { exception_type?: string; next_micro_code: string; next_micro: string }) => ele.exception_type === contentState.selectedDIN?.exception_type
    );

    if (!nextMicroConfig) return;

    const inventoryDate = contentState.selectedDataJson?.onebaseHeader?.inventoryDate
      || contentState.selectedDataJson?.onebaseHeader?.incomingDate || '';

    const workflowParams = {
      customer_id: user.customer_id || '',
      bps_id: user.bps_id || '',
      bu_id: user.bu_id || '',
      tps_id: user.tps_id || '',
      spProcessId: contentState.selectedDataJson?.onebaseHeader?.spProcessId || '',
      corpId: contentState.selectedDataJson?.onebaseHeader?.corpId || '',
      custDin: contentState.selectedDataJson?.onebaseHeader?.custDin || '',
      declineFromWorkflow: contentState.selectedDataJson?.onebaseHeader?.declineFromWorkflow || false,
      process_month: '',
      sourceFileId: contentState.exceptionDetails?.srcfile_id || '',
      fileId: contentState.exceptionDetails?.file_id || '',
      fileName: contentState.selectedDataJson?.onebaseHeader?.fileName || '',
      fileDate: contentState.selectedDataJson?.onebaseHeader?.fileDate || '',
      filePath: contentState.selectedDataJson?.onebaseHeader?.filePath || '',
      dept_id: user.dept_id || '',
      queue_id: user.queue_id || '',
      dataJSON: contentState.selectedDataJson,
      dataExceptionJson: contentState.selectedExceptionJson,
      queue_comment: comments,
      din_status: 'new',
      dinType: 'false',
      keyByFullExtract: false,
      schemaBeanPath: 'com.onebase.baas.pojo.schema.PO.AccountsPayable',
      next_micro_process_code: nextMicroConfig.next_micro_code,
      next_micro_process_id: nextMicroConfig.next_micro,
      next_queue: routingJson[0].queue_id || '',
      next_channel: routingJson[0].channel || '',
      din: contentState.selectedDinNo,
      din_sub_index: contentState.currentDinSubIndex,
      din_version: contentState.currentVersion,
      uin: contentState.selectedUinNo,
      ixsdId: contentState.selectedDataJson?.onebaseHeader?.ixsdId || '',
      efs_uin: contentState.mediaConfig[0]?.efs_uin || '',
      tfs_uin: contentState.selectedDataJson?.onebaseHeader?.tfsUin || '',
      bpaas_connector_id: contentState.selectedDataJson?.onebaseHeader?.bpaasConnectorId || '',
      din_assignee: user.user_id || '',
      user_id: user.user_id || '',
      transactionData: contentState.mediaConfig,
      preparedMXSD: contentState.prepMxsd,
      selectedDateFormats: contentState.fieldFormatsFor999,
      serviceDashboard: contentState.serviceDashboard,
      actionByEmployee: true,
      inventoryDate,
      formMedia: contentState.selectedMediaType || 'PDF-EDI',
      userType: false,
    };

    await handleStartWorkflow(workflowParams, comments);
  }, [selectedProcess, user, contentState, handleStartWorkflow]);

  const handleWorkflowCancel = useCallback(() => {
    setShowWorkflowDialog(false);
    setSelectedProcess(null);
  }, []);

  const handleToggleExceptions = useCallback(() => {
    dispatch(setShowExceptionSidebar(!contentState.showExceptionSidebar));
    handleFilterByException();
  }, [contentState.showExceptionSidebar, dispatch, handleFilterByException]);

  // ─── Data Tab Rendering ───
  const visibleHeaders = useMemo(() => {
    return contentState.ixsdDataHeaders.filter((header: IXSDDataHeader) => header.showTabContent !== false);
  }, [contentState.ixsdDataHeaders]);

  const selectedHeader = contentState.selectedDataHeader || visibleHeaders[0] || null;

  // ─── Render Field Rows (Object View) ───
  const renderObjectFields = useCallback((header: IXSDDataHeader) => {
    const fields = header.ixsd_fields as IXSDField[][];
    // For object-style headers, ixsd_fields is treated as flat array of fields
    const flatFields = fields.flat();
    return flatFields
      .filter((field: IXSDField) => field.page === contentState.currentPageNew && field.view_status !== false)
      .map((field: IXSDField, idx: number) => (
        <div key={field.key || idx} style={styles.fieldRow}>
          <span style={styles.fieldLabel}>{field.key_alias_name || field.key}</span>
          <input
            style={{
              ...styles.fieldInput,
              border: field.input_border || '1px solid #cfd8dc',
            }}
            type="text"
            value={field.value || ''}
            readOnly={!contentState.enableEditStatus}
            title={field.exception_msg?.length > 0 ? field.exception_msg.map((m: ExceptionMessage) => m.exception_msg).join(', ') : ''}
          />
          {field.exception_msg?.length > 0 && (
            <span style={{ color: 'red', marginLeft: '4px', fontSize: '11px' }}>
              ({field.exception_msg.length})
            </span>
          )}
        </div>
      ));
  }, [contentState.currentPageNew, contentState.enableEditStatus]);

  // ─── Render Line Items (Array View) ───
  const renderArrayFields = useCallback((header: IXSDDataHeader) => {
    const rows: IXSDField[][] = header.ixsd_fields;
    const filteredRows = rows.filter((row: IXSDField[]) =>
      row.some((field: IXSDField) => field.page === contentState.currentPageNew)
    );

    if (filteredRows.length === 0) {
      return <div style={{ padding: '16px', color: '#78909c' }}>No line items for this page</div>;
    }

    // Get column headers from first row
    const headerFields: IXSDField[] = filteredRows[0] || [];

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#eceff1' }}>
              <th style={{ padding: '6px 8px', borderBottom: '2px solid #cfd8dc', textAlign: 'left' }}>#</th>
              {headerFields
                .filter((f: IXSDField) => f.view_status !== false)
                .map((field: IXSDField) => (
                  <th key={field.key} style={{ padding: '6px 8px', borderBottom: '2px solid #cfd8dc', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    {field.key_alias_name || field.key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row: IXSDField[], rowIdx: number) => (
              <tr
                key={rowIdx}
                style={{ cursor: 'pointer', backgroundColor: rowIdx % 2 === 0 ? '#fff' : '#fafafa' }}
                onClick={() => handleChangeLineItemView(row, rowIdx)}
              >
                <td style={{ padding: '4px 8px', borderBottom: '1px solid #f0f0f0' }}>{row[0]?.row || rowIdx + 1}</td>
                {row
                  .filter((f: IXSDField) => f.view_status !== false)
                  .map((field: IXSDField, colIdx: number) => (
                    <td
                      key={`${rowIdx}-${colIdx}`}
                      style={{
                        padding: '4px 8px',
                        borderBottom: '1px solid #f0f0f0',
                        borderLeft: field.input_border || 'none',
                        whiteSpace: 'nowrap',
                        maxWidth: '150px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {field.value || ''}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [contentState.currentPageNew, handleChangeLineItemView]);

  return (
    <div style={styles.container}>
      {/* ─── Toolbar ─── */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <button style={styles.toolbarBtn} onClick={handleGoHome} title="Go to Inbox (Alt+H)">
            <i className="fa fa-home" /> Home
          </button>
          <span style={styles.dinInfo}>
            DIN: {contentState.selectedDinNo} | UIN: {contentState.selectedUinNo}
            {contentState.selectedMediaSource && ` | ${contentState.selectedMediaSource}`}
          </span>
        </div>

        <div style={styles.toolbarRight}>
          {/* Page Navigation */}
          <div style={styles.pageNav}>
            <button
              style={contentState.currentPageNew > 1 ? styles.toolbarBtn : styles.toolbarBtnDisabled}
              onClick={() => handleChangePageNumber('up')}
              disabled={contentState.currentPageNew <= 1}
            >
              <i className="fa fa-chevron-up" />
            </button>
            <input
              style={styles.pageInput}
              value={pageInputValue}
              onChange={(e) => setPageInputValue(e.target.value)}
              onKeyDown={handlePageInputKeyDown}
            />
            <span>/ {contentState.totalPages}</span>
            <button
              style={contentState.currentPageNew < contentState.totalPages ? styles.toolbarBtn : styles.toolbarBtnDisabled}
              onClick={() => handleChangePageNumber('down')}
              disabled={contentState.currentPageNew >= contentState.totalPages}
            >
              <i className="fa fa-chevron-down" />
            </button>
          </div>

          {/* Save Button */}
          <button
            style={contentState.enableEditStatus ? styles.toolbarBtnActive : styles.toolbarBtn}
            onClick={handleSave}
            disabled={contentState.isSaving}
          >
            <i className="fa fa-save" /> {contentState.isSaving ? 'Saving...' : 'Save'}
          </button>

          {/* Filter Exceptions */}
          <button
            style={contentState.hasExceptions ? styles.toolbarBtnActive : styles.toolbarBtn}
            onClick={handleToggleExceptions}
          >
            <i className="fa fa-filter" /> Exceptions
          </button>

          {/* Workflow Actions */}
          <div style={styles.workflowActions}>
            {contentState.workflowConfig.map((action: WorkflowConfigItem, idx: number) => (
              <button
                key={idx}
                style={action.isEnabled ? styles.toolbarBtn : styles.toolbarBtnDisabled}
                onClick={() => action.isEnabled && handleProcessDocument(action)}
                disabled={!action.isEnabled || contentState.isWorkflowProcessing}
                title={action.tooltip || action.process_desc}
              >
                {action.process_name || action.process_desc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Main Split Panel ─── */}
      <div style={styles.splitPanel}>
        {/* Left Panel: PDF Viewer */}
        <div style={styles.leftPanel}>
          {contentState.isLoading && (
            <div style={styles.loadingOverlay}>
              <span>Loading document...</span>
            </div>
          )}
          {contentState.workflowActionStarted && (
            <div style={styles.loadingOverlay}>
              <span>Processing...</span>
            </div>
          )}
          {contentState.selectedMedia && (
            <img
              id="stencilingImage"
              src={contentState.selectedMedia}
              alt="Document"
              style={styles.pdfImage}
            />
          )}
          {!contentState.selectedMedia && !contentState.isLoading && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#78909c' }}>
              No document loaded
            </div>
          )}

          {/* Media source selector (if multiple media) */}
          {contentState.mediaConfig.length > 1 && (
            <div style={{ padding: '8px', borderTop: '1px solid #cfd8dc', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {contentState.mediaConfig.map((media: MediaConfig, idx: number) => (
                <button
                  key={idx}
                  style={idx === contentState.currentMediaIndex ? styles.toolbarBtnActive : styles.toolbarBtn}
                  onClick={() => handleChangeSelectedMedia(idx)}
                >
                  {media.extracted_file_name || `Media ${idx + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Data Tabs & Fields */}
        <div style={styles.rightPanel}>
          {/* Tab Headers */}
          {visibleHeaders.length > 0 && (
            <div style={styles.tabContainer}>
              {visibleHeaders.map((header: IXSDDataHeader, idx: number) => (
                <div
                  key={header.label + idx}
                  style={selectedHeader?.label === header.label ? styles.tabActive : styles.tab}
                  onClick={() => handleSetDataHeader(header, idx)}
                >
                  {header.header_name}
                  {header.exception_status && (
                    <span
                      style={{
                        ...styles.tabException,
                        backgroundColor: header.exceptionColor || 'red',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Field Content */}
          {selectedHeader && (
            <div style={{ padding: '8px 0' }}>
              {selectedHeader.view_style === 'object'
                ? renderObjectFields(selectedHeader)
                : renderArrayFields(selectedHeader)
              }
            </div>
          )}

          {/* Single Line Item Detail View */}
          {contentState.singleLineItemView && contentState.selectedLineItemObj && (
            <div style={{ padding: '12px', borderTop: '2px solid #26a69a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '13px' }}>
                  Line Item #{contentState.selectedLineItemIndex + 1}
                </strong>
                <button
                  style={styles.toolbarBtn}
                  onClick={() => dispatch(setSingleLineItemView(false))}
                >
                  Close Detail
                </button>
              </div>
              {(contentState.selectedLineItemObj as IXSDField[]).map((field: IXSDField, idx: number) => (
                <div key={field.key || idx} style={styles.fieldRow}>
                  <span style={styles.fieldLabel}>{field.key_alias_name || field.key}</span>
                  <input
                    style={{
                      ...styles.fieldInput,
                      border: field.input_border || '1px solid #cfd8dc',
                    }}
                    type="text"
                    value={field.value || ''}
                    readOnly={!contentState.enableEditStatus}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {visibleHeaders.length === 0 && !contentState.isLoading && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#78909c' }}>
              No data headers available
            </div>
          )}
        </div>
      </div>

      {/* ─── Exception Sidebar ─── */}
      {contentState.showExceptionSidebar && contentState.filteredException.length > 0 && (
        <WorkflowValidationInbox
          exceptions={contentState.filteredException}
          onClose={() => dispatch(setShowExceptionSidebar(false))}
        />
      )}

      {/* ─── Workflow Dialog ─── */}
      {showWorkflowDialog && selectedProcess && (
        <ValidationWorkflowDialog
          selectedDinNo={contentState.selectedDinNo}
          processLabel={selectedProcess.process_desc}
          currentStatus={contentState.currentStatus}
          onConfirm={handleWorkflowConfirm}
          onCancel={handleWorkflowCancel}
        />
      )}

      {/* ─── Error Bar ─── */}
      {contentState.error && (
        <div style={styles.errorBar}>
          <i className="fa fa-exclamation-circle" /> {contentState.error}
        </div>
      )}
    </div>
  );
};

export default ValidationContentView;
