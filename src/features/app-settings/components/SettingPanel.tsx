/**
 * Setting Panel (left sidebar settings tabs + right content)
 * Origin: AppSettingPage.html - 7 setting tabs
 * Tabs: T&C, Date Format, Time Format, Server TZ, Display TZ, Corp Profile, Remote Key
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useAppSettingsState } from '../hooks/useAppSettingsState';
import { DateFormatDialog } from './DateFormatDialog';
import { CorporationProfile } from './CorporationProfile';

const SETTING_TABS = [
  { title: 'Terms & Conditions', content: 'Last Updated dd mmm yyyy HH:MM AM', events: 'Read and Accept Terms' },
  { title: 'Date Format', content: 'Current Format August 31st, 2000', events: 'Change Date Format' },
  { title: 'Time Format', content: 'Current Time Format: HH:MM AM/PM', events: 'Change Time Format' },
  { title: 'Server Business Time Zone', content: '(UTC-05:00) Eastern Time (US & Canada)' },
  { title: 'Display Time Zone', content: 'Current Display 01 : 01 AM', events: 'Change Display Time' },
  { title: 'Corp Profile Configuration' },
  { title: 'Remote Access Key Setup' },
];

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

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0: // Terms & Conditions
        return (
          <div style={{ padding: 20 }}>
            <h3>Terms & Conditions</h3>
            {settingsState.settingConfig?.lastupdated_termsconditions && (
              <p style={{ color: '#666' }}>
                Last Updated: {settingsState.settingConfig.lastupdated_termsconditions}
              </p>
            )}
            <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8, maxHeight: 300, overflowY: 'auto', marginBottom: 15, background: '#fafafa' }}>
              <p>Please read and accept the Terms and Conditions to proceed.</p>
            </div>
            {showMessage && <div style={{ padding: 10, background: isAccepted ? '#e8f5e9' : '#ffebee', borderRadius: 4, marginBottom: 10 }}>{messageText}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleAccept} style={{ padding: '8px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Accept</button>
              <button onClick={handleDecline} style={{ padding: '8px 20px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Decline</button>
            </div>
          </div>
        );

      case 1: // Date Format
        return (
          <div style={{ padding: 20 }}>
            <h3>Date Format</h3>
            <p>Current Format: <strong>{dateRow.value}</strong> ({dateRow.date_format})</p>
            {settingsState.settingConfig?.lastupdated_dateformat && (
              <p style={{ color: '#666' }}>Saved Format: {settingsState.settingConfig.lastupdated_dateformat}</p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button onClick={() => { loadDateFormats(); setShowDateDialog(true); }} style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                Change Date Format
              </button>
              <button onClick={() => saveDateFormat(dateRow.value)} style={{ padding: '8px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                Save
              </button>
            </div>
            {showDateDialog && (
              <DateFormatDialog
                dateFormats={settingsState.dateFormats}
                selectedFormat={dateRow.date_format}
                onSelect={(format) => {
                  const now = new Date();
                  const options: Intl.DateTimeFormatOptions = {};
                  // Use the raw format string for display
                  setDateRow({ value: format, date_format: format });
                  dispatch(setDisplayDateFormat(format));
                  setShowDateDialog(false);
                }}
                onClose={() => setShowDateDialog(false)}
              />
            )}
          </div>
        );

      case 2: // Time Format
        return (
          <div style={{ padding: 20 }}>
            <h3>Time Format</h3>
            <p>Current Time: <strong>{timeRow.value}</strong> ({timeRow.timeFormatLabel})</p>
            {settingsState.settingConfig?.current_timeformat && (
              <p style={{ color: '#666' }}>Saved Format: {settingsState.settingConfig.current_timeformat}</p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <input type="radio" name="timeFormat" value="hh:mm A" checked={timeRow.time_format === 'hh:mm A'} onChange={() => handleTimeFormatChange('hh:mm A')} /> 12 Hours
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <input type="radio" name="timeFormat" value="HH:mm" checked={timeRow.time_format === 'HH:mm'} onChange={() => handleTimeFormatChange('HH:mm')} /> 24 Hours
              </label>
            </div>
            <button onClick={() => saveTimeFormat(timeRow.value)} style={{ marginTop: 15, padding: '8px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Save
            </button>
          </div>
        );

      case 3: // Server Business Time Zone
        return (
          <div style={{ padding: 20 }}>
            <h3>Server Business Time Zone</h3>
            <p>Current Server Timezone: <strong>{tzRow.current_time_zone}</strong></p>
            <p style={{ color: '#666' }}>This timezone is determined by the server configuration.</p>
          </div>
        );

      case 4: // Display Time Zone
        return (
          <div style={{ padding: 20 }}>
            <h3>Display Time Zone</h3>
            <p>Current: <strong>{settingsState.formattedCurrentTime || '-'}</strong></p>
            <p>New: <strong>{settingsState.formattedNewTime || '-'}</strong> {tzRow.new_time_zone}</p>
            {settingsState.settingConfig?.display_timezone && (
              <p style={{ color: '#666' }}>Saved: {settingsState.settingConfig.display_timezone}</p>
            )}
            <div style={{ position: 'relative', marginTop: 10, maxWidth: 400 }}>
              <input
                type="text"
                placeholder="Search timezone..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4 }}
              />
              {showDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 200, overflowY: 'auto', background: '#fff', border: '1px solid #ccc', borderRadius: '0 0 4px 4px', zIndex: 10 }}>
                  {filteredZones.slice(0, 50).map((zone) => (
                    <div key={zone} onClick={() => handleSelectTimezone(zone)} style={{ padding: '6px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                      onMouseOver={(e) => (e.currentTarget.style.background = '#e3f2fd')}
                      onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}>
                      {zone}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => saveTimeZone(settingsState.displayTimeZone)} style={{ marginTop: 15, padding: '8px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Save
            </button>
          </div>
        );

      case 5: // Corp Profile Configuration
        return <CorporationProfile />;

      case 6: // Remote Access Key Setup
        return (
          <div style={{ padding: 20 }}>
            <h3>Remote Access Key Setup</h3>
            <div style={{ maxWidth: 400 }}>
              <input
                type="text"
                placeholder="Enter 8-character remote key"
                value={remoteKey}
                onChange={(e) => setRemoteKey(e.target.value)}
                maxLength={8}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, marginBottom: 10 }}
              />
              <p style={{ fontSize: 12, color: '#666' }}>{remoteKey.length}/8 characters</p>
              {settingsState.remoteKeyError && <p style={{ color: '#f44336' }}>{settingsState.remoteKeyError}</p>}
              {settingsState.remoteKeySuccess && <p style={{ color: '#4CAF50' }}>{settingsState.remoteKeySuccess}</p>}
              <button onClick={() => storeRemoteAccessKey(remoteKey)} style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                Store Key
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#fff' }}>
      {/* Left sidebar - setting tabs */}
      <div style={{ width: 280, borderRight: '1px solid #e0e0e0', overflowY: 'auto' }}>
        {SETTING_TABS.map((tab, idx) => (
          <div
            key={tab.title}
            onClick={() => selectEvent(idx)}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0',
              background: selectedTab === idx ? '#e3f2fd' : 'transparent',
              borderLeft: selectedTab === idx ? '3px solid #1976d2' : '3px solid transparent',
            }}
          >
            <div style={{ fontWeight: 500, fontSize: 14 }}>{tab.title}</div>
            {tab.content && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{tab.content}</div>}
            {tab.events && <div style={{ fontSize: 11, color: '#1976d2', marginTop: 2 }}>{tab.events}</div>}
          </div>
        ))}
      </div>

      {/* Right content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {settingsState.isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <span>Loading...</span>
          </div>
        ) : (
          renderTabContent()
        )}
        {settingsState.successMessage && (
          <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#4CAF50', color: '#fff', padding: '10px 20px', borderRadius: 4, zIndex: 1000 }}>
            {settingsState.successMessage}
          </div>
        )}
      </div>
    </div>
  );
};
