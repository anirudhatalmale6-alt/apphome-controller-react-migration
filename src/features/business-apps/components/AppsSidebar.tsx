/**
 * Apps Sidebar Component
 * Left sidebar with queue navigation
 * Origin: BusinessApps.html #Appsidebar section
 */
import React from 'react';
import type { QueueItem, QueueProperty } from '../types/BusinessAppsTypes';

interface AppsSidebarProps {
  queueItems: QueueItem[];
  expandedSections: Record<string, boolean>;
  activeItemIndex: Record<string, number>;
  onToggleSection: (queue: QueueItem) => void;
  onSelectAction: (queue: QueueItem, property: QueueProperty, index: number) => void;
}

export const AppsSidebar: React.FC<AppsSidebarProps> = ({
  queueItems,
  expandedSections,
  activeItemIndex,
  onToggleSection,
  onSelectAction,
}) => {
  return (
    <div className="apps-sidebar">
      {queueItems.map((queue) => (
        <div key={queue.display_id} className="sidebar-item">
          {/* Queue Header */}
          <div
            className="sidebar-item-header"
            onClick={() => onToggleSection(queue)}
          >
            <i
              className={`fa ${
                expandedSections[queue.QueueNames]
                  ? 'fa-chevron-down'
                  : 'fa-chevron-right'
              }`}
            />
            <span>{queue.QueueNames}</span>
          </div>

          {/* Queue Properties */}
          {expandedSections[queue.QueueNames] && (
            <div className="sub-items">
              {queue.QueueProperties.filter(prop => prop.isActionEnabled).map(
                (property, index) => (
                  <div
                    key={property.bPaaS_workflow_id}
                    className={`sub-item ${
                      activeItemIndex[queue.QueueNames] === index ? 'active' : ''
                    }`}
                    onClick={() => onSelectAction(queue, property, index)}
                  >
                    <span>{property.displayName}</span>
                    {property.count > 0 && (
                      <span className="property-count">{property.count}</span>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AppsSidebar;
