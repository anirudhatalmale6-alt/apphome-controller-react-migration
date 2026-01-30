import { useState } from 'react';
import { useBusinessStarterState } from '../hooks/useBusinessStarterState';
import type { BusinessProcess } from '../types/BusinessStarterTypes';

export function BusinessProcessGrid() {
  const {
    selectedBpsList,
    handleGroupBusinessUnits,
    isContractActive,
  } = useBusinessStarterState();
  const [searchInput, setSearchInput] = useState('');

  // Flatten and filter
  const allBps = selectedBpsList.flat();
  const filteredBps = allBps.filter((bps) =>
    bps.bps_desc.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Regroup into rows of 4
  const groupedBps: BusinessProcess[][] = [];
  let row: BusinessProcess[] = [];
  filteredBps.forEach((bps, idx) => {
    row.push(bps);
    if ((idx + 1) % 4 === 0) {
      groupedBps.push(row);
      row = [];
    }
  });
  if (row.length > 0) {
    groupedBps.push(row);
  }

  const handleSelectBps = (bps: BusinessProcess) => {
    handleGroupBusinessUnits(bps.bu_list as any);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Select Business Process</h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search business processes..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* BPS Grid */}
      {groupedBps.map((bpsRow, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {bpsRow.map((bps) => (
            <div
              key={bps.bps_id}
              onClick={() => handleSelectBps(bps)}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                isContractActive(bps.contract_end_date)
                  ? 'border-gray-200 hover:border-blue-300'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              {bps.bps_logo && (
                <img
                  src={bps.bps_logo}
                  alt={bps.bps_desc}
                  className="w-16 h-16 object-contain mx-auto mb-2"
                />
              )}
              <p className="text-center font-medium text-gray-800">
                {bps.bps_desc}
              </p>
              {bps.lobtype && (
                <span className="block text-center text-xs text-blue-600 mt-1">
                  {bps.lobtype}
                </span>
              )}
              <p className="text-center text-xs text-gray-500 mt-1">
                {bps.bu_list.length} Business Unit(s)
              </p>
              {!isContractActive(bps.contract_end_date) && (
                <span className="block text-center text-xs text-red-500 mt-1">
                  Contract Expired
                </span>
              )}
            </div>
          ))}
        </div>
      ))}

      {filteredBps.length === 0 && (
        <p className="text-center text-gray-500 py-8">No business processes found</p>
      )}
    </div>
  );
}
