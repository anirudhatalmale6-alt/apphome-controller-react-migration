/**
 * Data Entry Operator State Hook
 * Orchestrates data entry exception workflow (page splitting/classification)
 * Replaces DataEntryOperatorController.js $scope/$rootScope methods
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectAuth } from '../../authentication/store/authSlice';
import {
  selectDataEntryOperator,
  setLoading,
  setWorkflowActionStarted,
  setDownloading,
  setModifyPageStream,
  setSelectedException,
  setFromController,
  setPdfStream,
  setCurrentPage,
  setCurrentPageNew,
  setNewPageNumber,
  setTotalPages,
  setSelectedPageStream,
  setClassificationInfo,
  setCurrentPageStatus,
  setCurrentPageStatusMsg,
  setPageOrderList,
  setPageOrderListToRoute,
  setSelectedPageArray,
  setOriginalDocPages,
  setCurrentHeaderIndex,
  setInvoiceNumberList,
  setMaxFileId,
  setMaxFileIdBackUp,
  setWorkflowActionConfigData,
  setSelectedAction,
  setSelectedActionClick,
  setSelectedRabbitMq,
  setNextMicroProcessObj,
  setInventoryData,
  setGenericMxsd,
  setCurrentMedia,
  setSourceFile,
  setServiceDashboard,
  setQueueCatalog,
  setDocValidationResult,
  setShowValidationResultDialog,
  setShowActionDialog,
  setShowPageList,
  setError,
  resetDataEntryOperatorState,
} from '../store/dataEntryOperatorSlice';
import {
  useLazyLoadDataEntryMediaListQuery,
  useChangeMediaPageDataEntryMutation,
  useRotatePDFPageMutation,
  useHandleDataEntryExceptionMutation,
  useDownloadStreamExceptionMutation,
} from '../api/dataEntryOperatorApi';
import type {
  SelectedException,
  PageOrderItem,
  OriginalDocPage,
  WorkflowActionConfig,
  RawWorkflowActionConfig,
  WorkflowRoutingJson,
  ClassificationInfo,
  InventoryData,
  MediaConfigData,
  MaxFileIdData,
  QueueInfo,
  QueueCatalogEntry,
} from '../types/DataEntryOperatorTypes';

export function useDataEntryOperatorState() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authState = useAppSelector(selectAuth);
  const deState = useAppSelector(selectDataEntryOperator);

  // RTK Query hooks
  const [triggerLoadMedia] = useLazyLoadDataEntryMediaListQuery();
  const [changeMediaPage] = useChangeMediaPageDataEntryMutation();
  const [rotatePDFPage] = useRotatePDFPageMutation();
  const [handleDataEntryException] = useHandleDataEntryExceptionMutation();
  const [downloadStreamException] = useDownloadStreamExceptionMutation();

  const user = authState.user;

  // ─── Load Exception Media Info ───
  // Origin: $scope.load_exception_media_info (line ~1003)
  // Response array: [0]=inventoryData, [1]=iXSDConfigData, [2]=mediaConfigData,
  // [3]=workflowActionConfigData, [4]=classificationInfo, [5]=?, [6]=maxFileId,
  // [7]=queueInfo, [8]=?, [9]=queueCatalog
  const handleLoadExceptionMedia = useCallback(async (exception: SelectedException) => {
    if (!user) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(setSelectedException(exception));
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
        currentStatus: deState.currentStatus,
      }).unwrap();

      if (result && Array.isArray(result)) {
        // [0] inventoryData
        const inventoryData = (result[0] || []) as InventoryData[];
        dispatch(setInventoryData(inventoryData));

        if (inventoryData.length > 0) {
          // Update exception with server data
          const updatedException: SelectedException = {
            ...exception,
            filename: inventoryData[0].source_file,
            filePath: inventoryData[0].extracted_file_name,
          };
          dispatch(setSelectedException(updatedException));

          // Set PDF stream from first page
          dispatch(setPdfStream('data:image/jpeg;base64,' + inventoryData[0].byteString));
          dispatch(setTotalPages(inventoryData[0].totalPages));
          dispatch(setSourceFile(inventoryData[0].source_file));

          // Build original doc pages array
          const pages: OriginalDocPage[] = [];
          for (let i = 1; i <= inventoryData[0].totalPages; i++) {
            pages.push({ page: i, isForm: 'Form' });
          }
          dispatch(setOriginalDocPages(pages));
        }

        // [2] mediaConfigData
        if (result[2] && Array.isArray(result[2]) && result[2].length > 0) {
          const mediaConfig = result[2][0] as MediaConfigData;
          dispatch(setGenericMxsd(JSON.parse(mediaConfig.eFS_XSD) as Record<string, unknown>));
          dispatch(setCurrentMedia(mediaConfig.efs_uin));
        }

        // [3] workflowActionConfigData
        if (result[3] && Array.isArray(result[3])) {
          const actionConfig: WorkflowActionConfig[] = (result[3] as RawWorkflowActionConfig[]).map((ele: RawWorkflowActionConfig) => {
            const routingJson: WorkflowRoutingJson[] = JSON.parse(ele.workflow_routing_json);
            let tooltips: Record<string, string> | undefined = undefined;
            try {
              tooltips = JSON.parse(ele.process_desc || '');
            } catch { /* not JSON */ }
            return {
              ...ele,
              isEnabled: routingJson[0].enablesAlways || false,
              tooltips,
            };
          });
          dispatch(setWorkflowActionConfigData(actionConfig));
        }

        // [4] classificationInfo
        const classInfoArr = (result[4] && Array.isArray(result[4]) ? result[4] : []) as ClassificationInfo[];
        if (classInfoArr.length > 0) {
          dispatch(setClassificationInfo(classInfoArr));
          // Set initial page status
          const firstPage = classInfoArr[0];
          dispatch(setCurrentPageStatus(
            firstPage.classification_status === 1 ? 'classified' : 'failed'
          ));
          dispatch(setCurrentPageStatusMsg(
            firstPage.classification_status === 1 ? 'Classified' : 'Failed to classify'
          ));
        }

        // [6] maxFileId
        if (result[6] && Array.isArray(result[6]) && result[6].length > 0) {
          const maxFileIdData = result[6][0] as MaxFileIdData;
          dispatch(setMaxFileId(maxFileIdData.max_file_id));
          dispatch(setMaxFileIdBackUp(maxFileIdData.max_file_id));
        }

        // [7] queueInfo (fileDate and serviceDashboard)
        if (result[7] && Array.isArray(result[7]) && result[7].length > 0) {
          const queueInfo = result[7][0] as QueueInfo;
          const updatedException2: SelectedException = {
            ...(deState.selectedException || exception),
            filename: inventoryData[0]?.source_file || exception.filename,
            filePath: inventoryData[0]?.extracted_file_name || exception.filePath,
            fileDate: queueInfo.queue_btime,
          };
          dispatch(setSelectedException(updatedException2));
          dispatch(setServiceDashboard(JSON.parse(queueInfo.service_dashboard) as Record<string, unknown>));
        }

        // [9] queueCatalog
        if (result[9] && Array.isArray(result[9])) {
          dispatch(setQueueCatalog(result[9] as QueueCatalogEntry[]));
        }

        // Reset page state
        dispatch(setCurrentPage(1));
        dispatch(setCurrentPageNew(1));
        dispatch(setNewPageNumber(1));
        dispatch(setPageOrderList([]));
        dispatch(setCurrentHeaderIndex(0));
        dispatch(setSelectedPageArray([]));

        // Set classified documents as tabs
        setClassifiedDocumentsAsTabsInternal(classInfoArr, inventoryData, exception);
      }
    } catch (err: unknown) {
      console.error('[DataEntryOperator] loadExceptionMedia error:', err);
      dispatch(setError(err instanceof Error ? err.message : 'Failed to load media'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, deState.currentStatus, dispatch, triggerLoadMedia]);

  // ─── Set Classified Documents As Tabs (internal) ───
  // Origin: $scope.setClassifiedDocumentsAsTabs (line ~1128)
  const setClassifiedDocumentsAsTabsInternal = useCallback((
    classificationInfoArr: ClassificationInfo[],
    inventoryData: InventoryData[],
    exception: SelectedException
  ) => {
    const newPageOrderList: PageOrderItem[] = [];
    const newSelectedPageArray: OriginalDocPage[] = [];
    let formPageFound = false;

    classificationInfoArr.forEach((loop) => {
      if (loop.efslobowner_name && (loop.efsuin_state === 'efsuinBegin' || loop.efsuin_state === 'efsuin beginEnd')) {
        const item: PageOrderItem = {
          inv_number: '_split_' + (newPageOrderList.length + 1),
          file_id: parseInt(inventoryData[0]?.file_id || '0'),
          source_file_id: exception.sourceFileId,
          inv_number_desc: loop.efslobowner_name,
          lastPageSelected: loop.extracted_file_id,
          selectedPages: [],
          droppedPageStream: '',
          routeTo: 'classification',
          isOpened: true,
          validationResult: [],
        };
        newPageOrderList.push(item);
        formPageFound = true;
      }

      if (formPageFound || loop.efsuin_state === 'efsuin middle' || loop.efsuin_state === 'efsuinEnd') {
        formPageFound = false;
        const lastDocIndex = newPageOrderList.length - 1;
        if (lastDocIndex >= 0) {
          newPageOrderList[lastDocIndex].selectedPages.push({
            page: loop.extracted_file_id,
            isForm: true,
          });
          newSelectedPageArray.push({
            page: loop.extracted_file_id,
            isForm: 'Form',
          });
          newPageOrderList[lastDocIndex].lastPageSelected = loop.extracted_file_id;
        }
      }
    });

    dispatch(setPageOrderList(newPageOrderList));
    dispatch(setSelectedPageArray(newSelectedPageArray));

    // Load thumbnail for each document tab
    newPageOrderList.forEach((doc, index) => {
      if (doc.lastPageSelected && user) {
        const pageNum = typeof doc.lastPageSelected === 'number'
          ? doc.lastPageSelected
          : parseInt(String(doc.lastPageSelected));

        changeMediaPage({
          customer_id: user.customer_id || '',
          bps_id: user.bps_id || '',
          bu_id: user.bu_id || '',
          tps_id: user.tps_id || '',
          spProcess_id: user.sp_process_id || '',
          uin: exception.uin,
          source_file_id: exception.sourceFileId,
          file_id: exception.fileId,
          extracted_file_id: pageNum - 1,
        }).unwrap().then((res) => {
          if (res?.byteString) {
            // Update droppedPageStream for this doc
            dispatch(setPageOrderList(
              newPageOrderList.map((item, idx) =>
                idx === index
                  ? { ...item, droppedPageStream: 'data:image/jpeg;base64,' + res.byteString }
                  : item
              )
            ));
          }
        }).catch(() => { /* skip */ });
      }
    });

    // Handle single-page documents
    const totalPages = inventoryData[0]?.totalPages || 1;
    if (totalPages === 1 && newPageOrderList.length === 0) {
      handleSetInitialPageDrop(inventoryData, exception);
    }
  }, [user, dispatch, changeMediaPage]);

  // ─── Set Initial Page Drop (single page doc) ───
  // Origin: $scope.setInitialPageDrop (line ~1208)
  const handleSetInitialPageDrop = useCallback((inventoryData: InventoryData[], exception: SelectedException) => {
    const pdfStream = 'data:image/jpeg;base64,' + (inventoryData[0]?.byteString || '');
    const fileId = parseInt(inventoryData[0]?.file_id || '0');

    const newItem: PageOrderItem = {
      inv_number: '',
      file_id: fileId,
      source_file_id: exception.sourceFileId,
      inv_number_desc: 'Doc 1',
      lastPageSelected: 1,
      selectedPages: [{ page: 1, isForm: true }],
      droppedPageStream: pdfStream,
      routeTo: 'classification',
      isOpened: true,
      validationResult: [],
    };

    dispatch(setPageOrderList([newItem]));
    dispatch(setSelectedPageArray([{ page: 1, isForm: 'Form' }]));
    dispatch(setCurrentHeaderIndex(0));

    // Enable all workflow actions
    dispatch(setWorkflowActionConfigData(
      deState.workflowActionConfigData.map((ele) => ({ ...ele, isEnabled: true }))
    ));
  }, [deState.workflowActionConfigData, dispatch]);

  // ─── Change Media Page ───
  // Origin: $scope.changeMediaPageDataEntry (line ~930)
  const handleChangeMediaPage = useCallback(async (page: number) => {
    if (!user || !deState.selectedException) return;

    dispatch(setWorkflowActionStarted(true));
    dispatch(setNewPageNumber(page));
    dispatch(setCurrentPage(page));
    dispatch(setShowPageList(false));

    try {
      const result = await changeMediaPage({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        spProcess_id: user.sp_process_id || '',
        uin: deState.selectedException.uin,
        source_file_id: deState.selectedException.sourceFileId,
        file_id: deState.selectedException.fileId,
        extracted_file_id: page - 1,
      }).unwrap();

      if (result?.byteString) {
        dispatch(setPdfStream('data:image/jpeg;base64,' + result.byteString));

        // Update classification status for current page
        if (deState.classificationInfo.length >= page) {
          const pageInfo = deState.classificationInfo[page - 1];
          dispatch(setCurrentPageStatus(
            pageInfo.classification_status === 1 ? 'classified' : 'failed'
          ));
          dispatch(setCurrentPageStatusMsg(
            pageInfo.classification_status === 1 ? 'Classified' : 'Failed to classify'
          ));
        }
      }
    } catch (err: unknown) {
      console.error('[DataEntryOperator] changeMediaPage error:', err);
    } finally {
      dispatch(setWorkflowActionStarted(false));
    }
  }, [user, deState.selectedException, deState.classificationInfo, dispatch, changeMediaPage]);

  // ─── Rotate PDF Page ───
  // Origin: $scope.rotatePDFPage (line ~30)
  const handleRotatePDFPage = useCallback(async (degree: number) => {
    if (!user || !deState.selectedException) return;

    dispatch(setWorkflowActionStarted(true));

    try {
      const result = await rotatePDFPage({
        customer_id: user.customer_id || '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        spProcess_id: user.sp_process_id || '',
        uin: deState.selectedException.uin,
        source_file_id: deState.selectedException.sourceFileId,
        file_id: deState.selectedException.fileId,
        extracted_file_id: deState.currentPage - 1,
        rotate_degree: degree,
      }).unwrap();

      if (result?.byteString) {
        dispatch(setPdfStream('data:image/jpeg;base64,' + result.byteString));
      }
    } catch (err: unknown) {
      console.error('[DataEntryOperator] rotatePDFPage error:', err);
    } finally {
      dispatch(setWorkflowActionStarted(false));
    }
  }, [user, deState.selectedException, deState.currentPage, dispatch, rotatePDFPage]);

  // ─── Drop Selected Page to Document Tab ───
  // Origin: $scope.dropSelectedPage (line ~355)
  const handleDropSelectedPage = useCallback(() => {
    if (!deState.pdfStream || deState.pageOrderList.length === 0) return;

    const updatedList = deState.pageOrderList.map((item) => {
      if (item.isOpened) {
        return {
          ...item,
          droppedPageStream: deState.pdfStream,
          lastPageSelected: deState.currentPage,
          selectedPages: [...item.selectedPages, { page: deState.currentPage, isForm: true }],
        };
      }
      return item;
    });

    dispatch(setPageOrderList(updatedList));
    dispatch(setSelectedPageArray([
      ...deState.selectedPageArray,
      { page: deState.currentPage, isForm: 'Form' },
    ]));

    // Enable all workflow actions
    dispatch(setWorkflowActionConfigData(
      deState.workflowActionConfigData.map((ele) => ({ ...ele, isEnabled: true }))
    ));

    dispatch(setSelectedPageStream(''));

    // Auto-advance to next page
    if (deState.currentPage < deState.totalPages) {
      handleChangeMediaPage(deState.currentPage + 1);
    }
  }, [deState, dispatch, handleChangeMediaPage]);

  // ─── Remove Page From Selection ───
  // Origin: $scope.removePageFromSelection (line ~230)
  const handleRemovePageFromSelection = useCallback((page: number) => {
    dispatch(setModifyPageStream(true));

    // Remove from selectedPageArray
    const newSelectedPages = deState.selectedPageArray.filter((p) => p.page !== page);
    dispatch(setSelectedPageArray(newSelectedPages));

    // Remove from pageOrderList
    let enableActionBtn = 0;
    const updatedList = deState.pageOrderList.map((doc) => {
      const filteredPages = doc.selectedPages.filter((pg) => pg.page !== page);
      if (filteredPages.length === 0) enableActionBtn++;
      return {
        ...doc,
        selectedPages: filteredPages,
        droppedPageStream: filteredPages.length > 0 ? doc.droppedPageStream : '',
      };
    });
    dispatch(setPageOrderList(updatedList));

    // Disable action buttons if no pages selected
    if (enableActionBtn === deState.pageOrderList.length) {
      dispatch(setWorkflowActionConfigData(
        deState.workflowActionConfigData.map((ele) => {
          const routingJson: WorkflowRoutingJson[] = JSON.parse(ele.workflow_routing_json);
          return {
            ...ele,
            isEnabled: routingJson[0].enabledAlways || routingJson[0].enablesAlways || false,
          };
        })
      ));
    }

    dispatch(setModifyPageStream(false));
  }, [deState, dispatch]);

  // ─── Start Splitting (add new document tab) ───
  // Origin: $scope.startSplitting (line ~323)
  const handleStartSplitting = useCallback(() => {
    const newInvNumber = '_split_' + (deState.pageOrderList.length + 1);
    const newInvDesc = 'Doc ' + (deState.pageOrderList.length + 1);

    // Add to invoice number list
    dispatch(setInvoiceNumberList([
      ...deState.invoiceNumberList,
      { inv_number: newInvNumber, inv_number_display: newInvDesc },
    ]));

    // Determine file_id
    let fileId: number;
    if (deState.pageOrderList.length === 0 && deState.inventoryData.length > 0) {
      fileId = parseInt(deState.inventoryData[0].file_id);
    } else {
      fileId = deState.maxFileId + 1;
      dispatch(setMaxFileId(fileId));
    }

    // Create new document item
    const newItem: PageOrderItem = {
      inv_number: newInvNumber,
      file_id: fileId,
      source_file_id: deState.selectedException?.sourceFileId || '',
      inv_number_desc: newInvDesc,
      lastPageSelected: '',
      selectedPages: [],
      droppedPageStream: '',
      routeTo: 'classification',
      isOpened: true,
      validationResult: [],
    };

    // Close all other tabs
    const updatedList = deState.pageOrderList.map((item) => ({ ...item, isOpened: false }));
    dispatch(setPageOrderList([...updatedList, newItem]));
    dispatch(setCurrentHeaderIndex(updatedList.length));
  }, [deState, dispatch]);

  // ─── Remove Invoice (document tab) ───
  // Origin: $scope.removeInvoice (line ~764)
  const handleRemoveInvoice = useCallback((index: number) => {
    // Remove pages from selected array
    const pagesInDoc = deState.pageOrderList[index]?.selectedPages || [];
    const newSelectedPages = deState.selectedPageArray.filter(
      (sp) => !pagesInDoc.some((pg) => pg.page === sp.page)
    );
    dispatch(setSelectedPageArray(newSelectedPages));

    // Remove the document
    const updatedList = deState.pageOrderList.filter((_, i) => i !== index);
    dispatch(setPageOrderList(updatedList));

    // Check if actions should be disabled
    const emptyDocs = updatedList.filter((doc) => doc.selectedPages.length === 0).length;
    if (emptyDocs === updatedList.length) {
      dispatch(setWorkflowActionConfigData(
        deState.workflowActionConfigData.map((ele) => {
          const routingJson: WorkflowRoutingJson[] = JSON.parse(ele.workflow_routing_json);
          return {
            ...ele,
            isEnabled: routingJson[0].enabledAlways || routingJson[0].enablesAlways || false,
          };
        })
      ));
    }
  }, [deState, dispatch]);

  // ─── Clear All Invoices ───
  // Origin: $scope.clearAllInvoices (line ~787)
  const handleClearAllInvoices = useCallback(() => {
    dispatch(setPageOrderList([]));
    dispatch(setSelectedPageArray([]));
    dispatch(setWorkflowActionConfigData(
      deState.workflowActionConfigData.map((ele) => {
        const routingJson: WorkflowRoutingJson[] = JSON.parse(ele.workflow_routing_json);
        return {
          ...ele,
          isEnabled: routingJson[0].enabledAlways || routingJson[0].enablesAlways || false,
        };
      })
    ));
  }, [deState.workflowActionConfigData, dispatch]);

  // ─── Open Invoice (switch active document tab) ───
  // Origin: $scope.openInvoice (line ~797)
  const handleOpenInvoice = useCallback((clickedIndex: number) => {
    const updatedList = deState.pageOrderList.map((item, index) => ({
      ...item,
      isOpened: index === clickedIndex,
    }));
    dispatch(setPageOrderList(updatedList));
    dispatch(setCurrentHeaderIndex(clickedIndex));
  }, [deState.pageOrderList, dispatch]);

  // ─── Process Document (open workflow action dialog) ───
  // Origin: $rootScope.processDocument (line ~663)
  const handleProcessDocument = useCallback((action: WorkflowActionConfig) => {
    dispatch(setSelectedAction(action));

    const routingJson: WorkflowRoutingJson[] = JSON.parse(action.workflow_routing_json);
    const exception = deState.selectedException;
    if (!exception) return;

    const nextMicroProcess = routingJson[0].next_micro_list.find(
      (ele) => ele.exception_type === exception.exception_type
    );

    if (nextMicroProcess) {
      dispatch(setSelectedActionClick(nextMicroProcess.next_micro_code));
      dispatch(setSelectedRabbitMq(nextMicroProcess.rabbit_mq));
      dispatch(setNextMicroProcessObj(nextMicroProcess.next_micro));
    }

    // Build pageOrderListToRoute
    const isFullyDeletion = routingJson[0].enablesAlways;

    if (!isFullyDeletion) {
      const routeList: PageOrderItem[] = [];
      let selectedPageCount = 0;

      deState.pageOrderList.forEach((ele) => {
        if (ele.selectedPages.length > 0) {
          const item: PageOrderItem = {
            inv_number: ele.inv_number,
            routeTo: 'classification',
            file_id: ele.file_id,
            source_file_id: ele.source_file_id,
            inv_number_desc: ele.inv_number_desc,
            lastPageSelected: '',
            selectedPages: ele.selectedPages.map((pg, pgIndex) => ({
              ...pg,
              extractedfileid: pgIndex + 1,
            })),
            droppedPageStream: '',
            isOpened: ele.isOpened,
            validationResult: [],
          };
          selectedPageCount += ele.selectedPages.length;
          routeList.push(item);
        }
      });

      if (routeList.length > 0) {
        routeList[0].onlyClassification = true;
      }

      // Add remaining pages as "deleted" document if needed
      if (routingJson[0].returnAfterComplete && deState.totalPages > 1 && deState.totalPages > selectedPageCount) {
        const deletedDoc: PageOrderItem = {
          inv_number: '_split_' + (routeList.length + 1),
          inv_number_desc: 'Doc ' + (routeList.length + 1),
          file_id: routeList.length + 1,
          source_file_id: exception.sourceFileId,
          lastPageSelected: '',
          selectedPages: [],
          droppedPageStream: '',
          isOpened: false,
          routeTo: 'deleted',
          validationResult: [],
        };

        // Find pages not assigned to any document
        const assignedPages = deState.selectedPageArray.map((p) => p.page);
        deState.originalDocPages.forEach((pageObj) => {
          if (!assignedPages.includes(pageObj.page)) {
            deletedDoc.selectedPages.push({
              page: pageObj.page,
              isForm: pageObj.isForm ? 'Form' : 'Attachment',
              extractedfileid: pageObj.page,
            });
          }
        });

        routeList.push(deletedDoc);
        if (routeList.length > 0) {
          routeList[0].onlyClassification = false;
        }
      }

      dispatch(setPageOrderListToRoute(routeList));
    }

    // Open action dialog
    dispatch(setShowActionDialog(true));
  }, [deState, dispatch]);

  // ─── Continue Process (submit workflow action) ───
  // Origin: WorkflowActionPageController $scope.continueProcess (line ~479)
  const handleContinueProcess = useCallback(async (queueComments: string) => {
    if (!user || !deState.selectedException || !deState.selectedAction) return;

    dispatch(setShowActionDialog(false));
    dispatch(setWorkflowActionStarted(true));

    const routingJson: WorkflowRoutingJson[] = JSON.parse(deState.selectedAction.workflow_routing_json);

    const prepMxsdListObject = {
      prepMxsd: deState.genericMxsd,
      efsUin: deState.currentMedia,
      prepMxsdStatus: 'clean',
      sheetName: '',
      ixsdId: deState.ixsdId,
    };

    try {
      const result = await handleDataEntryException({
        customer_id: user.customer_id || '',
        customer_lead_id: '',
        bpaas_connector_id: '',
        bps_id: user.bps_id || '',
        bu_id: user.bu_id || '',
        tps_id: user.tps_id || '',
        spProcessId: 'sp_100999',
        corpId: '',
        custDin: '',
        process_month: '',
        mediaUploaderEmailId: '',
        mediaUploaderFName: '',
        mediaUploaderLName: '',
        exceptionCount: 0,
        microService: '',
        source_file: deState.source_file,
        dept_id: user.dept_id || '',
        queue_id: user.queue_id || '',
        dataJSON: deState.selectedDataJson,
        dataExceptionJson: {},
        queue_comment: queueComments,
        exceptionTicketStatus: '',
        exceptionType: deState.selectedException.exception_type,
        schemaBeanPath: deState.ixsd_bean_path,
        rabbitMq: deState.selectedRabbitMq,
        next_micro_process_code: deState.selectedActionClick,
        next_micro_process_id: deState.nextMicroProcessObj,
        next_queue: typeof deState.nextMicroProcessObj === 'object' && deState.nextMicroProcessObj !== null ? deState.nextMicroProcessObj.next_queue : '',
        next_channel: typeof deState.nextMicroProcessObj === 'object' && deState.nextMicroProcessObj !== null ? deState.nextMicroProcessObj.next_channel : '',
        din: '0',
        din_sub_index: '',
        extractFileId: 0,
        din_version: deState.currentVersion,
        sourceFileId: deState.selectedException.sourceFileId,
        fileId: deState.selectedException.fileId,
        fileName: deState.selectedException.filename,
        filePath: deState.selectedException.filePath,
        fileSize: '',
        fileType: '',
        fileDate: deState.selectedException.fileDate,
        fileIndex: 0,
        form_input_source: 'WEBUPLOAD',
        ticketShortDesc: '',
        ticketLongDesc: '',
        ticketPriority: 0,
        ticketSeverity: 0,
        runningSeconds: '',
        current_channel: '',
        current_micro_process_id: '',
        current_micro_process_code: '',
        exceptionVersion: '0',
        exception_channel: deState.selectedAction.exception_channel || '',
        exception_ticket: deState.selectedException.exception_ticket,
        mimeType: '',
        listIndex: 0,
        preparedXSDStatus: [],
        preparedMXSDList: [prepMxsdListObject],
        dinType: true,
        formMedia: 'PDF-EDI',
        form_type: deState.selectedException.form_type,
        uin: deState.selectedException.uin,
        ixsdId: deState.ixsdId,
        efs_uin: 'cefs100999',
        tfs_uin: deState.tfs_uin,
        din_assignee: user.user_id || '',
        user_id: user.user_id || '',
        pageOrderList: deState.pageOrderListToRoute,
        classificationResult: deState.classificationInfo,
        isValidation: !routingJson[0].returnAfterComplete,
        serviceDashboard: deState.serviceDashboard,
      }).unwrap();

      if (result && Object.keys(result).length > 0) {
        dispatch(setSelectedAction(null));

        if (routingJson[0].returnAfterComplete) {
          // Navigate back to inbox
          handleGoToInbox();
        } else {
          // Show validation result
          dispatch(setDocValidationResult(result.exceptionMsg ?? null));
          dispatch(setShowValidationResultDialog(true));
          dispatch(setWorkflowActionStarted(false));
        }
      } else {
        dispatch(setWorkflowActionStarted(false));
        dispatch(setError('Unable to process now..'));
      }
    } catch (err: unknown) {
      console.error('[DataEntryOperator] handleDataEntryException error:', err);
      dispatch(setWorkflowActionStarted(false));
      dispatch(setError(err instanceof Error ? err.message : 'Unable to process'));
    }
  }, [user, deState, dispatch, handleDataEntryException]);

  // ─── Decline All Pages ───
  // Origin: $scope.declinedAllPages (line ~853)
  const handleDeclineAllPages = useCallback(() => {
    const nextAction: WorkflowActionConfig = {
      process_name: 'Decline All Pages',
      isEnabled: true,
      workflow_routing_json: JSON.stringify([{
        channel: 'csfs100102',
        enablesAlways: true,
        next_micro_list: [{
          exception_type: 'design_exception',
          next_channel: 'csfs100102',
          next_micro: '160',
          next_micro_code: 'trashAllPagesWithTicket',
          next_queue: 'qu10045',
          rabbit_mq: 'onebase_pdfdataentry_q',
        }, {
          exception_type: 'declined',
          next_channel: 'csfs100102',
          next_micro: '160',
          next_micro_code: 'trashAllPagesWithTicket',
          next_queue: 'qu10045',
          rabbit_mq: 'onebase_pdfdataentry_q',
        }],
        queue_id: 'qu10045',
        returnAfterComplete: true,
      }]),
    };

    // Build route list with all pages as deleted
    const deletedDoc: PageOrderItem = {
      inv_number: 'split_1',
      inv_number_desc: 'Doc 1',
      file_id: 0,
      source_file_id: '',
      routeTo: 'deleted',
      lastPageSelected: '',
      selectedPages: deState.classificationInfo.map((ele) => ({
        page: ele.extracted_file_id,
        isForm: true,
      })),
      droppedPageStream: '',
      isOpened: false,
      validationResult: [],
    };

    dispatch(setPageOrderListToRoute([deletedDoc]));
    handleProcessDocument(nextAction);
  }, [deState.classificationInfo, dispatch, handleProcessDocument]);

  // ─── Download Source File ───
  // Origin: $scope.download_stream (line ~1277)
  const handleDownloadStream = useCallback(async () => {
    if (!deState.selectedException) return;

    dispatch(setDownloading(true));

    try {
      const result = await downloadStreamException({
        extracted_file_name: deState.selectedException.filePath,
        source_file: deState.selectedException.filename,
      }).unwrap();

      if (result?.downloadStream) {
        // Convert base64 to blob and trigger download
        const binaryString = window.atob(result.downloadStream);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = result.downloadStreamFile || 'download';
        link.click();
        window.URL.revokeObjectURL(link.href);
      }
    } catch (err: unknown) {
      console.error('[DataEntryOperator] downloadStream error:', err);
      dispatch(setError(err instanceof Error ? err.message : 'Download failed'));
    } finally {
      dispatch(setDownloading(false));
    }
  }, [deState.selectedException, dispatch, downloadStreamException]);

  // ─── Go To Inbox ───
  // Origin: $scope.goToInbox (line ~174)
  const handleGoToInbox = useCallback(() => {
    dispatch(resetDataEntryOperatorState());
    if (deState.fromController === 'apps') {
      navigate('/BusinessApps');
    } else {
      navigate('/BusinessTasks');
    }
  }, [deState.fromController, dispatch, navigate]);

  // ─── Sort Pages (drag-drop reorder) ───
  // Origin: $scope.applySorting (line ~282)
  const handleApplySorting = useCallback((fromIndex: number, toIndex: number) => {
    const openedDoc = deState.pageOrderList.find((doc) => doc.isOpened);
    if (!openedDoc) return;

    const pages = [...openedDoc.selectedPages];
    const [moved] = pages.splice(fromIndex, 1);
    pages.splice(toIndex, 0, moved);

    const updatedList = deState.pageOrderList.map((item) =>
      item.isOpened ? { ...item, selectedPages: pages } : item
    );
    dispatch(setPageOrderList(updatedList));
  }, [deState.pageOrderList, dispatch]);

  // ─── Change Page Status (Form/Attachment toggle) ───
  // Origin: $scope.changePageStatus (line ~742)
  const handleChangePageStatus = useCallback((docIndex: number, pageIndex: number) => {
    const doc = deState.pageOrderList[docIndex];
    if (!doc) return;

    const updatedPages = doc.selectedPages.map((pg, idx) =>
      idx === pageIndex ? { ...pg, isForm: !pg.isForm } : pg
    );

    // Ensure at least one page is Form
    const formPages = updatedPages.filter((pg) => pg.isForm);
    if (formPages.length === 0) {
      // Revert - keep at least one form page
      return;
    }

    const updatedList = deState.pageOrderList.map((item, idx) =>
      idx === docIndex ? { ...item, selectedPages: updatedPages } : item
    );
    dispatch(setPageOrderList(updatedList));
  }, [deState.pageOrderList, dispatch]);

  // ─── Check if current page is already selected ───
  // Origin: $scope.isThisPageSelected (line ~265)
  const isCurrentPageSelected = useCallback(() => {
    return deState.selectedPageArray.some((p) => p.page === deState.currentPage);
  }, [deState.selectedPageArray, deState.currentPage]);

  // ─── Select Page To Drag ───
  // Origin: $scope.selectPageToDrag (line ~389)
  const handleSelectPageToDrag = useCallback(() => {
    dispatch(setSelectedPageStream(deState.pdfStream));
  }, [deState.pdfStream, dispatch]);

  // ─── Deselect Page ───
  const handleDeselectPage = useCallback(() => {
    dispatch(setSelectedPageStream(''));
  }, [dispatch]);

  return {
    // State
    deState,
    user,

    // Load operations
    handleLoadExceptionMedia,

    // Page navigation
    handleChangeMediaPage,
    handleRotatePDFPage,

    // Page operations
    handleDropSelectedPage,
    handleRemovePageFromSelection,
    handleSelectPageToDrag,
    handleDeselectPage,
    handleApplySorting,
    handleChangePageStatus,
    isCurrentPageSelected,

    // Document tabs
    handleStartSplitting,
    handleRemoveInvoice,
    handleClearAllInvoices,
    handleOpenInvoice,

    // Workflow
    handleProcessDocument,
    handleContinueProcess,
    handleDeclineAllPages,

    // Download
    handleDownloadStream,

    // Navigation
    handleGoToInbox,
  };
}
