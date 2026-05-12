/**
 * Validation Content State Hook
 * Orchestrates validation workflow for documents with exception data
 * Replaces ValidationContentController.js $scope/$rootScope methods
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectAuth } from '../../authentication/store/authSlice';
import {
  selectValidationContent,
  setLoading,
  setWorkflowProcessing,
  setSaving,
  setSelectedDIN,
  setCurrentVersion,
  setCurrentDinSubIndex,
  setMediaConfig,
  setSelectedMedia,
  setCurrentMediaIndex,
  setSelectedMediaType,
  setCurrentPageNew,
  setNewPageNumber,
  setTotalPages,
  setSelectedMediaSource,
  setSelectedMediaSourcePath,
  setPdfDimensions,
  setSelectedDataJson,
  setSelectedExceptionJson,
  setIXSDDataJson,
  setFieldFormatsFor999,
  setBundleDesign,
  setPrepMxsd,
  setSaveProcessIsCompleted,
  setIsExtractedDataChanged,
  setSelectedDataHeader,
  setCurrentHeaderIndex,
  setSelectedIndex,
  setSelectedLineItemIndex,
  setSingleLineItemView,
  setSelectedLineItemObj,
  setWorkflowActionStarted,
  setFromController,
  setWorkflowConfig,
  setFilteredException,
  setExceptionDetails,
  setServiceDashboard,
  setQueueCatalog,
  setError,
  resetValidationContentState,
} from '../store/validationContentSlice';
import {
  useLazyLoadValidationMediaListQuery,
  useChangeMediaPageMutation,
  useExtractDataFromPositionMutation,
  useStartWorkflowMutation,
  useSaveIXSDJSONMutation,
  useLoadBundleDesignAndIXSDMutation,
  useLoadUpdateDataJsonMutation,
} from '../api/validationContentApi';
import type {
  SelectedDIN,
  MediaConfig as MediaConfigType,
  IXSDDataHeader,
  IXSDField,
  ExceptionMessage,
  WorkflowConfigItem,
  FilteredException,
  CoordinatesPosition,
} from '../types/ValidationContentTypes';

/** Internal type for grouping exception items during filtering */
interface ExceptionGroupItem {
  id: number;
  rowNo: number;
  complexType: string;
  complexTypeLabel: string;
  key: string;
  exception: string;
}

export function useValidationContentState() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authState = useAppSelector(selectAuth);
  const contentState = useAppSelector(selectValidationContent);

  // RTK Query hooks
  const [triggerLoadMedia] = useLazyLoadValidationMediaListQuery();
  const [changeMediaPage] = useChangeMediaPageMutation();
  const [extractDataFromPosition] = useExtractDataFromPositionMutation();
  const [startWorkflow] = useStartWorkflowMutation();
  const [saveIXSD] = useSaveIXSDJSONMutation();
  const [loadBundleDesign] = useLoadBundleDesignAndIXSDMutation();
  const [loadUpdateDataJson] = useLoadUpdateDataJsonMutation();

  const user = authState.user;

  // ─── Load Validation Media Info ───
  // Origin: $scope.load_transaction_media_list (line ~3238)
  // Response array: [0]=iXSDDataJson, [1]=bundleDesignData, [2]=workflowConfig,
  //   [3]=exceptionDetails, [4]=queueCatalog, [5]=mediaConfig
  const handleLoadValidationMedia = useCallback(async (din: SelectedDIN) => {
    if (!user) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(setSelectedDIN(din));
    dispatch(setFromController(din.fromController || ''));

    try {
      const result = await triggerLoadMedia({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        role_id: '',
        din: din.TransactionID,
        user_id: user.user_id || '',
        spProcess_id: user.sp_process_id || '',
        dept_id: user.dept_id || '',
        queue_id: user.queue_id || '',
        ixsd_id: din.ixsd_id,
        currentStatus: contentState.currentStatus,
        efs_uin: din.efs_uin || '',
      }).unwrap();

      if (result && Array.isArray(result)) {
        // ── response[0]: iXSDDataJson ──
        const iXSDDataJson = result[0] || [];
        dispatch(setIXSDDataJson(iXSDDataJson));

        if (Array.isArray(iXSDDataJson) && iXSDDataJson.length > 0) {
          const firstRecord = iXSDDataJson[0];

          // Field formats for 999
          if (firstRecord.field_formats_for_999) {
            try {
              dispatch(setFieldFormatsFor999(JSON.parse(firstRecord.field_formats_for_999)));
            } catch { /* skip */ }
          }

          // Parse selected data json & exception json
          const selectedDataJson = firstRecord.ixsd_data_json
            ? JSON.parse(firstRecord.ixsd_data_json)
            : {};
          const selectedExceptionJson = firstRecord.ixsd_data_exception
            ? JSON.parse(firstRecord.ixsd_data_exception)
            : {};

          dispatch(setSelectedDataJson(selectedDataJson));
          dispatch(setSelectedExceptionJson(selectedExceptionJson));

          // Version
          const version = String(parseInt(firstRecord.change_history_version || '1', 10));
          dispatch(setCurrentVersion(version));
          dispatch(setCurrentDinSubIndex(firstRecord.din_sub_index || ''));

          // DIN/UIN from server
          if (firstRecord.din) {
            dispatch(setSelectedDIN({
              ...din,
              din: firstRecord.din,
              uin: firstRecord.uin || din.uin,
            }));
          }
        }

        // ── response[1]: bundleDesignData ──
        if (result[1] && Array.isArray(result[1]) && result[1].length > 0) {
          try {
            const bundleDesign = JSON.parse(result[1][0].bundle_design);
            dispatch(setBundleDesign(bundleDesign));
          } catch { /* skip */ }
        }

        // ── response[2]: workflowConfig ──
        if (result[2] && Array.isArray(result[2]) && result[2].length > 0) {
          const wfConfig: WorkflowConfigItem[] = result[2].map((ele: Record<string, unknown>) => ({
            ...ele,
            isEnabled: true,
            process_desc: typeof ele.process_desc === 'string' && (ele.process_desc as string).startsWith('{')
              ? JSON.parse(ele.process_desc as string).enabled_message
              : ele.process_desc,
            tooltip: typeof ele.process_desc === 'string' && (ele.process_desc as string).startsWith('{')
              ? JSON.parse(ele.process_desc as string).enabled_message
              : ele.process_desc,
            process_name: ele.process_name || ele.process_desc,
          } as WorkflowConfigItem));
          dispatch(setWorkflowConfig(wfConfig));
        }

        // ── response[3]: exceptionDetails ──
        if (result[3] && Array.isArray(result[3]) && result[3].length > 0) {
          dispatch(setExceptionDetails(result[3][0]));
          if (result[3][0].service_dashboard) {
            try {
              dispatch(setServiceDashboard(JSON.parse(result[3][0].service_dashboard)));
            } catch { /* skip */ }
          }
        }

        // ── response[4]: queueCatalog ──
        if (result[4] && Array.isArray(result[4])) {
          dispatch(setQueueCatalog(result[4]));
        }

        // ── response[5]: mediaConfig ──
        if (result[5] && Array.isArray(result[5]) && result[5].length > 0) {
          const mediaConfigArr: MediaConfigType[] = result[5].map((ele: Record<string, unknown>) => {
            const extractedFilePath = (ele.extracted_file_name as string) || '';
            const extractedFileName = extractedFilePath.substring(
              extractedFilePath.lastIndexOf('/') + 1
            );
            return {
              ...ele,
              extracted_file_path: extractedFilePath,
              extracted_file_name: extractedFileName,
            } as MediaConfigType;
          });
          dispatch(setMediaConfig(mediaConfigArr));

          // Set first media
          const firstMedia = mediaConfigArr[0];
          dispatch(setSelectedMediaType(firstMedia.media || 'PDF-EDI'));
          dispatch(setSelectedMediaSource(firstMedia.extracted_file_name || ''));
          dispatch(setSelectedMediaSourcePath(firstMedia.extracted_file_path || ''));
          dispatch(setTotalPages(firstMedia.totalPages || firstMedia.page_count || 1));
          if (firstMedia.pdfWidth && firstMedia.pdfHeight) {
            dispatch(setPdfDimensions({ width: firstMedia.pdfWidth, height: firstMedia.pdfHeight }));
          }

          // Set initial PDF image
          if (firstMedia.byteString) {
            dispatch(setSelectedMedia('data:image/jpeg;base64,' + firstMedia.byteString));
          }

          // Parse prep_mxsd
          if (firstMedia.prep_mxsd) {
            try {
              const prep = typeof firstMedia.prep_mxsd === 'string'
                ? JSON.parse(firstMedia.prep_mxsd)
                : firstMedia.prep_mxsd;
              dispatch(setPrepMxsd(prep));
            } catch { /* skip */ }
          }
        }
      }
    } catch (err: any) {
      console.error('[ValidationContent] loadValidationMedia error:', err);
      dispatch(setError(err?.message || 'Failed to load validation media'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, contentState.currentStatus, dispatch, triggerLoadMedia]);

  // ─── Change Media Page ───
  // Origin: $scope.changeMediaPage (line ~2667)
  const handleChangeMediaPage = useCallback(async (pageNumber: number) => {
    if (!user || !contentState.selectedDIN) return;

    dispatch(setWorkflowActionStarted(true));

    try {
      const result = await changeMediaPage({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        din: contentState.selectedDIN.TransactionID,
        spProcess_id: user.sp_process_id || '',
        ixsd_id: contentState.selectedDIN.ixsd_id,
        currentPage: pageNumber - 1, // 0-indexed for API
      }).unwrap();

      if (result?.byteString) {
        dispatch(setSelectedMedia('data:image/jpeg;base64,' + result.byteString));
        dispatch(setCurrentPageNew(pageNumber));
        dispatch(setNewPageNumber(pageNumber));
      }
    } catch (err: any) {
      console.error('[ValidationContent] changeMediaPage error:', err);
    } finally {
      dispatch(setWorkflowActionStarted(false));
    }
  }, [user, contentState.selectedDIN, dispatch, changeMediaPage]);

  // ─── Extract Data from Position (JCrop OCR) ───
  // Origin: $scope.extractData (line ~215)
  const handleExtractData = useCallback(async (coordinates: CoordinatesPosition) => {
    if (!contentState.selectedMediaSourcePath) return null;

    try {
      const result = await extractDataFromPosition({
        file_location: contentState.selectedMediaSourcePath,
        pageNo: contentState.currentPageNew,
        top: coordinates.y,
        left: coordinates.x,
        width: coordinates.w,
        height: coordinates.h,
      }).unwrap();

      if (result?.data) {
        const cleanedData = result.data
          .replace(/\r\n/g, '')
          .replace(/\n/g, '')
          .replace(/\r/g, '');
        return cleanedData;
      }
      return null;
    } catch (err: any) {
      console.error('[ValidationContent] extractData error:', err);
      return null;
    }
  }, [contentState.selectedMediaSourcePath, contentState.currentPageNew, extractDataFromPosition]);

  // ─── Start Workflow ───
  // Origin: $scope.continueProcess (line ~913)
  const handleStartWorkflow = useCallback(async (
    workflowParams: any,
    _queueComments: string
  ) => {
    if (!user || !contentState.selectedDIN) return null;

    dispatch(setWorkflowProcessing(true));
    dispatch(setWorkflowActionStarted(true));

    try {
      const result = await startWorkflow(workflowParams).unwrap();

      if (result) {
        // After workflow, reload data if there are exceptions
        if (result.exceptionMsg && result.exceptionMsg.length > 0) {
          dispatch(setCurrentVersion(result.din_version || contentState.currentVersion));
          dispatch(setCurrentDinSubIndex(result.din_sub_index || ''));

          // Reload data with updated exceptions
          const updateResult = await loadUpdateDataJson({
            din: contentState.selectedDinNo,
            uin: contentState.selectedUinNo,
          }).unwrap();

          if (updateResult) {
            const dataJson = JSON.parse(updateResult.ixsd_data_json);
            const exceptionJson = JSON.parse(updateResult.ixsd_data_exception);
            dispatch(setSelectedDataJson(dataJson));
            dispatch(setSelectedExceptionJson(exceptionJson));
          }
        } else {
          // No exceptions, navigate to inbox
          if (contentState.fromController === 'apps') {
            navigate('/BusinessApps');
          } else {
            navigate('/BusinessTasks');
          }
        }
      }
      return result;
    } catch (err: any) {
      console.error('[ValidationContent] startWorkflow error:', err);
      dispatch(setError(err?.message || 'Workflow processing failed'));
      return null;
    } finally {
      dispatch(setWorkflowProcessing(false));
      dispatch(setWorkflowActionStarted(false));
    }
  }, [
    user, contentState.selectedDIN, contentState.selectedDinNo,
    contentState.selectedUinNo, contentState.currentVersion,
    contentState.fromController, dispatch, navigate, startWorkflow, loadUpdateDataJson,
  ]);

  // ─── Save iXSD Data ───
  // Origin: $scope.saveIXSDDataAndClose (line ~2967)
  const handleSaveIXSD = useCallback(async () => {
    if (!user || !contentState.selectedDIN) return false;

    dispatch(setSaving(true));
    dispatch(setWorkflowActionStarted(true));
    dispatch(setError(null));

    try {
      await saveIXSD({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        din: contentState.selectedDIN.TransactionID,
        version: contentState.currentVersion,
        spProcess_id: user.sp_process_id || '',
        dept_id: user.dept_id || '',
        queue_id: user.queue_id || '',
        ixsd_id: contentState.selectedDIN.ixsd_id,
        dataJson: contentState.selectedDataJson,
        mediaiXSD: contentState.mediaConfig,
      }).unwrap();

      dispatch(setSaveProcessIsCompleted(true));
      dispatch(setIsExtractedDataChanged(true));
      return true;
    } catch (err: any) {
      console.error('[ValidationContent] saveIXSD error:', err);
      dispatch(setError(err?.message || 'Failed to save data'));
      dispatch(setIsExtractedDataChanged(false));
      return false;
    } finally {
      dispatch(setSaving(false));
      dispatch(setWorkflowActionStarted(false));
    }
  }, [user, contentState.selectedDIN, contentState.currentVersion,
    contentState.selectedDataJson, contentState.mediaConfig, dispatch, saveIXSD]);

  // ─── Load Bundle Design ───
  // Origin: load_bundle_design_and_iXSD (validationContent, encrypted)
  const handleLoadBundleDesign = useCallback(async () => {
    if (!user || !contentState.selectedDIN) return null;

    try {
      const result = await loadBundleDesign({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        din: contentState.selectedDIN.TransactionID,
        ixsd_id: contentState.selectedDIN.ixsd_id,
        efs_uin: contentState.selectedDIN.efs_uin || '',
      }).unwrap();

      if (result) {
        dispatch(setBundleDesign(result));
      }
      return result;
    } catch (err: any) {
      console.error('[ValidationContent] loadBundleDesign error:', err);
      return null;
    }
  }, [user, contentState.selectedDIN, dispatch, loadBundleDesign]);

  // ─── Change Page Number ───
  // Origin: $scope.changePageNumber (line ~2900)
  const handleChangePageNumber = useCallback((direction: 'up' | 'down') => {
    const currentPage = contentState.currentPageNew;
    const newPage = direction === 'up' ? currentPage - 1 : currentPage + 1;

    if (newPage < 1 || newPage > contentState.totalPages) return;

    dispatch(setCurrentPageNew(newPage));
    dispatch(setNewPageNumber(newPage));
    dispatch(setSingleLineItemView(false));
    handleChangeMediaPage(newPage);
  }, [contentState.currentPageNew, contentState.totalPages, dispatch, handleChangeMediaPage]);

  // ─── Go to Page Number ───
  const handleGoToPage = useCallback((pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > contentState.totalPages) return;

    dispatch(setCurrentPageNew(pageNumber));
    dispatch(setNewPageNumber(pageNumber));
    handleChangeMediaPage(pageNumber);
  }, [contentState.totalPages, dispatch, handleChangeMediaPage]);

  // ─── Change Selected Media ───
  // Origin: $scope.changeSelectedMedia (line ~3194)
  const handleChangeSelectedMedia = useCallback((index: number) => {
    if (index < 0 || index >= contentState.mediaConfig.length) return;

    const media = contentState.mediaConfig[index];
    dispatch(setCurrentMediaIndex(index));
    dispatch(setSelectedMediaType(media.media || 'PDF-EDI'));
    dispatch(setSelectedMediaSource(media.extracted_file_name || ''));
    dispatch(setSelectedMediaSourcePath(media.extracted_file_path || ''));
    if (media.pdfWidth && media.pdfHeight) {
      dispatch(setPdfDimensions({ width: media.pdfWidth, height: media.pdfHeight }));
    }
    dispatch(setCurrentPageNew(1));
    dispatch(setNewPageNumber(1));
    dispatch(setTotalPages(media.totalPages || media.page_count || 1));
    dispatch(setCurrentHeaderIndex(0));

    if (media.byteString) {
      dispatch(setSelectedMedia('data:image/jpeg;base64,' + media.byteString));
    }

    if (media.prep_mxsd) {
      try {
        const prep = typeof media.prep_mxsd === 'string'
          ? JSON.parse(media.prep_mxsd)
          : media.prep_mxsd;
        dispatch(setPrepMxsd(prep));
      } catch { /* skip */ }
    }
  }, [contentState.mediaConfig, dispatch]);

  // ─── Set Data Header (Tab Selection) ───
  // Origin: $scope.setDataHeader (line ~339)
  const handleSetDataHeader = useCallback((header: IXSDDataHeader, headerIndex: number) => {
    dispatch(setSelectedDataHeader(header));
    dispatch(setCurrentHeaderIndex(headerIndex));
    dispatch(setSelectedIndex(0));

    if (header.view_style === 'object') {
      dispatch(setSingleLineItemView(false));
    } else {
      // Array view - select first row
      if (header.ixsd_fields.length > 0) {
        dispatch(setSelectedLineItemObj(header.ixsd_fields[0]));
      }
    }
  }, [dispatch]);

  // ─── Toggle Line Item View ───
  // Origin: $scope.changeLineItemView (line ~431)
  const handleChangeLineItemView = useCallback((lineItem: IXSDField[], _index: number) => {
    if (!lineItem || lineItem.length === 0) return;

    const currentRow = lineItem[0].row ?? 1;
    dispatch(setSelectedLineItemIndex(currentRow - 1));
    dispatch(setSelectedLineItemObj(lineItem));
    dispatch(setSingleLineItemView(!contentState.singleLineItemView));
  }, [contentState.singleLineItemView, dispatch]);

  // ─── Filter by Exception ───
  // Origin: $rootScope.filterByException (line ~2286)
  const handleFilterByException = useCallback(() => {
    const exceptions: FilteredException[] = [];
    const exceptionArray: ExceptionGroupItem[] = [];

    contentState.ixsdDataHeaders.forEach((header: IXSDDataHeader) => {
      if (header.view_style === 'object') {
        // For object view, flatten the 2D array to iterate fields
        const flatFields: IXSDField[] = header.ixsd_fields.flat();
        flatFields.forEach((field: IXSDField, index: number) => {
          if (field.exception_msg && field.exception_msg.length > 0 && field.input_border === '2px solid red') {
            field.exception_msg.forEach((msg: ExceptionMessage) => {
              exceptionArray.push({
                id: exceptionArray.length,
                rowNo: index + 1,
                complexType: header.label,
                complexTypeLabel: header.header_name,
                key: field.key,
                exception: msg.exception_msg || '',
              });
            });
          }
        });
      } else {
        header.ixsd_fields.forEach((rows: IXSDField[], index: number) => {
          rows.forEach((field: IXSDField) => {
            if (field.exception_msg && field.exception_msg.length > 0 && field.input_border === '2px solid red') {
              field.exception_msg.forEach((msg: ExceptionMessage) => {
                exceptionArray.push({
                  id: exceptionArray.length,
                  rowNo: index + 1,
                  complexType: header.label,
                  complexTypeLabel: header.header_name,
                  key: field.key,
                  exception: msg.exception_msg || '',
                });
              });
            }
          });
        });
      }
    });

    // Group by exception description
    const grouped: Record<string, ExceptionGroupItem[]> = {};
    exceptionArray.forEach((item: ExceptionGroupItem) => {
      const key = item.exception;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    for (const exceptionDesc in grouped) {
      const fieldGroup: Record<string, ExceptionGroupItem[]> = {};
      grouped[exceptionDesc].forEach((item: ExceptionGroupItem) => {
        if (!fieldGroup[item.complexType]) fieldGroup[item.complexType] = [];
        fieldGroup[item.complexType].push(item);
      });

      const fieldList = Object.keys(fieldGroup).map((complexType: string) => ({
        complexType,
        complexTypeLabel: fieldGroup[complexType][0].complexTypeLabel,
        isSelected: true,
        fieldList: fieldGroup[complexType].map((o: ExceptionGroupItem) => ({ key: o.key, rowNo: o.rowNo })),
        exception_count: fieldGroup[complexType].length,
      }));

      exceptions.push({
        exception_desc: exceptionDesc,
        exception_count: grouped[exceptionDesc].length,
        isSelected: true,
        showFieldException: false,
        field_list: fieldList,
      });
    }

    dispatch(setFilteredException(exceptions));
  }, [contentState.ixsdDataHeaders, dispatch]);

  // ─── Check Exception Fields ───
  // Origin: $scope.checkExceptionFields (line ~2141)
  const checkExceptionFields = useCallback((): boolean => {
    let exceptionCount = 0;
    contentState.ixsdDataHeaders.forEach((header: IXSDDataHeader) => {
      if (header.view_style === 'object') {
        const flatFields: IXSDField[] = header.ixsd_fields.flat();
        const hasExc = flatFields.some(
          (field: IXSDField) => field.input_border === '2px solid red'
        );
        if (hasExc) exceptionCount++;
      } else {
        header.ixsd_fields.forEach((rows: IXSDField[]) => {
          const hasExc = rows.some((field: IXSDField) => field.input_border === '2px solid red');
          if (hasExc) exceptionCount++;
        });
      }
    });
    return exceptionCount > 0;
  }, [contentState.ixsdDataHeaders]);

  // ─── Check if Any Field Edited ───
  // Origin: $scope.checkIsAnyFieldEdited (line ~1367)
  const checkIsAnyFieldEdited = useCallback((): boolean => {
    return contentState.ixsdDataHeaders.some((header: IXSDDataHeader) => {
      if (header.view_style === 'object') {
        const flatFields: IXSDField[] = header.ixsd_fields.flat();
        return flatFields.some(
          (field: IXSDField) => field.isExtractedDataChanged
        );
      } else {
        return header.ixsd_fields.some((rows: IXSDField[]) =>
          rows.some((field: IXSDField) => field.isExtractedDataChanged)
        );
      }
    });
  }, [contentState.ixsdDataHeaders]);

  // ─── Go To Inbox ───
  // Origin: $scope.goToInbox (line ~1391)
  const handleGoToInbox = useCallback(() => {
    if (checkIsAnyFieldEdited() && !contentState.saveProcessIsCompleted) {
      // Unsaved changes - caller should show dialog
      return false;
    }
    if (contentState.fromController === 'apps') {
      navigate('/BusinessApps');
    } else {
      navigate('/BusinessTasks');
    }
    dispatch(resetValidationContentState());
    return true;
  }, [checkIsAnyFieldEdited, contentState.saveProcessIsCompleted,
    contentState.fromController, dispatch, navigate]);

  // ─── Navigate Back ───
  const handleNavigateBack = useCallback(() => {
    dispatch(resetValidationContentState());
    if (contentState.fromController === 'apps') {
      navigate('/BusinessApps');
    } else {
      navigate('/BusinessTasks');
    }
  }, [contentState.fromController, dispatch, navigate]);

  return {
    // State
    contentState,
    user,

    // Load operations
    handleLoadValidationMedia,
    handleLoadBundleDesign,

    // Media / Page navigation
    handleChangeMediaPage,
    handleChangePageNumber,
    handleGoToPage,
    handleChangeSelectedMedia,

    // Data extraction
    handleExtractData,

    // Workflow
    handleStartWorkflow,

    // Save
    handleSaveIXSD,

    // Tab / Header management
    handleSetDataHeader,
    handleChangeLineItemView,

    // Exception filtering
    handleFilterByException,
    checkExceptionFields,
    checkIsAnyFieldEdited,

    // Navigation
    handleGoToInbox,
    handleNavigateBack,
  };
}
