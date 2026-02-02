/**
 * Apps Recent View Component
 * Displays recent workflows
 * Origin: AppsRecentViews.html
 */
import React, { useState } from 'react';
import { useBusinessAppsState } from '../hooks/useBusinessAppsState';
import { WorkflowTable } from './WorkflowTable';
import { SearchBar } from './SearchBar';
import { Pagination } from './Pagination';

export const AppsRecentView: React.FC = () => {
  const {
    workflows,
    noDataAvailableRecent,
    searchByAll,
    isSearchEnable,
    pagination,
    totalItemsAppsRecents,
    handleSearch,
    handlePageChange,
    handleItemsPerPageChange,
    handlePerformAction,
  } = useBusinessAppsState();

  const [searchText, setSearchText] = useState('');
  const [selectedSearchField, setSelectedSearchField] = useState<string>('');

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      handleSearch(searchText);
    }
  };

  return (
    <div className="apps-recent-view">
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
      {noDataAvailableRecent ? (
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
            totalItems={isSearchEnable ? workflows.length : totalItemsAppsRecents}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}
    </div>
  );
};

export default AppsRecentView;
