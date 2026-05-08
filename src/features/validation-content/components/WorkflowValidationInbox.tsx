/**
 * Workflow Validation Inbox (Exception List Sidebar)
 * Displays grouped exception list with field-level detail
 * Origin: WorkflowValidationInbox.html (171 lines)
 */
import React, { useCallback, useState } from 'react';
import type { FilteredException } from '../types/ValidationContentTypes';

// ─── Inline Styles (dark toolbar theme) ───
const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    bottom: 0,
    width: '360px',
    backgroundColor: '#fff',
    boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#263238',
    color: '#eceff1',
  },
  headerTitle: {
    fontSize: '14px',
    fontWeight: 600,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#eceff1',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px 8px',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '8px 0',
  },
  exceptionRow: {
    padding: '10px 16px',
    borderBottom: '1px solid #eceff1',
    cursor: 'pointer',
  },
  exceptionRowHover: {
    backgroundColor: '#f5f5f5',
  },
  exceptionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exceptionDesc: {
    fontSize: '13px',
    color: '#37474f',
    flex: 1,
    marginRight: '8px',
  },
  exceptionCount: {
    fontSize: '11px',
    color: '#fff',
    backgroundColor: '#e53935',
    borderRadius: '10px',
    padding: '2px 8px',
    minWidth: '20px',
    textAlign: 'center' as const,
  },
  checkbox: {
    marginRight: '8px',
    cursor: 'pointer',
  },
  fieldList: {
    marginTop: '8px',
    marginLeft: '24px',
  },
  fieldItem: {
    fontSize: '12px',
    color: '#546e7a',
    padding: '3px 0',
    display: 'flex',
    alignItems: 'center',
  },
  fieldComplexType: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#263238',
    padding: '6px 0 2px 0',
  },
  fieldKey: {
    fontSize: '11px',
    color: '#78909c',
    marginLeft: '4px',
  },
  footer: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    borderTop: '1px solid #eceff1',
    backgroundColor: '#fafafa',
  },
  footerBtn: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #cfd8dc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    textAlign: 'center' as const,
    backgroundColor: '#fff',
  },
  footerBtnPrimary: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #26a69a',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    textAlign: 'center' as const,
    backgroundColor: '#26a69a',
    color: '#fff',
  },
};

interface WorkflowValidationInboxProps {
  exceptions: FilteredException[];
  onClose: () => void;
  onFilterApply?: (selected: FilteredException[]) => void;
  onViewAll?: () => void;
}

export const WorkflowValidationInbox: React.FC<WorkflowValidationInboxProps> = ({
  exceptions,
  onClose,
  onFilterApply,
  onViewAll,
}) => {
  const [localExceptions, setLocalExceptions] = useState<FilteredException[]>(
    exceptions.map((e) => ({ ...e }))
  );

  // ─── Toggle Exception Selection ───
  const handleToggleException = useCallback((index: number) => {
    setLocalExceptions((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isSelected: !updated[index].isSelected,
      };
      return updated;
    });
  }, []);

  // ─── Toggle Field Detail View ───
  const handleToggleFieldDetail = useCallback((index: number) => {
    setLocalExceptions((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        showFieldException: !updated[index].showFieldException,
      };
      return updated;
    });
  }, []);

  // ─── Toggle Field Group Selection ───
  const handleToggleFieldGroup = useCallback((excIdx: number, fieldIdx: number) => {
    setLocalExceptions((prev) => {
      const updated = [...prev];
      const updatedFieldList = [...updated[excIdx].field_list];
      updatedFieldList[fieldIdx] = {
        ...updatedFieldList[fieldIdx],
        isSelected: !updatedFieldList[fieldIdx].isSelected,
      };
      updated[excIdx] = { ...updated[excIdx], field_list: updatedFieldList };
      return updated;
    });
  }, []);

  // ─── Apply Filter ───
  const handleApplyFilter = useCallback(() => {
    const selected = localExceptions.filter((e) => e.isSelected);
    if (onFilterApply) {
      onFilterApply(selected);
    }
    onClose();
  }, [localExceptions, onFilterApply, onClose]);

  // ─── View All ─��─
  const handleViewAll = useCallback(() => {
    if (onViewAll) {
      onViewAll();
    }
    onClose();
  }, [onViewAll, onClose]);

  return (
    <div style={styles.overlay}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>
          <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }} />
          Exception List ({localExceptions.length})
        </span>
        <button style={styles.closeBtn} onClick={onClose}>
          <i className="fa fa-times" />
        </button>
      </div>

      {/* Exception Table */}
      <div style={styles.content}>
        {localExceptions.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#78909c' }}>
            No exceptions found
          </div>
        )}

        {localExceptions.map((exception, excIdx) => (
          <div key={excIdx} style={styles.exceptionRow}>
            {/* Exception Header Row */}
            <div style={styles.exceptionHeader}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={exception.isSelected}
                onChange={() => handleToggleException(excIdx)}
              />
              <span
                style={styles.exceptionDesc}
                onClick={() => handleToggleFieldDetail(excIdx)}
              >
                {exception.exception_desc}
              </span>
              <span style={styles.exceptionCount}>
                {exception.exception_count}
              </span>
            </div>

            {/* Field Detail Expandable */}
            {exception.showFieldException && (
              <div style={styles.fieldList}>
                {exception.field_list.map((fieldGroup, fIdx) => (
                  <div key={fIdx}>
                    <div style={styles.fieldComplexType}>
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={fieldGroup.isSelected}
                        onChange={() => handleToggleFieldGroup(excIdx, fIdx)}
                      />
                      {fieldGroup.complexTypeLabel} ({fieldGroup.exception_count})
                    </div>
                    {fieldGroup.fieldList.map((field, fieldIdx) => (
                      <div key={fieldIdx} style={styles.fieldItem}>
                        <span>Row {field.rowNo}:</span>
                        <span style={styles.fieldKey}>{field.key}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div style={styles.footer}>
        <button style={styles.footerBtn} onClick={handleViewAll}>
          View All
        </button>
        <button style={styles.footerBtnPrimary} onClick={handleApplyFilter}>
          Apply Filter
        </button>
      </div>
    </div>
  );
};

export default WorkflowValidationInbox;
