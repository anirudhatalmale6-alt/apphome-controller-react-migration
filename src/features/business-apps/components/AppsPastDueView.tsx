/**
 * Apps Past Due View Component
 * Displays past due workflows with aging tabs
 * Origin: AppsPastDueViews.html
 */
import React, { useState } from 'react';
import { useBusinessAppsState } from '../hooks/useBusinessAppsState';
import { WorkflowTable } from './WorkflowTable';
import { SearchBar } from './SearchBar';
import { Pagination } from './Pagination';

export const AppsPastDueView: React.FC = () => {
  const {
    workflows,
    noDataAvailablePast,
    searchByAll,
    isSearchEnable,
    pagination,
    totalItemsAppsPastDue,
    agingTabs,
    agingSelectedTab,
    handleSearch,
    handlePageChange,
    handleItemsPerPageChange,
    handleAgingSelectTab,
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
    <div className="apps-past-due-view">
      {/* Aging Tabs */}
      <div className="aging-tabs">
        {agingTabs.map((tab) => (
          <button
            key={tab.index}
            className={`aging-tab ${agingSelectedTab === tab.index ? 'active' : ''}`}
            onClick={() => handleAgingSelectTab(tab.index)}
          >
            {tab.title}
          </button>
        ))}
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
      {noDataAvailablePast ? (
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
            totalItems={isSearchEnable ? workflows.length : totalItemsAppsPastDue}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}
    </div>
  );
};

export default AppsPastDueView;
