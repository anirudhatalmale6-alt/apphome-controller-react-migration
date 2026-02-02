/**
 * Pagination Component
 * Reusable pagination for workflow tables
 * Origin: Pagination in Apps views
 */
import React, { useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage) || 1;
  }, [totalItems, itemsPerPage]);

  const displayedPages = useMemo(() => {
    const maxDisplay = 5;
    const start = Math.max(1, currentPage - Math.floor(maxDisplay / 2));
    const end = Math.min(totalPages, start + maxDisplay - 1);

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  const itemsPerPageOptions = [5, 10, 20, 50];

  return (
    <div className="pagination-container">
      {/* Items per page */}
      <div className="items-per-page">
        <span>Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span>entries per page</span>
      </div>

      {/* Page info */}
      <div className="page-info">
        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
      </div>

      {/* Page navigation */}
      <nav className="page-nav">
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          First
        </button>
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &laquo;
        </button>

        {displayedPages.map((page) => (
          <button
            key={page}
            className={`page-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          &raquo;
        </button>
        <button
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          Last
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
