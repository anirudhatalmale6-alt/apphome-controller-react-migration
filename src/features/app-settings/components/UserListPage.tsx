/**
 * User List Page
 * Two sub-tabs: Users | Bulk Upload Review
 * Origin: UserListPage.html (520 lines) + AppSettingPage.js user management
 * Ref: Feedback img 2 (Users tab) + img 4 (Bulk Upload Review tab)
 */
import React, { useCallback, useState, useRef } from 'react';
import { useAppSettingsState } from '../hooks/useAppSettingsState';

// ─── Pagination Component ───
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPages = 5;
    const half = Math.floor(maxPages / 2);
    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  if (totalPages <= 1) return null;

  const btnBase: React.CSSProperties = {
    padding: '6px 12px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500, minWidth: 36,
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 16, alignItems: 'center' }}>
      <button onClick={() => onPageChange(1)} disabled={currentPage <= 1}
        style={{ ...btnBase, background: '#4CAF50', color: '#fff', opacity: currentPage <= 1 ? 0.5 : 1 }}>First</button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}
        style={{ ...btnBase, background: '#4CAF50', color: '#fff', opacity: currentPage <= 1 ? 0.5 : 1 }}>&lt;</button>
      {getPageNumbers().map((p) => (
        <button key={p} onClick={() => onPageChange(p)}
          style={{ ...btnBase, background: p === currentPage ? '#1976d2' : '#4CAF50', color: '#fff' }}>{p}</button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}
        style={{ ...btnBase, background: '#4CAF50', color: '#fff', opacity: currentPage >= totalPages ? 0.5 : 1 }}>&gt;</button>
      <button onClick={() => onPageChange(totalPages)} disabled={currentPage >= totalPages}
        style={{ ...btnBase, background: '#4CAF50', color: '#fff', opacity: currentPage >= totalPages ? 0.5 : 1 }}>Last</button>
    </div>
  );
};

export const UserListPage: React.FC = () => {
  const {
    settingsState,
    loadExistingUsers,
    loadReviewUsers,
    validateExcelForUsers,
    importExcelForUsers,
    deleteUser,
    grantAccess,
    editUser,
    dispatch,
    setActiveSection,
    setShowForm,
    toggleUserSelection,
    toggleAllUsers,
    toggleReviewUserSelection,
    toggleAllReviewUsers,
    setCurrentPageExisting,
    setCurrentPageReview,
    setLoadingState,
  } = useAppSettingsState();

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [base64Content, setBase64Content] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSection = settingsState.activeSection;

  // ─── User Actions ───
  const handleEditUser = useCallback((user: any, type: 'existing' | 'review') => {
    editUser(user, type);
  }, [editUser]);

  const handleDeleteUser = useCallback((userId: string, type: 'existing' | 'review') => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    if (type === 'existing') {
      deleteUser('existingDelete', userId);
    } else {
      deleteUser('reviewExistingEditDelete', userId);
    }
  }, [deleteUser]);

  const handleBulkDelete = useCallback(() => {
    const ids = settingsState.selectedUserIds;
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected user(s)?`)) return;
    const result = ids.map((v) => `"${v}"`).join(',');
    deleteUser('multiDelete', result);
  }, [settingsState.selectedUserIds, deleteUser]);

  const handleReviewBulkDelete = useCallback(() => {
    const ids = settingsState.reviewSelectedUserIds;
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected user(s)?`)) return;
    const result = ids.map((v) => `"${v}"`).join(',');
    deleteUser('reviewMultiDelete', result);
  }, [settingsState.reviewSelectedUserIds, deleteUser]);

  const handleGrantAccess = useCallback(() => {
    if (settingsState.selectedUserIds.length === 0) return;
    grantAccess();
  }, [settingsState.selectedUserIds, grantAccess]);

  // ─── File Upload ───
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xls', 'xlsx', 'csv'].includes(ext || '')) {
      alert('Only Excel files (XLS, XLSX, CSV) are allowed!');
      return;
    }
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setBase64Content(result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImport = useCallback(async () => {
    if (!uploadFile) return;
    const result = await importExcelForUsers(uploadFile.name, uploadFile.type, uploadFile.size, base64Content);
    if (result?.result === 'success') {
      setShowUploadDialog(false);
      setUploadFile(null);
      setTimeout(() => loadReviewUsers(10, 1), 200);
    } else if (result?.result?.includes('The Excel format is incorrect')) {
      alert('The Excel format is incorrect!');
    }
  }, [uploadFile, base64Content, importExcelForUsers, loadReviewUsers]);

  const handlePageChange = useCallback((page: number, type: 'existing' | 'review') => {
    if (type === 'existing') {
      dispatch(setCurrentPageExisting(page));
      loadExistingUsers(settingsState.itemsPerPageExisting, page);
    } else {
      dispatch(setCurrentPageReview(page));
      loadReviewUsers(settingsState.itemsPerPageReview, page);
    }
  }, [dispatch, loadExistingUsers, loadReviewUsers, settingsState.itemsPerPageExisting, settingsState.itemsPerPageReview, setCurrentPageExisting, setCurrentPageReview]);

  const handleSectionChange = useCallback((section: 'users' | 'bulk') => {
    dispatch(setActiveSection(section));
    dispatch(setLoadingState(true));
    if (section === 'users') {
      setTimeout(() => { loadExistingUsers(); dispatch(setLoadingState(false)); }, 100);
    } else {
      setTimeout(() => { loadReviewUsers(); dispatch(setLoadingState(false)); }, 100);
    }
  }, [dispatch, setActiveSection, setLoadingState, loadExistingUsers, loadReviewUsers]);

  const isAllSelected = settingsState.existingUserList.length > 0 && settingsState.selectedUserIds.length === settingsState.existingUserList.length;
  const isAllReviewSelected = settingsState.reviewUserList.length > 0 && settingsState.reviewSelectedUserIds.length === settingsState.reviewUserList.length;

  // Icon button styles
  const editIconBtn: React.CSSProperties = { width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16, marginRight: 6 };
  const deleteIconBtn: React.CSSProperties = { width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16 };
  const thStyle: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#333', whiteSpace: 'nowrap' };
  const tdStyle: React.CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0' };

  return (
    <div style={{ padding: '16px 20px' }}>
      {/* Header with title + Add New User */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>User List</h2>
        <button onClick={() => setShowUploadDialog(true)}
          style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>+</span> Add New User
        </button>
      </div>

      {/* Sub-tabs: Users | Bulk Upload Review */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #e0e0e0' }}>
        <button onClick={() => handleSectionChange('users')}
          style={{ padding: '10px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: activeSection === 'users' ? 600 : 400, color: activeSection === 'users' ? '#1976d2' : '#666', borderBottom: activeSection === 'users' ? '2px solid #1976d2' : '2px solid transparent', marginBottom: -2 }}>
          Users
        </button>
        <button onClick={() => handleSectionChange('bulk')}
          style={{ padding: '10px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: activeSection === 'bulk' ? 600 : 400, color: activeSection === 'bulk' ? '#1976d2' : '#666', borderBottom: activeSection === 'bulk' ? '2px solid #1976d2' : '2px solid transparent', marginBottom: -2 }}>
          Bulk Upload Review
        </button>
      </div>

      {settingsState.isLoadingState ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Loading...</div>
      ) : activeSection === 'users' ? (
        /* ═══ Users Tab (ref img 2) ═══ */
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ ...thStyle, width: 40 }}>
                  <input type="checkbox" checked={isAllSelected} onChange={() => dispatch(toggleAllUsers())} />
                </th>
                <th style={thStyle}>First Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Active Status</th>
                <th style={thStyle}>Last Update Time</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {settingsState.existingUserList.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#999' }}>No users found</td></tr>
              ) : (
                settingsState.existingUserList.map((user, idx) => (
                  <tr key={user.user_id || idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>
                      <input type="checkbox" checked={settingsState.selectedUserIds.includes(user.user_id)} onChange={() => dispatch(toggleUserSelection(user.user_id))} />
                    </td>
                    <td style={tdStyle}>
                      {/* First name is a clickable link that opens edit form (ref img 2) */}
                      <a href="#" onClick={(e) => { e.preventDefault(); handleEditUser(user, 'existing'); }}
                        style={{ color: '#1976d2', textDecoration: 'none', cursor: 'pointer' }}>
                        {user.first_name || '-'}
                      </a>
                    </td>
                    <td style={tdStyle}>{user.email_id || '-'}</td>
                    <td style={tdStyle}>{user.active_status ?? '-'}</td>
                    <td style={tdStyle}>{user.last_update || user.enroll_datetime || '-'}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button onClick={() => handleDeleteUser(user.user_id, 'existing')} style={deleteIconBtn} title="Delete">
                        &#128465;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination currentPage={settingsState.currentPageExisting} totalPages={settingsState.existingTotalPages}
            onPageChange={(p) => handlePageChange(p, 'existing')} />
        </>
      ) : (
        /* ═══ Bulk Upload Review Tab (ref img 4) ═══ */
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ ...thStyle, width: 40 }}>
                  <input type="checkbox" checked={isAllReviewSelected} onChange={() => dispatch(toggleAllReviewUsers())} />
                </th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>First Name</th>
                <th style={thStyle}>Last Name</th>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Enroll Date</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settingsState.reviewUserList.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#999' }}>No review data found</td></tr>
              ) : (
                settingsState.reviewUserList.map((user, idx) => {
                  const d = typeof user.data_extract_json === 'object' ? user.data_extract_json as Record<string, any> : {};
                  return (
                    <tr key={user.user_id || idx} style={{ borderBottom: '1px solid #f0f0f0', background: user.hasException ? '#fff3e0' : 'transparent' }}>
                      <td style={tdStyle}>
                        <input type="checkbox" checked={settingsState.reviewSelectedUserIds.includes(user.user_id)} onChange={() => dispatch(toggleReviewUserSelection(user.user_id))} />
                      </td>
                      <td style={tdStyle}>{d.email_id || user.email_id || '-'}</td>
                      <td style={tdStyle}>{d.first_name || user.first_name || '-'}</td>
                      <td style={tdStyle}>{d.last_name || user.last_name || '-'}</td>
                      <td style={tdStyle}>{d.company_name || (user as any).company_name || '-'}</td>
                      <td style={tdStyle}>{d.enroll_datetime || (user as any).enroll_datetime || '-'}</td>
                      <td style={tdStyle}>{user.result || d.active_status || '-'}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <button onClick={() => handleEditUser(user as any, 'review')} style={editIconBtn} title="Edit">
                          &#9998;
                        </button>
                        <button onClick={() => handleDeleteUser(user.user_id, 'review')} style={deleteIconBtn} title="Delete">
                          &#128465;
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Bottom actions for bulk review */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <div>
              {settingsState.reviewSelectedUserIds.length > 0 && (
                <button onClick={handleReviewBulkDelete}
                  style={{ padding: '8px 20px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
                  Delete
                </button>
              )}
            </div>
            <Pagination currentPage={settingsState.currentPageReview} totalPages={settingsState.reviewTotalPages}
              onPageChange={(p) => handlePageChange(p, 'review')} />
          </div>
        </>
      )}

      {/* ═══ Upload Dialog (ref img 3 / img 5) ═══ */}
      {showUploadDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, maxWidth: 500, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600 }}>Upload Users</h3>

            {/* Drag & Drop zone */}
            <div style={{ border: '2px dashed #c7c7c7', borderRadius: 8, padding: '40px 20px', textAlign: 'center', background: '#fafafa', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>&#128196;</div>
              <p style={{ margin: '0 0 4px', color: '#555' }}>
                Drag & Drop file here or{' '}
                <label style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}>
                  Choose file
                  <input ref={fileInputRef} type="file" accept=".xls,.xlsx,.csv" style={{ display: 'none' }} onChange={handleFileSelect} />
                </label>
              </p>
              <small style={{ color: '#777' }}>Supported formats: XLS, XLSX, CSV | Max size: 25MB</small>
            </div>

            {/* Template download */}
            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 15, display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 28, marginRight: 10 }}>&#128196;</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Template</p>
                <small style={{ color: '#777' }}>Download template as starting point for your file.</small>
              </div>
              <button style={{ padding: '6px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Download</button>
            </div>

            {/* Selected file */}
            {uploadFile && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16, fontSize: 13 }}>
                <span>{uploadFile.name}</span>
                <button onClick={() => { setUploadFile(null); setBase64Content(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  style={{ border: 'none', background: 'none', color: '#f44336', cursor: 'pointer', fontSize: 16 }}>&#128465;</button>
              </div>
            )}

            {/* Footer buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #eee' }}>
              <button onClick={() => { setShowUploadDialog(false); dispatch(setShowForm(true)); }}
                style={{ padding: '8px 18px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>+</span> Add Single User
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowUploadDialog(false)}
                  style={{ padding: '8px 18px', background: '#eee', color: '#333', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button onClick={handleImport} disabled={!uploadFile}
                  style={{ padding: '8px 18px', background: uploadFile ? '#1976d2' : '#ccc', color: '#fff', border: 'none', borderRadius: 4, cursor: uploadFile ? 'pointer' : 'default', fontSize: 13 }}>Import</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
