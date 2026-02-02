/**
 * DashboardCards Component
 * Task/Workflow count cards for home dashboard
 * Migrated from BusinessHomeViews.js taskDataCount display
 */
import type { TasksWorkflowCount } from '../types/BusinessHomeTypes';

interface DashboardCardsProps {
  data: TasksWorkflowCount | null;
  isLoading: boolean;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex gap-4 flex-wrap">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[230px] h-[182px] bg-gray-100 animate-pulse rounded-lg shadow-lg" />
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const cards = [
    {
      title: 'Total Tasks',
      value: data.tasksCount || 0,
      color: 'from-blue-500 to-blue-600',
      icon: '📋',
    },
    {
      title: 'Total Workflows',
      value: data.workflowsCount || 0,
      color: 'from-green-500 to-green-600',
      icon: '🔄',
    },
    {
      title: 'Pending Tasks',
      value: data.pendingTasks || 0,
      color: 'from-yellow-500 to-yellow-600',
      icon: '⏳',
    },
    {
      title: 'Completed Tasks',
      value: data.completedTasks || 0,
      color: 'from-purple-500 to-purple-600',
      icon: '✅',
    },
  ];

  return (
    <div className="flex gap-4 flex-wrap">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`w-[230px] h-[182px] rounded-lg shadow-lg bg-gradient-to-br ${card.color} text-white p-4 flex flex-col justify-between`}
        >
          <div className="text-3xl">{card.icon}</div>
          <div>
            <h4 className="text-sm font-medium opacity-90">{card.title}</h4>
            <p className="text-4xl font-bold mt-2">{card.value.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
