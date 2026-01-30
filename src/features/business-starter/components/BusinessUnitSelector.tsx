import { useBusinessStarterState } from '../hooks/useBusinessStarterState';

export function BusinessUnitSelector() {
  const {
    selectedBuIndex,
    currentDeptIndex,
    searchBUInput,
    searchDepartments,
    searchQueues,
    isGridView,
    getFilteredBusinessUnits,
    getFilteredDepartments,
    getFilteredQueues,
    handleSelectQueue,
    setSearchBUInput,
    setSearchDepartments,
    setSearchQueues,
    toggleGridView,
  } = useBusinessStarterState();

  const filteredBUs = getFilteredBusinessUnits();
  const filteredDepts = getFilteredDepartments();
  const currentDept = filteredDepts[currentDeptIndex];
  const filteredQueues = currentDept ? getFilteredQueues(currentDept.deptQueues) : [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header with view toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Select Queue</h2>
        <button
          onClick={toggleGridView}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          title={isGridView ? 'Switch to List View' : 'Switch to Grid View'}
        >
          {isGridView ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          )}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Business Units Column */}
        <div className="col-span-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Business Units</h3>
          <input
            type="text"
            placeholder="Search BU..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-2"
            value={searchBUInput}
            onChange={(e) => setSearchBUInput(e.target.value)}
          />
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredBUs.map((bu, idx) => (
              <div
                key={bu.bu_id}
                className={`px-3 py-2 cursor-pointer border-b last:border-b-0 ${
                  idx === selectedBuIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                }`}
              >
                {bu.bu_desc}
              </div>
            ))}
          </div>
        </div>

        {/* Departments Column */}
        <div className="col-span-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Departments</h3>
          <input
            type="text"
            placeholder="Search departments..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-2"
            value={searchDepartments}
            onChange={(e) => setSearchDepartments(e.target.value)}
          />
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredDepts.map((dept, idx) => (
              <div
                key={dept.dept_id}
                className={`px-3 py-2 cursor-pointer border-b last:border-b-0 ${
                  idx === currentDeptIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                }`}
              >
                {dept.dept_desc}
              </div>
            ))}
          </div>
        </div>

        {/* Queues Column */}
        <div className="col-span-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Queues</h3>
          <input
            type="text"
            placeholder="Search queues..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-2"
            value={searchQueues}
            onChange={(e) => setSearchQueues(e.target.value)}
          />

          {isGridView ? (
            // Grid View
            <div className="grid grid-cols-2 gap-3">
              {filteredQueues.flat().map((queue) => (
                <div
                  key={queue.queue_id}
                  onClick={() => handleSelectQueue(queue)}
                  className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <p className="font-medium text-sm">{queue.custom_queue_name}</p>
                  {queue.menuList && queue.menuList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {queue.menuList.map((menu, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-gray-100 rounded"
                        >
                          {menu.menu_display}: {menu.menu_count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Queue Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredQueues.flat().map((queue) => (
                    <tr
                      key={queue.queue_id}
                      onClick={() => handleSelectQueue(queue)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm">{queue.custom_queue_name}</td>
                      <td className="px-4 py-3">
                        {queue.menuList && queue.menuList.length > 0 ? (
                          <div className="flex gap-1">
                            {queue.menuList.slice(0, 3).map((menu, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded"
                              >
                                {menu.menu_count}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No items</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredQueues.flat().length === 0 && (
            <p className="text-center text-gray-500 py-8">No queues found</p>
          )}
        </div>
      </div>
    </div>
  );
}
