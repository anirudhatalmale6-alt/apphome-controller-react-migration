/**
 * Filter By Exception Component
 * Right sidebar panel for filtering and viewing exceptions
 * Origin: FilterByException.html
 */
import React, { useState, useCallback } from 'react';

export interface FilteredException {
  exception_desc: string;
  exception_count: number;
  isSelected: boolean;
  showFieldException: boolean;
  field_list: FilteredFieldItem[];
}

export interface FilteredFieldItem {
  complexTypeLabel: string;
  exception_count: number;
  isSelected: boolean;
}

interface FilterByExceptionProps {
  filteredException: FilteredException[];
  isOpen: boolean;
  onClose: () => void;
  onFilterTabs: (selected: FilteredException[]) => void;
  onRemoveFilter: () => void;
  onNotifyException: (exceptionDesc: string) => void;
}

export const FilterByException: React.FC<FilterByExceptionProps> = ({
  filteredException,
  isOpen,
  onClose,
  onFilterTabs,
  onRemoveFilter,
  onNotifyException,
}) => {
  const [localExceptions, setLocalExceptions] = useState<FilteredException[]>(filteredException);

  // Sync local state when props change
  React.useEffect(() => {
    setLocalExceptions(filteredException);
  }, [filteredException]);

  const toggleExceptionSelection = useCallback((index: number) => {
    setLocalExceptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isSelected: !updated[index].isSelected };
      return updated;
    });
  }, []);

  const toggleFieldException = useCallback((index: number) => {
    setLocalExceptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], showFieldException: !updated[index].showFieldException };
      return updated;
    });
  }, []);

  const toggleFieldItemSelection = useCallback((exceptionIndex: number, fieldIndex: number) => {
    setLocalExceptions((prev) => {
      const updated = [...prev];
      const fieldList = [...updated[exceptionIndex].field_list];
      fieldList[fieldIndex] = { ...fieldList[fieldIndex], isSelected: !fieldList[fieldIndex].isSelected };
      updated[exceptionIndex] = { ...updated[exceptionIndex], field_list: fieldList };
      return updated;
    });
  }, []);

  const isAnySelected = localExceptions.some((e) => e.isSelected);

  if (!isOpen || filteredException.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', right: 0, top: '115px', width: '450px', maxHeight: '500px',
      backgroundColor: 'white', boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
      zIndex: 200, overflowY: 'auto', borderLeft: '1px solid #ddd',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#265a88', color: 'white', padding: '10px 12px',
      }}>
        <strong>Exception List</strong>
        <span className="fa fa-close" style={{ cursor: 'pointer', color: 'white' }} onClick={onClose} />
      </div>

      {/* Exception List */}
      <div style={{ padding: '8px' }}>
        {/* Header Row */}
        <div style={{ display: 'flex', padding: '4px 8px', borderBottom: '1px solid #eee', fontWeight: 'bold', fontSize: '12px' }}>
          <div style={{ flex: '0 0 10%' }}></div>
          <div style={{ flex: '0 0 60%' }}>Exception Type</div>
          <div style={{ flex: '0 0 15%', textAlign: 'center' }}>Count</div>
          <div style={{ flex: '0 0 15%', textAlign: 'center' }}></div>
        </div>

        {/* Exception Rows */}
        {localExceptions.map((exception, idx) => (
          <div key={idx}>
            <div
              style={{
                display: 'flex', alignItems: 'center', padding: '6px 8px',
                borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
              }}
              onClick={() => toggleFieldException(idx)}
            >
              <div style={{ flex: '0 0 10%' }}>
                <input
                  type="checkbox"
                  checked={exception.isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleExceptionSelection(idx);
                  }}
                />
              </div>
              <div style={{ flex: '0 0 60%', fontSize: '12px' }}>
                {exception.exception_desc}
              </div>
              <div style={{ flex: '0 0 15%', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                {exception.exception_count}
              </div>
              <div style={{ flex: '0 0 15%', textAlign: 'center' }}>
                <span
                  className="fa fa-reply"
                  style={{ cursor: 'pointer', color: '#337ab7' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNotifyException(exception.exception_desc);
                  }}
                  title="Send Notification"
                />
              </div>
            </div>

            {/* Field items (expandable) */}
            {exception.showFieldException && exception.field_list.map((fieldItem, fIdx) => (
              <div key={fIdx} style={{
                display: 'flex', alignItems: 'center', padding: '4px 8px 4px 32px',
                backgroundColor: '#fafafa', borderBottom: '1px solid #f5f5f5',
              }}>
                <div style={{ flex: '0 0 10%' }}>
                  <input
                    type="checkbox"
                    checked={fieldItem.isSelected}
                    onChange={() => toggleFieldItemSelection(idx, fIdx)}
                  />
                </div>
                <div style={{ flex: '0 0 60%', fontSize: '11px' }}>
                  {fieldItem.complexTypeLabel}
                </div>
                <div style={{ flex: '0 0 15%', textAlign: 'center', fontSize: '11px' }}>
                  {fieldItem.exception_count}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 8px' }}>
          <button className="btn btn-sm btn-default" onClick={onRemoveFilter}>
            Remove Filter
          </button>
          <button
            className="btn btn-sm btn-primary"
            disabled={!isAnySelected}
            onClick={() => onFilterTabs(localExceptions.filter((e) => e.isSelected))}
          >
            Filter Tabs
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterByException;
