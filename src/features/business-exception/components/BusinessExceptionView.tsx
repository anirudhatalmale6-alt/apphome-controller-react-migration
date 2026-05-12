/**
 * Business Exception View (Main Data Entry Exception Page)
 * Integrates: PDF viewer with canvas-based JCrop overlay + data entry panel + table extraction
 * Origin: DataEntryException.html + BusinessExceptionController.js
 *
 * Canvas-based coordinate selection replaces jQuery JCrop plugin.
 * The user draws a rectangle on the PDF image to crop/extract text via OCR.
 */
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useBusinessExceptionState } from '../hooks/useBusinessExceptionState';
import {
  selectBusinessException,
  setJCropToolIsActive,
  setCurrentPageNew,
  setSelectedIndex,
  setSelectedField,
  setShowDataEntryForm,
  setImgDimensions,
} from '../store/businessExceptionSlice';
import { TableExtractionPanel } from './TableExtractionPanel';
import { BusinessFieldSelectionDialog } from './BusinessFieldSelectionDialog';
import type { CropCoordinates, IXSDField, IXSDDataHeader, WorkflowActionConfig } from '../types/BusinessExceptionTypes';

// ─── Styles ───
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
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'rgb(74, 74, 74)',
    color: 'white',
    fontSize: '12px',
    minHeight: '48px',
    flexWrap: 'wrap' as const,
  },
  toolbarBtn: {
    padding: '4px 10px',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '3px',
    backgroundColor: 'transparent',
    color: 'white',
    cursor: 'pointer',
    fontSize: '11px',
  },
  toolbarBtnDisabled: {
    padding: '4px 10px',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '3px',
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'not-allowed',
    fontSize: '11px',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  leftPanel: {
    flex: '0 0 55%',
    position: 'relative' as const,
    overflow: 'auto',
    borderRight: '1px solid #ddd',
    backgroundColor: '#e0e0e0',
  },
  rightPanel: {
    flex: '0 0 45%',
    overflow: 'auto',
    backgroundColor: 'white',
  },
  imageContainer: {
    position: 'relative' as const,
    display: 'inline-block',
  },
  canvas: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    cursor: 'crosshair',
  },
  tabBar: {
    display: 'flex',
    gap: '2px',
    padding: '4px 8px',
    backgroundColor: 'rgb(74, 74, 74)',
    borderBottom: '1px solid #444',
    flexWrap: 'wrap' as const,
  },
  tabActive: {
    padding: '6px 12px',
    backgroundColor: 'white',
    color: 'rgb(74, 74, 74)',
    border: 'none',
    borderRadius: '3px 3px 0 0',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  },
  tabInactive: {
    padding: '6px 12px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: 'none',
    borderRadius: '3px 3px 0 0',
    fontSize: '11px',
    cursor: 'pointer',
  },
  tabException: {
    border: '1px solid red',
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 8px',
    borderBottom: '1px solid #eee',
    fontSize: '12px',
  },
  fieldLabel: {
    flex: '0 0 140px',
    fontWeight: 500,
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  fieldInput: {
    flex: 1,
    padding: '4px 8px',
    border: '1px solid #ccc',
    borderRadius: '3px',
    fontSize: '12px',
  },
  fieldInputFocused: {
    border: '2px solid #2196F3',
  },
  fieldInputException: {
    border: '2px solid red',
  },
  lineItemRow: {
    display: 'flex',
    gap: '4px',
    padding: '2px 4px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '11px',
  },
  lineItemCell: {
    flex: 1,
    padding: '2px 4px',
    border: '1px solid #ddd',
    borderRadius: '2px',
    fontSize: '11px',
    minWidth: '60px',
  },
  pageNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: 'white',
    fontSize: '14px',
    zIndex: 100,
  },
  shortcutPanel: {
    padding: '8px 12px',
    backgroundColor: '#fff3cd',
    borderTop: '1px solid #ffc107',
    fontSize: '11px',
  },
  dataEntryForm: {
    padding: '8px',
    backgroundColor: '#f9f9f9',
    borderTop: '2px solid rgb(74, 74, 74)',
  },
};

export const BusinessExceptionView: React.FC = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectBusinessException);
  const {
    handleChangeMediaPage,
    handleExtractData,
    handleExtractTable,
    handleCoordinatesChanged,
    handleSelectIXSDHeader,
    handleNextTabSelection,
    handlePreviousTabSelection,
    handleNextFieldSelection,
    handlePreviousFieldSelection,
    handleAddLineItem,
    handleDeleteLineItem,
    handleSetColumnEditMode,
    handleRemoveTableColumn,
    handleSetConfigurationTab,
    handleClearTableExtraction,
    handleActivateSkipIndexText,
    handleNavigateBack,
  } = useBusinessExceptionState();

  // ─── Canvas Crop State ───
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<CropCoordinates | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [shortcutPanelView, setShortcutPanelView] = useState(false);

  // ─── Image Load Handler ───
  const handleImageLoad = useCallback(() => {
    if (imgRef.current && canvasRef.current) {
      canvasRef.current.width = imgRef.current.clientWidth;
      canvasRef.current.height = imgRef.current.clientHeight;
      dispatch(setImgDimensions({ width: imgRef.current.clientWidth, height: imgRef.current.clientHeight }));
    }
  }, [dispatch]);

  // ─── Canvas Mouse Events (JCrop replacement) ───
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setIsDragging(true);
    setCurrentRect(null);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cropRect: CropCoordinates = {
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      w: Math.abs(x - startPos.x),
      h: Math.abs(y - startPos.y),
    };
    setCurrentRect(cropRect);

    // Draw selection rectangle
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Clear selected area
      ctx.clearRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
      // Blue border
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
    }
  }, [isDragging, startPos]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !currentRect) {
      setIsDragging(false);
      return;
    }
    setIsDragging(false);

    if (currentRect.w > 5 && currentRect.h > 5) {
      dispatch(setJCropToolIsActive(true));
      handleCoordinatesChanged(currentRect);
    }
  }, [isDragging, currentRect, dispatch, handleCoordinatesChanged]);

  const handleDoubleClick = useCallback(() => {
    if (state.jCropToolIsActive) {
      handleExtractData();
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setCurrentRect(null);
    }
  }, [state.jCropToolIsActive, handleExtractData]);

  // ─── Page Navigation ───
  const handlePageUp = useCallback(() => {
    if (state.currentPageNew > 1) {
      const newPage = state.currentPageNew - 1;
      dispatch(setCurrentPageNew(newPage));
      handleChangeMediaPage(newPage);
    }
  }, [state.currentPageNew, dispatch, handleChangeMediaPage]);

  const handlePageDown = useCallback(() => {
    if (state.currentPageNew < state.totalPages) {
      const newPage = state.currentPageNew + 1;
      dispatch(setCurrentPageNew(newPage));
      handleChangeMediaPage(newPage);
    }
  }, [state.currentPageNew, state.totalPages, dispatch, handleChangeMediaPage]);

  // ─── Keyboard Shortcuts ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        handleNavigateBack();
      } else if (e.altKey && e.key === 'n') {
        e.preventDefault();
        handleNextTabSelection();
      } else if (e.altKey && e.key === 'p') {
        e.preventDefault();
        handlePreviousTabSelection();
      } else if (e.key === 'ArrowDown' && !state.isWorkflowActionPageOpened) {
        handleNextFieldSelection();
      } else if (e.key === 'ArrowUp' && !state.isWorkflowActionPageOpened) {
        handlePreviousFieldSelection();
      } else if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && state.jCropToolIsActive) {
        e.preventDefault();
        handleExtractData();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    state.isWorkflowActionPageOpened,
    state.jCropToolIsActive,
    handleNavigateBack,
    handleNextTabSelection,
    handlePreviousTabSelection,
    handleNextFieldSelection,
    handlePreviousFieldSelection,
    handleExtractData,
  ]);

  // ─── Open Business Field Dialog ───
  const handleOpenFieldDialog = useCallback((index: number) => {
    dispatch(setSelectedIndex(index));
    setFieldDialogOpen(true);
  }, [dispatch]);

  // ─── Render Object Fields ───
  const renderObjectFields = (header: IXSDDataHeader) => {
    const fields = header.ixsd_fields as IXSDField[];
    if (!fields) return null;

    return (
      <div style={{ padding: '4px 0' }}>
        {fields.map((field: IXSDField, idx: number) => (
          <div
            key={field.key}
            style={{
              ...styles.fieldRow,
              backgroundColor: state.focusedField === field.key ? '#e3f2fd' : 'transparent',
            }}
            onClick={() => {
              dispatch(setSelectedIndex(idx));
              dispatch(setSelectedField(field));
            }}
          >
            <div style={styles.fieldLabel} title={field.key_alias_name || field.key}>
              {field.key_alias_name || field.key}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </div>
            <input
              style={{
                ...styles.fieldInput,
                ...(field.exception_msg && field.exception_msg.length > 0 ? styles.fieldInputException : {}),
                ...(state.focusedField === field.key ? styles.fieldInputFocused : {}),
              }}
              value={field.value || ''}
              readOnly={!field.edit}
              placeholder={field.key_hint || ''}
              onChange={(_e: React.ChangeEvent<HTMLInputElement>) => {
                // Update field value in headers
                // This will be handled through dispatch
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  // ─── Render Array (Line Item) Fields ───
  const renderArrayFields = (header: IXSDDataHeader) => {
    const lineItems = header.ixsd_fields as IXSDField[][];
    if (!lineItems || lineItems.length === 0) return null;

    // Get column names from first row
    const columns = lineItems[0] || [];

    return (
      <div style={{ padding: '4px', overflow: 'auto' }}>
        {/* Header row */}
        <div style={{ ...styles.lineItemRow, backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
          <div style={{ width: '30px', textAlign: 'center' }}>#</div>
          {columns.map((col: IXSDField) => (
            <div key={col.key} style={styles.lineItemCell}>
              {col.key_alias_name || col.key}
            </div>
          ))}
          <div style={{ width: '60px' }}>Actions</div>
        </div>
        {/* Data rows */}
        {lineItems.map((row: IXSDField[], rowIdx: number) => (
          <div key={rowIdx} style={styles.lineItemRow}>
            <div style={{ width: '30px', textAlign: 'center', fontSize: '10px' }}>{rowIdx + 1}</div>
            {row.map((cell: IXSDField) => (
              <div key={cell.key} style={styles.lineItemCell}>
                {cell.value || ''}
              </div>
            ))}
            <div style={{ width: '60px' }}>
              <button
                style={{ ...styles.toolbarBtn, color: 'red', border: '1px solid red', fontSize: '10px', padding: '2px 4px' }}
                onClick={() => handleDeleteLineItem(rowIdx)}
                title="Delete row"
              >
                <i className="fa fa-trash" />
              </button>
            </div>
          </div>
        ))}
        {/* Add line item button */}
        <div style={{ padding: '4px' }}>
          <button
            style={{ ...styles.toolbarBtn, color: '#333', border: '1px solid #333', fontSize: '10px' }}
            onClick={handleAddLineItem}
          >
            + Add Line Item
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* ─── Toolbar ─── */}
      <div style={styles.toolbar}>
        <button style={styles.toolbarBtn} onClick={handleNavigateBack} title="Alt+H: Home">
          <i className="fa fa-home" /> Home
        </button>
        <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', height: '24px' }} />

        {/* Page Navigation */}
        <div style={styles.pageNav}>
          <button
            style={state.currentPageNew <= 1 ? styles.toolbarBtnDisabled : styles.toolbarBtn}
            onClick={handlePageUp}
            disabled={state.currentPageNew <= 1}
          >
            <i className="fa fa-chevron-up" />
          </button>
          <span style={{ minWidth: '60px', textAlign: 'center' }}>
            Page {state.currentPageNew} / {state.totalPages}
          </span>
          <button
            style={state.currentPageNew >= state.totalPages ? styles.toolbarBtnDisabled : styles.toolbarBtn}
            onClick={handlePageDown}
            disabled={state.currentPageNew >= state.totalPages}
          >
            <i className="fa fa-chevron-down" />
          </button>
        </div>

        <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', height: '24px' }} />

        {/* Exception Info */}
        {state.selectException && (
          <span style={{ fontSize: '11px', opacity: 0.8 }}>
            DIN: {state.selectException.din} | File: {state.selectException.filename || state.selectException.fileName}
          </span>
        )}

        <span style={{ flex: 1 }} />

        {/* Workflow Actions */}
        {state.workflowActionConfigData.map((action: WorkflowActionConfig, idx: number) => (
          <button
            key={idx}
            style={action.isEnabled ? styles.toolbarBtn : styles.toolbarBtnDisabled}
            disabled={!action.isEnabled}
            title={action.tooltips?.disabled_message || action.process_name}
          >
            {action.process_name}
          </button>
        ))}

        <button
          style={styles.toolbarBtn}
          onClick={() => setShortcutPanelView(!shortcutPanelView)}
          title="Keyboard shortcuts"
        >
          <i className="fa fa-keyboard-o" />
        </button>
      </div>

      {/* ─── Shortcut Panel ─── */}
      {shortcutPanelView && (
        <div style={styles.shortcutPanel}>
          <strong>Shortcuts:</strong> Alt+H: Home | Alt+N: Next Tab | Alt+P: Prev Tab |
          Down/Up: Next/Prev Field | Enter: Extract | Alt+O: List View | Alt+X: Normal View |
          Alt+Arrow: Navigate Line Items
          <button
            style={{ marginLeft: '8px', fontSize: '10px', cursor: 'pointer', border: 'none', background: 'none' }}
            onClick={() => setShortcutPanelView(false)}
          >
            [close]
          </button>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div style={styles.mainContent}>
        {/* Left Panel: PDF Image + Canvas Overlay */}
        <div style={styles.leftPanel}>
          {(state.isLoading || state.workflowActionStarted) && (
            <div style={styles.loadingOverlay}>
              <span>{state.isLoading ? 'Loading document...' : 'Processing...'}</span>
            </div>
          )}

          <div style={styles.imageContainer}>
            {state.downloadStream && (
              <>
                <img
                  ref={imgRef}
                  src={state.downloadStream}
                  alt="Document page"
                  onLoad={handleImageLoad}
                  style={{ display: 'block', maxWidth: '100%' }}
                  draggable={false}
                />
                <canvas
                  ref={canvasRef}
                  style={styles.canvas}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onDoubleClick={handleDoubleClick}
                />
              </>
            )}
          </div>
        </div>

        {/* Right Panel: Data Entry */}
        <div style={styles.rightPanel}>
          {/* Tab bar for iXSD headers */}
          {state.ixsdDataHeaders.length > 0 && (
            <div style={styles.tabBar}>
              {state.ixsdDataHeaders.map((header: IXSDDataHeader, idx: number) => (
                <button
                  key={header.label}
                  style={{
                    ...(state.currentHeaderIndex === idx ? styles.tabActive : styles.tabInactive),
                    ...(header.exception_status ? styles.tabException : {}),
                  }}
                  onClick={() => handleSelectIXSDHeader(header, idx)}
                >
                  {header.header_name || header.label}
                </button>
              ))}
            </div>
          )}

          {/* Fields Panel */}
          {state.selectedIXSDDataObject && (
            <div style={{ flex: 1, overflow: 'auto' }}>
              {state.selectedIXSDDataObject.view_style === 'object'
                ? renderObjectFields(state.selectedIXSDDataObject)
                : renderArrayFields(state.selectedIXSDDataObject)
              }
            </div>
          )}

          {/* Table Extraction Panel (shown when JCrop line item is active) */}
          {state.jCropLineItemIsActive && (
            <TableExtractionPanel
              currentPage={state.currentPage}
              pageWiseExtraction={state.pageWiseExtraction}
              configProcessStep={state.configProcessStep}
              onSetConfigTab={handleSetConfigurationTab}
              onSetColumnEditMode={handleSetColumnEditMode}
              onRemoveColumn={handleRemoveTableColumn}
              onClearExtraction={handleClearTableExtraction}
              onExtractTable={handleExtractTable}
              onActivateSkipIndex={handleActivateSkipIndexText}
              onOpenFieldDialog={handleOpenFieldDialog}
            />
          )}

          {/* Data Entry Form (for line items in array mode) */}
          {state.showDataEntryForm && state.lineItemForDataEntry.length > 0 && (
            <div style={styles.dataEntryForm}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '12px' }}>
                  Line Item #{state.selectedFormElementIndex} / {state.totalLineItemOfCurrentPage}
                </strong>
                <button
                  style={{ ...styles.toolbarBtn, color: '#333', border: '1px solid #333' }}
                  onClick={() => dispatch(setShowDataEntryForm(false))}
                >
                  Close
                </button>
              </div>
              {state.lineItemForDataEntry.map((field: IXSDField, idx: number) => (
                <div key={field.key} style={styles.fieldRow}>
                  <div style={styles.fieldLabel}>{field.key_alias_name || field.key}</div>
                  <input
                    style={{
                      ...styles.fieldInput,
                      ...(state.selectedIndex === idx ? styles.fieldInputFocused : {}),
                    }}
                    value={field.value || ''}
                    readOnly={!field.edit}
                    onChange={() => {}}
                    onClick={() => dispatch(setSelectedIndex(idx))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error display */}
      {state.error && (
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderTop: '1px solid #ef9a9a',
          fontSize: '12px',
        }}>
          <i className="fa fa-exclamation-circle" /> {state.error}
        </div>
      )}

      {/* Business Field Selection Dialog */}
      {fieldDialogOpen && (
        <BusinessFieldSelectionDialog
          isOpen={fieldDialogOpen}
          onClose={() => setFieldDialogOpen(false)}
          selectedComplexTypeFields={state.selectedComplexTypeFields}
          selectedTableColumn={state.selectedTableColumn}
          selectedTableField={state.selectedTableField}
          tableColumnIndex={state.tableColumnIndex}
          currentPage={state.currentPage}
        />
      )}
    </div>
  );
};

export default BusinessExceptionView;
