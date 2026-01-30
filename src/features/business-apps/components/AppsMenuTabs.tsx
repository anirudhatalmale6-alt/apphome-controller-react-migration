import { useBusinessAppsState } from '../hooks/useBusinessAppsState';

export function AppsMenuTabs() {
  const { menuTabs, selectedTabIndex, handleSelectTab } = useBusinessAppsState();

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-4 overflow-x-auto">
        {menuTabs.map((tab, index) => (
          <button
            key={tab.menutabs_id}
            onClick={() => handleSelectTab(index)}
            className={`py-2 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              selectedTabIndex === index
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </nav>
    </div>
  );
}
