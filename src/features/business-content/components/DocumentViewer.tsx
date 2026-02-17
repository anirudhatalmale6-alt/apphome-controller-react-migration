/**
 * Document Viewer Component
 * Displays document/image with page navigation
 * Origin: PDFLoadingPage.html - left panel (pdfImageView section)
 */
import React, { useState, useCallback } from 'react';

interface DocumentViewerProps {
  selectedMedia: string;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (pageNumber: number, filePath: string) => void;
  onDownloadSource: () => void;
  onGenerateExcel: () => void;
  filePath: string;
  isDownloading: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  selectedMedia,
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
  onDownloadSource,
  onGenerateExcel,
  filePath,
  isDownloading,
}) => {
  const [pageInput, setPageInput] = useState(String(currentPage));

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setPageInput(String(newPage));
      onPageChange(newPage, filePath);
    }
  }, [currentPage, filePath, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setPageInput(String(newPage));
      onPageChange(newPage, filePath);
    }
  }, [currentPage, totalPages, filePath, onPageChange]);

  const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  }, []);

  const handlePageInputBlur = useCallback(() => {
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page, filePath);
    } else {
      setPageInput(String(currentPage));
    }
  }, [pageInput, totalPages, currentPage, filePath, onPageChange]);

  const handlePageInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputBlur();
    }
  }, [handlePageInputBlur]);

  return (
    <div className="document-viewer">
      {/* Toolbar */}
      <div className="document-toolbar">
        <div className="page-navigation">
          <button
            className="btn btn-sm"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
            title="Previous Page"
          >
            <i className="fa fa-chevron-left" />
          </button>

          <span className="page-info">
            <input
              type="text"
              className="page-input"
              value={pageInput}
              onChange={handlePageInputChange}
              onBlur={handlePageInputBlur}
              onKeyDown={handlePageInputKeyDown}
              style={{ width: '40px', textAlign: 'center' }}
            />
            <span> / {totalPages}</span>
          </span>

          <button
            className="btn btn-sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
            title="Next Page"
          >
            <i className="fa fa-chevron-right" />
          </button>
        </div>

        <div className="document-actions">
          <button
            className="btn btn-sm"
            onClick={onDownloadSource}
            disabled={isDownloading}
            title="Download Source File"
          >
            <i className="fa fa-download" />
            {isDownloading ? ' Downloading...' : ' Download'}
          </button>
          <button
            className="btn btn-sm"
            onClick={onGenerateExcel}
            disabled={isDownloading}
            title="Export to Excel"
          >
            <i className="fa fa-file-excel-o" />
            {' Excel'}
          </button>
        </div>
      </div>

      {/* Document Display */}
      <div className="document-content">
        {isLoading ? (
          <div className="document-loading">
            <i className="fa fa-spinner fa-spin fa-3x" />
            <p>Loading document...</p>
          </div>
        ) : selectedMedia ? (
          <img
            src={selectedMedia}
            alt="Document"
            className="document-image"
            style={{ width: '100%', height: 'auto' }}
          />
        ) : (
          <div className="no-document">
            <i className="fa fa-file-o fa-3x" />
            <p>No document available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
