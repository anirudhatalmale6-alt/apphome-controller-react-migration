/**
 * TransactionHistoryModal Component
 * Modal dialog showing DIN/transaction history
 * Migrated from BusinessTasksController.js loadTasksShowTransactionHistory
 * Template: pages/business/ShowTransactionLogs.html
 */
import type { TransactionLog } from '../types/BusinessTasksTypes';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dinNumber: string | null;
  logs: TransactionLog[];
  isLoading: boolean;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  dinNumber,
  logs,
  isLoading,
}) => {
  if (!isOpen) return null;

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col m-4">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
            {dinNumber && (
              <p className="text-sm text-gray-600">DIN Number: {dinNumber}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : logs.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-3 border-b border-gray-200 font-medium">Log ID</th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium">Action</th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium">Timestamp</th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium">User</th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.log_id || index} className="hover:bg-gray-50">
                    <td className="p-3 border-b border-gray-100">{log.log_id}</td>
                    <td className="p-3 border-b border-gray-100">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.action.toLowerCase().includes('create') ? 'bg-green-100 text-green-700' :
                        log.action.toLowerCase().includes('update') ? 'bg-blue-100 text-blue-700' :
                        log.action.toLowerCase().includes('delete') ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 border-b border-gray-100">{formatTimestamp(log.timestamp)}</td>
                    <td className="p-3 border-b border-gray-100">{log.user}</td>
                    <td className="p-3 border-b border-gray-100 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              No transaction history found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;
