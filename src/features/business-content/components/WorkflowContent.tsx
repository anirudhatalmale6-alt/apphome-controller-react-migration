/**
 * Workflow Content Component
 * Main toolbar wrapper for BusinessContent page
 * Origin: WorkflowContent.html
 *
 * Provides: DIN/UIN/Version info bar, media selector, page navigation,
 * workflow action buttons, auditing tools, save, download, shortcuts
 */
import React, { useState, useCallback, useEffect } from 'react';
import type { MediaConfig } from '../types/BusinessContentTypes';

interface WorkflowContentProps {
  // DIN info
  selectedDinNo: string;
  selectedUinNo: string;
  currentVersion: string;
  selectedMediaSource: string;
  queueBtime: string;
  currentStatus: string;

  // Media
  mediaConfig: MediaConfig[];
  currentPage: number;
  totalPages: number;

  // Workflow config
  workflowConfig: WorkflowAction[];
  selectedProcessLabel: WorkflowAction | null;
  hasExceptions: boolean;
  enableEditStatus: boolean;

  // Loading
  isLoading: boolean;
  isWorkflowProcessing: boolean;

  // Callbacks
  onGoHome: () => void;
  onChangeMedia: (index: number) => void;
  onPageChange: (direction: 'up' | 'down') => void;
  onPageInputChange: (page: number) => void;
  onFilterExceptions: () => void;
  onFormAudit: () => void;
  onProcessDocument: (action: WorkflowAction) => void;
  onEnableFieldAudit: () => void;
  onDownloadSource: () => void;
  onGenerateExcel: () => void;
  onSave: () => void;
  onUploadArtifact: () => void;
  onClose: () => void;

  // Children (split panel content)
  children: React.ReactNode;
}

export interface WorkflowAction {
  process_name: string;
  process_icon: string;
  tooltip: string;
  isEnabled: boolean;
  next_micro_process_code?: string;
  next_micro_process_id?: string;
  next_queue?: string;
  next_channel?: string;
  modeOfAction?: string;
}

// Shortcut key definitions
const SHORTCUT_KEYS = [
  [
    { shortcut: 'Save', keys: 'Ctrl + S' },
    { shortcut: 'Next Page', keys: 'Ctrl + Down' },
    { shortcut: 'Prev Page', keys: 'Ctrl + Up' },
    { shortcut: 'Home', keys: 'Ctrl + H' },
  ],
  [
    { shortcut: 'Form Audit', keys: 'Ctrl + A' },
    { shortcut: 'Download', keys: 'Ctrl + D' },
    { shortcut: 'Excel', keys: 'Ctrl + E' },
    { shortcut: 'Close', keys: 'Escape' },
  ],
];

/**
 * Calculate aging in days from queue_btime to now
 */
function calculateAging(queueBtime: string): string {
  if (!queueBtime) return '-';
  try {
    const startDate = new Date(queueBtime);
    const now = new Date();
    const diffMs = now.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? `${diffDays} day${diffDays !== 1 ? 's' : ''}` : '-';
  } catch {
    return '-';
  }
}

/**
 * Truncate string with dots
 */
function truncateWithDots(str: string, maxLen: number): string {
  if (!str || str.length <= maxLen) return str || '';
  return str.substring(0, maxLen - 3) + '...';
}

export const WorkflowContent: React.FC<WorkflowContentProps> = ({
  selectedDinNo,
  selectedUinNo,
  currentVersion,
  selectedMediaSource,
  queueBtime,
  currentStatus,
  mediaConfig,
  currentPage,
  totalPages,
  workflowConfig,
  selectedProcessLabel,
  hasExceptions,
  enableEditStatus,
  isLoading,
  isWorkflowProcessing,
  onGoHome,
  onChangeMedia,
  onPageChange,
  onPageInputChange,
  onFilterExceptions,
  onFormAudit,
  onProcessDocument,
  onEnableFieldAudit,
  onDownloadSource,
  onGenerateExcel,
  onSave,
  onUploadArtifact,
  onClose,
  children,
}) => {
  const [showShortcutPanel, setShowShortcutPanel] = useState(false);
  const [showMediaDropdown, setShowMediaDropdown] = useState(false);
  const [pageInput, setPageInput] = useState(String(currentPage));

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            onSave();
            break;
          case 'arrowdown':
            e.preventDefault();
            if (currentPage < totalPages) onPageChange('down');
            break;
          case 'arrowup':
            e.preventDefault();
            if (currentPage > 1) onPageChange('up');
            break;
          case 'h':
            e.preventDefault();
            onGoHome();
            break;
          case 'a':
            e.preventDefault();
            onFormAudit();
            break;
          case 'd':
            e.preventDefault();
            onDownloadSource();
            break;
          case 'e':
            e.preventDefault();
            onGenerateExcel();
            break;
        }
      }
      if (e.key === 'Escape') {
        if (showShortcutPanel) {
          setShowShortcutPanel(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, showShortcutPanel, onSave, onPageChange, onGoHome, onFormAudit, onDownloadSource, onGenerateExcel, onClose]);

  const handlePageInputBlur = useCallback(() => {
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageInputChange(page);
    } else {
      setPageInput(String(currentPage));
    }
  }, [pageInput, totalPages, currentPage, onPageInputChange]);

  return (
    <div id="contentPage" style={{ minHeight: '100%', backgroundColor: 'white' }}>
      {/* Loading state */}
      {isLoading && !isWorkflowProcessing && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'white' }}>
          <div className="fa fa-spinner fa-spin fa-3x" style={{ color: '#337ab7' }} />
          <p className="h4" style={{ marginTop: '20px' }}>Please Wait. Simplifying...</p>
          <p className="h5">Do not refresh the page or Click back button</p>
        </div>
      )}

      {/* Main content */}
      {!isLoading && (
        <>
          {/* TOP INFO BAR - DIN, Version, UIN, Source, Aging */}
          <div className="workflow_menu text-small" style={{
            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            padding: '8px 16px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd',
            position: 'sticky', top: 0, zIndex: 100,
          }}>
            <div title="Document Identification Number (DIN) identifies each business transaction.">
              <span className="text-small">DIN:&nbsp;</span><strong>{selectedDinNo}</strong>
            </div>
            <div title="Maximum Version of this DIN in your queue">
              <span className="text-small">DIN Version:&nbsp;</span><strong>{currentVersion}</strong>
            </div>
            <div title="Upload Identification Number (UIN) identifies each upload of the source media.">
              <span className="text-small">UIN:&nbsp;</span><strong>{selectedUinNo}</strong>
            </div>
            <div title="Source file from which data is extracted.">
              <span className="text-small">Source File:&nbsp;</span><strong>{selectedMediaSource}</strong>
            </div>
            <div title="Number of days from inventory date to current date.">
              <span className="text-small">Aging:&nbsp;</span><strong>{calculateAging(queueBtime)}</strong>
            </div>
          </div>

          {/* TOOLBAR */}
          <div id="actionDiv" style={{
            display: 'flex', flexWrap: 'wrap', backgroundColor: 'white',
            borderBottom: '1px solid #ddd', position: 'sticky', top: '40px', zIndex: 99,
          }}>

            {/* Section 1: Media Selection */}
            <div style={{ flex: '0 0 25%', padding: '4px 8px', backgroundColor: '#fdfdfd' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="btn btn-sm" onClick={onGoHome} title="Click to load home page back.">
                  <i className="fa fa-home" style={{ fontSize: '18px' }} />
                </button>
                <div style={{ position: 'relative' }}>
                  <button className="btn btn-sm" onClick={() => setShowMediaDropdown(!showMediaDropdown)}>
                    <strong>{truncateWithDots(selectedMediaSource, 18)}</strong>
                    <i className="fa fa-angle-down" style={{ marginLeft: '4px' }} />
                  </button>
                  {showMediaDropdown && mediaConfig.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, zIndex: 1632,
                      backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: '200px',
                    }}>
                      {mediaConfig.map((media, idx) => (
                        <div key={idx} style={{ padding: '6px 12px', cursor: 'pointer' }}
                          className="hover:bg-gray-100"
                          onClick={() => { onChangeMedia(idx); setShowMediaDropdown(false); }}>
                          {(media as any).extracted_file_name || `Media ${idx + 1}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ marginTop: '4px', backgroundColor: 'rgb(200,200,200)', color: '#122b40', textAlign: 'center', padding: '2px', fontSize: '11px' }}>
                Media Information
              </div>
            </div>

            {/* Section 2: Page Navigation */}
            <div style={{ flex: '0 0 15%', padding: '4px 8px', backgroundColor: '#fdfdfd' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px' }}>
                <span
                  className={`fa fa-arrow-circle-o-up fa-2x ${currentPage > 1 ? 'mouse_point' : ''}`}
                  style={{ color: currentPage > 1 ? 'rgb(74,74,74)' : 'lightgray', cursor: currentPage > 1 ? 'pointer' : 'default' }}
                  onClick={() => currentPage > 1 && onPageChange('up')}
                />
                <span
                  className={`fa fa-arrow-circle-o-down fa-2x ${currentPage < totalPages ? 'mouse_point' : ''}`}
                  style={{ color: currentPage < totalPages ? 'rgb(74,74,74)' : 'lightgray', cursor: currentPage < totalPages ? 'pointer' : 'default' }}
                  onClick={() => currentPage < totalPages && onPageChange('down')}
                />
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={handlePageInputBlur}
                  onKeyDown={(e) => e.key === 'Enter' && handlePageInputBlur()}
                  style={{ border: '1px solid rgb(74,74,74)', width: '40px', textAlign: 'center', fontWeight: 'bold' }}
                />
                <strong>/ {totalPages}</strong>
              </div>
              <div style={{ marginTop: '4px', backgroundColor: 'rgb(200,200,200)', textAlign: 'center', padding: '2px', fontSize: '11px' }}>
                Page Number
              </div>
            </div>

            {/* Section 3: Workflow Actions */}
            <div style={{ flex: '0 0 30%', padding: '4px 8px', backgroundColor: '#fdfdfd' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {/* Filter Exceptions */}
                {hasExceptions && (
                  <button className="btn btn-sm" onClick={onFilterExceptions} title="Filter Exceptions">
                    <i className="fa fa-info-circle" style={{ color: 'red', fontSize: '18px' }} />
                  </button>
                )}

                {/* Form Audit */}
                <button className="btn btn-sm" onClick={onFormAudit} title="Form Audit">
                  <i className="fa fa-history" style={{ fontSize: '16px' }} />
                </button>

                {/* Dynamic Workflow Action Buttons */}
                {workflowConfig.map((action, idx) => (
                  <button
                    key={idx}
                    className={`btn btn-sm ${action.isEnabled ? '' : 'disabled'}`}
                    onClick={() => action.isEnabled && onProcessDocument(action)}
                    title={action.tooltip}
                    disabled={!action.isEnabled}
                    style={{
                      borderBottom: selectedProcessLabel?.process_name === action.process_name
                        ? '3px solid #265a88' : 'none',
                    }}
                  >
                    <i className="fa fa-cog" style={{ fontSize: '16px' }} />
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '4px', backgroundColor: 'rgb(200,200,200)', textAlign: 'center', padding: '2px', fontSize: '11px' }}>
                Workflow Actions
              </div>
            </div>

            {/* Section 4: Auditing Tools */}
            <div style={{ flex: '0 0 20%', padding: '4px 8px', backgroundColor: '#fdfdfd' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn btn-sm" onClick={onEnableFieldAudit} title="Enable Field Audit"
                  style={{ borderBottom: enableEditStatus ? '2px solid rgb(74,74,74)' : 'none' }}>
                  <i className="fa fa-pencil-square-o" style={{ fontSize: '16px' }} />
                </button>
                <button className="btn btn-sm" onClick={onDownloadSource} title="Download source file">
                  <i className="fa fa-download" style={{ fontSize: '16px' }} />
                </button>
                <button className="btn btn-sm" onClick={onGenerateExcel} title="Download Excel output">
                  <i className="fa fa-file-excel-o" style={{ fontSize: '16px' }} />
                </button>
                <button className="btn btn-sm" onClick={onSave} title="Save changes">
                  <i className="fa fa-save" style={{ fontSize: '16px' }} />
                </button>
                <button className="btn btn-sm" onClick={onUploadArtifact} title="Artifact upload">
                  <i className="fa fa-paperclip" style={{ fontSize: '16px' }} />
                </button>
              </div>
              <div style={{ marginTop: '4px', backgroundColor: 'rgb(200,200,200)', textAlign: 'center', padding: '2px', fontSize: '11px' }}>
                Auditing
              </div>
            </div>

            {/* Section 5: Shortcut & Close */}
            <div style={{ flex: '0 0 10%', padding: '4px 8px', backgroundColor: '#fdfdfd' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn btn-sm" onClick={() => setShowShortcutPanel(!showShortcutPanel)} title="Shortcut keys">
                  <i className="fa fa-keyboard-o" style={{ fontSize: '16px' }} />
                </button>
                <button className="btn btn-sm" onClick={onClose} title="Close">
                  <i className="fa fa-times-circle" style={{ color: 'red', fontSize: '16px' }} />
                </button>
              </div>
              <div style={{ marginTop: '4px', backgroundColor: 'rgb(200,200,200)', textAlign: 'center', padding: '2px', fontSize: '11px' }}>
                Shortcut Keys
              </div>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div style={{ marginTop: '8px' }}>
            {children}
          </div>

          {/* SHORTCUT PANEL (floating) */}
          {showShortcutPanel && (
            <div style={{
              position: 'fixed', top: '120px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 9200, width: '850px', backgroundColor: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderRadius: '4px',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: '#337ab7', color: 'white', padding: '8px 12px',
              }}>
                <span>Shortcut Keys</span>
                <span className="fa fa-close" style={{ cursor: 'pointer', color: 'white', fontSize: '15pt' }}
                  onClick={() => setShowShortcutPanel(false)} />
              </div>
              <div style={{ padding: '12px' }}>
                <table className="table" style={{ width: '100%' }}>
                  <tbody>
                    {SHORTCUT_KEYS.map((row, rowIdx) => (
                      <tr key={rowIdx} style={{ lineHeight: '2' }}>
                        {row.map((tile, colIdx) => (
                          <td key={colIdx} style={{ border: 'none', textAlign: 'center', padding: '8px' }}>
                            <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px' }}>
                              <div className="text-small" style={{ color: 'rgb(74,74,74)' }}>{tile.shortcut}</div>
                              <div><strong style={{ color: '#337ab7' }}>{tile.keys}</strong></div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* WORKFLOW PROCESSING OVERLAY */}
          {isWorkflowProcessing && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', zIndex: 9999,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div className="fa fa-spinner fa-spin fa-3x" />
              <p className="h4" style={{ marginTop: '20px' }}>Please Wait. Processing...</p>
              <p className="h5">Do not refresh the page or Click back button</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorkflowContent;
