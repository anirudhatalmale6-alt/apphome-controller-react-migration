/**
 * Search Bar Component
 * Reusable search input with field selection
 * Origin: Search functionality in Apps views
 */
import React from 'react';
import type { SearchConfig } from '../types/BusinessAppsTypes';

interface SearchBarProps {
  searchFields: SearchConfig[];
  selectedField: string;
  searchText: string;
  onFieldChange: (field: string) => void;
  onSearchTextChange: (text: string) => void;
  onSearch: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchFields,
  selectedField,
  searchText,
  onFieldChange,
  onSearchTextChange,
  onSearch,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="search-bar">
      <select
        className="search-field-select"
        value={selectedField}
        onChange={(e) => onFieldChange(e.target.value)}
      >
        <option value="">Select Field</option>
        {searchFields.map((field) => (
          <option key={field.id} value={field.id}>
            {field.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        className="search-input"
        placeholder="Search..."
        value={searchText}
        onChange={(e) => onSearchTextChange(e.target.value)}
        onKeyPress={handleKeyPress}
      />

      <button className="btn-search" onClick={onSearch}>
        <i className="fa fa-search" />
      </button>
    </div>
  );
};

export default SearchBar;
