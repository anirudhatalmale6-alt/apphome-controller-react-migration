import { useBusinessAppsState } from '../hooks/useBusinessAppsState';

export function AppsSidebar() {
  const {
    queueActions,
    selectedQueue,
    isSidebarCollapsed,
    tasksCount,
    handleSelectQueue,
  } = useBusinessAppsState();

  const getQueueCount = (queueId: string): number => {
    const count = tasksCount.find(tc => tc.queue_id === queueId);
    return count?.counts || 0;
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all z-10 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        {!isSidebarCollapsed && (
          <h2 className="font-semibold text-gray-800">Queues</h2>
        )}
      </div>

      {/* Queue List */}
      <div className="overflow-y-auto h-[calc(100%-4rem)]">
        {queueActions.map((queue) => (
          <div
            key={queue.queue_id}
            onClick={() => handleSelectQueue(queue)}
            className={`cursor-pointer transition-colors ${
              selectedQueue?.queue_id === queue.queue_id
                ? 'bg-blue-50 border-r-2 border-blue-500'
                : 'hover:bg-gray-50'
            }`}
          >
            {isSidebarCollapsed ? (
              // Collapsed view - just icon/initials
              <div className="p-4 flex justify-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    selectedQueue?.queue_id === queue.queue_id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {queue.queue_name.substring(0, 2).toUpperCase()}
                </div>
              </div>
            ) : (
              // Expanded view
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium truncate ${
                      selectedQueue?.queue_id === queue.queue_id
                        ? 'text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {queue.queue_name}
                  </span>
                  {getQueueCount(queue.queue_id) > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {getQueueCount(queue.queue_id)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {queue.bu_desc}
                </p>
              </div>
            )}
          </div>
        ))}

        {queueActions.length === 0 && !isSidebarCollapsed && (
          <div className="p-4 text-center text-sm text-gray-500">
            No queues available
          </div>
        )}
      </div>
    </aside>
  );
}
