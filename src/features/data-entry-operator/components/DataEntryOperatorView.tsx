/**
 * Data Entry Operator View (Main Page)
 * Split layout: PDF viewer (left) + Page order/classification panel (right)
 * Toolbar: Media info, Page navigation, Workflow actions, Download
 * Origin: DataEntryOperatorController.js + associated HTML templates
 */
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useDataEntryOperatorState } from '../hooks/useDataEntryOperatorState';
import {
  selectDataEntryOperator,
  setShowPageList,
  setShowActionDialog,
} from '../store/dataEntryOperatorSlice';
import { WorkflowActionDialog } from './WorkflowActionDialog';
import type { WorkflowActionConfig, WorkflowRoutingJson } from '../types/DataEntryOperatorTypes';

export const DataEntryOperatorView: React.FC = () => {
  const dispatch = useAppDispatch();
  const deState = useAppSelector(selectDataEntryOperator);
  const {
    handleLoadExceptionMedia,
    handleChangeMediaPage,
    handleRotatePDFPage,
    handleDropSelectedPage,
    handleRemovePageFromSelection,
    handleSelectPageToDrag,
    handleDeselectPage,
    handleApplySorting,
    handleChangePageStatus,
    isCurrentPageSelected,
    handleStartSplitting,
    handleRemoveInvoice,
    handleClearAllInvoices,
    handleOpenInvoice,
    handleProcessDocument,
    handleContinueProcess,
    handleDeclineAllPages,
    handleDownloadStream,
    handleGoToInbox,
  } = useDataEntryOperatorState();

  const [pageInput, setPageInput] = useState('1');
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);

  // ─── Initialize: Load media on mount ───
  useEffect(() => {
    if (deState.selectedException && !deState.isLoading && !deState.pdfStream) {
      handleLoadExceptionMedia(deState.selectedException);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync page input with state
  useEffect(() => {
    setPageInput(String(deState.currentPage));
  }, [deState.currentPage]);

  // ─── Page Navigation ───
  const handlePrevPage = useCallback(() => {
    if (deState.currentPage > 1) {
      handleChangeMediaPage(deState.currentPage - 1);
    }
  }, [deState.currentPage, handleChangeMediaPage]);

  const handleNextPage = useCallback(() => {
    if (deState.currentPage < deState.totalPages) {
      handleChangeMediaPage(deState.currentPage + 1);
    }
  }, [deState.currentPage, deState.totalPages, handleChangeMediaPage]);

  const handlePageInputSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newPage = parseInt(pageInput, 10);
      if (newPage >= 1 && newPage <= deState.totalPages) {
        handleChangeMediaPage(newPage);
      } else {
        setPageInput(String(deState.currentPage));
      }
    }
  }, [pageInput, deState.totalPages, deState.currentPage, handleChangeMediaPage]);

  // ─── Filter action buttons based on exception type ───
  const visibleActions = useMemo(() => {
    if (!deState.selectedException) return [];
    return deState.workflowActionConfigData.filter((action) => {
      try {
        const routingJson: WorkflowRoutingJson[] = JSON.parse(action.workflow_routing_json);
        if (routingJson[0].enablesAlways) return true;
        return routingJson[0].next_micro_list.some(
          (ele) => ele.exception_type === deState.selectedException!.exception_type
        );
      } catch {
        return false;
      }
    });
  }, [deState.workflowActionConfigData, deState.selectedException]);

  // ─── Page Drag/Drop Sorting ───
  const handleDragStart = useCallback((index: number) => {
    setDragFromIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((toIndex: number) => {
    if (dragFromIndex !== null && dragFromIndex !== toIndex) {
      handleApplySorting(dragFromIndex, toIndex);
    }
    setDragFromIndex(null);
  }, [dragFromIndex, handleApplySorting]);

  // ─── Active document tab ───
  const activeDoc = useMemo(() => {
    return deState.pageOrderList.find((doc) => doc.isOpened);
  }, [deState.pageOrderList]);

  // ─── Loading overlay ───
  if (deState.isLoading && !deState.pdfStream) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <span style={{ color: '#fff', marginTop: 12 }}>Loading document...</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ═══ TOOLBAR ═══ */}
      <div style={styles.toolbar}>
        {/* Go Back */}
        <button onClick={handleGoToInbox} style={styles.toolbarButton} title="Go to Inbox">
          <i className="fa fa-arrow-left" />
        </button>

        {/* Media Info */}
        <div style={styles.toolbarSection}>
          <span style={styles.toolbarLabel}>
            <i className="fa fa-file-pdf-o" style={{ marginRight: 4 }} />
            {deState.selectedException?.filename || 'Document'}
          </span>
        </div>

        {/* Separator */}
        <div style={styles.separator} />

        {/* Page Navigation */}
        <div style={styles.toolbarSection}>
          <button
            onClick={handlePrevPage}
            disabled={deState.currentPage <= 1 || deState.workflowActionStarted}
            style={styles.toolbarButton}
            title="Previous Page"
          >
            <i className="fa fa-chevron-left" />
          </button>

          <input
            type="text"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={handlePageInputSubmit}
            onFocus={() => dispatch(setShowPageList(false))}
            style={styles.pageInput}
            title="Page number"
          />
          <span style={styles.pageTotal}>/ {deState.totalPages}</span>

          <button
            onClick={handleNextPage}
            disabled={deState.currentPage >= deState.totalPages || deState.workflowActionStarted}
            style={styles.toolbarButton}
            title="Next Page"
          >
            <i className="fa fa-chevron-right" />
          </button>

          {/* Classification status indicator */}
          <span style={{
            marginLeft: 8,
            fontSize: 11,
            color: deState.currentPageStatus === 'classified' ? '#4caf50' : '#f44336',
          }}>
            <i className={deState.currentPageStatus === 'classified' ? 'fa fa-check' : 'fa fa-close'} />
            {' '}{deState.currentPageStatusMsg}
          </span>
        </div>

        {/* Separator */}
        <div style={styles.separator} />

        {/* Rotate Buttons */}
        <div style={styles.toolbarSection}>
          <button
            onClick={() => handleRotatePDFPage(-90)}
            disabled={deState.workflowActionStarted}
            style={styles.toolbarButton}
            title="Rotate Left"
          >
            <i className="fa fa-rotate-left" />
          </button>
          <button
            onClick={() => handleRotatePDFPage(90)}
            disabled={deState.workflowActionStarted}
            style={styles.toolbarButton}
            title="Rotate Right"
          >
            <i className="fa fa-rotate-right" />
          </button>
        </div>

        {/* Separator */}
        <div style={styles.separator} />

        {/* Workflow Action Buttons */}
        <div style={styles.toolbarSection}>
          {visibleActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleProcessDocument(action)}
              disabled={!action.isEnabled || deState.workflowActionStarted}
              style={{
                ...styles.actionButton,
                opacity: action.isEnabled && !deState.workflowActionStarted ? 1 : 0.5,
              }}
              title={action.process_name}
            >
              {action.process_name}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div style={styles.separator} />

        {/* Download Button */}
        <button
          onClick={handleDownloadStream}
          disabled={deState.isDownloading}
          style={styles.toolbarButton}
          title="Download Source File"
        >
          <i className="fa fa-download" />
        </button>
      </div>

      {/* ═══ MAIN CONTENT (Split Layout) ═══ */}
      <div style={styles.mainContent}>
        {/* ─── LEFT PANEL: PDF Viewer ─── */}
        <div style={styles.leftPanel}>
          {deState.workflowActionStarted && (
            <div style={styles.overlaySpinner}>
              <div style={styles.spinner} />
            </div>
          )}

          {/* PDF Image */}
          {deState.pdfStream ? (
            <div style={styles.pdfContainer}>
              <img
                src={deState.pdfStream}
                alt={`Page ${deState.currentPage}`}
                style={styles.pdfImage}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectPageToDrag();
                }}
              />
            </div>
          ) : (
            <div style={styles.noPdfMessage}>
              <i className="fa fa-file-pdf-o" style={{ fontSize: 48, color: '#757575', marginBottom: 12 }} />
              <span>No document loaded</span>
            </div>
          )}

          {/* Page selection indicator */}
          {deState.selectedPageStream && (
            <div style={styles.pageSelectedBanner}>
              <span>Page {deState.currentPage} selected for assignment</span>
              <button onClick={handleDeselectPage} style={styles.deselectButton}>
                <i className="fa fa-times" /> Deselect
              </button>
            </div>
          )}

          {/* Assign page button */}
          {deState.selectedPageStream && deState.pageOrderList.length > 0 && (
            <div style={styles.assignBar}>
              <button
                onClick={handleDropSelectedPage}
                style={styles.assignButton}
                disabled={isCurrentPageSelected()}
              >
                <i className="fa fa-arrow-right" style={{ marginRight: 6 }} />
                Assign Page {deState.currentPage} to {activeDoc?.inv_number_desc || 'Document'}
              </button>
            </div>
          )}
        </div>

        {/* ─── RIGHT PANEL: Page Order & Classification ─── */}
        <div style={styles.rightPanel}>
          {/* Panel Header / Controls */}
          <div style={styles.rightPanelHeader}>
            <span style={styles.rightPanelTitle}>Documents & Page Order</span>
            <div style={styles.rightPanelControls}>
              <button onClick={handleStartSplitting} style={styles.smallButton} title="Add New Document">
                <i className="fa fa-plus" /> Split
              </button>
              <button onClick={handleClearAllInvoices} style={styles.smallButton} title="Clear All">
                <i className="fa fa-trash" /> Clear
              </button>
            </div>
          </div>

          {/* Document Tabs */}
          <div style={styles.documentTabs}>
            {deState.pageOrderList.map((doc, docIndex) => (
              <div
                key={docIndex}
                style={{
                  ...styles.documentTab,
                  borderColor: doc.isOpened ? '#1976d2' : '#e0e0e0',
                  backgroundColor: doc.isOpened ? '#e3f2fd' : '#fafafa',
                }}
              >
                {/* Tab Header */}
                <div
                  style={styles.tabHeader}
                  onClick={() => handleOpenInvoice(docIndex)}
                >
                  <span style={styles.tabTitle}>
                    <i className={`fa ${doc.isOpened ? 'fa-folder-open' : 'fa-folder'}`}
                      style={{ marginRight: 6, color: doc.isOpened ? '#1976d2' : '#757575' }} />
                    {doc.inv_number_desc}
                  </span>
                  <span style={styles.pageCount}>{doc.selectedPages.length} page(s)</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveInvoice(docIndex); }}
                    style={styles.removeTabButton}
                    title="Remove document"
                  >
                    <i className="fa fa-times" />
                  </button>
                </div>

                {/* Tab Content (expanded when opened) */}
                {doc.isOpened && (
                  <div style={styles.tabContent}>
                    {/* Thumbnail */}
                    {doc.droppedPageStream && (
                      <div style={styles.thumbnailContainer}>
                        <img
                          src={doc.droppedPageStream}
                          alt="Last assigned page"
                          style={styles.thumbnail}
                        />
                      </div>
                    )}

                    {/* Page list */}
                    <div style={styles.pageListContainer}>
                      {doc.selectedPages.map((pg, pgIndex) => (
                        <div
                          key={pgIndex}
                          draggable
                          onDragStart={() => handleDragStart(pgIndex)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(pgIndex)}
                          style={{
                            ...styles.pageItem,
                            backgroundColor: dragFromIndex === pgIndex ? '#e3f2fd' : '#fff',
                          }}
                        >
                          <span style={styles.pageNumber}>
                            <i className="fa fa-file-o" style={{ marginRight: 4 }} />
                            Page {pg.page}
                          </span>
                          <div style={styles.pageItemActions}>
                            <button
                              onClick={() => handleChangePageStatus(docIndex, pgIndex)}
                              style={{
                                ...styles.formToggle,
                                color: pg.isForm ? '#4caf50' : '#ff9800',
                              }}
                              title={pg.isForm ? 'Form (click to mark as Attachment)' : 'Attachment (click to mark as Form)'}
                            >
                              {pg.isForm ? 'Form' : 'Att'}
                            </button>
                            <button
                              onClick={() => handleRemovePageFromSelection(pg.page)}
                              style={styles.removePageButton}
                              title="Remove page"
                            >
                              <i className="fa fa-times" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {doc.selectedPages.length === 0 && (
                        <div style={styles.emptyPageList}>
                          <i className="fa fa-info-circle" style={{ marginRight: 6 }} />
                          No pages assigned. Select a page from the PDF and assign it.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {deState.pageOrderList.length === 0 && (
              <div style={styles.noDocuments}>
                <i className="fa fa-inbox" style={{ fontSize: 32, color: '#bdbdbd', marginBottom: 8 }} />
                <p style={{ margin: 0, color: '#757575', fontSize: 13 }}>
                  No document tabs created yet.
                </p>
                <p style={{ margin: '4px 0 0', color: '#9e9e9e', fontSize: 12 }}>
                  Click "Split" to create a new document, then assign pages from the PDF.
                </p>
              </div>
            )}
          </div>

          {/* Classification Info (bottom section) */}
          {deState.classificationInfo.length > 0 && (
            <div style={styles.classificationSection}>
              <div style={styles.classificationHeader}>
                <i className="fa fa-tags" style={{ marginRight: 6 }} />
                Classification Status
              </div>
              <div style={styles.classificationGrid}>
                {deState.classificationInfo.map((info, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.classificationItem,
                      borderLeftColor: info.classification_status === 1 ? '#4caf50' : '#f44336',
                    }}
                    onClick={() => handleChangeMediaPage(info.extracted_file_id)}
                    title={`Page ${info.extracted_file_id} - Click to view`}
                  >
                    <span style={styles.classPageNum}>P{info.extracted_file_id}</span>
                    <i
                      className={info.classification_status === 1 ? 'fa fa-check' : 'fa fa-close'}
                      style={{ color: info.classification_status === 1 ? '#4caf50' : '#f44336', fontSize: 11 }}
                    />
                    {info.efslobowner_name && (
                      <span style={styles.classLabel}>{info.efslobowner_name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ WORKFLOW ACTION DIALOG ═══ */}
      <WorkflowActionDialog
        isOpen={deState.showActionDialog}
        actionName={deState.selectedAction?.process_name || ''}
        uin={deState.selectedException?.uin || ''}
        onContinue={handleContinueProcess}
        onCancel={() => dispatch(setShowActionDialog(false))}
      />

      {/* ═══ VALIDATION RESULT DIALOG ═══ */}
      {deState.showValidationResultDialog && (
        <div style={styles.overlay}>
          <div style={{ ...styles.validationDialog }}>
            <div style={styles.validationHeader}>
              <span>Validation Result</span>
              <button
                onClick={() => dispatch({ type: 'dataEntryOperator/setShowValidationResultDialog', payload: false })}
                style={styles.closeButton}
              >
                <i className="fa fa-times" />
              </button>
            </div>
            <div style={styles.validationContent}>
              {deState.docValidationResult ? (
                <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', margin: 0 }}>
                  {typeof deState.docValidationResult === 'string'
                    ? deState.docValidationResult
                    : JSON.stringify(deState.docValidationResult, null, 2)}
                </pre>
              ) : (
                <span>No validation result available.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ ERROR DISPLAY ═══ */}
      {deState.error && (
        <div style={styles.errorBar}>
          <i className="fa fa-exclamation-circle" style={{ marginRight: 6 }} />
          {deState.error}
        </div>
      )}
    </div>
  );
};

// ─── Inline Styles (dark toolbar theme matching existing codebase) ───
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },

  // Toolbar
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    backgroundColor: 'rgb(74, 74, 74)',
    borderBottom: '1px solid #333',
    gap: 8,
    flexShrink: 0,
    minHeight: 42,
  },
  toolbarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  toolbarButton: {
    border: 'none',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: 3,
    fontSize: 14,
  },
  toolbarLabel: {
    color: '#e0e0e0',
    fontSize: 12,
    maxWidth: 180,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#666',
    margin: '0 4px',
  },
  pageInput: {
    width: 40,
    padding: '3px 6px',
    fontSize: 12,
    textAlign: 'center',
    border: '1px solid #666',
    borderRadius: 3,
    backgroundColor: '#555',
    color: '#fff',
  },
  pageTotal: {
    color: '#bdbdbd',
    fontSize: 12,
    marginLeft: 4,
  },
  actionButton: {
    border: '1px solid #1976d2',
    background: '#1976d2',
    color: '#fff',
    cursor: 'pointer',
    padding: '4px 12px',
    borderRadius: 3,
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
  },

  // Main content
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },

  // Left panel (PDF)
  leftPanel: {
    flex: '0 0 55%',
    position: 'relative',
    overflow: 'auto',
    backgroundColor: '#424242',
    display: 'flex',
    flexDirection: 'column',
  },
  pdfContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 16,
    overflow: 'auto',
  },
  pdfImage: {
    maxWidth: '100%',
    maxHeight: 'calc(100vh - 120px)',
    objectFit: 'contain',
    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
    cursor: 'grab',
  },
  noPdfMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: '#9e9e9e',
    fontSize: 14,
  },
  pageSelectedBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: '#1b5e20',
    color: '#fff',
    fontSize: 12,
  },
  deselectButton: {
    border: 'none',
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 3,
    fontSize: 11,
  },
  assignBar: {
    padding: '8px 16px',
    backgroundColor: '#263238',
    display: 'flex',
    justifyContent: 'center',
  },
  assignButton: {
    border: '1px solid #4caf50',
    background: '#4caf50',
    color: '#fff',
    cursor: 'pointer',
    padding: '6px 16px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
  },
  overlaySpinner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Right panel
  rightPanel: {
    flex: '0 0 45%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fafafa',
    borderLeft: '1px solid #e0e0e0',
    overflow: 'hidden',
  },
  rightPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
  },
  rightPanelTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'rgb(74, 74, 74)',
  },
  rightPanelControls: {
    display: 'flex',
    gap: 8,
  },
  smallButton: {
    border: '1px solid #bdbdbd',
    background: '#fff',
    color: 'rgb(74, 74, 74)',
    cursor: 'pointer',
    padding: '4px 10px',
    borderRadius: 3,
    fontSize: 11,
  },

  // Document tabs
  documentTabs: {
    flex: 1,
    overflow: 'auto',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  documentTab: {
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    borderLeftWidth: 3,
  },
  tabHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    cursor: 'pointer',
    gap: 8,
  },
  tabTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: 500,
    color: 'rgb(74, 74, 74)',
  },
  pageCount: {
    fontSize: 11,
    color: '#757575',
    backgroundColor: '#e0e0e0',
    padding: '2px 6px',
    borderRadius: 10,
  },
  removeTabButton: {
    border: 'none',
    background: 'transparent',
    color: '#c62828',
    cursor: 'pointer',
    padding: '4px 6px',
    fontSize: 12,
  },
  tabContent: {
    padding: '8px 12px',
    borderTop: '1px solid #e0e0e0',
  },
  thumbnailContainer: {
    textAlign: 'center',
    marginBottom: 8,
  },
  thumbnail: {
    maxWidth: 120,
    maxHeight: 160,
    border: '1px solid #e0e0e0',
    borderRadius: 2,
  },
  pageListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  pageItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px',
    border: '1px solid #e0e0e0',
    borderRadius: 3,
    cursor: 'grab',
    fontSize: 12,
  },
  pageNumber: {
    color: 'rgb(74, 74, 74)',
    fontWeight: 500,
  },
  pageItemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  formToggle: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 6px',
  },
  removePageButton: {
    border: 'none',
    background: 'transparent',
    color: '#c62828',
    cursor: 'pointer',
    padding: '2px 4px',
    fontSize: 11,
  },
  emptyPageList: {
    padding: '12px 8px',
    color: '#9e9e9e',
    fontSize: 12,
    textAlign: 'center',
  },
  noDocuments: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    textAlign: 'center',
  },

  // Classification section
  classificationSection: {
    borderTop: '1px solid #e0e0e0',
    padding: 12,
    backgroundColor: '#fff',
    maxHeight: 200,
    overflow: 'auto',
  },
  classificationHeader: {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgb(74, 74, 74)',
    marginBottom: 8,
  },
  classificationGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  classificationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    borderLeft: '3px solid',
    backgroundColor: '#f5f5f5',
    borderRadius: 2,
    cursor: 'pointer',
    fontSize: 11,
  },
  classPageNum: {
    fontWeight: 600,
    color: 'rgb(74, 74, 74)',
  },
  classLabel: {
    color: '#757575',
    maxWidth: 80,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // Dialogs
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  validationDialog: {
    backgroundColor: '#fff',
    borderRadius: 4,
    boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
    width: 500,
    maxWidth: '90vw',
    maxHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
  },
  validationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e0e0e0',
    fontWeight: 600,
    fontSize: 14,
  },
  validationContent: {
    padding: 16,
    overflow: 'auto',
    flex: 1,
  },
  closeButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: '#c62828',
    fontSize: 16,
    padding: '4px 8px',
  },

  // Error bar
  errorBar: {
    padding: '8px 16px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    fontSize: 12,
    borderTop: '1px solid #ef9a9a',
  },

  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: 'rgb(74, 74, 74)',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid rgba(255,255,255,0.2)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

export default DataEntryOperatorView;
