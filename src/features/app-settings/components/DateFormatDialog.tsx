/**
 * Date Format Dialog
 * Modal for selecting date format
 * Origin: SelectDateFormatPage.html + DateFormatDialogController
 */
import React from 'react';
import type { DateFormatItem } from '../types/AppSettingsTypes';

interface DateFormatDialogProps {
  dateFormats: DateFormatItem[];
  selectedFormat: string;
  onSelect: (format: string) => void;
  onClose: () => void;
}

export const DateFormatDialog: React.FC<DateFormatDialogProps> = ({
  dateFormats,
  selectedFormat,
  onSelect,
  onClose,
}) => {
  const [selected, setSelected] = React.useState(selectedFormat);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, minWidth: 350, maxWidth: 500, maxHeight: '80vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 15px' }}>Select Date Format</h3>

        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {dateFormats.length === 0 ? (
            <p style={{ color: '#666' }}>Loading formats...</p>
          ) : (
            dateFormats.map((fmt, idx) => {
              const formatStr = fmt.format || (fmt as any);
              return (
                <div
                  key={idx}
                  onClick={() => setSelected(typeof formatStr === 'string' ? formatStr : String(formatStr))}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    background: selected === formatStr ? '#e3f2fd' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <input
                    type="radio"
                    checked={selected === formatStr}
                    onChange={() => setSelected(typeof formatStr === 'string' ? formatStr : String(formatStr))}
                  />
                  <span>{typeof formatStr === 'string' ? formatStr : JSON.stringify(formatStr)}</span>
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 15 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={() => onSelect(selected)} style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Select
          </button>
        </div>
      </div>
    </div>
  );
};
