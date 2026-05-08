/**
 * Validation Workflow Dialog
 * Workflow action confirmation with comments input
 * Origin: WorkflowActionPage.html + DialogController in ValidationContentController.js (line ~896)
 */
import React, { useCallback, useState } from 'react';

// ─── Inline Styles (dark toolbar theme) ───
const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    width: '420px',
    maxWidth: '90vw',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    backgroundColor: '#263238',
    color: '#eceff1',
  },
  headerTitle: {
    fontSize: '15px',
    fontWeight: 600,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#eceff1',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
  },
  body: {
    padding: '20px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '13px',
  },
  infoLabel: {
    fontWeight: 600,
    color: '#37474f',
    width: '80px',
  },
  infoValue: {
    color: '#546e7a',
  },
  fieldGroup: {
    marginBottom: '16px',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#37474f',
    marginBottom: '6px',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cfd8dc',
    borderRadius: '4px',
    fontSize: '13px',
    minHeight: '80px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  charCount: {
    fontSize: '11px',
    color: '#78909c',
    textAlign: 'right' as const,
    marginTop: '4px',
  },
  footer: {
    display: 'flex',
    gap: '12px',
    padding: '16px 20px',
    borderTop: '1px solid #eceff1',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '8px 20px',
    border: '1px solid #cfd8dc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    color: '#37474f',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  },
  confirmBtn: {
    padding: '8px 20px',
    border: '1px solid #26a69a',
    borderRadius: '4px',
    backgroundColor: '#26a69a',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  },
  confirmBtnDisabled: {
    padding: '8px 20px',
    border: '1px solid #b2dfdb',
    borderRadius: '4px',
    backgroundColor: '#b2dfdb',
    color: '#fff',
    cursor: 'not-allowed',
    fontSize: '13px',
    fontWeight: 500,
  },
  processLabel: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
  },
};

const MAX_COMMENT_LENGTH = 99;

interface ValidationWorkflowDialogProps {
  selectedDinNo: string;
  processLabel: string;
  currentStatus: string;
  onConfirm: (comments: string) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const ValidationWorkflowDialog: React.FC<ValidationWorkflowDialogProps> = ({
  selectedDinNo,
  processLabel,
  currentStatus,
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  const [comments, setComments] = useState('');

  // ─── Handle Comments Change (max 99 chars - from original controller line ~906) ───
  const handleCommentsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_COMMENT_LENGTH) {
      setComments(value);
    } else {
      setComments(value.substring(0, MAX_COMMENT_LENGTH));
    }
  }, []);

  // ─── Handle Confirm ───
  const handleConfirm = useCallback(() => {
    onConfirm(comments);
  }, [comments, onConfirm]);

  // ─── Handle Key Press (Enter to confirm) ───
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  }, [onCancel]);

  return (
    <div style={styles.overlay} onKeyDown={handleKeyDown}>
      <div style={styles.dialog}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.headerTitle}>
            <i className="fa fa-cogs" style={{ marginRight: '8px' }} />
            Workflow Action
          </span>
          <button style={styles.closeBtn} onClick={onCancel}>
            <i className="fa fa-times" />
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* DIN Info */}
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>DIN:</span>
            <span style={styles.infoValue}>{selectedDinNo}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Status:</span>
            <span style={styles.infoValue}>{currentStatus}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Action:</span>
            <span style={styles.processLabel}>{processLabel}</span>
          </div>

          {/* Comments */}
          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>
              Comments (optional)
            </label>
            <textarea
              style={styles.textarea}
              value={comments}
              onChange={handleCommentsChange}
              placeholder="Enter comments for this workflow action..."
              maxLength={MAX_COMMENT_LENGTH}
              disabled={isProcessing}
            />
            <div style={styles.charCount}>
              {comments.length}/{MAX_COMMENT_LENGTH}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            style={styles.cancelBtn}
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            style={isProcessing ? styles.confirmBtnDisabled : styles.confirmBtn}
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationWorkflowDialog;
