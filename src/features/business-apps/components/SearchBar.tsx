import { useState } from 'react';
import { useBusinessAppsState } from '../hooks/useBusinessAppsState';

const SEARCH_FIELDS = [
  { field: 'BatchID', label: 'Batch ID' },
  { field: 'TransactionID', label: 'Transaction ID' },
  { field: 'DocumentID', label: 'Document ID' },
  { field: 'Queue', label: 'Queue' },
];

export function SearchBar() {
  const { searchField, searchValue, handleSearch, handleClearSearch } = useBusinessAppsState();
  const [localField, setLocalField] = useState(searchField || SEARCH_FIELDS[0].field);
  const [localValue, setLocalValue] = useState(searchValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localValue.trim()) {
      handleSearch(localField, localValue.trim());
    }
  };

  const handleClear = () => {
    setLocalValue('');
    handleClearSearch();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        {/* Field selector */}
        <select
          value={localField}
          onChange={(e) => setLocalField(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {SEARCH_FIELDS.map((field) => (
            <option key={field.field} value={field.field}>
              {field.label}
            </option>
          ))}
        </select>

        {/* Search input */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search..."
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
          />
          {localValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>

        {/* Clear button */}
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {/* Active search indicator */}
      {searchValue && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <span>Searching</span>
          <span className="font-medium">{searchField}</span>
          <span>for</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
            {searchValue}
          </span>
        </div>
      )}
    </div>
  );
}
