/**
 * Apps Upload View Component
 * File upload functionality
 * Origin: UploadViews.html
 */
import React, { useState, useRef } from 'react';
import { useBusinessAppsState } from '../hooks/useBusinessAppsState';

export const AppsUploadView: React.FC = () => {
  useBusinessAppsState(); // Hook for potential state updates
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="apps-upload-view">
      <h4 className="upload-title">Upload Documents</h4>

      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        <div className="drop-zone-content">
          <i className="fa fa-cloud-upload upload-icon" />
          <p>Drag and drop files here</p>
          <p className="or-text">or</p>
          <button className="btn-browse" onClick={handleButtonClick}>
            Browse Files
          </button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <span>Selected Files ({files.length})</span>
            <span>Total Size: {formatFileSize(totalSize)}</span>
          </div>

          <table className="file-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Size</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>{file.type || 'Unknown'}</td>
                  <td>
                    <button
                      className="btn-remove"
                      onClick={() => removeFile(index)}
                    >
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="file-list-actions">
            <button className="btn-clear" onClick={() => setFiles([])}>
              Clear All
            </button>
            <button className="btn-upload" disabled={files.length === 0}>
              <i className="fa fa-upload" /> Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppsUploadView;
