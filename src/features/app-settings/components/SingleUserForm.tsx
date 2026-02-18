/**
 * Single User Form
 * Add/Edit user with ~30 fields across 3 sections
 * Origin: SingleUserFormPage.html (673 lines) + AppSettingPage.js submitForm/editUser
 * Sections: Personal Info, Enrollment Data, Access & Admin Info
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useAppSettingsState } from '../hooks/useAppSettingsState';
import type { UserFormData, SelectOption } from '../types/AppSettingsTypes';

const PASSKEY_OPTIONS: SelectOption[] = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];

const MULTI_DEVICE_OPTIONS: SelectOption[] = [
  { label: 'No', value: 'no' },
  { label: 'Yes (requires remote key)', value: 'yes' },
];

const emptyForm: UserFormData = {
  email: '', firstName: '', lastName: '',
  enrollDate: null, activeStatus: '', aurnantAccount: '', format: '',
  disable: '', lastKYU: '', lastKYUDate: null,
  remoteKey: '', userSecretKey: '', enrollEmail: '',
  encryptedPassword: '', dynamicEncryptedKey: '',
  passkeyEnabled: '', passkeyMedia: '', plainPassword: '',
  multiDeviceAccess: '', multiDeviceAuth: '', passkeyAccess: '',
  userCity: '', userCountry: '',
  firstAccessIP: '', firstAccessDevice: '',
  lastAccessDate: null, lastAccessLocation: '', lastAccessDevice: '',
  darmentDate: null, disableDate: null,
  userStatus: '', userLock: '',
  lastUpdatedBy: '', lastUpdatedDate: null,
  companyName: '', id: '',
  supervisorEmail: '', adminEmail: '',
  landlineContact: '', primaryContact: '',
};

export const SingleUserForm: React.FC = () => {
  const {
    settingsState,
    submitUserForm,
    cancelForm,
    deleteUser,
    dispatch,
    setUserFormData,
  } = useAppSettingsState();

  const [form, setForm] = useState<UserFormData>(settingsState.userFormData || emptyForm);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (settingsState.userFormData) {
      setForm(settingsState.userFormData);
    }
  }, [settingsState.userFormData]);

  const updateField = useCallback((key: keyof UserFormData, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      dispatch(setUserFormData(updated));
      return updated;
    });
    if (errors[key]) {
      setErrors((prev) => { const copy = { ...prev }; delete copy[key]; return copy; });
    }
  }, [dispatch, setUserFormData, errors]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    const newErrors: Record<string, boolean> = {};
    if (!form.email) newErrors.email = true;
    if (!form.firstName) newErrors.firstName = true;
    if (!form.lastName) newErrors.lastName = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    submitUserForm();
  }, [form, submitUserForm]);

  const handleDelete = useCallback(() => {
    if (!settingsState.editingUserId) return;
    const type = settingsState.activeEditType;
    if (type === 'existing') {
      deleteUser('existingDelete', settingsState.editingUserId);
    } else {
      deleteUser('reviewExistingEditDelete', settingsState.editingUserId);
    }
  }, [settingsState.editingUserId, settingsState.activeEditType, deleteUser]);

  const fieldResources = settingsState.userFieldResources;
  const passkeyMediaOptions = fieldResources?.passkeyMediaOptions || [];
  const multiDeviceAuthOptions = fieldResources?.multiDeviceAuthOptions || [];
  const passkeyAccessOptions = fieldResources?.passkeyAccessOptions || [];

  const inputStyle = (hasError: boolean) => ({
    width: '100%',
    padding: '6px 10px',
    border: `1px solid ${hasError ? '#f44336' : '#ccc'}`,
    borderRadius: 4,
    fontSize: 13,
  });

  const labelStyle = { display: 'block', fontWeight: 500 as const, marginBottom: 3, fontSize: 13 };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().slice(0, 16);
  };

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>
          {settingsState.isEditing ? 'Edit User' : 'Add New User'}
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {settingsState.isEditing && (
            <button onClick={handleDelete} style={{ padding: '6px 14px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
              Delete
            </button>
          )}
          <button onClick={cancelForm} style={{ padding: '6px 14px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
            Cancel
          </button>
        </div>
      </div>

      {/* Form error display */}
      {Object.keys(settingsState.formErrors).length > 0 && (
        <div style={{ background: '#fff3e0', padding: 10, borderRadius: 4, marginBottom: 12, fontSize: 13 }}>
          <strong>Validation Errors:</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
            {Object.entries(settingsState.formErrors).map(([key, msg]) => (
              <li key={key}>{key}: {msg}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Personal Information */}
        <fieldset style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: 16, marginBottom: 16 }}>
          <legend style={{ fontWeight: 600, fontSize: 14, padding: '0 8px' }}>Personal Information</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} style={inputStyle(!!errors.email)} required />
            </div>
            <div>
              <label style={labelStyle}>First Name *</label>
              <input type="text" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} style={inputStyle(!!errors.firstName)} required />
            </div>
            <div>
              <label style={labelStyle}>Last Name *</label>
              <input type="text" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} style={inputStyle(!!errors.lastName)} required />
            </div>
            <div>
              <label style={labelStyle}>Company Name</label>
              <input type="text" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input type="text" value={form.userCity} onChange={(e) => updateField('userCity', e.target.value)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input type="text" value={form.userCountry} onChange={(e) => updateField('userCountry', e.target.value)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>Supervisor Email</label>
              <input type="email" value={form.supervisorEmail} onChange={(e) => updateField('supervisorEmail', e.target.value)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>Admin Email</label>
              <input type="email" value={form.adminEmail} onChange={(e) => updateField('adminEmail', e.target.value)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>Primary Contact (Mobile)</label>
              <input type="text" value={form.primaryContact} onChange={(e) => updateField('primaryContact', e.target.value)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>Landline</label>
              <input type="text" value={form.landlineContact} onChange={(e) => updateField('landlineContact', e.target.value)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>ID</label>
              <input type="text" value={form.id} onChange={(e) => updateField('id', e.target.value)} style={inputStyle(false)} />
            </div>
          </div>
        </fieldset>

        {/* Section 2: Enrollment Data */}
        <fieldset style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: 16, marginBottom: 16 }}>
          <legend style={{ fontWeight: 600, fontSize: 14, padding: '0 8px' }}>Enrollment Data</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Enroll Date</label>
              <input type="datetime-local" value={formatDateForInput(form.enrollDate)} onChange={(e) => updateField('enrollDate', e.target.value ? new Date(e.target.value) : null)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>Enroll Email</label>
              <input type="email" value={form.enrollEmail} onChange={(e) => updateField('enrollEmail', e.target.value)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={form.plainPassword} onChange={(e) => updateField('plainPassword', e.target.value)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>Passkey Enabled</label>
              <select value={form.passkeyEnabled} onChange={(e) => updateField('passkeyEnabled', e.target.value)} style={inputStyle(false)}>
                <option value="">Select</option>
                {PASSKEY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Passkey Media</label>
              <select value={form.passkeyMedia} onChange={(e) => updateField('passkeyMedia', e.target.value)} style={inputStyle(false)}>
                <option value="">Select</option>
                {passkeyMediaOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Multi-Device Access</label>
              <select value={form.multiDeviceAccess} onChange={(e) => updateField('multiDeviceAccess', e.target.value)} style={inputStyle(false)}>
                <option value="">Select</option>
                {MULTI_DEVICE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Multi-Device Auth</label>
              <select value={form.multiDeviceAuth} onChange={(e) => updateField('multiDeviceAuth', e.target.value)} style={inputStyle(false)}>
                <option value="">Select</option>
                {multiDeviceAuthOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Passkey Access</label>
              <select value={form.passkeyAccess} onChange={(e) => updateField('passkeyAccess', e.target.value)} style={inputStyle(false)}>
                <option value="">Select</option>
                {passkeyAccessOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Remote Key</label>
              <input type="text" value={form.remoteKey} onChange={(e) => updateField('remoteKey', e.target.value)} style={inputStyle(false)} />
            </div>
          </div>
        </fieldset>

        {/* Section 3: Access & Admin Info */}
        <fieldset style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: 16, marginBottom: 16 }}>
          <legend style={{ fontWeight: 600, fontSize: 14, padding: '0 8px' }}>Access & Admin Info</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Active Status</label>
              <select value={form.activeStatus} onChange={(e) => updateField('activeStatus', e.target.value)} style={inputStyle(false)}>
                <option value="">Select</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>User Status</label>
              <input type="text" value={form.userStatus} onChange={(e) => updateField('userStatus', e.target.value)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>User Lock</label>
              <select value={form.userLock} onChange={(e) => updateField('userLock', e.target.value)} style={inputStyle(false)}>
                <option value="">Select</option>
                <option value="0">Unlocked</option>
                <option value="1">Locked</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Disabled</label>
              <select value={form.disable} onChange={(e) => updateField('disable', e.target.value)} style={inputStyle(false)}>
                <option value="">Select</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Aurnant Account</label>
              <input type="text" value={form.aurnantAccount} onChange={(e) => updateField('aurnantAccount', e.target.value)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>Format</label>
              <input type="text" value={form.format} onChange={(e) => updateField('format', e.target.value)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>Last KYU</label>
              <input type="text" value={form.lastKYU} onChange={(e) => updateField('lastKYU', e.target.value)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>Last KYU Date</label>
              <input type="datetime-local" value={formatDateForInput(form.lastKYUDate)} onChange={(e) => updateField('lastKYUDate', e.target.value ? new Date(e.target.value) : null)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>First Access IP</label>
              <input type="text" value={form.firstAccessIP} onChange={(e) => updateField('firstAccessIP', e.target.value)} style={inputStyle(false)} readOnly />
            </div>
            <div>
              <label style={labelStyle}>First Access Device</label>
              <input type="text" value={form.firstAccessDevice} onChange={(e) => updateField('firstAccessDevice', e.target.value)} style={inputStyle(false)} readOnly />
            </div>
            <div>
              <label style={labelStyle}>Last Access Date</label>
              <input type="datetime-local" value={formatDateForInput(form.lastAccessDate)} onChange={(e) => updateField('lastAccessDate', e.target.value ? new Date(e.target.value) : null)} style={inputStyle(false)} readOnly />
            </div>
            <div>
              <label style={labelStyle}>Last Access Location</label>
              <input type="text" value={form.lastAccessLocation} onChange={(e) => updateField('lastAccessLocation', e.target.value)} style={inputStyle(false)} readOnly />
            </div>
            <div>
              <label style={labelStyle}>Last Access Device</label>
              <input type="text" value={form.lastAccessDevice} onChange={(e) => updateField('lastAccessDevice', e.target.value)} style={inputStyle(false)} readOnly />
            </div>
            <div>
              <label style={labelStyle}>Darment Date</label>
              <input type="date" value={form.darmentDate ? form.darmentDate.toISOString().split('T')[0] : ''} onChange={(e) => updateField('darmentDate', e.target.value ? new Date(e.target.value) : null)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>Disable Date</label>
              <input type="date" value={form.disableDate ? form.disableDate.toISOString().split('T')[0] : ''} onChange={(e) => updateField('disableDate', e.target.value ? new Date(e.target.value) : null)} style={inputStyle(false)} />
            </div>
            <div>
              <label style={labelStyle}>Last Updated By</label>
              <input type="text" value={form.lastUpdatedBy} onChange={(e) => updateField('lastUpdatedBy', e.target.value)} style={inputStyle(false)} readOnly />
            </div>
            <div>
              <label style={labelStyle}>Last Updated Date</label>
              <input type="datetime-local" value={formatDateForInput(form.lastUpdatedDate)} onChange={(e) => updateField('lastUpdatedDate', e.target.value ? new Date(e.target.value) : null)} style={inputStyle(false)} readOnly />
            </div>
          </div>
        </fieldset>

        {/* Submit */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={cancelForm} style={{ padding: '8px 20px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={settingsState.isLoadingState} style={{ padding: '8px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {settingsState.isLoadingState ? 'Saving...' : settingsState.isEditing ? 'Update User' : 'Add User'}
          </button>
        </div>
      </form>
    </div>
  );
};
