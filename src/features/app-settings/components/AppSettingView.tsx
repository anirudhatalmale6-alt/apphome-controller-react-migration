/**
 * App Setting View (Main entry point for /Setting route)
 * 3 top-level tabs: Setting, BpsConfiguration (Users), DevOps
 * Origin: AppSettingPage.js uniqueTabs + AppSettingPage.html outer layout
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSettingsState } from '../hooks/useAppSettingsState';
import { SettingPanel } from './SettingPanel';
import { UserListPage } from './UserListPage';
import { SingleUserForm } from './SingleUserForm';

const UNIQUE_TABS = [
  { title: 'Setting', key: 'Setting' },
  { title: 'BpsConfiguration', key: 'BpsConfiguration' },
  { title: 'DevOps', key: 'DevOps' },
];

export const AppSettingView: React.FC = () => {
  const navigate = useNavigate();
  const {
    settingsState,
    loadBpsConfigTab,
    dispatch,
    setActiveUniqueTab,
    setLoadingState,
  } = useAppSettingsState();

  const [activeTab, setActiveTab] = useState('Setting');
  const [isTabLoading, setIsTabLoading] = useState(false);

  const handleTabChange = useCallback((tabKey: string) => {
    setIsTabLoading(true);
    setActiveTab(tabKey);
    dispatch(setActiveUniqueTab(tabKey));

    if (tabKey === 'BpsConfiguration') {
      loadBpsConfigTab();
    }

    setTimeout(() => setIsTabLoading(false), 1000);
  }, [dispatch, setActiveUniqueTab, loadBpsConfigTab]);

  const handleGoBack = useCallback(() => {
    navigate('/BPaaSWorkflow');
  }, [navigate]);

  // Compute sidebar height
  const sbHeight = typeof window !== 'undefined'
    ? (window.innerHeight * (window.innerHeight / document.body.offsetHeight)) - 80
    : 600;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top bar with back button and tabs */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e0e0', background: '#fafafa', padding: '0 16px' }}>
        <button
          onClick={handleGoBack}
          style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#1976d2', fontWeight: 500, fontSize: 14 }}
        >
          &larr; Back
        </button>

        <div style={{ display: 'flex', marginLeft: 16 }}>
          {UNIQUE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: '12px 24px',
                background: activeTab === tab.key ? '#fff' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #1976d2' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? '#1976d2' : '#666',
                fontSize: 14,
              }}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: sbHeight }}>
        {isTabLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <span>Loading...</span>
          </div>
        ) : (
          <>
            {activeTab === 'Setting' && <SettingPanel />}

            {activeTab === 'BpsConfiguration' && (
              settingsState.showForm ? (
                <SingleUserForm />
              ) : (
                <UserListPage />
              )
            )}

            {activeTab === 'DevOps' && (
              <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
                DevOps configuration coming soon
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
