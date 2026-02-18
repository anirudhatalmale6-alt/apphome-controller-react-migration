/**
 * Corporation Profile Configuration
 * Logo upload with cropping + form fields
 * Origin: AppSettingPage.js tabIndex === 5 (line ~471) + AppSettingPage.html Corp Profile section
 *
 * Note: Cropper.js integration is kept simple - the client may want to customize the UI.
 * The image cropping uses native canvas API instead of Cropper.js for zero-dependency approach.
 */
import React, { useState, useRef, useCallback } from 'react';
import { useAppSettingsState } from '../hooks/useAppSettingsState';
import type { CorporationProfile as CorporationProfileType } from '../types/AppSettingsTypes';

export const CorporationProfile: React.FC = () => {
  const {
    settingsState,
    saveCorporationProfile,
    dispatch,
    setCorporationProfile,
    setIsCropping,
  } = useAppSettingsState();

  const [corp, setCorp] = useState<CorporationProfileType>({
    industry: '',
    lastUpdatedTime: new Date().toISOString(),
  });
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreviewSrc(dataUrl);
      dispatch(setIsCropping(true));
    };
    reader.readAsDataURL(file);
  }, [dispatch, setIsCropping]);

  const handleCrop = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple center crop
    const size = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - size) / 2;
    const sy = (img.naturalHeight - size) / 2;

    canvas.width = 200;
    canvas.height = 200;
    ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);

    const croppedData = canvas.toDataURL('image/png');
    setCorp((prev) => ({ ...prev, logoData: croppedData }));
    dispatch(setIsCropping(false));
    setPreviewSrc('');
  }, [dispatch, setIsCropping]);

  const handleRemoveLogo = useCallback(() => {
    setCorp((prev) => ({ ...prev, logoData: null }));
    setPreviewSrc('');
    dispatch(setIsCropping(false));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [dispatch, setIsCropping]);

  const handleReset = useCallback(() => {
    if (window.confirm('Reset all fields?')) {
      setCorp({ industry: '' });
      setPreviewSrc('');
      dispatch(setIsCropping(false));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [dispatch, setIsCropping]);

  const handleSubmit = useCallback(() => {
    setFormSubmitted(true);
    if (!corp.logoData || !corp.name) return;
    saveCorporationProfile(corp);
  }, [corp, saveCorporationProfile]);

  return (
    <div style={{ padding: 20 }}>
      <h3>Corp Profile Configuration</h3>

      {/* Logo Upload */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 500 }}>Corporation Logo</label>
        <div style={{ marginTop: 8 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginBottom: 10 }}
          />
        </div>

        {/* Cropping area */}
        {settingsState.isCropping && previewSrc && (
          <div style={{ marginTop: 10 }}>
            <img
              ref={imgRef}
              src={previewSrc}
              alt="Preview"
              style={{ maxWidth: 400, maxHeight: 300, border: '1px solid #ccc' }}
              crossOrigin="anonymous"
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button onClick={handleCrop} style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                Crop & Apply
              </button>
              <button onClick={() => { dispatch(setIsCropping(false)); setPreviewSrc(''); }} style={{ padding: '8px 20px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Logo preview */}
        {corp.logoData && (
          <div style={{ marginTop: 10 }}>
            <img src={corp.logoData} alt="Logo" style={{ maxWidth: 200, maxHeight: 200, border: '1px solid #ccc', borderRadius: 4 }} />
            <div style={{ marginTop: 5 }}>
              <button onClick={handleRemoveLogo} style={{ padding: '4px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                Remove Logo
              </button>
            </div>
          </div>
        )}
        {formSubmitted && !corp.logoData && <p style={{ color: '#f44336', fontSize: 12 }}>Logo is required</p>}
      </div>

      {/* Corp Fields */}
      <div style={{ maxWidth: 500 }}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>Corporation Name *</label>
          <input
            type="text"
            value={corp.name || ''}
            onChange={(e) => setCorp((prev) => ({ ...prev, name: e.target.value }))}
            style={{ width: '100%', padding: '8px 12px', border: `1px solid ${formSubmitted && !corp.name ? '#f44336' : '#ccc'}`, borderRadius: 4 }}
          />
          {formSubmitted && !corp.name && <p style={{ color: '#f44336', fontSize: 12 }}>Name is required</p>}
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>Industry</label>
          <input
            type="text"
            value={corp.industry || ''}
            onChange={(e) => setCorp((prev) => ({ ...prev, industry: e.target.value }))}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={handleSubmit} disabled={settingsState.isLoading} style={{ padding: '8px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {settingsState.isLoading ? 'Saving...' : 'Save'}
        </button>
        <button onClick={handleReset} style={{ padding: '8px 20px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Reset
        </button>
        <button onClick={() => { dispatch(setIsCropping(false)); setPreviewSrc(''); }} style={{ padding: '8px 20px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
};
