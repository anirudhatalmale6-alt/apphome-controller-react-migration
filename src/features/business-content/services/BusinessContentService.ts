/**
 * Business Content Service
 * Data transformation & business logic extracted from BusinessContentController.js
 * Handles: iXSD parsing, line item management, field validation, download helpers
 */
import type {
  IXSDDataHeader,
  IXSDField,
  MediaConfig,
  ExceptionMessage,
  LookupItem,
  DataPosition,
} from '../types/BusinessContentTypes';

// ─── iXSD Data Parsing ───

/**
 * Parse iXSD data JSON and exception JSON into typed headers
 * Origin: BusinessContentController.js lines ~400-600
 * Called after loadTransactionMediaList API response
 */
export function parseIXSDData(
  dataJsonStr: string,
  exceptionJsonStr: string,
  fieldFormatsFor999?: any[]
): {
  headers: IXSDDataHeader[];
  dataJson: any;
  exceptionJson: any;
} {
  let dataJson: any;
  let exceptionJson: any;

  try {
    dataJson = typeof dataJsonStr === 'string' ? JSON.parse(dataJsonStr) : dataJsonStr;
  } catch {
    dataJson = {};
  }

  try {
    exceptionJson = typeof exceptionJsonStr === 'string' ? JSON.parse(exceptionJsonStr) : exceptionJsonStr;
  } catch {
    exceptionJson = {};
  }

  const headers: IXSDDataHeader[] = [];

  // Iterate through each complexType in the dataJson
  for (const complexType in dataJson) {
    if (!dataJson.hasOwnProperty(complexType)) continue;

    const headerData = dataJson[complexType];
    const exceptionData = exceptionJson?.[complexType] || {};

    // Determine if this is an object view (single record) or array view (line items)
    const isArray = Array.isArray(headerData);
    const viewStyle: 'object' | 'array' = isArray ? 'array' : 'object';

    // Parse fields for this header
    const fieldRows: IXSDField[][] = [];
    let hasException = false;
    let exceptionColor: 'red' | 'orange' | '' = '';

    if (isArray) {
      // Array view: each element is a row of fields
      headerData.forEach((rowData: any, rowIndex: number) => {
        const fields = parseFieldsFromRow(
          rowData,
          exceptionData[rowIndex] || {},
          complexType,
          rowIndex,
          fieldFormatsFor999
        );
        fieldRows.push(fields);

        // Check for exceptions in this row
        fields.forEach((field) => {
          if (field.exception_msg && field.exception_msg.length > 0) {
            hasException = true;
            const hasRed = field.exception_msg.some((e) => e.exception_type === 'error');
            if (hasRed) exceptionColor = 'red';
            else if (!exceptionColor) exceptionColor = 'orange';
          }
        });
      });
    } else {
      // Object view: single record
      const fields = parseFieldsFromRow(
        headerData,
        exceptionData,
        complexType,
        0,
        fieldFormatsFor999
      );
      fieldRows.push(fields);

      fields.forEach((field) => {
        if (field.exception_msg && field.exception_msg.length > 0) {
          hasException = true;
          const hasRed = field.exception_msg.some((e) => e.exception_type === 'error');
          if (hasRed) exceptionColor = 'red';
          else if (!exceptionColor) exceptionColor = 'orange';
        }
      });
    }

    // Create header label from complexType (camelCase to Title Case)
    const label = complexType
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();

    headers.push({
      header_name: complexType,
      label,
      view_style: viewStyle,
      ixsd_fields: fieldRows,
      exception_status: hasException,
      exceptionColor,
      visible_status: true,
    });
  }

  return { headers, dataJson, exceptionJson };
}

/**
 * Parse fields from a single row of data
 */
function parseFieldsFromRow(
  rowData: any,
  exceptionRow: any,
  complexType: string,
  rowIndex: number,
  fieldFormatsFor999?: any[]
): IXSDField[] {
  const fields: IXSDField[] = [];

  if (!rowData || typeof rowData !== 'object') return fields;

  for (const key in rowData) {
    if (!rowData.hasOwnProperty(key)) continue;

    const fieldData = rowData[key];

    // Skip metadata fields
    if (key === 'itemState' || key === 'hasDuplicated') continue;

    // Determine field type from fieldData properties
    let inputType: IXSDField['input_type'] = 'text';
    let readOnly = false;
    let value = '';
    let lookupCriteria: LookupItem[] = [];
    let dataPosition: DataPosition | undefined;
    let valueMaxLength = 255;
    let exceptionMsgs: ExceptionMessage[] = [];

    if (typeof fieldData === 'object' && fieldData !== null) {
      value = fieldData.value ?? '';
      inputType = fieldData.input_type ?? 'text';
      readOnly = fieldData.read_only ?? false;
      lookupCriteria = fieldData.lookup_criteria ?? [];
      valueMaxLength = fieldData.valueMaxLength ?? 255;

      if (fieldData.data_position) {
        dataPosition = fieldData.data_position;
      }
    } else {
      value = String(fieldData ?? '');
    }

    // Get exceptions for this field
    if (exceptionRow && exceptionRow[key]) {
      const exc = exceptionRow[key];
      if (Array.isArray(exc)) {
        exceptionMsgs = exc;
      } else if (typeof exc === 'object' && exc.exception_msg) {
        exceptionMsgs = [exc];
      }
    }

    // Build alias name from key (camelCase to readable label)
    const keyAliasName = key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();

    fields.push({
      key,
      key_alias_name: typeof fieldData === 'object' ? (fieldData?.key_alias_name ?? keyAliasName) : keyAliasName,
      value,
      value_of: typeof fieldData === 'object' ? fieldData?.value_of : undefined,
      value_from: typeof fieldData === 'object' ? fieldData?.value_from : undefined,
      value_condn: typeof fieldData === 'object' ? fieldData?.value_condn : undefined,
      input_type: inputType,
      read_only: readOnly,
      exception_msg: exceptionMsgs,
      data_position: dataPosition,
      lookup_criteria: lookupCriteria,
      lookup_table: typeof fieldData === 'object' ? fieldData?.lookup_table : undefined,
      lookupType: typeof fieldData === 'object' ? fieldData?.lookupType : undefined,
      visible_status: typeof fieldData === 'object' ? (fieldData?.visible_status ?? true) : true,
      valueMaxLength,
      row: rowIndex,
      page: typeof fieldData === 'object' ? fieldData?.page : undefined,
      itemState: rowData.itemState,
      hasDuplicated: rowData.hasDuplicated,
    });
  }

  return fields;
}

// ─── Line Item Management ───

/**
 * Add a new line item (duplicate last row)
 * Origin: $scope.addNewLineItem (line ~1500-1600)
 */
export function addLineItem(
  headers: IXSDDataHeader[],
  headerIndex: number
): IXSDDataHeader[] {
  const updated = [...headers];
  const header = { ...updated[headerIndex] };

  if (header.view_style !== 'array' || header.ixsd_fields.length === 0) return updated;

  // Clone the last row as template
  const lastRow = header.ixsd_fields[header.ixsd_fields.length - 1];
  const newRow: IXSDField[] = lastRow.map((field) => ({
    ...field,
    value: '', // Empty values for new row
    exception_msg: [],
    itemState: 'A' as const, // A = Added
    isExtractedDataChanged: false,
    isOptionFieldEdited: false,
  }));

  header.ixsd_fields = [...header.ixsd_fields, newRow];
  updated[headerIndex] = header;

  return updated;
}

/**
 * Delete a line item (mark as deleted)
 * Origin: $scope.deleteLineItem (line ~1600-1700)
 */
export function deleteLineItem(
  headers: IXSDDataHeader[],
  headerIndex: number,
  rowIndex: number
): IXSDDataHeader[] {
  const updated = [...headers];
  const header = { ...updated[headerIndex] };

  if (header.view_style !== 'array') return updated;

  // Mark row as deleted (itemState = 'D') rather than removing
  const updatedFields = header.ixsd_fields.map((row, idx) => {
    if (idx === rowIndex) {
      return row.map((field) => ({
        ...field,
        itemState: 'D' as const,
      }));
    }
    return row;
  });

  header.ixsd_fields = updatedFields;
  updated[headerIndex] = header;

  return updated;
}

/**
 * Update a field value in the iXSD data
 * Origin: Various $scope watchers for field changes
 */
export function updateFieldValue(
  headers: IXSDDataHeader[],
  headerIndex: number,
  rowIndex: number,
  fieldKey: string,
  newValue: string
): IXSDDataHeader[] {
  const updated = [...headers];
  const header = { ...updated[headerIndex] };

  const updatedFields = header.ixsd_fields.map((row, rIdx) => {
    if (rIdx === rowIndex) {
      return row.map((field) => {
        if (field.key === fieldKey) {
          return {
            ...field,
            value: newValue,
            isExtractedDataChanged: true,
          };
        }
        return field;
      });
    }
    return row;
  });

  header.ixsd_fields = updatedFields;
  updated[headerIndex] = header;

  return updated;
}

// ─── Data JSON Reconstruction ───

/**
 * Reconstruct dataJson from headers for save/workflow operations
 * Origin: Various save/workflow prep code in BusinessContentController
 * Reverses parseIXSDData: headers → JSON object matching API format
 */
export function reconstructDataJson(headers: IXSDDataHeader[]): any {
  const dataJson: any = {};

  headers.forEach((header) => {
    if (header.view_style === 'array') {
      dataJson[header.header_name] = header.ixsd_fields.map((row) => {
        const rowObj: any = {};
        row.forEach((field) => {
          rowObj[field.key] = field.value;
          if (field.itemState) rowObj.itemState = field.itemState;
          if (field.hasDuplicated) rowObj.hasDuplicated = field.hasDuplicated;
        });
        return rowObj;
      });
    } else {
      const rowObj: any = {};
      if (header.ixsd_fields[0]) {
        header.ixsd_fields[0].forEach((field) => {
          rowObj[field.key] = field.value;
        });
      }
      dataJson[header.header_name] = rowObj;
    }
  });

  return dataJson;
}

/**
 * Reconstruct exception JSON from headers
 */
export function reconstructExceptionJson(headers: IXSDDataHeader[]): any {
  const exceptionJson: any = {};

  headers.forEach((header) => {
    if (header.view_style === 'array') {
      exceptionJson[header.header_name] = header.ixsd_fields.map((row) => {
        const rowObj: any = {};
        row.forEach((field) => {
          if (field.exception_msg && field.exception_msg.length > 0) {
            rowObj[field.key] = field.exception_msg;
          }
        });
        return rowObj;
      });
    } else {
      const rowObj: any = {};
      if (header.ixsd_fields[0]) {
        header.ixsd_fields[0].forEach((field) => {
          if (field.exception_msg && field.exception_msg.length > 0) {
            rowObj[field.key] = field.exception_msg;
          }
        });
      }
      exceptionJson[header.header_name] = rowObj;
    }
  });

  return exceptionJson;
}

// ─── Download Helpers ───

/**
 * Trigger file download from base64 string
 * Origin: $scope.downloadSourceFile response handler (line ~120-135)
 */
export function downloadBase64File(
  base64Data: string,
  fileName: string,
  mimeType = 'application/octet-stream'
): void {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download file:', err);
  }
}

/**
 * Download Excel file from base64 string
 * Origin: $scope.generateExcel response handler (line ~190-206)
 */
export function downloadExcelFile(base64Data: string, fileName: string): void {
  downloadBase64File(
    base64Data,
    fileName,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}

// ─── Validation / Exception Helpers ───

/**
 * Get all exceptions from headers for notification
 * Origin: $scope.getFilteredExceptionToNotify (line ~3060-3100)
 */
export function getFilteredExceptions(headers: IXSDDataHeader[]): ExceptionMessage[] {
  const exceptions: ExceptionMessage[] = [];

  headers.forEach((header) => {
    header.ixsd_fields.forEach((row) => {
      row.forEach((field) => {
        if (field.exception_msg && field.exception_msg.length > 0) {
          field.exception_msg.forEach((exc) => {
            exceptions.push({
              ...exc,
              field_key: field.key,
            });
          });
        }
      });
    });
  });

  return exceptions;
}

/**
 * Check if any field has been modified (for unsaved changes warning)
 * Origin: $scope.isAnyFieldModified check in BusinessContentController
 */
export function hasUnsavedChanges(headers: IXSDDataHeader[]): boolean {
  return headers.some((header) =>
    header.ixsd_fields.some((row) =>
      row.some((field) => field.isExtractedDataChanged || field.isOptionFieldEdited)
    )
  );
}

/**
 * Build media display URL from base64 byte string
 * Origin: Image display pattern throughout BusinessContentController
 */
export function buildMediaUrl(byteString: string, fileType?: string): string {
  if (!byteString) return '';

  const type = fileType?.toLowerCase() || 'png';
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    pdf: 'application/pdf',
    bmp: 'image/bmp',
  };

  const mime = mimeMap[type] || 'image/png';
  return `data:${mime};base64,${byteString}`;
}
