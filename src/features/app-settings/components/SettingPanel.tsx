/**
 * Setting Panel - Card/tile grid layout with right content panel
 * Origin: AppSettingPage.html - 7 setting tiles in 2-column grid
 * Layout: Left = 2-col grid of setting cards | Right = content panel for selected setting
 * Ref: Feedback img 1
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useAppSettingsState } from '../hooks/useAppSettingsState';
import { DateFormatDialog } from './DateFormatDialog';
import { CorporationProfile } from './CorporationProfile';

export const SettingPanel: React.FC = () => {
  const {
    settingsState,
    user,
    loadFetchForSetting,
    acceptTerms,
    loadDateFormats,
    saveDateFormat,
    saveTimeFormat,
    saveTimeZone,
    storeRemoteAccessKey,
    dispatch,
    setSettingSelectedTab,
    setDisplayDateFormat,
    setTimeFormatValue,
    setTimeFormatLabel,
    setDisplayTimeZone,
    setFormattedCurrentTime,
    setFormattedNewTime,
    setSuccessMessage,
  } = useAppSettingsState();

  const [showDateDialog, setShowDateDialog] = useState(false);
  const [dateRow, setDateRow] = useState({ value: '', date_format: 'DD/MM/YY' });
  const [timeRow, setTimeRow] = useState({ value: '', time_format: 'hh:mm A', timeFormatLabel: '12 Hours' });
  const [tzRow, setTzRow] = useState({ current_time_zone: '', new_time_zone: '', value: '' });
  const [timeZones, setTimeZones] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [remoteKey, setRemoteKey] = useState('');
  const [isAccepted, setIsAccepted] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');

  const selectedTab = settingsState.settingSelectedTab;

  // Dynamic content/subtitle for each card based on live config
  const getCardSubtitle = useCallback((idx: number) => {
    const cfg = settingsState.settingConfig;
    switch (idx) {
      case 0: return cfg?.lastupdated_termsconditions ? `Last Updated ${cfg.lastupdated_termsconditions}` : 'Last Updated dd mmm yyyy HH:MM AM';
      case 1: return cfg?.lastupdated_dateformat ? `Current Format ${cfg.lastupdated_dateformat}` : 'Current Format dd/mm/yy';
      case 2: return cfg?.current_timeformat ? `Current Time Format: ${cfg.current_timeformat}` : 'Current Time Format: HH:MM AM/PM';
      case 3: {
        const tz = tzRow.current_time_zone || 'Asia/Kolkata';
        try {
          const offset = new Date().toLocaleString('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).split(' ').pop();
          return `Server Time Zone: (${offset}) ${tz.replace('_', ' ')}`;
        } catch {
          return '(UTC+5:30) Asia/Kolkata';
        }
      }
      case 4: return cfg?.display_timezone ? `Display Time Zone: ${cfg.display_timezone}` : 'Current Display 01:01 AM';
      case 5: return 'Corp Profile Name:';
      case 6: return 'Remote Access Key Setup';
      default: return '';
    }
  }, [settingsState.settingConfig, tzRow.current_time_zone]);

  const getCardAction = useCallback((idx: number) => {
    switch (idx) {
      case 0: return 'Read and Accept Terms';
      case 1: return 'Change Date Format';
      case 2: return 'Change Time Format';
      case 3: return null;
      case 4: return 'Change Display Time';
      case 5: return 'Manage Corp Information';
      case 6: return 'Register Your Key';
      default: return null;
    }
  }, []);

  const SETTING_CARDS = [
    'Terms & Conditions',
    'Date Format',
    'Time Format',
    'Server Business Time Zone',
    'Display Time Zone',
    'Corp Profile Configuration',
    'Remote Access Key Setup',
  ];

  // Load setting config on mount
  useEffect(() => {
    loadFetchForSetting();
  }, [loadFetchForSetting]);

  // Initialize timezone data
  useEffect(() => {
    try {
      const allZones = Intl.supportedValuesOf('timeZone');
      const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimeZones([defaultTz, ...allZones.filter((z) => z !== defaultTz)]);
      setTzRow((prev) => ({
        ...prev,
        current_time_zone: defaultTz,
        new_time_zone: defaultTz,
      }));
    } catch {
      setTimeZones([]);
    }
  }, []);

  const selectEvent = useCallback((tabIndex: number) => {
    dispatch(setSettingSelectedTab(tabIndex));
    if (tabIndex === 0) {
      loadFetchForSetting();
    } else if (tabIndex === 1) {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
      setDateRow({ value: formatted, date_format: 'DD/MM/YY' });
    } else if (tabIndex === 2) {
      const now = new Date();
      const h = now.getHours() % 12 || 12;
      const m = String(now.getMinutes()).padStart(2, '0');
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      setTimeRow({ value: `${h}:${m} ${ampm}`, time_format: 'hh:mm A', timeFormatLabel: '12 Hours' });
    }
  }, [dispatch, loadFetchForSetting, setSettingSelectedTab]);

  const handleAccept = useCallback(() => {
    setIsAccepted(true);
    setMessageText('Thank you for accepting our Terms and Conditions.');
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
    acceptTerms();
  }, [acceptTerms]);

  const handleDecline = useCallback(() => {
    setIsAccepted(false);
    setMessageText('You have declined our Terms and Conditions.');
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  }, []);

  const handleTimeFormatChange = useCallback((format: string) => {
    const now = new Date();
    let value: string;
    let label: string;
    if (format === 'HH:mm') {
      value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      label = '24 Hours';
    } else {
      const h = now.getHours() % 12 || 12;
      const m = String(now.getMinutes()).padStart(2, '0');
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      value = `${h}:${m} ${ampm}`;
      label = '12 Hours';
    }
    setTimeRow({ value, time_format: format, timeFormatLabel: label });
    dispatch(setTimeFormatValue(value));
    dispatch(setTimeFormatLabel(label));
  }, [dispatch, setTimeFormatValue, setTimeFormatLabel]);

  const handleSelectTimezone = useCallback((zone: string) => {
    setTzRow((prev) => ({ ...prev, new_time_zone: zone }));
    setShowDropdown(false);
    const now = new Date();
    const currentStr = now.toLocaleTimeString('en-US', { timeZone: tzRow.current_time_zone, hour: '2-digit', minute: '2-digit', hour12: true });
    const newStr = now.toLocaleTimeString('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: true });
    dispatch(setFormattedCurrentTime(currentStr));
    dispatch(setFormattedNewTime(newStr));
    dispatch(setDisplayTimeZone(`${newStr} ${zone}`));
  }, [tzRow.current_time_zone, dispatch, setFormattedCurrentTime, setFormattedNewTime, setDisplayTimeZone]);

  const filteredZones = timeZones.filter((z) =>
    z.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRightPanel = () => {
    switch (selectedTab) {
      case 0:
        return (
          <div style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>Terms & Conditions</h3>
            <p style={{ color: '#555', lineHeight: 1.6, marginBottom: 16 }}>
              Terms of service are the legal agreements between a service provider and a person who wants to use that service.
              The person must agree to abide by the terms of service in order to use the offered service.
              Terms of service can also be merely a disclaimer, especially regarding the use of website.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <input type="checkbox" id="agree-tc" checked={isAccepted} onChange={(e) => setIsAccepted(e.target.checked)} style={{ width: 16, height: 16 }} />
              <label htmlFor="agree-tc" style={{ fontSize: 14 }}>
                By Agreeing, you <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#1976d2' }}>Read and Accept our Terms and Conditions</a>
              </label>
            </div>
            {showMessage && <div style={{ padding: 10, background: isAccepted ? '#e8f5e9' : '#ffebee', borderRadius: 4, marginBottom: 10 }}>{messageText}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleDecline} style={{ padding: '8px 24px', background: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>Decline</button>
              <button onClick={handleAccept} style={{ padding: '8px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>Accept</button>
            </div>
          </div>
        );

      case 1:
        return (
          <div style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>Date Format</h3>
            <p>Current Format: <strong>{dateRow.value}</strong> ({dateRow.date_format})</p>
            {settingsState.settingConfig?.lastupdated_dateformat && (
              <p style={{ color: '#666' }}>Saved Format: {settingsState.settingConfig.lastupdated_dateformat}</p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
              <button onClick={() => { loadDateFormats(); setShowDateDialog(true); }} style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Change Date Format</button>
              <button onClick={() => saveDateFormat(dateRow.value)} style={{ padding: '8px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Save</button>
            </div>
            {showDateDialog && (
              <DateFormatDialog
                dateFormats={settingsState.dateFormats}
                selectedFormat={dateRow.date_format}
                onSelect={(format) => { setDateRow({ value: format, date_format: format }); dispatch(setDisplayDateFormat(format)); setShowDateDialog(false); }}
                onClose={() => setShowDateDialog(false)}
              />
            )}
          </div>
        );

      case 2:
        return (
          <div style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>Time Format</h3>
            <p>Current Time: <strong>{timeRow.value}</strong> ({timeRow.timeFormatLabel})</p>
            {settingsState.settingConfig?.current_timeformat && (
              <p style={{ color: '#666' }}>Saved Format: {settingsState.settingConfig.current_timeformat}</p>
            )}
            <div style={{ display: 'flex', gap: 15, marginTop: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <input type="radio" name="timeFormat" value="hh:mm A" checked={timeRow.time_format === 'hh:mm A'} onChange={() => handleTimeFormatChange('hh:mm A')} /> 12 Hours
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <input type="radio" name="timeFormat" value="HH:mm" checked={timeRow.time_format === 'HH:mm'} onChange={() => handleTimeFormatChange('HH:mm')} /> 24 Hours
              </label>
            </div>
            <button onClick={() => saveTimeFormat(timeRow.value)} style={{ marginTop: 15, padding: '8px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Save</button>
          </div>
        );

      case 3:
        return (
          <div style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>Server Business Time Zone</h3>
            <p>Server Time Zone: <strong>{tzRow.current_time_zone}</strong></p>
            <p style={{ color: '#666' }}>This timezone is determined by the server configuration.</p>
          </div>
        );

      case 4:
        return (
          <div style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>Display Time Zone</h3>
            <p>Current: <strong>{settingsState.formattedCurrentTime || '-'}</strong></p>
            <p>New: <strong>{settingsState.formattedNewTime || '-'}</strong> {tzRow.new_time_zone}</p>
            {settingsState.settingConfig?.display_timezone && (
              <p style={{ color: '#666' }}>Saved: {settingsState.settingConfig.display_timezone}</p>
            )}
            <div style={{ position: 'relative', marginTop: 10, maxWidth: 400 }}>
              <input type="text" placeholder="Search timezone..." value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4 }}
              />
              {showDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 200, overflowY: 'auto', background: '#fff', border: '1px solid #ccc', borderRadius: '0 0 4px 4px', zIndex: 10 }}>
                  {filteredZones.slice(0, 50).map((zone) => (
                    <div key={zone} onClick={() => handleSelectTimezone(zone)}
                      style={{ padding: '6px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                      onMouseOver={(e) => (e.currentTarget.style.background = '#e3f2fd')}
                      onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}>
                      {zone}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => saveTimeZone(settingsState.displayTimeZone)} style={{ marginTop: 15, padding: '8px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Save</button>
          </div>
        );

      case 5:
        return <CorporationProfile />;

      case 6:
        return (
          <div style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>Remote Access Key Setup</h3>
            <p style={{ color: '#555', marginBottom: 12 }}>Remote Access Key Setup</p>
            <div style={{ maxWidth: 400 }}>
              <input type="text" placeholder="Enter 8-character remote key" value={remoteKey}
                onChange={(e) => setRemoteKey(e.target.value)} maxLength={8}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, marginBottom: 8 }}
              />
              <p style={{ fontSize: 12, color: '#666' }}>{remoteKey.length}/8 characters</p>
              {settingsState.remoteKeyError && <p style={{ color: '#f44336' }}>{settingsState.remoteKeyError}</p>}
              {settingsState.remoteKeySuccess && <p style={{ color: '#4CAF50' }}>{settingsState.remoteKeySuccess}</p>}
              <button onClick={() => storeRemoteAccessKey(remoteKey)} style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Register Your Key</button>
            </div>
          </div>
        );

      default:
        return <div style={{ padding: 24, color: '#999' }}>Select a setting from the left panel</div>;
    }
  };

  return (
    <div style={{ padding: '0 20px 20px' }}>
      {/* Breadcrumb */}
      <div style={{ padding: '8px 0', fontSize: 13, color: '#666' }}>Home</div>
      <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 500 }}>Settings</h2>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Left: 2-column card grid */}
        <div style={{ flex: '0 0 580px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {SETTING_CARDS.map((title, idx) => {
              const subtitle = getCardSubtitle(idx);
              const action = getCardAction(idx);
              const isActive = selectedTab === idx;
              return (
                <div
                  key={title}
                  onClick={() => selectEvent(idx)}
                  style={{
                    padding: '16px 18px',
                    border: isActive ? '1px solid #1976d2' : '1px solid #e0e0e0',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: isActive ? '#f5f9ff' : '#fff',
                    minHeight: 80,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, textDecoration: 'underline', color: '#333' }}>{title}</div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{subtitle}</div>
                  {action && (
                    <div style={{ fontSize: 12, color: '#1976d2', cursor: 'pointer' }}>{action}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: content panel */}
        <div style={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 6, background: '#fff', minHeight: 400 }}>
          {settingsState.isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <span>Loading...</span>
            </div>
          ) : (
            renderRightPanel()
          )}
        </div>
      </div>

      {/* Toast */}
      {settingsState.successMessage && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#4CAF50', color: '#fff', padding: '10px 20px', borderRadius: 4, zIndex: 1000 }}>
          {settingsState.successMessage}
        </div>
      )}
    </div>
  );
};
