/**
 * iXSD Data Grid Component
 * Displays tabbed data headers with object/array views
 * Origin: PDFLoadingPage.html - right panel (md-tabs + ObjectTypeFields + ArrayTypeFields)
 */
import React, { useState, useCallback } from 'react';
import type { IXSDDataHeader, IXSDField, LookupItem } from '../types/BusinessContentTypes';

interface IXSDDataGridProps {
  headers: IXSDDataHeader[];
  enableEdit: boolean;
  selectedLineItemIndex: number;
  singleLineItemView: boolean;
  onFieldChange: (headerIndex: number, rowIndex: number, fieldKey: string, value: string) => void;
  onAddLineItem: (headerIndex: number) => void;
  onDeleteLineItem: (headerIndex: number, rowIndex: number) => void;
  onSelectLineItem: (index: number) => void;
  onToggleSingleLineView: () => void;
  onFieldAudit: (complexType: string, rowno: number) => void;
  onBotCamp?: (complexType: string, field: IXSDField) => void;
}

export const IXSDDataGrid: React.FC<IXSDDataGridProps> = ({
  headers,
  enableEdit,
  selectedLineItemIndex,
  singleLineItemView,
  onFieldChange,
  onAddLineItem,
  onDeleteLineItem,
  onSelectLineItem,
  onToggleSingleLineView,
  onFieldAudit,
  onBotCamp,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const visibleHeaders = headers.filter((h) => h.visible_status !== false);

  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  if (visibleHeaders.length === 0) {
    return (
      <div className="ixsd-no-data">
        <i className="fa fa-info-circle" /> No data available
      </div>
    );
  }

  const currentHeader = visibleHeaders[activeTab] || visibleHeaders[0];
  const originalIndex = headers.indexOf(currentHeader);

  return (
    <div className="ixsd-data-grid">
      {/* Tab Headers */}
      <div className="ixsd-tabs">
        {visibleHeaders.map((header, idx) => (
          <button
            key={header.header_name}
            className={`ixsd-tab ${idx === activeTab ? 'active' : ''} ${
              header.exception_status ? `exception-${header.exceptionColor}` : ''
            }`}
            onClick={() => handleTabChange(idx)}
          >
            {header.label}
            {header.exception_status && (
              <span
                className="exception-dot"
                style={{
                  backgroundColor: header.exceptionColor === 'red' ? '#f44336' : '#ff9800',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginLeft: '4px',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="ixsd-tab-content">
        {currentHeader.view_style === 'object' ? (
          <ObjectTypeView
            header={currentHeader}
            headerIndex={originalIndex}
            enableEdit={enableEdit}
            onFieldChange={onFieldChange}
            onFieldAudit={onFieldAudit}
            onBotCamp={onBotCamp}
          />
        ) : (
          <ArrayTypeView
            header={currentHeader}
            headerIndex={originalIndex}
            enableEdit={enableEdit}
            selectedLineItemIndex={selectedLineItemIndex}
            singleLineItemView={singleLineItemView}
            onFieldChange={onFieldChange}
            onAddLineItem={onAddLineItem}
            onDeleteLineItem={onDeleteLineItem}
            onSelectLineItem={onSelectLineItem}
            onToggleSingleLineView={onToggleSingleLineView}
            onFieldAudit={onFieldAudit}
            onBotCamp={onBotCamp}
          />
        )}
      </div>
    </div>
  );
};

// ─── Object Type View (Single Record) ───
interface ObjectTypeViewProps {
  header: IXSDDataHeader;
  headerIndex: number;
  enableEdit: boolean;
  onFieldChange: (headerIndex: number, rowIndex: number, fieldKey: string, value: string) => void;
  onFieldAudit: (complexType: string, rowno: number) => void;
  onBotCamp?: (complexType: string, field: IXSDField) => void;
}

const ObjectTypeView: React.FC<ObjectTypeViewProps> = ({
  header,
  headerIndex,
  enableEdit,
  onFieldChange,
  onFieldAudit,
  onBotCamp,
}) => {
  const fields = header.ixsd_fields[0] || [];
  const visibleFields = fields.filter((f) => f.visible_status !== false);

  return (
    <div className="object-type-view">
      <div className="object-fields">
        {visibleFields.map((field) => (
          <FieldRow
            key={field.key}
            field={field}
            headerIndex={headerIndex}
            rowIndex={0}
            enableEdit={enableEdit}
            onFieldChange={onFieldChange}
            onFieldAudit={() => onFieldAudit(header.header_name, 0)}
            onBotCamp={onBotCamp ? () => onBotCamp(header.header_name, field) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Array Type View (Line Items Table) ───
interface ArrayTypeViewProps {
  header: IXSDDataHeader;
  headerIndex: number;
  enableEdit: boolean;
  selectedLineItemIndex: number;
  singleLineItemView: boolean;
  onFieldChange: (headerIndex: number, rowIndex: number, fieldKey: string, value: string) => void;
  onAddLineItem: (headerIndex: number) => void;
  onDeleteLineItem: (headerIndex: number, rowIndex: number) => void;
  onSelectLineItem: (index: number) => void;
  onToggleSingleLineView: () => void;
  onFieldAudit: (complexType: string, rowno: number) => void;
  onBotCamp?: (complexType: string, field: IXSDField) => void;
}

const ArrayTypeView: React.FC<ArrayTypeViewProps> = ({
  header,
  headerIndex,
  enableEdit,
  selectedLineItemIndex,
  singleLineItemView,
  onFieldChange,
  onAddLineItem,
  onDeleteLineItem,
  onSelectLineItem,
  onToggleSingleLineView,
  onFieldAudit,
  onBotCamp,
}) => {
  // Get column headers from first row
  const firstRow = header.ixsd_fields[0] || [];
  const columnHeaders = firstRow
    .filter((f) => f.visible_status !== false && f.key !== 'itemState' && f.key !== 'hasDuplicated');

  // Filter out deleted rows for display
  const activeRows = header.ixsd_fields.filter(
    (row) => !row.some((f) => f.itemState === 'D')
  );

  return (
    <div className="array-type-view">
      {/* Array toolbar */}
      <div className="array-toolbar">
        <span className="line-item-count">
          {activeRows.length} line item{activeRows.length !== 1 ? 's' : ''}
        </span>
        <div className="array-actions">
          <button
            className="btn btn-sm"
            onClick={onToggleSingleLineView}
            title={singleLineItemView ? 'Table View' : 'Single Item View'}
          >
            <i className={`fa ${singleLineItemView ? 'fa-table' : 'fa-list-alt'}`} />
          </button>
          {enableEdit && (
            <>
              <button
                className="btn btn-sm btn-success"
                onClick={() => onAddLineItem(headerIndex)}
                title="Add Line Item"
              >
                <i className="fa fa-plus" /> Add
              </button>
            </>
          )}
        </div>
      </div>

      {singleLineItemView ? (
        /* Single Line Item View */
        <div className="single-line-view">
          <div className="line-item-nav">
            <button
              className="btn btn-sm"
              disabled={selectedLineItemIndex <= 0}
              onClick={() => onSelectLineItem(selectedLineItemIndex - 1)}
            >
              <i className="fa fa-chevron-left" />
            </button>
            <span>
              Item {selectedLineItemIndex + 1} of {activeRows.length}
            </span>
            <button
              className="btn btn-sm"
              disabled={selectedLineItemIndex >= activeRows.length - 1}
              onClick={() => onSelectLineItem(selectedLineItemIndex + 1)}
            >
              <i className="fa fa-chevron-right" />
            </button>
          </div>
          <div className="single-line-fields">
            {activeRows[selectedLineItemIndex] &&
              activeRows[selectedLineItemIndex]
                .filter((f) => f.visible_status !== false && f.key !== 'itemState' && f.key !== 'hasDuplicated')
                .map((field) => (
                  <FieldRow
                    key={field.key}
                    field={field}
                    headerIndex={headerIndex}
                    rowIndex={header.ixsd_fields.indexOf(activeRows[selectedLineItemIndex])}
                    enableEdit={enableEdit}
                    onFieldChange={onFieldChange}
                    onFieldAudit={() =>
                      onFieldAudit(
                        header.header_name,
                        header.ixsd_fields.indexOf(activeRows[selectedLineItemIndex])
                      )
                    }
                    onBotCamp={
                      onBotCamp
                        ? () => onBotCamp(header.header_name, field)
                        : undefined
                    }
                  />
                ))}
          </div>
          {enableEdit && activeRows.length > 1 && (
            <button
              className="btn btn-sm btn-danger"
              onClick={() =>
                onDeleteLineItem(
                  headerIndex,
                  header.ixsd_fields.indexOf(activeRows[selectedLineItemIndex])
                )
              }
            >
              <i className="fa fa-trash" /> Delete Item
            </button>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="table-view" style={{ overflowX: 'auto' }}>
          <table className="ixsd-table">
            <thead>
              <tr>
                <th>#</th>
                {columnHeaders.map((col) => (
                  <th key={col.key}>{col.key_alias_name}</th>
                ))}
                {enableEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {activeRows.map((row, rowDisplayIndex) => {
                const actualRowIndex = header.ixsd_fields.indexOf(row);
                return (
                  <tr
                    key={actualRowIndex}
                    className={`${rowDisplayIndex === selectedLineItemIndex ? 'selected-row' : ''} ${
                      row.some((f) => f.itemState === 'A') ? 'new-row' : ''
                    }`}
                    onClick={() => onSelectLineItem(rowDisplayIndex)}
                  >
                    <td>{rowDisplayIndex + 1}</td>
                    {columnHeaders.map((col) => {
                      const field = row.find((f) => f.key === col.key);
                      return (
                        <td key={col.key}>
                          {field ? (
                            <FieldCell
                              field={field}
                              headerIndex={headerIndex}
                              rowIndex={actualRowIndex}
                              enableEdit={enableEdit}
                              onFieldChange={onFieldChange}
                            />
                          ) : (
                            ''
                          )}
                        </td>
                      );
                    })}
                    {enableEdit && (
                      <td>
                        <button
                          className="btn btn-xs btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLineItem(headerIndex, actualRowIndex);
                          }}
                          title="Delete"
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Field Row (Object view - label + input) ───
interface FieldRowProps {
  field: IXSDField;
  headerIndex: number;
  rowIndex: number;
  enableEdit: boolean;
  onFieldChange: (headerIndex: number, rowIndex: number, fieldKey: string, value: string) => void;
  onFieldAudit: () => void;
  onBotCamp?: () => void;
}

const FieldRow: React.FC<FieldRowProps> = ({
  field,
  headerIndex,
  rowIndex,
  enableEdit,
  onFieldChange,
  onFieldAudit,
  onBotCamp,
}) => {
  const hasException = field.exception_msg && field.exception_msg.length > 0;

  return (
    <div className={`field-row ${hasException ? 'has-exception' : ''}`}>
      <label className="field-label" title={field.key}>
        {field.key_alias_name}
        {hasException && (
          <span className="exception-icon" title={field.exception_msg.map((e) => e.exception_msg).join(', ')}>
            <i className="fa fa-exclamation-triangle" style={{ color: '#f44336', marginLeft: '4px' }} />
          </span>
        )}
      </label>
      <div className="field-value">
        <FieldInput
          field={field}
          headerIndex={headerIndex}
          rowIndex={rowIndex}
          enableEdit={enableEdit}
          onFieldChange={onFieldChange}
        />
        <div className="field-actions">
          <button className="btn btn-xs" onClick={onFieldAudit} title="Field Audit">
            <i className="fa fa-history" />
          </button>
          {onBotCamp && (
            <button className="btn btn-xs" onClick={onBotCamp} title="Bot Camp">
              <i className="fa fa-graduation-cap" />
            </button>
          )}
        </div>
      </div>
      {hasException && (
        <div className="exception-messages">
          {field.exception_msg.map((exc, idx) => (
            <span key={idx} className="exception-msg">
              {exc.exception_msg}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Field Input (renders appropriate input based on type) ───
interface FieldInputProps {
  field: IXSDField;
  headerIndex: number;
  rowIndex: number;
  enableEdit: boolean;
  onFieldChange: (headerIndex: number, rowIndex: number, fieldKey: string, value: string) => void;
}

const FieldInput: React.FC<FieldInputProps> = ({
  field,
  headerIndex,
  rowIndex,
  enableEdit,
  onFieldChange,
}) => {
  const isEditable = enableEdit && !field.read_only;

  switch (field.input_type) {
    case 'options':
      return (
        <select
          className="field-select"
          value={field.value}
          disabled={!isEditable}
          onChange={(e) => onFieldChange(headerIndex, rowIndex, field.key, e.target.value)}
        >
          <option value="">-- Select --</option>
          {field.lookup_criteria.map((item) => (
            <option key={item.lookup_id} value={item.lookup_id}>
              {item.lookup_desc}
            </option>
          ))}
        </select>
      );

    case 'multiSelect':
      return (
        <select
          className="field-select"
          value={field.value}
          disabled={!isEditable}
          multiple
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions, (opt) => opt.value);
            onFieldChange(headerIndex, rowIndex, field.key, selectedOptions.join(','));
          }}
        >
          {field.lookup_criteria.map((item) => (
            <option key={item.lookup_id} value={item.lookup_id}>
              {item.lookup_desc}
            </option>
          ))}
        </select>
      );

    case 'date':
      return (
        <input
          type="date"
          className="field-input"
          value={field.value}
          disabled={!isEditable}
          onChange={(e) => onFieldChange(headerIndex, rowIndex, field.key, e.target.value)}
        />
      );

    case 'checkbox':
      return (
        <input
          type="checkbox"
          checked={field.value === 'true' || field.value === '1'}
          disabled={!isEditable}
          onChange={(e) =>
            onFieldChange(headerIndex, rowIndex, field.key, e.target.checked ? 'true' : 'false')
          }
        />
      );

    default:
      return (
        <input
          type="text"
          className="field-input"
          value={field.value}
          disabled={!isEditable}
          maxLength={field.valueMaxLength}
          onChange={(e) => onFieldChange(headerIndex, rowIndex, field.key, e.target.value)}
        />
      );
  }
};

// ─── Field Cell (Table view - compact input) ───
interface FieldCellProps {
  field: IXSDField;
  headerIndex: number;
  rowIndex: number;
  enableEdit: boolean;
  onFieldChange: (headerIndex: number, rowIndex: number, fieldKey: string, value: string) => void;
}

const FieldCell: React.FC<FieldCellProps> = ({
  field,
  headerIndex,
  rowIndex,
  enableEdit,
  onFieldChange,
}) => {
  const hasException = field.exception_msg && field.exception_msg.length > 0;
  const isEditable = enableEdit && !field.read_only;

  if (!isEditable) {
    return (
      <span className={hasException ? 'cell-exception' : ''} title={field.value}>
        {field.value}
        {hasException && <i className="fa fa-exclamation-triangle" style={{ color: '#f44336', marginLeft: '2px', fontSize: '10px' }} />}
      </span>
    );
  }

  if (field.input_type === 'options') {
    return (
      <select
        className="cell-select"
        value={field.value}
        onChange={(e) => onFieldChange(headerIndex, rowIndex, field.key, e.target.value)}
      >
        <option value="">--</option>
        {field.lookup_criteria.map((item) => (
          <option key={item.lookup_id} value={item.lookup_id}>
            {item.lookup_desc}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="text"
      className={`cell-input ${hasException ? 'cell-exception' : ''}`}
      value={field.value}
      maxLength={field.valueMaxLength}
      onChange={(e) => onFieldChange(headerIndex, rowIndex, field.key, e.target.value)}
    />
  );
};

export default IXSDDataGrid;
