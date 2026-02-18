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
              <div style={{ padding: 32 }}>
                {/* Skeleton page - DevOps under development */}
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                  {/* Skeleton header */}
                  <div style={{ height: 28, width: '35%', background: '#e0e0e0', borderRadius: 4, marginBottom: 24, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  {/* Skeleton subtitle */}
                  <div style={{ height: 16, width: '55%', background: '#eeeeee', borderRadius: 4, marginBottom: 32, animation: 'pulse 1.5s ease-in-out infinite' }} />

                  {/* Skeleton card rows */}
                  {[1, 2, 3].map((row) => (
                    <div key={row} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, padding: 24, marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e0e0e0' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 16, width: '40%', background: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
                          <div style={{ height: 12, width: '60%', background: '#eeeeee', borderRadius: 4 }} />
                        </div>
                      </div>
                      <div style={{ height: 12, width: '90%', background: '#f5f5f5', borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 12, width: '75%', background: '#f5f5f5', borderRadius: 4 }} />
                    </div>
                  ))}

                  {/* Skeleton table */}
                  <div style={{ marginTop: 24, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: 16, padding: '12px 16px', borderBottom: '1px solid #e8e8e8', background: '#fafafa' }}>
                      {[120, 180, 140, 100].map((w, i) => (
                        <div key={i} style={{ height: 14, width: w, background: '#e0e0e0', borderRadius: 4 }} />
                      ))}
                    </div>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <div key={r} style={{ display: 'flex', gap: 16, padding: '14px 16px', borderBottom: '1px solid #f0f0f0', animation: 'pulse 1.5s ease-in-out infinite' }}>
                        {[120, 180, 140, 100].map((w, i) => (
                          <div key={i} style={{ height: 12, width: w, background: '#f0f0f0', borderRadius: 4 }} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pulse animation for skeleton */}
                <style>{`
                  @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                  }
                `}</style>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
