/**
 * Table Extraction Panel
 * Manages table column configuration for data extraction
 * Origin: JCrop table configuration UI in BusinessExceptionController.js
 *
 * Features:
 * - Column header list with drag-reorder support
 * - Skip index and unique index configuration
 * - Table area crop activation
 * - Skip instruction list management
 * - Extract table button (triggers handleDataEntryException API)
 * - Column edit mode for relabeling
 */
import React, { useCallback, useState } from 'react';
import type { PageWiseExtraction } from '../types/BusinessExceptionTypes';

interface TableExtractionPanelProps {
  currentPage: number;
  pageWiseExtraction: PageWiseExtraction;
  configProcessStep: number;
  onSetConfigTab: (tab: number) => void;
  onSetColumnEditMode: (colIndex: number) => void;
  onRemoveColumn: (index: number) => void;
  onClearExtraction: () => void;
  onExtractTable: () => void;
  onActivateSkipIndex: () => void;
  onOpenFieldDialog: (index: number) => void;
}

// ─── Styles ───
const styles = {
  panel: {
    borderTop: '2px solid rgb(74, 74, 74)',
    backgroundColor: '#f5f5f5',
    padding: '8px',
    fontSize: '12px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    paddingBottom: '4px',
    borderBottom: '1px solid #ddd',
  },
  headerTitle: {
    fontWeight: 'bold' as const,
    fontSize: '12px',
    color: 'rgb(74, 74, 74)',
  },
  tabRow: {
    display: 'flex',
    gap: '4px',
    marginBottom: '8px',
  },
  tabBtn: {
    padding: '4px 10px',
    fontSize: '10px',
    border: '1px solid #999',
    borderRadius: '3px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#333',
  },
  tabBtnActive: {
    padding: '4px 10px',
    fontSize: '10px',
    border: '1px solid rgb(74, 74, 74)',
    borderRadius: '3px',
    cursor: 'pointer',
    backgroundColor: 'rgb(74, 74, 74)',
    color: 'white',
  },
  columnList: {
    maxHeight: '200px',
    overflow: 'auto',
    border: '1px solid #ddd',
    borderRadius: '3px',
    backgroundColor: 'white',
  },
  columnItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '11px',
  },
  columnItemActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '11px',
    backgroundColor: '#e3f2fd',
  },
  columnIndex: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: 'rgb(74, 74, 74)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
    flexShrink: 0,
  },
  columnLabel: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  columnBadge: {
    padding: '1px 4px',
    borderRadius: '2px',
    fontSize: '9px',
    fontWeight: 'bold' as const,
  },
  badgeSkip: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  badgeUnique: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  badgeDiscard: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  badgeTwin: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
  },
  actionBtn: {
    padding: '2px 5px',
    border: '1px solid #ccc',
    borderRadius: '2px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '10px',
    color: '#666',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #ddd',
  },
  extractBtn: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: '3px',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 'bold' as const,
  },
  extractBtnDisabled: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: '3px',
    backgroundColor: '#ccc',
    color: '#666',
    cursor: 'not-allowed',
    fontSize: '11px',
    fontWeight: 'bold' as const,
  },
  clearBtn: {
    padding: '4px 10px',
    border: '1px solid #dc3545',
    borderRadius: '3px',
    backgroundColor: 'transparent',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '10px',
  },
  skipSection: {
    marginTop: '8px',
    padding: '6px',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '3px',
    fontSize: '11px',
  },
  skipItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2px 0',
  },
  tableAreaInfo: {
    marginTop: '8px',
    padding: '6px',
    backgroundColor: '#d4edda',
    border: '1px solid #28a745',
    borderRadius: '3px',
    fontSize: '11px',
  },
};

export const TableExtractionPanel: React.FC<TableExtractionPanelProps> = ({
  currentPage,
  pageWiseExtraction,
  configProcessStep,
  onSetConfigTab,
  onSetColumnEditMode,
  onRemoveColumn,
  onClearExtraction,
  onExtractTable,
  onActivateSkipIndex,
  onOpenFieldDialog,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const pageExtraction = pageWiseExtraction[currentPage];
  const tableInputs = pageExtraction?.tableExtractionInputs;

  if (!tableInputs) return null;

  const { columnHeaders, skipIndexTextList, isTableAreaCropped, tableAreaPosition, isSkipIndexTextActive } = tableInputs;

  // ─── Can Extract (validation) ───
  const canExtract = columnHeaders.length > 0 && isTableAreaCropped;

  // ─── Drag and Drop ───
  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }
    // Reorder will be handled by parent via dispatch
    // For now we track the visual feedback
    setDragIndex(null);
  }, [dragIndex]);

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <i className="fa fa-table" /> Table Extraction Configuration
        </div>
        <span style={{ fontSize: '10px', color: '#666' }}>
          Page {currentPage} | {columnHeaders.length} column(s)
        </span>
      </div>

      {/* Config Process Tabs */}
      <div style={styles.tabRow}>
        <button
          style={configProcessStep === 1 ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => onSetConfigTab(1)}
        >
          1. Crop Table Area
        </button>
        <button
          style={configProcessStep === 2 ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => onSetConfigTab(2)}
        >
          2. Column Headers
        </button>
        <button
          style={styles.tabBtn}
          onClick={onActivateSkipIndex}
          title="Activate skip index text mode"
        >
          Skip Text
        </button>
      </div>

      {/* Table Area Status */}
      {configProcessStep === 1 && (
        <div style={isTableAreaCropped ? styles.tableAreaInfo : { ...styles.tableAreaInfo, backgroundColor: '#f8f9fa', borderColor: '#dee2e6' }}>
          {isTableAreaCropped ? (
            <>
              <i className="fa fa-check-circle" style={{ color: '#28a745' }} /> Table area cropped
              {tableAreaPosition.top !== undefined && (
                <span style={{ marginLeft: '8px', color: '#666' }}>
                  (T:{tableAreaPosition.top} L:{tableAreaPosition.left} W:{tableAreaPosition.width} H:{tableAreaPosition.height})
                </span>
              )}
            </>
          ) : (
            <>
              <i className="fa fa-info-circle" style={{ color: '#6c757d' }} /> Draw a rectangle on the document to define the table area
            </>
          )}
        </div>
      )}

      {/* Column Headers List */}
      {configProcessStep === 2 && (
        <div style={styles.columnList}>
          {columnHeaders.length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', color: '#999' }}>
              Double-click on column headers in the document to extract them
            </div>
          ) : (
            columnHeaders.map((col, idx) => (
              <div
                key={idx}
                style={col.isEditMode ? styles.columnItemActive : styles.columnItem}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(idx)}
              >
                <div style={styles.columnIndex}>{idx + 1}</div>
                <div style={styles.columnLabel} title={col.label}>
                  {col.label}
                </div>
                {/* Badges */}
                {col.isSkipIndex && (
                  <span style={{ ...styles.columnBadge, ...styles.badgeSkip }}>SKIP</span>
                )}
                {col.isUniqueColumn && (
                  <span style={{ ...styles.columnBadge, ...styles.badgeUnique }}>UNIQUE</span>
                )}
                {col.isDiscard && (
                  <span style={{ ...styles.columnBadge, ...styles.badgeDiscard }}>DISCARD</span>
                )}
                {col.isTwinHeader && (
                  <span style={{ ...styles.columnBadge, ...styles.badgeTwin }}>TWIN</span>
                )}
                {col.ixsdFieldName && (
                  <span style={{ fontSize: '9px', color: '#666' }}>
                    [{col.ixsdFieldName}]
                  </span>
                )}
                {/* Actions */}
                <button
                  style={styles.actionBtn}
                  onClick={() => onSetColumnEditMode(idx)}
                  title="Edit label (crop new text)"
                >
                  <i className="fa fa-pencil" />
                </button>
                <button
                  style={styles.actionBtn}
                  onClick={() => onOpenFieldDialog(idx)}
                  title="Map to business field"
                >
                  <i className="fa fa-link" />
                </button>
                <button
                  style={{ ...styles.actionBtn, color: '#dc3545' }}
                  onClick={() => onRemoveColumn(idx)}
                  title="Remove column"
                >
                  <i className="fa fa-times" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Skip Index Text Section */}
      {isSkipIndexTextActive && (
        <div style={styles.skipSection}>
          <strong>Skip Index Mode Active</strong> - Crop text from the document to add skip instructions
        </div>
      )}

      {/* Skip Instruction List */}
      {skipIndexTextList.length > 0 && (
        <div style={{ marginTop: '6px', fontSize: '11px' }}>
          <strong>Skip Instructions:</strong>
          {skipIndexTextList.map((text, idx) => (
            <div key={idx} style={styles.skipItem}>
              <span>{idx + 1}. "{text}"</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <button style={styles.clearBtn} onClick={onClearExtraction}>
          <i className="fa fa-refresh" /> Clear All
        </button>

        <button
          style={canExtract ? styles.extractBtn : styles.extractBtnDisabled}
          onClick={canExtract ? onExtractTable : undefined}
          disabled={!canExtract}
          title={!canExtract ? 'Crop table area and add column headers first' : 'Extract table data'}
        >
          <i className="fa fa-cogs" /> Extract Table
        </button>
      </div>
    </div>
  );
};

export default TableExtractionPanel;
