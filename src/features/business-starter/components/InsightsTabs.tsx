/**
 * Insights Tabs Component
 * Tab navigation for different views
 * Origin: BusinessStarterPage.html - nav-tabs section
 */
import React from 'react';
import type { InsightTab } from '../types/BusinessStarterTypes';

interface InsightsTabsProps {
  tabs: InsightTab[];
  selectedTab: number;
  onSelectTab: (index: number) => void;
}

export const InsightsTabs: React.FC<InsightsTabsProps> = ({
  tabs,
  selectedTab,
  onSelectTab,
}) => {
  return (
    <ul className="insights-nav-tabs">
      {tabs.map((tab, index) => (
        tab.enable_label === 1 && (
          <li
            key={index}
            className={`nav-item ${selectedTab === index ? 'active' : ''}`}
            onClick={() => onSelectTab(index)}
          >
            <a className="nav-link" href="#">
              {tab.title}
            </a>
          </li>
        )
      ))}
    </ul>
  );
};

export default InsightsTabs;
