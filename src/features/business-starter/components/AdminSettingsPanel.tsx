/**
 * Admin Settings Panel Component
 * Queue settings with users, menus, and actions management
 * Origin: BusinessStarterPage.html - qu-view admin queue settings section
 */
import React, { useState, useCallback } from 'react';
import { useBusinessStarterState } from '../hooks/useBusinessStarterState';
import {
  useEnableDisableQueueUserMenuMutation,
  useEnableDisableMenuMutation,
} from '../api/businessStarterApi';
import type { AdminSettingQueue, UserAssignment, MenuAssignment } from '../types/BusinessStarterTypes';

interface AdminSettingsPanelProps {
  onBack: () => void;
}

export const AdminSettingsPanel: React.FC<AdminSettingsPanelProps> = ({ onBack }) => {
  const {
    adminQueues,
    selectedBps,
    selectedCustomerId,
    handleToggleQueue,
    handleUpdateQueueEnable,
    handleToggleMailAlert,
    handleClearQueueChanges,
    isAnyQueueExpanded,
  } = useBusinessStarterState();

  const [enableDisableQueueUserMenu] = useEnableDisableQueueUserMenuMutation();
  const [enableDisableMenu] = useEnableDisableMenuMutation();

  // Save queue settings
  const handleSaveQueue = useCallback(async (queue: AdminSettingQueue) => {
    try {
      await enableDisableQueueUserMenu({
        customer_id: selectedCustomerId || '',
        bps_id: selectedBps || '',
        queueid: queue.queue_id,
        userid: '',
        tableName: 'dm_queueaccess_baas',
        EnableOrDisable: queue.isEnable ? '1' : '0',
        processName: '',
      }).unwrap();
      handleClearQueueChanges(queue.queue_id);
    } catch (error) {
      console.error('Queue save failed:', error);
    }
  }, [selectedCustomerId, selectedBps, enableDisableQueueUserMenu, handleClearQueueChanges]);

  // Save user settings
  const handleSaveUsers = useCallback(async (queue: AdminSettingQueue) => {
    try {
      for (const user of queue.UsersAssigned || []) {
        await enableDisableQueueUserMenu({
          customer_id: selectedCustomerId || '',
          bps_id: selectedBps || '',
          queueid: queue.queue_id,
          userid: user.userName,
          tableName: 'dm_workflow_user',
          EnableOrDisable: user.isEnable ? '1' : '0',
          processName: '',
        }).unwrap();
      }
      handleClearQueueChanges(queue.queue_id);
    } catch (error) {
      console.error('User settings save failed:', error);
    }
  }, [selectedCustomerId, selectedBps, enableDisableQueueUserMenu, handleClearQueueChanges]);

  // Save menu settings
  const handleSaveMenu = useCallback(async (
    queue: AdminSettingQueue,
    menu: MenuAssignment,
    user: UserAssignment
  ) => {
    try {
      await enableDisableMenu({
        customer_id: selectedCustomerId || '',
        bps_id: selectedBps || '',
        queue_id: queue.queue_id,
        user_id: user.userName,
        displayName: menu.menuDisplayName,
        isActionEnabled: menu.isEnable,
        expiryDate: menu.userValidityDate || null,
      }).unwrap();
      handleClearQueueChanges(queue.queue_id);
    } catch (error) {
      console.error('Menu save failed:', error);
    }
  }, [selectedCustomerId, selectedBps, enableDisableMenu, handleClearQueueChanges]);

  // Save action settings
  const handleSaveActions = useCallback(async (queue: AdminSettingQueue) => {
    try {
      const user = queue.UsersAssigned?.[0];
      if (!user) return;

      for (const action of user.actionAssigned || []) {
        await enableDisableQueueUserMenu({
          customer_id: selectedCustomerId || '',
          bps_id: selectedBps || '',
          queueid: queue.queue_id,
          userid: user.userName,
          tableName: 'dm_baas_serviceplayqueue',
          EnableOrDisable: action.isEnable ? '1' : '0',
          processName: action.displayName,
        }).unwrap();
      }
      handleClearQueueChanges(queue.queue_id);
    } catch (error) {
      console.error('Action settings save failed:', error);
    }
  }, [selectedCustomerId, selectedBps, enableDisableQueueUserMenu, handleClearQueueChanges]);

  return (
    <div className={`admin-settings-card ${isAnyQueueExpanded ? 'card-expanded' : ''}`}>
      {/* Header */}
      <div className="admin-settings-header">
        <h4 className="admin-title">Admin Queue Settings</h4>
        <button className="btn-back" onClick={onBack}>
          <i className="fa fa-arrow-left" /> Back
        </button>
      </div>

      {/* Queue List */}
      {adminQueues.map((queue) => (
        <div key={queue.queue_id} className="queue-section">
          {/* Queue Header */}
          <div className="queue-header">
            <div className="queue-header-left">
              <strong onClick={() => handleToggleQueue(queue.queue_id)}>
                {queue.custom_queue_name}
              </strong>
              {queue.hasQueueChanges && <span className="unsaved-dot" />}
              <i
                className={`fa fa-chevron-down chevron-icon ${queue.expanded ? 'fa-rotate-180' : ''}`}
                onClick={() => handleToggleQueue(queue.queue_id)}
              />
            </div>

            <div className="queue-header-right">
              {/* Queue Toggle */}
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={queue.isEnable}
                  onChange={(e) => handleUpdateQueueEnable(queue.queue_id, e.target.checked)}
                />
                <span className="slider" />
              </label>

              {/* Expiry Date */}
              <input
                type="date"
                className="expiry-date-input"
                value={queue.qValidityDate ? new Date(queue.qValidityDate).toISOString().split('T')[0] : ''}
                placeholder="Expiry Date"
              />

              {/* Mail Toggle */}
              <i
                className={`fa ${queue.isMailEnable ? 'fa-envelope text-primary' : 'fa-envelope mail-text-muted'}`}
                onClick={() => handleToggleMailAlert(queue.queue_id)}
                title={queue.isMailEnable ? 'Mail Alert: ON' : 'Mail Alert: OFF'}
              />

              {/* Save Button */}
              {queue.hasQueueChanges && (
                <button
                  className="btn-save"
                  onClick={(e) => { e.stopPropagation(); handleSaveQueue(queue); }}
                >
                  Save
                </button>
              )}
            </div>
          </div>

          {/* Expanded Queue Details */}
          {queue.expanded && (
            <div className="queue-details">
              {/* Users Section */}
              <div className="section">
                <div className="section-header">
                  <h6>Users under Queue</h6>
                  {queue.hasUserChanges && <span className="unsaved-dot" />}
                  {queue.hasUserChanges && (
                    <button className="btn-save" onClick={() => handleSaveUsers(queue)}>
                      Save Users
                    </button>
                  )}
                </div>

                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Toggle</th>
                      <th>Expiry</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.UsersAssigned?.map((user) => (
                      <UserRow
                        key={user.userName}
                        user={user}
                        queue={queue}
                        onSaveMenu={handleSaveMenu}
                        onSaveActions={handleSaveActions}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// User Row Sub-component
interface UserRowProps {
  user: UserAssignment;
  queue: AdminSettingQueue;
  onSaveMenu: (queue: AdminSettingQueue, menu: MenuAssignment, user: UserAssignment) => void;
  onSaveActions: (queue: AdminSettingQueue) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, queue, onSaveMenu, onSaveActions }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <tr>
        <td className="mark-text-muted">{user.userName}</td>
        <td>
          <label className="toggle">
            <input type="checkbox" checked={user.isEnable} readOnly />
            <span className="slider" />
          </label>
        </td>
        <td>
          <input
            type="date"
            className="expiry-date-input"
            value={user.userValidityDate ? new Date(user.userValidityDate).toISOString().split('T')[0] : ''}
            placeholder="User Expiry"
          />
        </td>
        <td>
          <i
            className={`fa ${showDetails ? 'fa-chevron-up' : 'fa-chevron-down'}`}
            onClick={() => setShowDetails(!showDetails)}
          />
        </td>
      </tr>

      {/* Menus & Actions (Expandable) */}
      {showDetails && (
        <tr>
          <td colSpan={4} className="user-details-cell">
            <div className="user-details-row">
              {/* Menus */}
              <div className="menus-section">
                <div className="section-header">
                  <h6>Menus Assigned</h6>
                  {queue.hasMenuChanges && <span className="unsaved-dot" />}
                </div>
                <table className="menu-table">
                  <tbody>
                    {user.menuAssigned?.map((menu) => (
                      <tr key={menu.menuDisplayName}>
                        <td className="mark-text-muted">{menu.menuDisplayName}</td>
                        <td>
                          <label className="toggle">
                            <input type="checkbox" checked={menu.isEnable} readOnly />
                            <span className="slider" />
                          </label>
                        </td>
                        <td>
                          <input
                            type="date"
                            className="expiry-date-input"
                            value={menu.userValidityDate ? new Date(menu.userValidityDate).toISOString().split('T')[0] : ''}
                            placeholder="Menu Expiry"
                          />
                        </td>
                        <td>
                          {menu.hasChanged && (
                            <button
                              className="btn-save"
                              onClick={() => onSaveMenu(queue, menu, user)}
                            >
                              Save
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="actions-section">
                <div className="section-header">
                  <h6>Actions Assigned</h6>
                  {queue.hasActionChanges && (
                    <button className="btn-save" onClick={() => onSaveActions(queue)}>
                      Save Actions
                    </button>
                  )}
                </div>
                <table className="action-table">
                  <tbody>
                    {user.actionAssigned?.map((action) => (
                      <tr key={action.displayName}>
                        <td className="mark-text-muted">{action.displayName}</td>
                        <td>
                          <label className="toggle">
                            <input type="checkbox" checked={action.isEnable} readOnly />
                            <span className="slider" />
                          </label>
                        </td>
                        <td>
                          <input
                            type="date"
                            className="expiry-date-input"
                            value={action.userValidityDate ? new Date(action.userValidityDate).toISOString().split('T')[0] : ''}
                            placeholder="Action Expiry"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default AdminSettingsPanel;
