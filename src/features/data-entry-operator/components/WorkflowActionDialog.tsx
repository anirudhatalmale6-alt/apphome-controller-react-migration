/**
 * Workflow Action Dialog
 * Modal for entering comments before processing a workflow action
 * Origin: DataEntryActionPage.html + WorkflowActionPageController
 */
import React, { useState, useCallback } from 'react';

interface WorkflowActionDialogProps {
  isOpen: boolean;
  actionName: string;
  uin: string;
  onContinue: (comments: string) => void;
  onCancel: () => void;
}

export const WorkflowActionDialog: React.FC<WorkflowActionDialogProps> = ({
  isOpen,
  actionName,
  uin,
  onContinue,
  onCancel,
}) => {
  const [comments, setComments] = useState('');

  const handleCommentsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Max 100 characters (Origin: $scope.checkCommentsLength)
    if (value.length <= 100) {
      setComments(value);
    }
  }, []);

  const handleContinue = useCallback(() => {
    if (comments.trim().length > 0) {
      onContinue(comments);
      setComments('');
    }
  }, [comments, onContinue]);

  const handleCancel = useCallback(() => {
    setComments('');
    onCancel();
  }, [onCancel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && comments.trim().length > 0) {
      e.preventDefault();
      handleContinue();
    }
  }, [comments, handleContinue]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <i className="fa fa-info-circle" style={{ marginRight: 6, color: '#1976d2' }} />
            <span style={styles.actionName}>{actionName}</span>
          </div>
          <button onClick={handleCancel} style={styles.closeButton} title="Close">
            <i className="fa fa-times" style={{ color: '#c62828' }} />
          </button>
        </div>

        {/* UIN Info */}
        <div style={styles.uinRow}>
          <span style={styles.uinLabel}>Upload Identification Number: </span>
          <span style={styles.uinValue}>{uin}</span>
        </div>

        {/* Comments Input */}
        <div style={styles.commentsContainer}>
          <label style={styles.commentsLabel}>Your comments</label>
          <textarea
            value={comments}
            onChange={handleCommentsChange}
            onKeyDown={handleKeyDown}
            rows={3}
            autoFocus
            style={{
              ...styles.textarea,
              borderBottomColor: comments.length >= 100 ? '#c62828' : '#bdbdbd',
            }}
            placeholder="Enter your comments..."
          />
          <span style={styles.charCount}>{comments.length}/100</span>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            onClick={handleContinue}
            disabled={comments.trim().length === 0}
            style={{
              ...styles.continueButton,
              opacity: comments.trim().length === 0 ? 0.5 : 1,
              cursor: comments.trim().length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
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
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25)',
    width: 420,
    maxWidth: '90vw',
    padding: 16,
    border: '2px solid #1976d2',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: 8,
    marginBottom: 12,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 500,
  },
  actionName: {
    color: 'rgb(74, 74, 74)',
  },
  closeButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 16,
  },
  uinRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 12,
    fontSize: 12,
  },
  uinLabel: {
    color: 'rgb(74, 74, 74)',
  },
  uinValue: {
    color: '#1976d2',
    fontWeight: 600,
    marginLeft: 4,
  },
  commentsContainer: {
    position: 'relative' as const,
    marginBottom: 16,
  },
  commentsLabel: {
    display: 'block',
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 13,
    border: 'none',
    borderBottom: '2px solid #bdbdbd',
    outline: 'none',
    resize: 'none' as const,
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },
  charCount: {
    position: 'absolute' as const,
    bottom: -18,
    right: 0,
    fontSize: 11,
    color: '#9e9e9e',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: 8,
  },
  continueButton: {
    border: 'none',
    background: 'transparent',
    color: '#1976d2',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: 4,
    textTransform: 'capitalize' as const,
  },
};

export default WorkflowActionDialog;
