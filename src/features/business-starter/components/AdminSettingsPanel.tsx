import { useState } from 'react';
import { useBusinessStarterState } from '../hooks/useBusinessStarterState';
import {
  useLoadAdminSettingsEnableDisableMutation,
  useEnableOrDisableServiceMutation,
} from '../api/businessStarterApi';

export function AdminSettingsPanel() {
  const {
    adminSettingsCustomers,
    adminSettingsQueues,
    selectedAdminBpsId,
    selectedAdminCustomerId,
    isLoadingBpsDetails,
    handleToggleAdminQueue,
    setAdminSettingsQueues,
    setIsLoadingBpsDetails,
    updateQueueEnable,
    updateQueueMailEnable,
    toggleQueueExpanded,
  } = useBusinessStarterState();

  const [searchInput, setSearchInput] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const [loadQueues] = useLoadAdminSettingsEnableDisableMutation();
  const [enableDisableService] = useEnableOrDisableServiceMutation();

  const filteredCustomers = adminSettingsCustomers.filter((customer) =>
    customer.customer_name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleToggleBps = async (bpsId: string, customerId: string) => {
    handleToggleAdminQueue(bpsId, customerId);

    if (selectedAdminBpsId !== bpsId) {
      try {
        const response = await loadQueues({ customer_id: customerId, bps_id: bpsId }).unwrap();
        const queues = (response as any[]) || [];
        setAdminSettingsQueues(queues.map((q: any) => ({
          ...q,
          isEnable: !!q.isEnable,
          isMailEnable: !!q.isMailEnable,
          expanded: false,
          hasQueueChanges: false,
          hasUserChanges: false,
          hasMenuChanges: false,
          hasActionChanges: false,
        })));
      } catch (error) {
        console.error('Failed to load queues:', error);
      } finally {
        setIsLoadingBpsDetails(false);
      }
    }
  };

  const handleSaveQueue = async (queue: any) => {
    if (!selectedAdminCustomerId || !selectedAdminBpsId) return;

    try {
      await enableDisableService({
        customer_id: selectedAdminCustomerId,
        bps_id: selectedAdminBpsId,
        queueid: queue.queue_id,
        userid: '',
        tableName: 'dm_queueaccess_baas',
        EnableOrDisable: queue.isEnable ? '1' : '0',
        processName: '',
      }).unwrap();
    } catch (error) {
      console.error('Failed to save queue:', error);
    }
  };

  const handleToggleMailAlert = async (queue: any) => {
    if (!selectedAdminCustomerId || !selectedAdminBpsId) return;

    updateQueueMailEnable(queue.queue_id, !queue.isMailEnable);

    try {
      await enableDisableService({
        customer_id: selectedAdminCustomerId,
        bps_id: selectedAdminBpsId,
        queueid: queue.queue_id,
        userid: '',
        tableName: 'dm_alerts',
        EnableOrDisable: !queue.isMailEnable ? '1' : '0',
        processName: '',
      }).unwrap();
    } catch (error) {
      console.error('Failed to toggle mail alert:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Admin Settings</h3>
        <p className="text-sm text-gray-500 mt-1">
          Manage queue, user, and menu settings for each business process
        </p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search customers..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Customer List */}
      <div className="divide-y divide-gray-200">
        {filteredCustomers.map((customer) => (
          <div key={customer.customer_id}>
            <div
              onClick={() => setExpandedCustomer(
                expandedCustomer === customer.customer_id ? null : customer.customer_id
              )}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                {customer.customer_logo && (
                  <img
                    src={customer.customer_logo}
                    alt={customer.customer_name}
                    className="w-10 h-10 object-contain"
                  />
                )}
                <p className="font-medium">{customer.customer_name}</p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedCustomer === customer.customer_id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* BPS List */}
            {expandedCustomer === customer.customer_id && customer.bps_list && (
              <div className="bg-gray-50 px-4 py-2">
                {customer.bps_list.map((bps) => (
                  <div key={bps.bps_id} className="mb-2">
                    <div
                      onClick={() => handleToggleBps(bps.bps_id, customer.customer_id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedAdminBpsId === bps.bps_id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-white border border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{bps.bps_desc}</p>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            selectedAdminBpsId === bps.bps_id ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Queue Settings */}
                    {selectedAdminBpsId === bps.bps_id && (
                      <div className="mt-2 ml-4">
                        {isLoadingBpsDetails ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {adminSettingsQueues.map((queue) => (
                              <div
                                key={queue.queue_id}
                                className="bg-white border border-gray-200 rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={queue.isEnable}
                                        onChange={() => {
                                          updateQueueEnable(queue.queue_id, !queue.isEnable);
                                          handleSaveQueue({ ...queue, isEnable: !queue.isEnable });
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm font-medium">{queue.queue_name}</span>
                                    </label>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-sm text-gray-600">
                                      <input
                                        type="checkbox"
                                        checked={queue.isMailEnable}
                                        onChange={() => handleToggleMailAlert(queue)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      Mail Alert
                                    </label>
                                    <button
                                      onClick={() => toggleQueueExpanded(queue.queue_id)}
                                      className="text-blue-600 text-sm hover:underline"
                                    >
                                      {queue.expanded ? 'Hide Details' : 'Show Details'}
                                    </button>
                                  </div>
                                </div>

                                {/* Expanded Queue Details */}
                                {queue.expanded && queue.UsersAssigned && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs font-medium text-gray-500 mb-2">
                                      Assigned Users
                                    </p>
                                    <div className="space-y-2">
                                      {queue.UsersAssigned.map((user) => (
                                        <div
                                          key={user.userName}
                                          className="flex items-center justify-between text-sm bg-gray-50 px-2 py-1 rounded"
                                        >
                                          <label className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={user.isEnable}
                                              onChange={() => {}}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            {user.userName}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No customers found
        </div>
      )}
    </div>
  );
}
