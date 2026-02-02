/**
 * Apps Custom View Component
 * Displays workflows within a custom date range
 * Origin: AppsCustomViews.html
 */
import React, { useState } from 'react';
import { useBusinessAppsState } from '../hooks/useBusinessAppsState';
import { WorkflowTable } from './WorkflowTable';
import { SearchBar } from './SearchBar';
import { Pagination } from './Pagination';

export const AppsCustomView: React.FC = () => {
  const {
    workflows,
    noDataAvailableCustom,
    searchByAll,
    isSearchEnable,
    pagination,
    totalItemsAppsCustom,
    dateRange,
    handleSearch,
    handlePageChange,
    handleItemsPerPageChange,
    handlePerformAction,
  } = useBusinessAppsState();

  const [searchText, setSearchText] = useState('');
  const [selectedSearchField, setSelectedSearchField] = useState<string>('');
  const [startDate, setStartDate] = useState(dateRange.startDate);
  const [startTime, setStartTime] = useState(dateRange.startTime);
  const [endDate, setEndDate] = useState(dateRange.endDate);
  const [endTime, setEndTime] = useState(dateRange.endTime);

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      handleSearch(searchText);
    }
  };

  const handleDateRangeSubmit = () => {
    // Trigger custom date range search
    console.log('Date range:', { startDate, startTime, endDate, endTime });
  };

  return (
    <div className="apps-custom-view">
      {/* Date Range Selector */}
      <div className="date-range-selector">
        <div className="date-range-group">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            step="1"
          />
        </div>

        <div className="date-range-group">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            step="1"
          />
        </div>

        <button className="btn-submit-date" onClick={handleDateRangeSubmit}>
          <i className="fa fa-search" /> Search
        </button>
      </div>

      {/* Search Bar */}
      <SearchBar
        searchFields={searchByAll}
        selectedField={selectedSearchField}
        searchText={searchText}
        onFieldChange={setSelectedSearchField}
        onSearchTextChange={setSearchText}
        onSearch={handleSearchSubmit}
      />

      {/* Workflow Table */}
      {noDataAvailableCustom ? (
        <div className="no-data-message">
          <i className="fa fa-info-circle" />
          <span>No Data Available</span>
        </div>
      ) : (
        <>
          <WorkflowTable
            workflows={workflows}
            onRowClick={handlePerformAction}
          />

          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={isSearchEnable ? workflows.length : totalItemsAppsCustom}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}
    </div>
  );
};

export default AppsCustomView;
