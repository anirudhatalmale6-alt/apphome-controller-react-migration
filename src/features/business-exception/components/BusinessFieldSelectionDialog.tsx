/**
 * Business Field Selection Dialog
 * Maps table columns to iXSD business fields
 * Origin: BusinessFieldSelectionController in BusinessExceptionController.js (line ~1120)
 *
 * Features:
 * - Select business field from available iXSD complex type fields
 * - Multi-header (twin column) support with separator configuration
 * - Skip index / Unique index toggles
 * - Discard column option
 * - Column separation list management
 */
import React, { useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  selectBusinessException,
  updateColumnHeaders,
} from '../store/businessExceptionSlice';
import type {
  ComplexTypeField,
  ColumnHeader,
  BusinessFieldConfig,
  ColumnSeparation,
  TwinHeaderSeparator,
} from '../types/BusinessExceptionTypes';

// ─── Separator Options ───
const TWIN_HEADER_SEPARATOR_LIST: TwinHeaderSeparator[] = [
  { separatorText: 'tab', separatorLabel: 'Tab' },
  { separatorText: '/', separatorLabel: 'Slash' },
  { separatorText: ',', separatorLabel: 'Comma' },
  { separatorText: '|', separatorLabel: 'Pipe' },
  { separatorText: 'new line', separatorLabel: 'New Line' },
  { separatorText: 'last line', separatorLabel: 'Last Line' },
  { separatorText: 'none', separatorLabel: 'None' },
];

interface BusinessFieldSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedComplexTypeFields: ComplexTypeField[];
  selectedTableColumn: string;
  selectedTableField: ColumnHeader | null;
  tableColumnIndex: number;
  currentPage: number;
}

// ─── Styles ───
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
    backgroundColor: 'white',
    borderRadius: '4px',
    padding: '16px',
    width: '500px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '2px solid rgb(74, 74, 74)',
  },
  title: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: 'rgb(74, 74, 74)',
  },
  closeBtn: {
    border: 'none',
    background: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#666',
  },
  section: {
    marginBottom: '12px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 'bold' as const,
    color: '#666',
    marginBottom: '4px',
    textTransform: 'uppercase' as const,
  },
  fieldList: {
    maxHeight: '150px',
    overflow: 'auto',
    border: '1px solid #ddd',
    borderRadius: '3px',
    padding: '4px',
  },
  fieldItem: {
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '12px',
    borderRadius: '2px',
  },
  fieldItemSelected: {
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '12px',
    borderRadius: '2px',
    backgroundColor: '#e3f2fd',
    fontWeight: 'bold' as const,
  },
  searchInput: {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #ddd',
    borderRadius: '3px',
    fontSize: '12px',
    marginBottom: '4px',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 0',
    fontSize: '12px',
  },
  checkbox: {
    width: '14px',
    height: '14px',
  },
  separatorRow: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    padding: '4px 0',
    borderBottom: '1px solid #eee',
    fontSize: '11px',
  },
  btn: {
    padding: '6px 14px',
    border: '1px solid #333',
    borderRadius: '3px',
    backgroundColor: 'rgb(74, 74, 74)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
  },
  btnOutline: {
    padding: '6px 14px',
    border: '1px solid #666',
    borderRadius: '3px',
    backgroundColor: 'transparent',
    color: '#333',
    cursor: 'pointer',
    fontSize: '12px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #ddd',
  },
};

export const BusinessFieldSelectionDialog: React.FC<BusinessFieldSelectionDialogProps> = ({
  isOpen,
  onClose,
  selectedComplexTypeFields,
  selectedTableColumn,
  selectedTableField,
  tableColumnIndex,
  currentPage,
}) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectBusinessException);

  // ─── Local State ───
  const [searchInput, setSearchInput] = useState('');
  const [businessFieldConfig, setBusinessFieldConfig] = useState<BusinessFieldConfig>({
    businessField: selectedTableField?.ixsdFieldName || '',
    isMultiHeader: selectedTableField?.isTwinHeader || false,
    isDiscardField: selectedTableField?.isDiscard || false,
    isSkipIndex: selectedTableField?.isSkipIndex || false,
    isUniqueIndex: selectedTableField?.isUniqueColumn || false,
    columnSeparationList: [],
  });
  const [selectedSeparator, setSelectedSeparator] = useState('');
  const [isNewSeparator, setIsNewSeparator] = useState(true);
  const [selectedSeparatorIndex, setSelectedSeparatorIndex] = useState(-1);
  const [, /* customSeparatorInput */ ] = useState(false);
  const [columnLabel, setColumnLabel] = useState(selectedTableColumn);

  // ─── Build field list with discard option ───
  const fieldListWithDiscard = useMemo(() => {
    const fields = selectedComplexTypeFields.map((f: ComplexTypeField, idx: number) => ({
      ...f,
      isChecked: idx === 0,
    }));
    fields.push({
      ixsdFieldName: 'discardField',
      ixsdAliaseName: 'discardField',
      ixsdPath: '',
      isChecked: false,
    });
    return fields;
  }, [selectedComplexTypeFields]);

  // ─── Filtered fields based on search ��──
  const filteredFields = useMemo(() => {
    if (!searchInput.trim()) return fieldListWithDiscard;
    return fieldListWithDiscard.filter((f: ComplexTypeField) =>
      f.ixsdFieldName.toLowerCase().includes(searchInput.toLowerCase()) ||
      f.ixsdAliaseName.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [fieldListWithDiscard, searchInput]);

  // ─���─ Handle field selection ───
  const handleSelectField = useCallback((field: ComplexTypeField) => {
    setBusinessFieldConfig((prev) => ({
      ...prev,
      businessField: field.ixsdFieldName,
      isDiscardField: field.ixsdFieldName === 'discardField',
    }));
  }, []);

  // ─── Handle multi-header toggle ���──
  const handleToggleMultiHeader = useCallback((checked: boolean) => {
    if (checked && !businessFieldConfig.businessField) {
      return; // Must have a business field selected first
    }
    setBusinessFieldConfig((prev) => ({
      ...prev,
      isMultiHeader: checked,
      isUniqueIndex: checked ? false : prev.isUniqueIndex,
      columnSeparationList: checked ? [] : [],
    }));
  }, [businessFieldConfig.businessField]);

  // ─── Add Separator ───
  const handleAddSeparator = useCallback((separatorText: string) => {
    if (isNewSeparator) {
      setBusinessFieldConfig((prev) => ({
        ...prev,
        columnSeparationList: [
          ...prev.columnSeparationList,
          {
            selectedTableColumn,
            selectedTableColumnPosition: selectedTableField?.labelPosition || { top: 0, left: 0, width: 0, height: 0 },
            separatedColumn: selectedTableColumn,
            businessField: prev.businessField,
            headerMasterIndex: tableColumnIndex,
            masterHeader: prev.columnSeparationList.length === 0,
            separatedText: separatorText,
          },
        ],
      }));
    } else {
      setBusinessFieldConfig((prev) => {
        const updated = [...prev.columnSeparationList];
        if (updated[selectedSeparatorIndex]) {
          updated[selectedSeparatorIndex] = {
            ...updated[selectedSeparatorIndex],
            separatedText: separatorText,
          };
        }
        return { ...prev, columnSeparationList: updated };
      });
      setIsNewSeparator(true);
    }
    setBusinessFieldConfig((prev) => ({ ...prev, businessField: '' }));
    setSelectedSeparator('');
  }, [isNewSeparator, selectedSeparatorIndex, selectedTableColumn, selectedTableField, tableColumnIndex]);

  // ─── Remove Separator ───
  const handleRemoveSeparator = useCallback((index: number) => {
    setBusinessFieldConfig((prev) => ({
      ...prev,
      columnSeparationList: prev.columnSeparationList.filter((_: ColumnSeparation, i: number) => i !== index),
    }));
  }, []);

  // ─── Save Business Field ───
  const handleSave = useCallback(() => {
    const config = businessFieldConfig;

    // Validate multi-header selection
    if (config.columnSeparationList.length > 0) {
      const hasEmptyField = config.columnSeparationList.some((item: ColumnSeparation) => item.businessField === '');
      if (hasEmptyField) return;
    } else if (!config.businessField) {
      return;
    }

    // Update column headers in page extraction
    const pageExtraction = state.pageWiseExtraction[currentPage];
    if (!pageExtraction) {
      onClose();
      return;
    }

    const columnHeaders = [...pageExtraction.tableExtractionInputs.columnHeaders];
    if (columnHeaders[tableColumnIndex]) {
      columnHeaders[tableColumnIndex] = {
        ...columnHeaders[tableColumnIndex],
        label: columnLabel || selectedTableColumn,
        ixsdFieldName: config.businessField,
        ixsdPath: state.selectedIXSDDataObject
          ? `${state.selectedIXSDDataObject.label}/element/${config.businessField}`
          : '',
        isTwinHeader: config.isMultiHeader,
        isDiscard: config.isDiscardField,
        isSkipIndex: config.isSkipIndex,
        isUniqueColumn: config.isUniqueIndex,
      };

      // Reset other columns if skip/unique set
      if (config.isSkipIndex) {
        columnHeaders.forEach((col: ColumnHeader, idx: number) => {
          if (idx !== tableColumnIndex) {
            columnHeaders[idx] = { ...col, isSkipIndex: false };
          }
        });
      }
      if (config.isUniqueIndex) {
        columnHeaders.forEach((col: ColumnHeader, idx: number) => {
          if (idx !== tableColumnIndex) {
            columnHeaders[idx] = { ...col, isUniqueColumn: false };
          }
        });
      }

      dispatch(updateColumnHeaders({ page: currentPage, columnHeaders }));
    }

    onClose();
  }, [
    businessFieldConfig,
    columnLabel,
    selectedTableColumn,
    state.pageWiseExtraction,
    state.selectedIXSDDataObject,
    currentPage,
    tableColumnIndex,
    dispatch,
    onClose,
  ]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title}>
            Business Field Selection - "{columnLabel || selectedTableColumn}"
          </div>
          <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        {/* Column Label Edit */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Column Label</div>
          <input
            style={styles.searchInput}
            value={columnLabel}
            onChange={(e) => setColumnLabel(e.target.value)}
            placeholder="Edit column label"
          />
        </div>

        {/* Search */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Business Field</div>
          <input
            style={styles.searchInput}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search fields..."
          />
          <div style={styles.fieldList}>
            {filteredFields.map((field: ComplexTypeField) => (
              <div
                key={field.ixsdFieldName}
                style={
                  businessFieldConfig.businessField === field.ixsdFieldName
                    ? styles.fieldItemSelected
                    : styles.fieldItem
                }
                onClick={() => handleSelectField(field)}
              >
                {field.ixsdAliaseName || field.ixsdFieldName}
                {field.ixsdFieldName === 'discardField' && (
                  <span style={{ color: '#999', marginLeft: '4px' }}>(discard)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div style={styles.section}>
          <div style={styles.toggle}>
            <input
              type="checkbox"
              style={styles.checkbox}
              checked={businessFieldConfig.isUniqueIndex}
              onChange={(e) => setBusinessFieldConfig((prev) => ({
                ...prev,
                isUniqueIndex: e.target.checked,
                isMultiHeader: e.target.checked ? false : prev.isMultiHeader,
              }))}
              disabled={businessFieldConfig.isSkipIndex || businessFieldConfig.isMultiHeader}
            />
            <span>Unique Index</span>
          </div>
          <div style={styles.toggle}>
            <input
              type="checkbox"
              style={styles.checkbox}
              checked={businessFieldConfig.isSkipIndex}
              onChange={(e) => setBusinessFieldConfig((prev) => ({
                ...prev,
                isSkipIndex: e.target.checked,
                isUniqueIndex: e.target.checked ? false : prev.isUniqueIndex,
              }))}
            />
            <span>Skip Index</span>
          </div>
          <div style={styles.toggle}>
            <input
              type="checkbox"
              style={styles.checkbox}
              checked={businessFieldConfig.isDiscardField}
              onChange={(e) => setBusinessFieldConfig((prev) => ({
                ...prev,
                isDiscardField: e.target.checked,
              }))}
            />
            <span>Discard Column</span>
          </div>
          <div style={styles.toggle}>
            <input
              type="checkbox"
              style={styles.checkbox}
              checked={businessFieldConfig.isMultiHeader}
              onChange={(e) => handleToggleMultiHeader(e.target.checked)}
              disabled={businessFieldConfig.isUniqueIndex}
            />
            <span>Multi-Header (Twin Column)</span>
          </div>
        </div>

        {/* Multi-Header Separator Configuration */}
        {businessFieldConfig.isMultiHeader && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Column Separators</div>
            {businessFieldConfig.columnSeparationList.map((sep: ColumnSeparation, idx: number) => (
              <div key={idx} style={styles.separatorRow}>
                <span style={{ flex: 1 }}>
                  {sep.businessField} ({sep.separatedText})
                </span>
                <button
                  style={{ ...styles.btnOutline, padding: '2px 6px', fontSize: '10px' }}
                  onClick={() => {
                    setSelectedSeparatorIndex(idx);
                    setSelectedSeparator(sep.separatedText);
                    setIsNewSeparator(false);
                  }}
                >
                  Edit
                </button>
                <button
                  style={{ ...styles.btnOutline, padding: '2px 6px', fontSize: '10px', color: 'red', borderColor: 'red' }}
                  onClick={() => handleRemoveSeparator(idx)}
                >
                  Remove
                </button>
              </div>
            ))}

            {/* Separator selection */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {TWIN_HEADER_SEPARATOR_LIST.map((sep: TwinHeaderSeparator) => (
                  <button
                    key={sep.separatorText}
                    style={{
                      ...styles.btnOutline,
                      padding: '2px 8px',
                      fontSize: '10px',
                      backgroundColor: selectedSeparator === sep.separatorText ? '#e3f2fd' : 'transparent',
                    }}
                    onClick={() => handleAddSeparator(sep.separatorText)}
                  >
                    {sep.separatorLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.btnOutline} onClick={onClose}>Cancel</button>
          <button style={styles.btn} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default BusinessFieldSelectionDialog;
