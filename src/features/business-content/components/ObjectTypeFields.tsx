/**
 * Object Type Fields Component
 * Renders individual form fields with support for all input types
 * Origin: ObjectTypeFields.html
 *
 * Input types: text, textarea, date, currency, decimal, options,
 *              boolean, booleanButton, checkbox
 */
import React, { useState, useCallback } from 'react';
import type { IXSDField, LookupItem } from '../types/BusinessContentTypes';

interface ObjectTypeFieldsProps {
  fields: IXSDField[];
  headerLabel: string;
  enableEdit: boolean;
  currentStatus: string;
  onFieldChange: (fieldKey: string, value: string) => void;
  onFieldAudit: (field: IXSDField) => void;
  onViewDataPosition?: (field: IXSDField) => void;
  onBotCamp?: (field: IXSDField) => void;
}

export const ObjectTypeFields: React.FC<ObjectTypeFieldsProps> = ({
  fields,
  headerLabel,
  enableEdit,
  currentStatus,
  onFieldChange,
  onFieldAudit,
  onViewDataPosition,
  onBotCamp,
}) => {
  const visibleFields = fields.filter((f) =>
    f.visible_status !== false && f.key !== 'itemState' && f.key !== 'hasDuplicated'
  );

  return (
    <table className="table" style={{ marginTop: '-5px', marginBottom: '12dvh' }}>
      <tbody>
        {visibleFields.map((field) => (
          <tr key={field.key}>
            <td style={{ borderTop: 'none' }}>
              {field.input_type === 'checkbox' ? (
                <CheckboxField
                  field={field}
                  enableEdit={enableEdit}
                  currentStatus={currentStatus}
                  headerLabel={headerLabel}
                  onFieldChange={onFieldChange}
                  onFieldAudit={onFieldAudit}
                />
              ) : field.input_type === 'booleanButton' ? (
                <BooleanButtonField
                  field={field}
                  onFieldChange={onFieldChange}
                />
              ) : (
                <StandardField
                  field={field}
                  enableEdit={enableEdit}
                  currentStatus={currentStatus}
                  headerLabel={headerLabel}
                  onFieldChange={onFieldChange}
                  onFieldAudit={onFieldAudit}
                  onViewDataPosition={onViewDataPosition}
                  onBotCamp={onBotCamp}
                />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ─── Standard Field (text, textarea, date, currency, decimal, options, boolean) ───
interface StandardFieldProps {
  field: IXSDField;
  enableEdit: boolean;
  currentStatus: string;
  headerLabel: string;
  onFieldChange: (fieldKey: string, value: string) => void;
  onFieldAudit: (field: IXSDField) => void;
  onViewDataPosition?: (field: IXSDField) => void;
  onBotCamp?: (field: IXSDField) => void;
}

const StandardField: React.FC<StandardFieldProps> = ({
  field,
  enableEdit,
  currentStatus,
  headerLabel,
  onFieldChange,
  onFieldAudit,
  onViewDataPosition,
}) => {
  const hasExceptions = field.exception_msg && field.exception_msg.length > 0;
  const [showExceptions, setShowExceptions] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {/* Label column (40%) */}
      <div style={{ flex: '0 0 40%', paddingRight: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Audit history icon */}
          {enableEdit && currentStatus !== 'validation' && (
            <span
              className="fa fa-history"
              style={{ cursor: 'pointer', color: '#337ab7', fontSize: '12px' }}
              onClick={() => onFieldAudit(field)}
              title="Field Audit"
            />
          )}

          {/* Field label */}
          {hasExceptions ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <strong
                style={{ cursor: 'pointer', color: '#333' }}
                onMouseEnter={() => { setShowExceptions(true); onViewDataPosition?.(field); }}
                onMouseLeave={() => setShowExceptions(false)}
              >
                {field.key_alias_name}
                {field.required && <i className="fa fa-asterisk" style={{ color: 'red', fontSize: '8px', marginLeft: '2px' }} />}
              </strong>
              {showExceptions && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, zIndex: 1000,
                  backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)', padding: '8px', minWidth: '200px',
                }}>
                  {field.exception_msg.map((exc, idx) => (
                    <div key={idx} style={{ padding: '2px 0', fontSize: '12px' }}>
                      <i className="fa fa-info-circle"
                        style={{ color: exc.exception_type === 'error' ? 'red' : 'darkorange', marginRight: '4px' }} />
                      {typeof exc === 'string' ? exc : exc.exception_msg}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <strong
              style={{ cursor: 'default' }}
              onMouseEnter={() => onViewDataPosition?.(field)}
            >
              {field.key_alias_name}
              {field.required && <i className="fa fa-asterisk" style={{ color: 'orangered', fontSize: '8px', marginLeft: '2px' }} />}
            </strong>
          )}
        </div>
      </div>

      {/* Value column (60%) */}
      <div style={{ flex: '0 0 60%' }}>
        <FieldInput
          field={field}
          enableEdit={enableEdit}
          onFieldChange={onFieldChange}
          onViewDataPosition={onViewDataPosition}
          hasExceptions={hasExceptions}
        />
        {field.key_hint && (
          <strong style={{ color: 'orangered', fontSize: '11px' }}>{field.key_hint}</strong>
        )}
      </div>
    </div>
  );
};

// ─── Field Input (renders appropriate input based on type) ───
interface FieldInputProps {
  field: IXSDField;
  enableEdit: boolean;
  onFieldChange: (fieldKey: string, value: string) => void;
  onViewDataPosition?: (field: IXSDField) => void;
  hasExceptions: boolean;
}

const FieldInput: React.FC<FieldInputProps> = ({
  field,
  enableEdit,
  onFieldChange,
  onViewDataPosition,
  hasExceptions,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const isEditable = enableEdit && !field.read_only;

  const borderStyle = hasExceptions
    ? { borderBottom: '2px solid red' }
    : field.isExtractedDataChanged
    ? { borderBottom: '2px solid orange' }
    : {};

  switch (field.input_type) {
    case 'boolean':
      return (
        <label style={{ display: 'flex', alignItems: 'center', cursor: isEditable ? 'pointer' : 'default' }}>
          <input
            type="checkbox"
            checked={field.value === 'true' || field.value === '1' || field.value === true}
            disabled={!isEditable}
            onChange={(e) => onFieldChange(field.key, e.target.checked ? 'true' : 'false')}
            style={{ marginRight: '8px' }}
          />
          <span>{field.value === 'true' || field.value === '1' ? 'Yes' : 'No'}</span>
        </label>
      );

    case 'textarea':
      return (
        <textarea
          className="input-md text-small"
          value={field.value || ''}
          readOnly={!isEditable}
          rows={3}
          onChange={(e) => onFieldChange(field.key, e.target.value)}
          onFocus={() => onViewDataPosition?.(field)}
          autoComplete="off"
          style={{ width: '100%', ...borderStyle }}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          className="input-md text-small"
          value={field.value || ''}
          readOnly={!isEditable}
          onChange={(e) => onFieldChange(field.key, e.target.value)}
          onFocus={() => onViewDataPosition?.(field)}
          autoComplete="off"
          style={{ width: '100%', ...borderStyle }}
        />
      );

    case 'currency':
    case 'decimal':
      return (
        <input
          type="text"
          className="input-md text-small"
          value={field.value || ''}
          readOnly={!isEditable}
          onChange={(e) => {
            // Allow only numbers, decimal point, minus sign
            const val = e.target.value.replace(/[^0-9.\-]/g, '');
            onFieldChange(field.key, val);
          }}
          onFocus={() => onViewDataPosition?.(field)}
          autoComplete="off"
          style={{ width: '100%', ...borderStyle }}
        />
      );

    case 'options':
      return (
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="input-md text-small"
            value={field.value || ''}
            readOnly={!isEditable}
            autoComplete="off"
            onChange={(e) => {
              onFieldChange(field.key, e.target.value);
              setShowOptions(true);
            }}
            onFocus={() => {
              setShowOptions(true);
              onViewDataPosition?.(field);
            }}
            onBlur={() => setTimeout(() => setShowOptions(false), 200)}
            style={{ width: '100%', ...borderStyle }}
          />
          {showOptions && isEditable && field.lookup_criteria && field.lookup_criteria.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, zIndex: 1000,
              backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)', maxHeight: '200px', overflowY: 'auto',
              width: '250px',
            }}>
              {field.lookup_criteria
                .filter((item) =>
                  !field.value ||
                  (item.lookup_desc || item.lookup_search_desc || '')
                    .toLowerCase()
                    .includes((field.value || '').toLowerCase())
                )
                .map((item) => (
                  <div
                    key={item.lookup_id}
                    style={{ padding: '6px 12px', cursor: 'pointer' }}
                    className="hover:bg-gray-100"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onFieldChange(field.key, item.lookup_id);
                      setShowOptions(false);
                    }}
                  >
                    {item.lookup_search_desc || item.lookup_desc}
                  </div>
                ))}
              {field.lookup_criteria.length === 0 && (
                <div style={{ padding: '8px 12px' }}>
                  <strong className="text-info">
                    <i className="fa fa-info-circle" /> No Lookup Information Is Available!
                  </strong>
                </div>
              )}
            </div>
          )}
        </div>
      );

    case 'text':
    default:
      // Check if value is a URL
      const isLink = typeof field.value === 'string' && field.value.startsWith('https://');
      return (
        <input
          type="text"
          className="input-md text-small"
          value={field.value || ''}
          readOnly={!isEditable}
          maxLength={field.valueMaxLength}
          onChange={(e) => onFieldChange(field.key, e.target.value)}
          onClick={isLink ? () => window.open(field.value, '_blank') : undefined}
          onFocus={() => onViewDataPosition?.(field)}
          autoComplete="off"
          style={{
            width: '100%',
            ...(isLink ? { color: '#337ab7', textDecoration: 'underline', cursor: 'pointer' } : {}),
            ...borderStyle,
          }}
        />
      );
  }
};

// ─── Checkbox Field ───
interface CheckboxFieldProps {
  field: IXSDField;
  enableEdit: boolean;
  currentStatus: string;
  headerLabel: string;
  onFieldChange: (fieldKey: string, value: string) => void;
  onFieldAudit: (field: IXSDField) => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  field,
  enableEdit,
  currentStatus,
  headerLabel,
  onFieldChange,
  onFieldAudit,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '-15px' }}>
      {enableEdit && currentStatus !== 'validation' && (
        <span
          className="fa fa-history"
          style={{ cursor: 'pointer', color: '#337ab7', fontSize: '10px', marginRight: '8px' }}
          onClick={() => onFieldAudit(field)}
        />
      )}
      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: '35px' }}>
        <input
          type="checkbox"
          checked={field.value === 'true' || field.value === '1' || field.value === true}
          onChange={(e) => onFieldChange(field.key, e.target.checked ? 'true' : 'false')}
          style={{ marginRight: '8px' }}
        />
        <strong style={{ color: field.value ? 'inherit' : 'red' }}>
          {field.key_alias_name}
        </strong>
      </label>
    </div>
  );
};

// ─── Boolean Button Field ───
interface BooleanButtonFieldProps {
  field: IXSDField;
  onFieldChange: (fieldKey: string, value: string) => void;
}

const BooleanButtonField: React.FC<BooleanButtonFieldProps> = ({ field, onFieldChange }) => {
  // booleanButton has value as {label: boolean, label2: boolean, ...}
  const valueObj = typeof field.value === 'object' && field.value !== null ? field.value : {};

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginLeft: '30px', marginTop: '20px', gap: '4px' }}>
      {Object.entries(valueObj).map(([label, isActive]) => (
        <button
          key={label}
          className="btn btn-sm"
          style={{ border: '2px solid slategray', minWidth: '60px' }}
          onClick={() => {
            const updated = { ...valueObj, [label]: !isActive };
            onFieldChange(field.key, JSON.stringify(updated));
          }}
        >
          {isActive ? (
            <strong className="fa fa-close fa-2x" style={{ color: 'red' }} />
          ) : (
            <strong>{label}</strong>
          )}
        </button>
      ))}
    </div>
  );
};

export default ObjectTypeFields;
