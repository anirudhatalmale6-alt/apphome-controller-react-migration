/**
 * InventoryCharts Component
 * Batch and Invoice inventory visualizations
 * Migrated from BusinessHomeViews.js BatchInvYTDOverview/InvoiceInvYTDOverview
 */
import { useMemo } from 'react';
import type { BatchInventoryOverview, BatchInventory30_60_90, InvoiceInventoryOverview } from '../types/BusinessHomeTypes';

interface BatchInventoryChartProps {
  overviewData: BatchInventoryOverview | null;
  agingData: BatchInventory30_60_90 | null;
  isLoading: boolean;
}

export const BatchInventoryChart: React.FC<BatchInventoryChartProps> = ({
  overviewData,
  agingData,
  isLoading,
}) => {
  const agingChartData = useMemo(() => {
    if (!agingData) return [];
    return [
      { label: '0-30 Days', value: agingData.days_0_30 || 0, color: '#4CAF50' },
      { label: '31-60 Days', value: agingData.days_31_60 || 0, color: '#FFC107' },
      { label: '61-90 Days', value: agingData.days_61_90 || 0, color: '#FF9800' },
      { label: '90+ Days', value: agingData.days_90_plus || 0, color: '#F44336' },
    ];
  }, [agingData]);

  const maxValue = Math.max(...agingChartData.map((d) => d.value), 1);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 h-[300px] animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Batch Inventory YTD</h3>

      {/* Overview cards */}
      {overviewData && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-blue-50 rounded p-3 text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold text-blue-600">{overviewData.total_batches?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-green-50 rounded p-3 text-center">
            <p className="text-xs text-gray-500">Processed</p>
            <p className="text-xl font-bold text-green-600">{overviewData.processed_batches?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-yellow-50 rounded p-3 text-center">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-xl font-bold text-yellow-600">{overviewData.pending_batches?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-red-50 rounded p-3 text-center">
            <p className="text-xs text-gray-500">Error</p>
            <p className="text-xl font-bold text-red-600">{overviewData.error_batches?.toLocaleString() || 0}</p>
          </div>
        </div>
      )}

      {/* Aging chart */}
      <div className="space-y-2">
        {agingChartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-20 text-xs text-gray-600">{item.label}</span>
            <div className="flex-1 bg-gray-100 rounded h-5 relative overflow-hidden">
              <div
                className="h-full rounded transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                  minWidth: item.value > 0 ? '30px' : '0',
                }}
              >
                {item.value > 0 && (
                  <span className="text-xs font-medium text-white">{item.value.toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface InvoiceInventoryChartProps {
  data: InvoiceInventoryOverview | null;
  isLoading: boolean;
}

export const InvoiceInventoryChart: React.FC<InvoiceInventoryChartProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 h-[200px] animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Invoice Inventory YTD</h3>

      <div className="grid grid-cols-5 gap-3">
        <div className="bg-blue-50 rounded p-3 text-center">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold text-blue-600">{data.total_invoices?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-green-50 rounded p-3 text-center">
          <p className="text-xs text-gray-500">Processed</p>
          <p className="text-xl font-bold text-green-600">{data.processed_invoices?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-yellow-50 rounded p-3 text-center">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-yellow-600">{data.pending_invoices?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-red-50 rounded p-3 text-center">
          <p className="text-xs text-gray-500">Error</p>
          <p className="text-xl font-bold text-red-600">{data.error_invoices?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-purple-50 rounded p-3 text-center">
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-lg font-bold text-purple-600">{formatCurrency(data.total_amount || 0)}</p>
        </div>
      </div>
    </div>
  );
};

