import { useCallback } from 'react';
import { useBusinessAppsState } from '../hooks/useBusinessAppsState';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
];

export function AppsUploadView() {
  const {
    attachments,
    totalUploadSize,
    handleAddAttachment,
    handleRemoveAttachment,
    handleClearAttachments,
  } = useBusinessAppsState();

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`File "${file.name}" exceeds maximum size of 10MB`);
          return;
        }
        if (totalUploadSize + file.size > MAX_TOTAL_SIZE) {
          alert('Total upload size exceeds 50MB limit');
          return;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert(`File type "${file.type}" is not allowed`);
          return;
        }
        handleAddAttachment(file);
      });
    },
    [handleAddAttachment, totalUploadSize]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`File "${file.name}" exceeds maximum size of 10MB`);
          return;
        }
        if (totalUploadSize + file.size > MAX_TOTAL_SIZE) {
          alert('Total upload size exceeds 50MB limit');
          return;
        }
        handleAddAttachment(file);
      });
      e.target.value = '';
    },
    [handleAddAttachment, totalUploadSize]
  );

  const handleUpload = async () => {
    if (attachments.length === 0) {
      alert('Please select files to upload');
      return;
    }
    // Upload logic would go here
    alert('Upload functionality to be implemented with API');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-4">
      <h3 className="text-lg font-semibold mb-4">Upload Files</h3>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileSelect}
          accept={ALLOWED_TYPES.join(',')}
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-gray-600 mb-2">
            <span className="text-blue-500 font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-gray-400">
            PDF, PNG, JPG, GIF, Excel, CSV (max 10MB per file, 50MB total)
          </p>
        </label>
      </div>

      {/* File List */}
      {attachments.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700">
              Selected Files ({attachments.length})
            </h4>
            <button
              onClick={handleClearAttachments}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAttachment(attachment.name)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Total Size */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Total size: {formatFileSize(totalUploadSize)} / {formatFileSize(MAX_TOTAL_SIZE)}
            </span>
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Upload Files
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
