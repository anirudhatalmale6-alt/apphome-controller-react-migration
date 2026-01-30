/**
 * YTDPendingChart Component
 * Horizontal bar chart for YTD pending items aging
 * Migrated from BusinessHomeViews.js YTD_Pending_30_60_90 chart
 */
import { useMemo } from 'react';
import type { YTDPending30_60_90 } from '../types/BusinessHomeTypes';

interface YTDPendingChartProps {
  data: YTDPending30_60_90 | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

export const YTDPendingChart: React.FC<YTDPendingChartProps> = ({ data, isLoading, onRefresh }) => {
  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'TODAY', value: data.today || 0, color: '#4CAF50' },
      { label: 'YESTERDAY', value: data.yesterday || 0, color: '#8BC34A' },
      { label: '3-7 DAYS', value: data.days_3_7 || 0, color: '#CDDC39' },
      { label: '8-15 DAYS', value: data.days_8_15 || 0, color: '#FFEB3B' },
      { label: '16-30 DAYS', value: data.days_16_30 || 0, color: '#FFC107' },
      { label: '31-60 DAYS', value: data.days_31_60 || 0, color: '#FF9800' },
      { label: '61-90 DAYS', value: data.days_61_90 || 0, color: '#FF5722' },
      { label: '90+ DAYS', value: data.days_90_plus || 0, color: '#F44336' },
    ];
  }, [data]);

  const maxValue = useMemo(() => Math.max(...chartData.map((d) => d.value), 1), [chartData]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 h-[400px]">
        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-20 h-4 bg-gray-200 animate-pulse rounded" />
              <div className="flex-1 h-6 bg-gray-100 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">YTD Pending Items (Aging)</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-24 text-xs text-gray-600 text-right">{item.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                  minWidth: item.value > 0 ? '40px' : '0',
                }}
              >
                {item.value > 0 && (
                  <span className="text-xs font-semibold text-white">{item.value.toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total Items:</span>
          <span className="font-semibold">
            {chartData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default YTDPendingChart;
