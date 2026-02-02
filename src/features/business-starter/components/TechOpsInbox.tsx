/**
 * TechOps Inbox Component
 * Displays TechOps workflows with pagination
 * Origin: BusinessStarterPage.html - techops inbox section
 */
import React, { useState, useCallback, useMemo } from 'react';
import { useBusinessStarterState, usePagination } from '../hooks/useBusinessStarterState';
import { useLazyLoadTechopsInboxQuery } from '../api/businessStarterApi';
import { getPaginationLimits, parseTechOpsWorkflow } from '../services/BusinessStarterService';

interface TechOpsInboxProps {
  onBack: () => void;
}

export const TechOpsInbox: React.FC<TechOpsInboxProps> = ({ onBack }) => {
  const {
    techOpsWorkflows,
    techOpsPagination,
    noDataAvailableTechopsInbox,
    selectedTechopsBps,
    selectedCustomerId,
    handleSetTechOpsWorkflows,
    handleSetTechOpsPagination,
  } = useBusinessStarterState();

  const [loadTechopsInbox] = useLazyLoadTechopsInboxQuery();
  const [inputPage, setInputPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { currentPage, totalItems } = techOpsPagination;
  const { totalPages, getDisplayedPages } = usePagination(totalItems, itemsPerPage);

  const displayedPages = useMemo(() => {
    return getDisplayedPages(currentPage);
  }, [currentPage, getDisplayedPages]);

  const headers = [
    { sequenceOrder: 1, columnLabel: 'Ticket Status' },
    { sequenceOrder: 2, columnLabel: 'Activity Date' },
    { sequenceOrder: 3, columnLabel: 'Batch ID' },
    { sequenceOrder: 4, columnLabel: 'Transaction ID' },
    { sequenceOrder: 5, columnLabel: 'Document ID' },
    { sequenceOrder: 6, columnLabel: 'File Name' },
  ];

  // Load page
  const loadPage = useCallback(async (page: number) => {
    const { minLimit, maxLimit } = getPaginationLimits(page, itemsPerPage);

    try {
      const result = await loadTechopsInbox({
        customer_id: selectedCustomerId || '',
        bps_id: selectedTechopsBps || '',
        exceptiontype: 'ticket_for_devops',
        minlimit: minLimit,
        maxlimit: maxLimit,
      }).unwrap();

      const workflows = (result[0] || []).map(parseTechOpsWorkflow);
      const count = parseInt(result[1]?.[0]?.exceptionCount || '0', 10);

      handleSetTechOpsWorkflows(workflows);
      handleSetTechOpsPagination({ currentPage: page, totalItems: count });
    } catch (error) {
      console.error('Failed to load TechOps inbox:', error);
    }
  }, [selectedCustomerId, selectedTechopsBps, itemsPerPage, loadTechopsInbox, handleSetTechOpsWorkflows, handleSetTechOpsPagination]);

  // Pagination handlers
  const gotoPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadPage(page);
    }
  };

  const gotoFirstPage = () => gotoPage(1);
  const gotoLastPage = () => gotoPage(totalPages);
  const gotoPreviousPage = () => gotoPage(currentPage - 1);
  const gotoNextPage = () => gotoPage(currentPage + 1);

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    loadPage(1);
  };

  return (
    <div className="techops-inbox">
      {/* Header */}
      <div className="techops-header">
        <h4 className="techops-title">Techops Inbox</h4>
        <button className="btn-back" onClick={onBack}>
          <i className="fa fa-arrow-left" /> Back
        </button>
      </div>

      {/* Table */}
      <div className="tableCard">
        <table className="rec-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header.sequenceOrder}>{header.columnLabel}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {noDataAvailableTechopsInbox ? (
              <tr className="no-hover">
                <td colSpan={6} className="no-data-cell">
                  No Data Available
                </td>
              </tr>
            ) : (
              techOpsWorkflows.map((workflow, index) => (
                <tr key={index}>
                  <td>{workflow.workflow_status}</td>
                  <td>{workflow.queue_btime}</td>
                  <td>{workflow.uin}</td>
                  <td>{workflow.DIN}</td>
                  <td>{workflow.thisFiledemography?.uploadId || ''}</td>
                  <td>{workflow.extracted_file_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="pagination-container">
          {/* Entries per page */}
          <div className="entries-per-page">
            <strong>Show</strong>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="items-per-page-select"
            >
              {[5, 10, 25, 50, 100].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <strong>entries per page</strong>
          </div>

          {/* Go to page */}
          <div className="goto-page">
            <label>Go to page:</label>
            <input
              type="number"
              value={inputPage}
              onChange={(e) => setInputPage(Number(e.target.value))}
              min={1}
              max={totalPages}
              className="page-input"
            />
            <button
              className="btn-goto"
              onClick={() => gotoPage(inputPage)}
              disabled={inputPage < 1 || inputPage > totalPages}
            >
              Go
            </button>
          </div>

          {/* Page Navigation */}
          <nav className="pagination-nav">
            <ul className="pagination">
              <li><a href="#" onClick={gotoFirstPage}>Top</a></li>
              <li><a href="#" onClick={gotoPreviousPage}>&laquo;</a></li>
              {displayedPages.map((page) => (
                <li key={page} className={page === currentPage ? 'active' : ''}>
                  <a href="#" onClick={() => gotoPage(page)}>{page}</a>
                </li>
              ))}
              <li><a href="#" onClick={gotoNextPage}>&raquo;</a></li>
              <li><a href="#" onClick={gotoLastPage}>Bottom</a></li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default TechOpsInbox;
