/**
 * Form Audit Component
 * Split-screen version comparison overlay
 * Origin: FormAudit.html
 *
 * Compares two versions of form data side-by-side with
 * version selection controls and field-level diff highlighting
 */
import React, { useState, useCallback, useEffect } from 'react';
import type { IXSDDataHeader, IXSDField, VersionAuthorInfo } from '../types/BusinessContentTypes';

interface FormAuditProps {
  isOpen: boolean;
  isLoading: boolean;
  maxVersion: number;

  // Version 1 (left pane)
  version1Headers: IXSDDataHeader[];
  version1AuthorInfo: VersionAuthorInfo | null;

  // Version 2 (right pane)
  version2Headers: IXSDDataHeader[];
  version2AuthorInfo: VersionAuthorInfo | null;

  // Callbacks
  onSearchVersions: (minVersion: number, maxVersion: number) => void;
  onClose: () => void;
  onDownloadVersion?: (versionInfo: VersionAuthorInfo) => void;
}

export const FormAudit: React.FC<FormAuditProps> = ({
  isOpen,
  isLoading,
  maxVersion,
  version1Headers,
  version1AuthorInfo,
  version2Headers,
  version2AuthorInfo,
  onSearchVersions,
  onClose,
  onDownloadVersion,
}) => {
  const [minVer, setMinVer] = useState(1);
  const [maxVer, setMaxVer] = useState(maxVersion || 2);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showAuthorInfo, setShowAuthorInfo] = useState(false);

  useEffect(() => {
    if (maxVersion) {
      setMaxVer(maxVersion);
      setMinVer(Math.max(1, maxVersion - 1));
    }
  }, [maxVersion]);

  const handleVersionUp = useCallback((which: 'min' | 'max') => {
    if (which === 'min' && minVer < maxVer - 1) {
      setMinVer(minVer + 1);
    } else if (which === 'max' && maxVer < maxVersion) {
      setMaxVer(maxVer + 1);
    }
  }, [minVer, maxVer, maxVersion]);

  const handleVersionDown = useCallback((which: 'min' | 'max') => {
    if (which === 'min' && minVer > 1) {
      setMinVer(minVer - 1);
    } else if (which === 'max' && maxVer > minVer + 1) {
      setMaxVer(maxVer - 1);
    }
  }, [minVer, maxVer]);

  const handleSearch = useCallback(() => {
    onSearchVersions(minVer, maxVer);
  }, [minVer, maxVer, onSearchVersions]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'white', zIndex: 300, overflowY: 'auto',
    }}>
      {/* Loading state */}
      {isLoading ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh',
        }}>
          <div className="fa fa-spinner fa-spin fa-3x" style={{ color: '#337ab7' }} />
          <p style={{ marginTop: '20px' }}>Loading audit data...</p>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', padding: '8px 16px',
            borderBottom: '2px solid #337ab7', backgroundColor: '#f8f8f8',
            marginTop: '50px',
          }}>
            {/* Version 1 info */}
            <div style={{ flex: '0 0 40%' }}>
              <strong>Form Audit</strong>
              {version1AuthorInfo && (
                <span style={{ marginLeft: '12px', fontSize: '12px', color: '#666' }}>
                  v{minVer} by {version1AuthorInfo.user_name || 'System'}
                  {version1AuthorInfo.queue_time && ` (${version1AuthorInfo.queue_time})`}
                </span>
              )}
              {version1AuthorInfo?.showdownloads && onDownloadVersion && (
                <button className="btn btn-xs" style={{ marginLeft: '8px' }}
                  onClick={() => onDownloadVersion(version1AuthorInfo)}>
                  <i className="fa fa-download" />
                </button>
              )}
            </div>

            {/* Version selector */}
            <div style={{ flex: '0 0 20%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="fa fa-chevron-up" style={{ cursor: 'pointer', fontSize: '10px' }}
                  onClick={() => handleVersionUp('min')} />
                <strong>{minVer}</strong>
                <span className="fa fa-chevron-down" style={{ cursor: 'pointer', fontSize: '10px' }}
                  onClick={() => handleVersionDown('min')} />
              </div>
              <span>vs</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="fa fa-chevron-up" style={{ cursor: 'pointer', fontSize: '10px' }}
                  onClick={() => handleVersionUp('max')} />
                <strong>{maxVer}</strong>
                <span className="fa fa-chevron-down" style={{ cursor: 'pointer', fontSize: '10px' }}
                  onClick={() => handleVersionDown('max')} />
              </div>
              <button className="btn btn-xs btn-primary" onClick={handleSearch} title="Compare versions">
                <i className="fa fa-search" />
              </button>
            </div>

            {/* Version 2 info + Close */}
            <div style={{ flex: '0 0 40%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
              {version2AuthorInfo && (
                <span style={{ fontSize: '12px', color: '#666' }}>
                  v{maxVer} by {version2AuthorInfo.user_name || 'System'}
                  {version2AuthorInfo.queue_time && ` (${version2AuthorInfo.queue_time})`}
                </span>
              )}
              {version2AuthorInfo?.showdownloads && onDownloadVersion && (
                <button className="btn btn-xs"
                  onClick={() => onDownloadVersion(version2AuthorInfo)}>
                  <i className="fa fa-download" />
                </button>
              )}
              <button className="btn btn-sm btn-danger" onClick={onClose}>
                <i className="fa fa-times" /> Close
              </button>
            </div>
          </div>

          {/* Tab Headers */}
          <div style={{ display: 'flex', borderBottom: '1px solid #ddd', padding: '0 16px' }}>
            {(version1Headers.length > 0 ? version1Headers : version2Headers).map((header, idx) => (
              <button
                key={header.header_name}
                style={{
                  padding: '8px 16px', border: 'none', backgroundColor: 'transparent',
                  borderBottom: idx === activeTabIndex ? '3px solid #337ab7' : 'none',
                  fontWeight: idx === activeTabIndex ? 'bold' : 'normal',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveTabIndex(idx)}
              >
                {header.label}
              </button>
            ))}
          </div>

          {/* Split comparison view */}
          <div style={{ display: 'flex', height: '550px', overflowY: 'auto' }}>
            {/* Left pane - Version 1 */}
            <div style={{ flex: '0 0 50%', borderRight: '2px solid #337ab7', padding: '8px', overflowY: 'auto' }}>
              <AuditPane
                headers={version1Headers}
                activeTabIndex={activeTabIndex}
                side="left"
              />
            </div>

            {/* Right pane - Version 2 */}
            <div style={{ flex: '0 0 50%', padding: '8px', overflowY: 'auto' }}>
              <AuditPane
                headers={version2Headers}
                activeTabIndex={activeTabIndex}
                side="right"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Audit Pane (renders one side of the comparison) ───
interface AuditPaneProps {
  headers: IXSDDataHeader[];
  activeTabIndex: number;
  side: 'left' | 'right';
}

const AuditPane: React.FC<AuditPaneProps> = ({ headers, activeTabIndex, side }) => {
  const header = headers[activeTabIndex];
  if (!header) {
    return <div style={{ padding: '16px', color: '#999' }}>No data for this version</div>;
  }

  if (header.view_style === 'object') {
    // Object view - single record
    const fields = header.ixsd_fields[0] || [];
    return (
      <table className="table" style={{ fontSize: '12px' }}>
        <tbody>
          {fields
            .filter((f) => f.visible_status !== false && f.key !== 'itemState')
            .map((field) => (
              <tr key={field.key} style={{
                backgroundColor: field.editedStatus ? '#fff9c4' : 'transparent',
              }}>
                <td style={{ fontWeight: 'bold', width: '40%', padding: '4px 8px' }}>
                  {field.key_alias_name}
                </td>
                <td style={{ padding: '4px 8px' }}>
                  {renderAuditFieldValue(field)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  }

  // Array view - table with line items
  const firstRow = header.ixsd_fields[0] || [];
  const columns = firstRow.filter((f) => f.visible_status !== false && f.key !== 'itemState' && f.key !== 'hasDuplicated');

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table" style={{ fontSize: '11px' }}>
        <thead>
          <tr>
            <th style={{ padding: '4px 6px' }}>#</th>
            {columns.map((col) => (
              <th key={col.key} style={{ padding: '4px 6px' }}>{col.key_alias_name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {header.ixsd_fields.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <td style={{ padding: '4px 6px' }}>{rowIdx + 1}</td>
              {columns.map((col) => {
                const field = row.find((f) => f.key === col.key);
                return (
                  <td key={col.key} style={{
                    padding: '4px 6px',
                    backgroundColor: field?.editedStatus ? '#fff9c4' : 'transparent',
                  }}>
                    {field ? renderAuditFieldValue(field) : '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function renderAuditFieldValue(field: IXSDField): React.ReactNode {
  if (field.input_type === 'booleanButton' && typeof field.value === 'object') {
    return Object.entries(field.value).map(([label, val]) => (
      <span key={label} style={{
        display: 'inline-block', margin: '2px', padding: '2px 6px',
        border: '1px solid #ccc', borderRadius: '4px',
        backgroundColor: val ? '#ffcdd2' : 'transparent',
      }}>
        {val ? 'X' : label}
      </span>
    ));
  }

  // Truncate long values
  const value = String(field.value || '');
  if (field.valueMaxLength && value.length > 100) {
    return <span title={value}>{value.substring(0, 100)}...</span>;
  }
  return value;
}

export default FormAudit;
