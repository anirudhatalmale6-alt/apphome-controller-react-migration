/**
 * Business Content State Hook
 * Orchestrates document/invoice processing workflow
 * Replaces BusinessContentController.js $scope/$rootScope methods
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectAuth } from '../../authentication/store/authSlice';
import {
  selectBusinessContent,
  setLoading,
  setWorkflowProcessing,
  setDownloading,
  setSaving,
  setSelectedDIN,
  setCurrentStatus,
  setCurrentVersion,
  setMediaConfig,
  setSelectedMedia,
  setCurrentPageNew,
  setIxsdDataHeaders,
  setSelectedDataJson,
  setSelectedExceptionJson,
  setSelectedExceptionJsonBackUp,
  setIXSDDataJson,
  setFieldFormatsFor999,
  setBPaaSConnectorId,
  setSpProcessId,
  setEnableEditStatus,
  setSaveProcessIsCompleted,
  setIsAnyLineItemDeleted,
  setIsNewLineItemAdded,
  setAutoUpdateFields,
  clearAutoUpdateFields,
  setSelectedLineItemIndex,
  setWorkflowActionStarted,
  setTransactionDataCaptureProcess,
  setDocInfoUin,
  setDocInfoDin,
  setFieldAuditData,
  setFormAuditView,
  setFormAuditResponse,
  setFilteredExceptionToNotify,
  setLookupCatalog,
  setExpenseLedgerAPILookUP,
  setApiLookUpResult,
  setApiLookUpSubResult,
  setArtifactUploadPath,
  setAttachmentList,
  setServiceDashboard,
  setBotCampList,
  setError,
  resetBusinessContentState,
} from '../store/businessContentSlice';
import {
  useLazyLoadTransactionMediaListQuery,
  useLazyLoadDinHistoryQuery,
  useStartWorkflowMutation,
  useLoadUpdateDataJsonMutation,
  useCheckForNewDINMutation,
  useSaveIXSDJSONMutation,
  useDownloadSourceFileMutation,
  useGenerateExcelOutputMutation,
  useChangeMediaPageMutation,
  useSetNewBotCampMutation,
  useSetInvoiceCodingMutation,
  useSendExceptionNotificationMutation,
  useFieldLevelAuditMutation,
  useLoadFormAuditMutation,
  useInfordataMutation,
} from '../api/businessContentApi';
import {
  parseIXSDData,
  addLineItem,
  deleteLineItem,
  updateFieldValue,
  reconstructDataJson,
  reconstructExceptionJson,
  downloadBase64File,
  downloadExcelFile,
  getFilteredExceptions,
  buildMediaUrl,
} from '../services/BusinessContentService';
import type {
  SelectedDIN,
  MediaConfig as MediaConfigType,
  IXSDDataHeader,
  DataCaptureProcess,
} from '../types/BusinessContentTypes';

export function useBusinessContentState() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authState = useAppSelector(selectAuth);
  const contentState = useAppSelector(selectBusinessContent);

  // RTK Query hooks
  const [triggerLoadMedia] = useLazyLoadTransactionMediaListQuery();
  const [triggerLoadHistory] = useLazyLoadDinHistoryQuery();
  const [startWorkflow] = useStartWorkflowMutation();
  const [loadUpdateDataJson] = useLoadUpdateDataJsonMutation();
  const [checkForNewDIN] = useCheckForNewDINMutation();
  const [saveIXSD] = useSaveIXSDJSONMutation();
  const [downloadSource] = useDownloadSourceFileMutation();
  const [generateExcel] = useGenerateExcelOutputMutation();
  const [changeMediaPage] = useChangeMediaPageMutation();
  const [setNewBotCamp] = useSetNewBotCampMutation();
  const [setInvoiceCoding] = useSetInvoiceCodingMutation();
  const [sendNotification] = useSendExceptionNotificationMutation();
  const [fieldLevelAudit] = useFieldLevelAuditMutation();
  const [loadFormAudit] = useLoadFormAuditMutation();
  const [infordata] = useInfordataMutation();

  const user = authState.user;

  // ─── Load Transaction Media ───
  // Origin: $rootScope.loadTransactionMediaList
  const handleLoadTransactionMedia = useCallback(async (din: SelectedDIN) => {
    if (!user) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(setSelectedDIN(din));

    try {
      const result = await triggerLoadMedia({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        din: din.TransactionID,
        user_id: user.user_id || '',
        dept_id: user.dept_id || '',
        queue_id: user.queue_id || '',
        ixsd_id: din.ixsd_id,
        currentStatus: contentState.currentStatus,
        hasException: din.hasException,
      }).unwrap();

      if (result && Array.isArray(result)) {
        // Response structure: [transactionData, bundleDesign, workflowConfig, orgHierarchy, lookupCatalog, ...]
        const transactionData = result[0] || [];
        const bundleDesign = result[1] || [];

        // Extract media config from transaction data
        if (Array.isArray(transactionData) && transactionData.length > 0) {
          const firstRecord = transactionData[0];

          // Set UIN and connector ID
          if (firstRecord.uin) {
            dispatch(setSelectedDIN({ ...din, uin: firstRecord.uin }));
          }
          if (firstRecord.bPaaS_connectorID) {
            dispatch(setBPaaSConnectorId(firstRecord.bPaaS_connectorID));
          }
          if (firstRecord.field_formats_for_999) {
            try {
              const formats = JSON.parse(firstRecord.field_formats_for_999);
              dispatch(setFieldFormatsFor999(formats));
            } catch {
              // Not valid JSON, skip
            }
          }
        }

        // Parse iXSD data
        if (Array.isArray(bundleDesign) && bundleDesign.length > 0) {
          const ixsdRecord = bundleDesign[0];
          if (ixsdRecord?.ixsd_data_json) {
            const { headers, dataJson, exceptionJson } = parseIXSDData(
              ixsdRecord.ixsd_data_json,
              ixsdRecord.ixsd_data_exception || '{}'
            );
            dispatch(setIxsdDataHeaders(headers));
            dispatch(setSelectedDataJson(dataJson));
            dispatch(setSelectedExceptionJson(exceptionJson));
            dispatch(setSelectedExceptionJsonBackUp(JSON.parse(JSON.stringify(exceptionJson))));
          }
        }

        // Media config (images/pages)
        if (result[2] && Array.isArray(result[2])) {
          const media: MediaConfigType[] = result[2].map((item: any) => ({
            byteString: item.byteString || '',
            file_path: item.file_path || '',
            page_count: item.page_count,
            file_type: item.file_type,
          }));
          dispatch(setMediaConfig(media));
          if (media.length > 0 && media[0].byteString) {
            dispatch(setSelectedMedia(buildMediaUrl(media[0].byteString, media[0].file_type)));
          }
        }

        // Lookup catalog
        if (result[4]) {
          dispatch(setLookupCatalog(result[4]));
        }

        // Service dashboard
        if (result[5]) {
          dispatch(setServiceDashboard(result[5]));
        }

        // Bot camp list
        if (result[6]) {
          dispatch(setBotCampList(Array.isArray(result[6]) ? result[6] : []));
        }

        dispatch(setIXSDDataJson(result));
      }
    } catch (err: any) {
      console.error('[BusinessContent] loadTransactionMedia error:', err);
      dispatch(setError(err?.message || 'Failed to load transaction media'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, contentState.currentStatus, dispatch, triggerLoadMedia]);

  // ─── Load DIN History ───
  // Origin: $rootScope.load_din_history
  const handleLoadDinHistory = useCallback(async () => {
    if (!user || !contentState.selectedDIN) return;

    try {
      const result = await triggerLoadHistory({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        spProcessId: user.sp_process_id || contentState.spProcessId || '',
        user_id: user.user_id || '',
        din: contentState.selectedDIN.din,
      }).unwrap();

      if (result && Array.isArray(result)) {
        // Parse transaction history data capture processes
        if (result[0] && Array.isArray(result[0])) {
          try {
            const historyData = result[0][0];
            if (historyData?.dataCapture) {
              const dataCapture = typeof historyData.dataCapture === 'string'
                ? JSON.parse(historyData.dataCapture)
                : historyData.dataCapture;
              dispatch(setTransactionDataCaptureProcess(dataCapture as DataCaptureProcess[]));
            }
          } catch {
            // Parse error, skip
          }
        }

        // Document info
        if (result[1] && Array.isArray(result[1]) && result[1].length > 0) {
          const docInfo = result[1][0];
          dispatch(setDocInfoUin(docInfo?.uin || ''));
          dispatch(setDocInfoDin(docInfo?.din || ''));
        }
      }
    } catch (err: any) {
      console.error('[BusinessContent] loadDinHistory error:', err);
    }
  }, [user, contentState.selectedDIN, contentState.spProcessId, dispatch, triggerLoadHistory]);

  // ─── Start Workflow Action ───
  // Origin: $scope.startWorkflow
  const handleStartWorkflow = useCallback(async (
    workflowParams: any
  ) => {
    if (!user) return null;

    dispatch(setWorkflowProcessing(true));
    dispatch(setWorkflowActionStarted(true));

    try {
      const result = await startWorkflow(workflowParams).unwrap();
      return result;
    } catch (err: any) {
      console.error('[BusinessContent] startWorkflow error:', err);
      dispatch(setError(err?.message || 'Workflow processing failed'));
      return null;
    } finally {
      dispatch(setWorkflowProcessing(false));
    }
  }, [user, dispatch, startWorkflow]);

  // ─── Save iXSD Data ───
  // Origin: $scope.saveiXSD
  const handleSaveIXSD = useCallback(async () => {
    if (!user || !contentState.selectedDIN) return false;

    dispatch(setSaving(true));
    dispatch(setError(null));

    try {
      const dataJson = reconstructDataJson(contentState.ixsdDataHeaders);
      const exceptionJson = reconstructExceptionJson(contentState.ixsdDataHeaders);

      await saveIXSD({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        din: contentState.selectedDIN.din,
        version: contentState.currentVersion,
        spProcess_id: contentState.spProcessId,
        bPaaSConnector_id: contentState.bPaaSConnector_id,
        dept_id: user.dept_id || '',
        queue_id: user.queue_id || '',
        ixsd_id: contentState.selectedDIN.ixsd_id,
        dataJson,
        exceptionJson,
        user_id: user.user_id || '',
        mediaiXSD: contentState.mediaConfig,
        autoUpdateFields: contentState.autoUpdateFields,
      }).unwrap();

      dispatch(clearAutoUpdateFields());
      dispatch(setSaveProcessIsCompleted(true));
      return true;
    } catch (err: any) {
      console.error('[BusinessContent] saveIXSD error:', err);
      dispatch(setError(err?.message || 'Failed to save data'));
      return false;
    } finally {
      dispatch(setSaving(false));
    }
  }, [user, contentState, dispatch, saveIXSD]);

  // ─── Check For New DIN ───
  // Origin: $rootScope.checkForNewDIN
  const handleCheckForNewDIN = useCallback(async (openFromAnalytics?: boolean) => {
    if (!user || !contentState.selectedDIN) return null;

    try {
      const result = await checkForNewDIN({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        dept_id: user.dept_id || '',
        queue_id: user.queue_id || '',
        din: contentState.selectedDIN.din,
        din_status: contentState.currentStatus,
        user_id: user.user_id || '',
        queue_btime: contentState.selectedDIN.queue_btime,
        openFromAnalytics,
      }).unwrap();

      if (result && result.din) {
        // New DIN found - load it
        const newDIN: SelectedDIN = {
          din: result.din,
          uin: result.uin || '',
          TransactionID: result.TransactionID || result.din,
          fileName: result.fileName || '',
          queue_btime: result.queue_btime || '',
          ixsd_id: result.ixsd_id || '',
          hasException: result.hasException || '',
        };
        dispatch(setSelectedDIN(newDIN));
        return newDIN;
      }

      return null;
    } catch (err: any) {
      console.error('[BusinessContent] checkForNewDIN error:', err);
      return null;
    }
  }, [user, contentState.selectedDIN, contentState.currentStatus, dispatch, checkForNewDIN]);

  // ─── Load Update Data JSON ───
  // Origin: $rootScope.loadUpdateDataJson
  const handleLoadUpdateDataJson = useCallback(async () => {
    if (!contentState.selectedDIN) return;

    try {
      const result = await loadUpdateDataJson({
        din: contentState.selectedDIN.din,
        uin: contentState.selectedDIN.uin,
      }).unwrap();

      if (result) {
        const { headers, dataJson, exceptionJson } = parseIXSDData(
          result.ixsd_data_json,
          result.ixsd_data_exception
        );
        dispatch(setIxsdDataHeaders(headers));
        dispatch(setSelectedDataJson(dataJson));
        dispatch(setSelectedExceptionJson(exceptionJson));
        dispatch(setSelectedExceptionJsonBackUp(JSON.parse(JSON.stringify(exceptionJson))));

        if (result.artifact_upload_path) {
          dispatch(setArtifactUploadPath(result.artifact_upload_path));
        }
      }
    } catch (err: any) {
      console.error('[BusinessContent] loadUpdateDataJson error:', err);
    }
  }, [contentState.selectedDIN, dispatch, loadUpdateDataJson]);

  // ─── Download Source File ───
  // Origin: $scope.downloadSourceFile
  const handleDownloadSourceFile = useCallback(async () => {
    if (!contentState.mediaConfig.length || !contentState.selectedDIN) return;

    dispatch(setDownloading(true));

    try {
      const result = await downloadSource({
        source_file: contentState.mediaConfig[0].file_path,
        file_name: contentState.selectedDIN.fileName,
      }).unwrap();

      if (result?.downloadStream) {
        downloadBase64File(result.downloadStream, result.downloadStreamFile || 'download');
      }
    } catch (err: any) {
      console.error('[BusinessContent] downloadSourceFile error:', err);
      dispatch(setError(err?.message || 'Download failed'));
    } finally {
      dispatch(setDownloading(false));
    }
  }, [contentState.mediaConfig, contentState.selectedDIN, dispatch, downloadSource]);

  // ─── Generate Excel ───
  // Origin: $scope.generateExcel
  const handleGenerateExcel = useCallback(async () => {
    if (!user || !contentState.selectedDIN) return;

    dispatch(setDownloading(true));

    try {
      const result = await generateExcel({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        dept_id: user.dept_id || '',
        queue_id: user.queue_id || '',
        din: contentState.selectedDIN.din,
      }).unwrap();

      if (result?.downloadStream) {
        downloadExcelFile(result.downloadStream, result.downloadStreamFile || 'export.xlsx');
      }
    } catch (err: any) {
      console.error('[BusinessContent] generateExcel error:', err);
      dispatch(setError(err?.message || 'Excel generation failed'));
    } finally {
      dispatch(setDownloading(false));
    }
  }, [user, contentState.selectedDIN, dispatch, generateExcel]);

  // ─── Change Media Page ───
  // Origin: $scope.changeMediaPage
  const handleChangeMediaPage = useCallback(async (pageNumber: number, filePath: string) => {
    if (!user || !contentState.selectedDIN) return;

    try {
      const result = await changeMediaPage({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        din: contentState.selectedDIN.din,
        spProcess_id: contentState.spProcessId,
        ixsd_id: contentState.selectedDIN.ixsd_id,
        page_number: pageNumber - 1, // 0-indexed for API
        file_path: filePath,
      }).unwrap();

      if (result?.byteString) {
        dispatch(setSelectedMedia(buildMediaUrl(result.byteString)));
        dispatch(setCurrentPageNew(pageNumber));
      }
    } catch (err: any) {
      console.error('[BusinessContent] changeMediaPage error:', err);
    }
  }, [user, contentState.selectedDIN, contentState.spProcessId, dispatch, changeMediaPage]);

  // ─── Field Level Audit ───
  // Origin: $scope.fieldLevelAudit
  const handleFieldLevelAudit = useCallback(async (complexType: string, rowno: number) => {
    if (!user || !contentState.selectedDIN) return null;

    try {
      const result = await fieldLevelAudit({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        din: contentState.selectedDIN.din,
        uin: contentState.selectedDIN.uin,
        complexType,
        rowno,
      }).unwrap();

      if (result && Array.isArray(result)) {
        dispatch(setFieldAuditData(result[0] || []));
      }
      return result;
    } catch (err: any) {
      console.error('[BusinessContent] fieldLevelAudit error:', err);
      return null;
    }
  }, [user, contentState.selectedDIN, dispatch, fieldLevelAudit]);

  // ─── Load Form Audit ───
  // Origin: $scope.loadFormAudit
  const handleLoadFormAudit = useCallback(async (version1: string, version2: string) => {
    if (!user || !contentState.selectedDIN) return null;

    try {
      const result = await loadFormAudit({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        din: contentState.selectedDIN.din,
        uin: contentState.selectedDIN.uin,
        din_version1: version1,
        din_version2: version2,
      }).unwrap();

      dispatch(setFormAuditResponse(result));
      dispatch(setFormAuditView(true));
      return result;
    } catch (err: any) {
      console.error('[BusinessContent] loadFormAudit error:', err);
      return null;
    }
  }, [user, contentState.selectedDIN, dispatch, loadFormAudit]);

  // ─── Set New Bot Camp ───
  // Origin: $scope.setNewBotCamp
  const handleSetNewBotCamp = useCallback(async (
    complexType: string,
    learningField: string,
    learningValue: string,
    tfsUin: string
  ) => {
    if (!user) return;

    try {
      await setNewBotCamp({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        spProcess_id: contentState.spProcessId,
        user_id: user.user_id || '',
        ixsd_id: contentState.selectedDIN?.ixsd_id || '',
        tfs_uin: tfsUin,
        complexType,
        learning_field: learningField,
        learning_value: learningValue,
      }).unwrap();
    } catch (err: any) {
      console.error('[BusinessContent] setNewBotCamp error:', err);
    }
  }, [user, contentState.spProcessId, contentState.selectedDIN, setNewBotCamp]);

  // ─── Set Invoice Coding ───
  // Origin: $scope.setInvoiceCoding
  const handleSetInvoiceCoding = useCallback(async (
    deptId: string,
    expenseLedger: string,
    lineItem: string
  ) => {
    if (!user) return;

    try {
      await setInvoiceCoding({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        spProcess_id: contentState.spProcessId,
        user_id: user.user_id || '',
        dept_id: deptId,
        expense_ledger: expenseLedger,
        line_item: lineItem,
      }).unwrap();
    } catch (err: any) {
      console.error('[BusinessContent] setInvoiceCoding error:', err);
    }
  }, [user, contentState.spProcessId, setInvoiceCoding]);

  // ─── Send Exception Notification ───
  // Origin: $scope.sendExceptionNotification
  const handleSendNotification = useCallback(async (
    toAddress: string[],
    subject: string,
    message: string,
    dataJSON: any,
    exceptionData: any[],
    exceptionMsg: string
  ) => {
    if (!user) return;

    try {
      await sendNotification({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        dept_id: user.dept_id || '',
        queue_id: user.queue_id || '',
        toAddress,
        user_id: user.user_id || '',
        user_name: user.user_name || '',
        message,
        subject,
        user_login_id: user.user_login_id || '',
        dataJSON,
        exceptionData,
        exceptionMsg,
      }).unwrap();
    } catch (err: any) {
      console.error('[BusinessContent] sendNotification error:', err);
    }
  }, [user, sendNotification]);

  // ─── Infordata Lookup ───
  // Origin: $scope.infordata
  const handleInfordata = useCallback(async (poNum: string) => {
    try {
      const result = await infordata({ poNum }).unwrap();
      if (result) {
        dispatch(setExpenseLedgerAPILookUP(Array.isArray(result) ? result : []));
      }
      return result;
    } catch (err: any) {
      console.error('[BusinessContent] infordata error:', err);
      return null;
    }
  }, [dispatch, infordata]);

  // ─── Line Item Operations ───
  const handleAddLineItem = useCallback((headerIndex: number) => {
    const updated = addLineItem(contentState.ixsdDataHeaders, headerIndex);
    dispatch(setIxsdDataHeaders(updated));
    dispatch(setIsNewLineItemAdded(true));
  }, [contentState.ixsdDataHeaders, dispatch]);

  const handleDeleteLineItem = useCallback((headerIndex: number, rowIndex: number) => {
    const updated = deleteLineItem(contentState.ixsdDataHeaders, headerIndex, rowIndex);
    dispatch(setIxsdDataHeaders(updated));
    dispatch(setIsAnyLineItemDeleted(true));
  }, [contentState.ixsdDataHeaders, dispatch]);

  const handleUpdateFieldValue = useCallback((
    headerIndex: number,
    rowIndex: number,
    fieldKey: string,
    newValue: string
  ) => {
    const updated = updateFieldValue(contentState.ixsdDataHeaders, headerIndex, rowIndex, fieldKey, newValue);
    dispatch(setIxsdDataHeaders(updated));
  }, [contentState.ixsdDataHeaders, dispatch]);

  // ─── Get Filtered Exceptions ───
  const handleGetFilteredExceptions = useCallback(() => {
    return getFilteredExceptions(contentState.ixsdDataHeaders);
  }, [contentState.ixsdDataHeaders]);

  // ─── Navigate Back ───
  const handleNavigateBack = useCallback((from: 'apps' | 'tasks' | '') => {
    dispatch(resetBusinessContentState());
    if (from === 'apps') {
      navigate('/BusinessApps');
    } else if (from === 'tasks') {
      navigate('/BusinessTasks');
    } else {
      navigate('/BusinessHomeViews');
    }
  }, [dispatch, navigate]);

  return {
    // State
    contentState,
    user,

    // Load operations
    handleLoadTransactionMedia,
    handleLoadDinHistory,
    handleLoadUpdateDataJson,

    // Workflow
    handleStartWorkflow,
    handleCheckForNewDIN,

    // Save
    handleSaveIXSD,

    // Downloads
    handleDownloadSourceFile,
    handleGenerateExcel,

    // Media
    handleChangeMediaPage,

    // Line items
    handleAddLineItem,
    handleDeleteLineItem,
    handleUpdateFieldValue,

    // Audit
    handleFieldLevelAudit,
    handleLoadFormAudit,

    // Bot camp / Invoice
    handleSetNewBotCamp,
    handleSetInvoiceCoding,

    // Notification
    handleSendNotification,

    // Lookup
    handleInfordata,
    handleGetFilteredExceptions,

    // Navigation
    handleNavigateBack,
  };
}
