/**
 * Apps Timeline Tabs Component
 * Recent / Past Due / Custom tabs
 * Origin: BusinessApps.html .tabs section
 */
import React from 'react';
import type { TimelineTab } from '../types/BusinessAppsTypes';

interface AppsTimelineTabsProps {
  tabs: TimelineTab[];
  selectedTab: number;
  onSelectTab: (tabIndex: number) => void;
}

export const AppsTimelineTabs: React.FC<AppsTimelineTabsProps> = ({
  tabs,
  selectedTab,
  onSelectTab,
}) => {
  return (
    <div className="apps-timeline-tabs">
      {tabs.map((tab) => (
        <div
          key={tab.index}
          className={`timeline-tab ${selectedTab === tab.index ? 'active' : ''}`}
          onClick={() => onSelectTab(tab.index)}
        >
          {tab.title}
        </div>
      ))}
    </div>
  );
};

export default AppsTimelineTabs;
