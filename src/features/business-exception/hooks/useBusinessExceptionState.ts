/**
 * Business Exception State Hook
 * Orchestrates data entry exception processing workflow
 * Replaces BusinessExceptionController.js $scope/$rootScope methods
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectAuth } from '../../authentication/store/authSlice';
import {
  selectBusinessException,
  setLoading,
  setExtracting,
  setWorkflowProcessing,
  setSelectException,
  setFromController,
  setDownloadStream,
  setFilepath,
  setTotalPages,
  setCurrentPage,
  setCurrentPageNew,
  setNewPageNumber,
  setPdfExactWidth,
  setPdfExactHeight,
  setImgDimensions,
  setJCropToolIsActive,
  setJCropLineItemIsActive,
  setCoordinatesPositions,
  initPageExtraction,
  updateColumnHeaders,
  addColumnHeader,
  removeColumnHeader,
  setTableAreaPosition,
  setCanTableAreaCrop,
  setIsSkipIndexTextActive,
  addSkipIndexText,
  removeSkipIndexText,
  clearTableExtraction,
  setIxsdDataHeaders,
  setSelectedIXSDDataObject,
  setSelectedDataJson,
  setSelectedDataException,
  setEmptySelectedDataJson,
  setBundleDesign,
  setIXSDFieldsFormat,
  setFlipDataJson,
  setSelectedField,
  setSelectedIndex,
  setCurrentHeaderIndex,
  setFocusedField,
  setExpectedData,
  setIsExtractedDataChanged,
  setLineItemForDataEntry,
  setGenericLineItem,
  setShowDataEntryForm,
  setSelectedFormElementIndex,
  setTotalLineItemOfCurrentPage,
  setSelectedComplexTypeLabel,
  setCurrentLineItemRowNo,
  setGenericMxsd,
  setPreparedMxsd,
  setPrepMxsdForPartial,
  setSelectedComplexTypeFields,
  setTableColumnIndex,
  setSelectedTableColumn,
  setSelectedTableField,
  setWorkflowActionStarted,
  setWorkflowActionConfigData,
  setIsWorkflowActionPageOpened,
  setIxsdSelectionDiv,
  setNormalDataEntryFormView,
  setClassificationInfo,
  setMediaConfigData,
  setCurrentMedia,
  setTfsUin,
  setIxsdId,
  setIxsdBeanPath,
  setServiceDashboard,
  setLookupCatalog,
  setQueueCatalog,
  setSelectedDateFormats,
  setConfigProcessStep,
  setError,
  resetBusinessExceptionState,
} from '../store/businessExceptionSlice';
import {
  useLazyLoadDataEntryMediaListQuery,
  useChangeMediaPageDataEntryMutation,
  useExtractDataFromPositionMutation,
  useHandleDataEntryExceptionMutation,
  useLoadBundleDesignAndIXSDMutation,
  useDownloadStreamExceptionMutation,
} from '../api/businessExceptionApi';
import type {
  ExceptionTicket,
  CropCoordinates,
  ColumnHeader,
  IXSDDataHeader,
  IXSDField,
  ComplexTypeField,
  GenericMXSD,
} from '../types/BusinessExceptionTypes';

export function useBusinessExceptionState() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authState = useAppSelector(selectAuth);
  const exceptionState = useAppSelector(selectBusinessException);

  // RTK Query hooks
  const [triggerLoadMedia] = useLazyLoadDataEntryMediaListQuery();
  const [changeMediaPage] = useChangeMediaPageDataEntryMutation();
  const [extractDataFromPosition] = useExtractDataFromPositionMutation();
  const [handleDataEntryException] = useHandleDataEntryExceptionMutation();
  const [loadBundleDesign] = useLoadBundleDesignAndIXSDMutation();
  const [downloadStreamException] = useDownloadStreamExceptionMutation();

  const user = authState.user;

  // ─── Load Data Entry Media List ───
  // Origin: $scope.load_data_entry_media_list (line ~2095)
  const handleLoadDataEntryMediaList = useCallback(async (exception: ExceptionTicket) => {
    if (!user) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(setSelectException(exception));
    dispatch(setFromController(exception.fromController));

    try {
      const result = await triggerLoadMedia({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        uin: exception.uin,
        file_id: exception.fileId,
        formMedia: 'PDF-EDI',
        extracted_file_id: exception.extractFileId,
        source_file_id: exception.sourceFileId,
        dept_id: user.dept_id || '',
        queue_id: user.queue_id || '',
        user_id: user.user_id || '',
        exception_ticket: exception.exception_ticket,
      }).unwrap();

      if (result && Array.isArray(result)) {
        // response[0]: inventoryData
        const inventoryData = result[0];
        if (inventoryData && inventoryData.length > 0) {
          const sourceFile = inventoryData[0].source_file;
          if (!sourceFile) {
            const extractedFileName = inventoryData[0].extracted_file_name || '';
            const parts = extractedFileName.split('/');
            dispatch(setSelectException({
              ...exception,
              filename: parts[parts.length - 1],
            }));
          } else {
            dispatch(setSelectException({
              ...exception,
              filename: sourceFile,
            }));
          }

          dispatch(setDownloadStream('data:image/jpeg;base64,' + inventoryData[0].byteString));
          dispatch(setPdfExactWidth(inventoryData[0].pdfWidth || 0));
          dispatch(setPdfExactHeight(inventoryData[0].pdfHeight || 0));
          dispatch(setFilepath(inventoryData[0].extracted_file_name || ''));
          dispatch(setTotalPages(inventoryData[0].totalPages || 1));
        }

        // response[1]: iXSDConfigData
        const iXSDConfigData = result[1] || [];

        // response[2]: mediaConfigData
        const mediaConfigData = result[2] || [];
        dispatch(setMediaConfigData(mediaConfigData));

        // response[3]: workflowActionConfigData
        const workflowActions = result[3] || [];
        const configuredActions = workflowActions.map((ele: any) => {
          const routingJson = JSON.parse(ele.workflow_routing_json || '[]');
          return {
            ...ele,
            isEnabled: routingJson[0]?.enabledAlways ? true : false,
            tooltips: typeof ele.process_desc === 'string' ? JSON.parse(ele.process_desc) : ele.process_desc,
          };
        });
        dispatch(setWorkflowActionConfigData(configuredActions));

        // response[4]: classificationInfo
        dispatch(setClassificationInfo(result[4] || []));

        // response[5]: dataEntryJson (prepared MXSD and data entry state)
        if (result[5] && result[5][0] && Object.keys(result[5][0]).length > 0) {
          const dataEntryData = result[5][0];
          dispatch(setSelectedDataJson(JSON.parse(dataEntryData.data_entry_json || '{}')));
          dispatch(setPreparedMxsd(JSON.parse(dataEntryData.prepared_mxsd || '{}')));
          dispatch(setPrepMxsdForPartial(JSON.parse(dataEntryData.prepared_mxsd || '{}')));
          if (dataEntryData.field_formats_for_999) {
            dispatch(setSelectedDateFormats(JSON.parse(dataEntryData.field_formats_for_999)));
          }
        }

        // response[7]: serviceDashboard + report time
        if (result[7] && result[7][0]) {
          if (result[7][0].service_dashboard) {
            dispatch(setServiceDashboard(JSON.parse(result[7][0].service_dashboard)));
          }
          if (result[7][0].queue_btime) {
            dispatch(setSelectException({
              ...exception,
              exception_report_time: result[7][0].queue_btime,
              fileDate: result[7][0].queue_btime,
            }));
          }
        }

        // response[8]: lookupCatalog
        if (result[8]) {
          dispatch(setLookupCatalog({ dm_service_providers: result[8] }));
        }

        // response[9]: queueCatalog
        if (result[9]) {
          dispatch(setQueueCatalog(result[9]));
        }

        // Initialize page state
        dispatch(setCurrentPage(1));
        dispatch(setCurrentPageNew(1));
        dispatch(setNewPageNumber(1));
        dispatch(initPageExtraction(1));
        dispatch(setWorkflowActionStarted(false));

        // Set filePath
        if (inventoryData && inventoryData[0]) {
          dispatch(setSelectException({
            ...exception,
            filePath: inventoryData[0].extracted_file_name,
          }));
        }

        // Load bundle design if single iXSD config
        const filteredIXSD = iXSDConfigData.length > 0 && iXSDConfigData[0].hasOwnProperty('tfs_uin')
          ? iXSDConfigData : [];
        if (filteredIXSD.length <= 1 && filteredIXSD.length > 0) {
          dispatch(setIxsdSelectionDiv(false));
          await handleSetBundleInfo(filteredIXSD[0]);
        } else if (filteredIXSD.length > 1) {
          dispatch(setIxsdSelectionDiv(true));
        }
      }
    } catch (err: any) {
      console.error('[BusinessException] loadDataEntryMediaList error:', err);
      dispatch(setError(err?.message || 'Failed to load exception media'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch, triggerLoadMedia]);

  // ─── Set Bundle Info (Load iXSD design) ───
  // Origin: $scope.setBundleInfo (line ~1953)
  const handleSetBundleInfo = useCallback(async (tfs: any) => {
    if (!user) return;

    dispatch(setNormalDataEntryFormView(true));

    try {
      const result = await loadBundleDesign({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        efs_uin: tfs.efs_uin,
        tfs_uin: tfs.tfs_uin,
      }).unwrap();

      if (result && Array.isArray(result) && result[0] && result[0][0]) {
        const bundleData = result[0][0];

        dispatch(setBundleDesign(JSON.parse(bundleData.bundle_design || '{}')));
        dispatch(setSelectedDataJson(JSON.parse(bundleData.data_json || '{}')));
        dispatch(setEmptySelectedDataJson(JSON.parse(bundleData.data_json || '{}')));
        dispatch(setIXSDFieldsFormat(JSON.parse(bundleData.data_json_with_type || '{}')));
        dispatch(setFlipDataJson(JSON.parse(bundleData.flip_data_json || '[]')));
        dispatch(setTfsUin(bundleData.tfs_uin || ''));
        dispatch(setIxsdId(bundleData.ixsd_id || ''));
        dispatch(setIxsdBeanPath(bundleData.ixsd_bean_path || ''));
        dispatch(setCurrentMedia(bundleData.efs_uin || ''));

        // Set generic MXSD from media config
        if (exceptionState.mediaConfigData.length > 0) {
          const genericMxsdParsed = JSON.parse(exceptionState.mediaConfigData[0].eFS_XSD || '{}') as GenericMXSD;
          // Initialize tablelist for generic MXSD
          if (genericMxsdParsed.mxsd?.efsuin_form?.page?.[0]) {
            genericMxsdParsed.mxsd.efsuin_form.page[0].tablelist = [{
              name: 'Default Table',
              isTableHeader: true,
              skip_until_text: [],
              is_ugly_column: false,
              skip_until_index: '',
              unique_field_index: '',
              skip_data_column: '',
              extract_unique_index_only: false,
              fieldlist: [],
              positions: [],
            }];
          }
          dispatch(setGenericMxsd(genericMxsdParsed));

          // Initialize preparedMxsd if empty
          if (!exceptionState.preparedMxsd) {
            const prepMxsd = JSON.parse(exceptionState.mediaConfigData[0].eFS_XSD || '{}') as GenericMXSD;
            if (prepMxsd.mxsd?.efsuin_form?.page?.[0]) {
              prepMxsd.mxsd.efsuin_form.page[0].tablelist = [{
                name: 'Default Table',
                isTableHeader: true,
                skip_until_text: [],
                is_ugly_column: false,
                skip_until_index: '',
                unique_field_index: '',
                skip_data_column: '',
                extract_unique_index_only: false,
                fieldlist: [],
                positions: [],
              }];
            }
            dispatch(setPreparedMxsd(prepMxsd));
            dispatch(setPrepMxsdForPartial(prepMxsd));
          }
        }

        dispatch(setIxsdSelectionDiv(false));
      }
    } catch (err: any) {
      console.error('[BusinessException] setBundleInfo error:', err);
      dispatch(setError(err?.message || 'Failed to load bundle design'));
    }
  }, [user, exceptionState.mediaConfigData, exceptionState.preparedMxsd, dispatch, loadBundleDesign]);

  // ─── Change Media Page ───
  // Origin: $scope.changeMediaPageDataEntry (line ~2831)
  const handleChangeMediaPage = useCallback(async (page: number) => {
    if (!user || !exceptionState.selectException) return;

    dispatch(setWorkflowActionStarted(true));
    dispatch(setNewPageNumber(page));
    dispatch(setCurrentPage(page));
    dispatch(initPageExtraction(page));

    try {
      const result = await changeMediaPage({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        spProcess_id: user.sp_process_id || '',
        uin: exceptionState.selectException.uin,
        source_file_id: exceptionState.selectException.sourceFileId,
        file_id: exceptionState.selectException.fileId,
        extracted_file_id: page - 1, // 0-indexed for API
      }).unwrap();

      if (result?.byteString) {
        dispatch(setDownloadStream('data:image/jpeg;base64,' + result.byteString));
      }
    } catch (err: any) {
      console.error('[BusinessException] changeMediaPage error:', err);
    } finally {
      dispatch(setWorkflowActionStarted(false));
    }
  }, [user, exceptionState.selectException, dispatch, changeMediaPage]);

  // ─── Extract Data From Position (OCR Crop) ───
  // Origin: $scope.extractData (line ~917)
  const handleExtractData = useCallback(async () => {
    if (!exceptionState.filepath || !exceptionState.coordinatesPositions) return;

    dispatch(setExtracting(true));
    const coords = exceptionState.coordinatesPositions;

    try {
      const result = await extractDataFromPosition({
        file_location: exceptionState.filepath,
        pageNo: exceptionState.currentPage,
        top: coords.y,
        left: coords.x,
        width: coords.w,
        height: coords.h,
      }).unwrap();

      if (result?.data) {
        let extractedText = result.data.replaceAll('\\', '\\\\');
        extractedText = extractedText.replaceAll('\r\n', '').replaceAll('\n', '').replaceAll('\r', '');
        dispatch(setExpectedData(extractedText));

        const currentPage = exceptionState.currentPage;
        const pageExtraction = exceptionState.pageWiseExtraction[currentPage];

        // If skip index text is active, add to skip list
        if (pageExtraction?.tableExtractionInputs?.isSkipIndexTextActive) {
          dispatch(addSkipIndexText({ page: currentPage, text: extractedText }));
          dispatch(setIsSkipIndexTextActive({ page: currentPage, value: false }));
        }
        // If object view_style - apply to selected field
        else if (exceptionState.selectedIXSDDataObject?.view_style === 'object') {
          if (exceptionState.selectedField?.edit) {
            dispatch(setIsExtractedDataChanged(true));
            dispatch(setJCropToolIsActive(false));
            // Move to next field
            const nextIndex = exceptionState.selectedIndex + 1;
            dispatch(setSelectedIndex(nextIndex));
          }
        }
        // If array view_style - add/edit column header
        else {
          dispatch(setConfigProcessStep(2));
          const columnHeaders = pageExtraction?.tableExtractionInputs?.columnHeaders || [];
          const editModeIndex = columnHeaders.findIndex((col) => col.isEditMode);

          if (editModeIndex > -1) {
            // Update existing column label
            const updatedHeaders = columnHeaders.map((col, idx) => ({
              ...col,
              label: idx === editModeIndex ? extractedText : col.label,
              isEditMode: false,
            }));
            dispatch(updateColumnHeaders({ page: currentPage, columnHeaders: updatedHeaders }));
          } else {
            // Add new column header
            const newHeader: ColumnHeader = {
              label: extractedText,
              labelPosition: {
                top: coords.y,
                left: coords.x,
                width: coords.w,
                height: coords.h,
              },
              headerMasterIndex: columnHeaders.length,
              isTwinHeader: false,
              ixsdFieldName: '',
              ixsdPath: '',
              isEditMode: false,
              isSkipIndex: false,
              isUniqueColumn: false,
              isDiscard: false,
            };
            dispatch(addColumnHeader({ page: currentPage, header: newHeader }));
            dispatch(setTableColumnIndex(columnHeaders.length));
            dispatch(setSelectedTableColumn(extractedText));
            dispatch(setSelectedTableField(newHeader));
          }
        }
      }
    } catch (err: any) {
      console.error('[BusinessException] extractData error:', err);
    } finally {
      dispatch(setExtracting(false));
    }
  }, [
    exceptionState.filepath,
    exceptionState.coordinatesPositions,
    exceptionState.currentPage,
    exceptionState.pageWiseExtraction,
    exceptionState.selectedIXSDDataObject,
    exceptionState.selectedField,
    exceptionState.selectedIndex,
    dispatch,
    extractDataFromPosition,
  ]);

  // ─── Extract Table (Process Table Extraction Workflow) ───
  // Origin: $scope.extractTable (line ~590)
  const handleExtractTable = useCallback(async () => {
    if (!user || !exceptionState.selectException) return;

    dispatch(setWorkflowActionStarted(true));

    const currentPage = exceptionState.currentPage;
    // Release crop
    dispatch(setCanTableAreaCrop({ page: currentPage, value: false }));

    try {
      const prepMxsdListObject = {
        prepMxsd: exceptionState.genericMxsd,
        efsUin: exceptionState.currentMedia,
        prepMxsdStatus: 'clean',
        sheetName: '',
        ixsdId: exceptionState.ixsdId,
      };

      const nextMicroCode = 'extractLineItemForPartialPrep';
      const rabbitMq = 'onebase_exception_extraction_q';

      const input = {
        customer_id: user.customer_id || '',
        customer_lead_id: '',
        bpaas_connector_id: '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        spProcessId: user.sp_process_id || '',
        corpId: '',
        custDin: '',
        process_month: '',
        exceptionCount: 0,
        microService: '',
        templaeStatus: 0,
        source_file: exceptionState.selectException.filePath || '',
        dept_id: user.dept_id || '',
        queue_id: user.queue_id || '',
        dataJSON: exceptionState.emptySelectedDataJson,
        dataExceptionJson: {},
        queue_comment: '',
        din_status: 'ticket_for_dataentry',
        schemaBeanPath: exceptionState.ixsdBeanPath,
        rabbitMq,
        next_micro_process_code: nextMicroCode,
        next_micro_process_id: '160',
        next_queue: 'qu10045',
        next_channel: 'csfs100102',
        din: exceptionState.selectException.din,
        din_sub_index: '',
        extractFileId: 0,
        din_version: '',
        fileId: exceptionState.selectException.fileId,
        fileName: exceptionState.selectException.fileName,
        filePath: exceptionState.selectException.filePath,
        fileSize: '',
        fileType: '',
        fileDate: exceptionState.selectException.fileDate || '',
        fileIndex: 0,
        form_input_source: exceptionState.selectException.formInputSource,
        ticketShortDesc: '',
        ticketLongDesc: '',
        ticketPriority: 0,
        ticketSeverity: 0,
        runningSeconds: '',
        current_channel: '',
        current_micro_process_id: '',
        current_micro_process_code: '',
        exceptionVersion: exceptionState.selectException.exception_version,
        exception_channel: '',
        exception_ticket: exceptionState.selectException.exception_ticket,
        mimeType: '',
        listIndex: 0,
        preparedXSDStatus: [],
        preparedMXSDList: [prepMxsdListObject],
        dinType: true,
        formMedia: 'PDF-EDI',
        form_type: 'PO-Inventory',
        uin: exceptionState.selectException.uin,
        ixsdId: exceptionState.ixsdId,
        efs_uin: exceptionState.currentMedia,
        tfs_uin: exceptionState.tfsUin,
        din_assignee: user.user_id || '',
        user_id: user.user_id || '',
        serviceDashboard: exceptionState.serviceDashboard,
        isManualUser: true,
      };

      const result = await handleDataEntryException(input).unwrap();

      if (result) {
        dispatch(setIsExtractedDataChanged(true));
        dispatch(setJCropLineItemIsActive(false));
      }
    } catch (err: any) {
      console.error('[BusinessException] extractTable error:', err);
      dispatch(setError(err?.message || 'Table extraction failed'));
    } finally {
      dispatch(setWorkflowActionStarted(false));
    }
  }, [user, exceptionState, dispatch, handleDataEntryException]);

  // ─── Coordinates Changed (scale coordinates from display to PDF) ───
  // Origin: $scope.coordinatesChanged (line ~269)
  const handleCoordinatesChanged = useCallback((rawCoords: CropCoordinates) => {
    const { formSize, imgWidth, imgHeight, pdfExactWidth, pdfExactHeight, currentPage, pageWiseExtraction } = exceptionState;

    const formWidth = parseInt(formSize.width);
    const formHeight = parseInt(formSize.Height);

    // Scale from image coords to form coords
    let scaledCoords: CropCoordinates = {
      x: Math.ceil(formWidth / imgWidth * rawCoords.x),
      y: Math.ceil(formHeight / imgHeight * rawCoords.y),
      w: Math.ceil(formWidth / imgWidth * rawCoords.w),
      h: Math.ceil(formHeight / imgHeight * rawCoords.h),
    };

    const pageExtraction = pageWiseExtraction[currentPage];

    if (pageExtraction?.tableExtractionInputs?.canTableAreaCrop) {
      // Scale further from form coords to PDF exact coords
      const pdfCoords: CropCoordinates = {
        x: Math.ceil(pdfExactWidth / formWidth * scaledCoords.x),
        y: Math.ceil(pdfExactHeight / formHeight * scaledCoords.y),
        w: Math.ceil(pdfExactWidth / formWidth * scaledCoords.w),
        h: Math.ceil(pdfExactHeight / formHeight * scaledCoords.h),
      };

      dispatch(setTableAreaPosition({
        page: currentPage,
        position: {
          top: pdfCoords.y,
          left: pdfCoords.x,
          width: pdfCoords.w + pdfCoords.x,
          height: pdfCoords.h + pdfCoords.y,
          page: currentPage - 1,
        },
      }));
      dispatch(setJCropToolIsActive(false));
    } else {
      dispatch(setJCropToolIsActive(true));
    }

    dispatch(setCoordinatesPositions(scaledCoords));
  }, [exceptionState, dispatch]);

  // ─── Select iXSD Header Tab ───
  // Origin: $scope.selectIXSDHeader (line ~1680)
  const handleSelectIXSDHeader = useCallback((header: IXSDDataHeader, index: number) => {
    dispatch(setSelectedIXSDDataObject(header));
    dispatch(setCurrentHeaderIndex(index));
    dispatch(setSelectedIndex(0));

    if (header.view_style === 'object') {
      dispatch(setShowDataEntryForm(false));
      const fields = header.ixsd_fields as IXSDField[];
      if (fields && fields.length > 0) {
        dispatch(setSelectedField(fields[0]));
        dispatch(setFocusedField(fields[0].key));
      }
    } else {
      dispatch(setJCropLineItemIsActive(false));
      // For array type, show data entry form with last line item
      const lineItems = header.ixsd_fields as IXSDField[][];
      if (lineItems && lineItems.length > 0) {
        const lastItem = lineItems[lineItems.length - 1];
        dispatch(setLineItemForDataEntry(lastItem));
        dispatch(setSelectedFormElementIndex(lineItems.length));
        dispatch(setTotalLineItemOfCurrentPage(lineItems.length));
        dispatch(setShowDataEntryForm(true));
      }
    }
  }, [dispatch]);

  // ─── Next/Previous Tab Selection ───
  // Origin: $scope.nextTabSelection / $scope.previousTabSelection
  const handleNextTabSelection = useCallback(() => {
    const nextIndex = (exceptionState.currentHeaderIndex + 1) % exceptionState.ixsdDataHeaders.length;
    handleSelectIXSDHeader(exceptionState.ixsdDataHeaders[nextIndex], nextIndex);
  }, [exceptionState.currentHeaderIndex, exceptionState.ixsdDataHeaders, handleSelectIXSDHeader]);

  const handlePreviousTabSelection = useCallback(() => {
    let prevIndex = exceptionState.currentHeaderIndex - 1;
    if (prevIndex < 0) prevIndex = exceptionState.ixsdDataHeaders.length - 1;
    handleSelectIXSDHeader(exceptionState.ixsdDataHeaders[prevIndex], prevIndex);
  }, [exceptionState.currentHeaderIndex, exceptionState.ixsdDataHeaders, handleSelectIXSDHeader]);

  // ─── Next/Previous Field Selection ───
  // Origin: $scope.nextFieldSelection / $scope.previousFieldSelection
  const handleNextFieldSelection = useCallback(() => {
    const nextIdx = exceptionState.selectedIndex + 1;
    dispatch(setSelectedIndex(nextIdx));

    if (exceptionState.selectedIXSDDataObject?.view_style === 'object') {
      const fields = exceptionState.selectedIXSDDataObject.ixsd_fields as IXSDField[];
      if (nextIdx >= fields.length) {
        handleNextTabSelection();
      } else if (fields[nextIdx]) {
        dispatch(setSelectedField(fields[nextIdx]));
        dispatch(setFocusedField(fields[nextIdx].key));
      }
    }
  }, [exceptionState.selectedIndex, exceptionState.selectedIXSDDataObject, dispatch, handleNextTabSelection]);

  const handlePreviousFieldSelection = useCallback(() => {
    const prevIdx = Math.max(0, exceptionState.selectedIndex - 1);
    dispatch(setSelectedIndex(prevIdx));

    if (exceptionState.selectedIXSDDataObject?.view_style === 'object') {
      const fields = exceptionState.selectedIXSDDataObject.ixsd_fields as IXSDField[];
      if (fields[prevIdx]) {
        dispatch(setSelectedField(fields[prevIdx]));
        dispatch(setFocusedField(fields[prevIdx].key));
      }
    }
  }, [exceptionState.selectedIndex, exceptionState.selectedIXSDDataObject, dispatch]);

  // ─── Create Generic Line Item ───
  // Origin: $scope.createGenericLineItem (line ~1769)
  const createGenericLineItem = useCallback((lineItem: IXSDField[], lastRowNo: number): IXSDField[] => {
    return lineItem.map((header) => ({
      ...header,
      value: '',
      isExtractedDataChanged: false,
      page: exceptionState.currentPage,
      row: lastRowNo + 1,
      lookup_criteria: [],
      field_properties: [],
      data_format: [],
    }));
  }, [exceptionState.currentPage]);

  // ─── Add Line Item ───
  const handleAddLineItem = useCallback(() => {
    if (!exceptionState.selectedIXSDDataObject) return;

    const headers = [...exceptionState.ixsdDataHeaders];
    const headerIdx = headers.findIndex((h) => h.label === exceptionState.selectedIXSDDataObject?.label);
    if (headerIdx === -1) return;

    const lineItems = headers[headerIdx].ixsd_fields as IXSDField[][];
    if (lineItems.length === 0) return;

    const lastRow = lineItems.length;
    const newItem = createGenericLineItem(lineItems[0], lastRow);
    const updatedFields = [...lineItems, newItem];
    headers[headerIdx] = { ...headers[headerIdx], ixsd_fields: updatedFields };
    dispatch(setIxsdDataHeaders(headers));
  }, [exceptionState.ixsdDataHeaders, exceptionState.selectedIXSDDataObject, createGenericLineItem, dispatch]);

  // ─── Delete Line Item ───
  const handleDeleteLineItem = useCallback((rowIndex: number) => {
    if (!exceptionState.selectedIXSDDataObject) return;

    const headers = [...exceptionState.ixsdDataHeaders];
    const headerIdx = headers.findIndex((h) => h.label === exceptionState.selectedIXSDDataObject?.label);
    if (headerIdx === -1) return;

    const lineItems = [...(headers[headerIdx].ixsd_fields as IXSDField[][])];
    lineItems.splice(rowIndex, 1);
    headers[headerIdx] = { ...headers[headerIdx], ixsd_fields: lineItems };
    dispatch(setIxsdDataHeaders(headers));
    dispatch(setIsExtractedDataChanged(true));
  }, [exceptionState.ixsdDataHeaders, exceptionState.selectedIXSDDataObject, dispatch]);

  // ─── Set Column Edit Mode ───
  // Origin: $scope.setColumnEditMode (line ~311)
  const handleSetColumnEditMode = useCallback((colIndex: number) => {
    const currentPage = exceptionState.currentPage;
    const pageExtraction = exceptionState.pageWiseExtraction[currentPage];
    if (!pageExtraction) return;

    const updatedHeaders = pageExtraction.tableExtractionInputs.columnHeaders.map((col, idx) => ({
      ...col,
      isEditMode: idx === colIndex,
    }));
    dispatch(updateColumnHeaders({ page: currentPage, columnHeaders: updatedHeaders }));
    dispatch(setIsSkipIndexTextActive({ page: currentPage, value: false }));
    dispatch(setCanTableAreaCrop({ page: currentPage, value: false }));
  }, [exceptionState.currentPage, exceptionState.pageWiseExtraction, dispatch]);

  // ─── Remove Table Column ───
  // Origin: $scope.removeTableColumn (line ~582)
  const handleRemoveTableColumn = useCallback((index: number) => {
    dispatch(removeColumnHeader({ page: exceptionState.currentPage, index }));
  }, [exceptionState.currentPage, dispatch]);

  // ─── Set Configuration Tab ───
  // Origin: $scope.setConfigurationTab (line ~1656)
  const handleSetConfigurationTab = useCallback((tab: number) => {
    const currentPage = exceptionState.currentPage;
    dispatch(setIsSkipIndexTextActive({ page: currentPage, value: false }));
    dispatch(setCanTableAreaCrop({ page: currentPage, value: tab === 1 }));

    const pageExtraction = exceptionState.pageWiseExtraction[currentPage];
    if (pageExtraction) {
      const updatedHeaders = pageExtraction.tableExtractionInputs.columnHeaders.map((col) => ({
        ...col,
        isEditMode: false,
      }));
      dispatch(updateColumnHeaders({ page: currentPage, columnHeaders: updatedHeaders }));
    }
    dispatch(setConfigProcessStep(tab));
  }, [exceptionState.currentPage, exceptionState.pageWiseExtraction, dispatch]);

  // ─── Download Stream ───
  const handleDownloadStream = useCallback(async (item: any) => {
    if (!item.selectedMedia) return;

    try {
      await downloadStreamException({
        source_file: item.selectedMedia,
        file_name: item.selectedMediaName || 'download',
      }).unwrap();
    } catch (err: any) {
      console.error('[BusinessException] downloadStream error:', err);
    }
  }, [downloadStreamException]);

  // ─── Navigate Back ───
  const handleNavigateBack = useCallback(() => {
    dispatch(resetBusinessExceptionState());
    if (exceptionState.fromController === 'tasks') {
      navigate('/BusinessTasks');
    } else {
      navigate('/BusinessHomeViews');
    }
  }, [exceptionState.fromController, dispatch, navigate]);

  // ─── Clear Table Extraction ───
  // Origin: $scope.clearTableExtraction (line ~503)
  const handleClearTableExtraction = useCallback(() => {
    dispatch(clearTableExtraction(exceptionState.currentPage));
  }, [exceptionState.currentPage, dispatch]);

  // ─── Activate Skip Index Text ───
  // Origin: $scope.activateSkipIndexText (line ~806)
  const handleActivateSkipIndexText = useCallback(() => {
    const currentPage = exceptionState.currentPage;
    const pageExtraction = exceptionState.pageWiseExtraction[currentPage];
    if (!pageExtraction) return;

    const hasSkipColumn = pageExtraction.tableExtractionInputs.columnHeaders.some((col) => col.isSkipIndex);
    if (hasSkipColumn) {
      dispatch(setIsSkipIndexTextActive({ page: currentPage, value: true }));
      dispatch(setCanTableAreaCrop({ page: currentPage, value: false }));
      const updatedHeaders = pageExtraction.tableExtractionInputs.columnHeaders.map((col) => ({
        ...col,
        isEditMode: false,
      }));
      dispatch(updateColumnHeaders({ page: currentPage, columnHeaders: updatedHeaders }));
    }
  }, [exceptionState.currentPage, exceptionState.pageWiseExtraction, dispatch]);

  return {
    // State
    exceptionState,
    user,

    // Load operations
    handleLoadDataEntryMediaList,
    handleSetBundleInfo,
    handleChangeMediaPage,

    // Extraction
    handleExtractData,
    handleExtractTable,
    handleCoordinatesChanged,

    // Tab navigation
    handleSelectIXSDHeader,
    handleNextTabSelection,
    handlePreviousTabSelection,

    // Field navigation
    handleNextFieldSelection,
    handlePreviousFieldSelection,

    // Line items
    handleAddLineItem,
    handleDeleteLineItem,
    createGenericLineItem,

    // Table extraction config
    handleSetColumnEditMode,
    handleRemoveTableColumn,
    handleSetConfigurationTab,
    handleClearTableExtraction,
    handleActivateSkipIndexText,

    // Download
    handleDownloadStream,

    // Navigation
    handleNavigateBack,
  };
}
