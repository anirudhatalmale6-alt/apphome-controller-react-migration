/**
 * Apps Menu Tabs Component
 * Business unit tab navigation
 * Origin: BusinessApps.html .AppsTabs section
 */
import React from 'react';
import type { MenuTab } from '../types/BusinessAppsTypes';

interface AppsMenuTabsProps {
  tabs: MenuTab[];
  selectedIndex: number;
  onSelectTab: (tabId: number) => void;
}

export const AppsMenuTabs: React.FC<AppsMenuTabsProps> = ({
  tabs,
  selectedIndex,
  onSelectTab,
}) => {
  return (
    <div className="apps-menu-tabs">
      {tabs.map((tab) => (
        <div
          key={tab.menutabs_id}
          className={`menu-tab ${selectedIndex === tab.menutabs_id ? 'active' : ''}`}
          onClick={() => onSelectTab(tab.menutabs_id)}
        >
          {tab.title}
        </div>
      ))}
    </div>
  );
};

export default AppsMenuTabs;
