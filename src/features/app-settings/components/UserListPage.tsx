/**
 * User List Page
 * Existing users table + review/bulk table with pagination
 * Origin: UserListPage.html (520 lines) + AppSettingPage.js user management
 */
import React, { useCallback, useState, useRef } from 'react';
import { useAppSettingsState } from '../hooks/useAppSettingsState';

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

  // ─── Pagination Helpers ───
  const getPageNumbers = useCallback((currentPage: number, totalPages: number) => {
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
  }, []);

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
    const result = await importExcelForUsers(
      uploadFile.name,
      uploadFile.type,
      uploadFile.size,
      base64Content
    );
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

  // ─── Section Toggle ───
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

  return (
    <div style={{ padding: 16 }}>
      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
        <button onClick={() => handleSectionChange('users')} style={{ padding: '8px 20px', background: activeSection === 'users' ? '#1976d2' : '#eee', color: activeSection === 'users' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px 0 0 4px' }}>
          Users
        </button>
        <button onClick={() => handleSectionChange('bulk')} style={{ padding: '8px 20px', background: activeSection === 'bulk' ? '#1976d2' : '#eee', color: activeSection === 'bulk' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '0 4px 4px 0' }}>
          Bulk Upload / Review
        </button>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowUploadDialog(true)} style={{ padding: '6px 14px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
            + Add User
          </button>
          {activeSection === 'users' && settingsState.selectedUserIds.length > 0 && (
            <>
              <button onClick={handleBulkDelete} style={{ padding: '6px 14px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
                {isAllSelected ? 'Delete All' : 'Delete Selected'}
              </button>
              <button onClick={handleGrantAccess} style={{ padding: '6px 14px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
                {isAllSelected ? 'Grant Access to All' : 'Grant Access'}
              </button>
            </>
          )}
          {activeSection === 'bulk' && settingsState.reviewSelectedUserIds.length > 0 && (
            <button onClick={handleReviewBulkDelete} style={{ padding: '6px 14px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
              {isAllReviewSelected ? 'Delete All' : 'Delete Selected'}
            </button>
          )}
          {activeSection === 'bulk' && (
            <button onClick={validateExcelForUsers} style={{ padding: '6px 14px', background: '#ff9800', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
              Validate & Review
            </button>
          )}
        </div>
      </div>

      {settingsState.isLoadingState ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : activeSection === 'users' ? (
        /* ─── Existing Users Table ─── */
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: 8, textAlign: 'left', width: 40 }}>
                  <input type="checkbox" checked={isAllSelected} onChange={() => dispatch(toggleAllUsers())} />
                </th>
                <th style={{ padding: 8, textAlign: 'left' }}>Email</th>
                <th style={{ padding: 8, textAlign: 'left' }}>First Name</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Last Name</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Enrolled</th>
                <th style={{ padding: 8, textAlign: 'center', width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settingsState.existingUserList.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#999' }}>No users found</td></tr>
              ) : (
                settingsState.existingUserList.map((user, idx) => (
                  <tr key={user.user_id || idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: 8 }}>
                      <input type="checkbox" checked={settingsState.selectedUserIds.includes(user.user_id)} onChange={() => dispatch(toggleUserSelection(user.user_id))} />
                    </td>
                    <td style={{ padding: 8 }}>{user.email_id}</td>
                    <td style={{ padding: 8 }}>{user.first_name}</td>
                    <td style={{ padding: 8 }}>{user.last_name}</td>
                    <td style={{ padding: 8 }}>{user.active_status}</td>
                    <td style={{ padding: 8 }}>{user.enroll_datetime}</td>
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      <button onClick={() => handleEditUser(user, 'existing')} style={{ padding: '2px 8px', marginRight: 4, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDeleteUser(user.user_id, 'existing')} style={{ padding: '2px 8px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {settingsState.existingTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 12 }}>
              <button disabled={settingsState.currentPageExisting <= 1} onClick={() => handlePageChange(settingsState.currentPageExisting - 1, 'existing')} style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>&laquo;</button>
              {getPageNumbers(settingsState.currentPageExisting, settingsState.existingTotalPages).map((p) => (
                <button key={p} onClick={() => handlePageChange(p, 'existing')} style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer', fontSize: 12, background: p === settingsState.currentPageExisting ? '#1976d2' : '#fff', color: p === settingsState.currentPageExisting ? '#fff' : '#333' }}>{p}</button>
              ))}
              <button disabled={settingsState.currentPageExisting >= settingsState.existingTotalPages} onClick={() => handlePageChange(settingsState.currentPageExisting + 1, 'existing')} style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>&raquo;</button>
            </div>
          )}
        </>
      ) : (
        /* ─── Review / Bulk Upload Table ─── */
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: 8, textAlign: 'left', width: 40 }}>
                  <input type="checkbox" checked={isAllReviewSelected} onChange={() => dispatch(toggleAllReviewUsers())} />
                </th>
                <th style={{ padding: 8, textAlign: 'left' }}>Email</th>
                <th style={{ padding: 8, textAlign: 'left' }}>First Name</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Last Name</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 8, textAlign: 'center', width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settingsState.reviewUserList.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#999' }}>No review data found</td></tr>
              ) : (
                settingsState.reviewUserList.map((user, idx) => {
                  const userData = typeof user.data_extract_json === 'object' ? user.data_extract_json : {};
                  return (
                    <tr key={user.user_id || idx} style={{ borderBottom: '1px solid #f0f0f0', background: user.hasException ? '#fff3e0' : 'transparent' }}>
                      <td style={{ padding: 8 }}>
                        <input type="checkbox" checked={settingsState.reviewSelectedUserIds.includes(user.user_id)} onChange={() => dispatch(toggleReviewUserSelection(user.user_id))} />
                      </td>
                      <td style={{ padding: 8 }}>{(userData as any)?.email_id || user.email_id || '-'}</td>
                      <td style={{ padding: 8 }}>{(userData as any)?.first_name || user.first_name || '-'}</td>
                      <td style={{ padding: 8 }}>{(userData as any)?.last_name || user.last_name || '-'}</td>
                      <td style={{ padding: 8 }}>{user.result || '-'}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>
                        <button onClick={() => handleEditUser(user as any, 'review')} style={{ padding: '2px 8px', marginRight: 4, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                        <button onClick={() => handleDeleteUser(user.user_id, 'review')} style={{ padding: '2px 8px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Review Pagination */}
          {settingsState.reviewTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 12 }}>
              <button disabled={settingsState.currentPageReview <= 1} onClick={() => handlePageChange(settingsState.currentPageReview - 1, 'review')} style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>&laquo;</button>
              {getPageNumbers(settingsState.currentPageReview, settingsState.reviewTotalPages).map((p) => (
                <button key={p} onClick={() => handlePageChange(p, 'review')} style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer', fontSize: 12, background: p === settingsState.currentPageReview ? '#1976d2' : '#fff', color: p === settingsState.currentPageReview ? '#fff' : '#333' }}>{p}</button>
              ))}
              <button disabled={settingsState.currentPageReview >= settingsState.reviewTotalPages} onClick={() => handlePageChange(settingsState.currentPageReview + 1, 'review')} style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>&raquo;</button>
            </div>
          )}
        </>
      )}

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, maxWidth: 500, width: '100%' }}>
            <h3 style={{ margin: '0 0 16px' }}>Upload Users</h3>

            <div style={{ border: '2px dashed #c7c7c7', borderRadius: 8, padding: '30px 20px', textAlign: 'center', background: '#fafafa', marginBottom: 16 }}>
              <p style={{ marginBottom: 10 }}>Drag & Drop file here or</p>
              <label style={{ color: '#1976d2', cursor: 'pointer' }}>
                Choose file
                <input ref={fileInputRef} type="file" accept=".xls,.xlsx,.csv" style={{ display: 'none' }} onChange={handleFileSelect} />
              </label>
              <p style={{ fontSize: 12, color: '#777', marginTop: 8 }}>Supported formats: XLS, XLSX, CSV | Max size: 25MB</p>
            </div>

            {uploadFile && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                <span>{uploadFile.name}</span>
                <button onClick={() => { setUploadFile(null); setBase64Content(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ border: 'none', background: 'none', color: '#f44336', cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => { setShowUploadDialog(false); dispatch(setShowForm(true)); }} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                Add Single User
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowUploadDialog(false)} style={{ padding: '8px 16px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleImport} disabled={!uploadFile} style={{ padding: '8px 16px', background: uploadFile ? '#1976d2' : '#ccc', color: '#fff', border: 'none', borderRadius: 4, cursor: uploadFile ? 'pointer' : 'default' }}>Import</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
