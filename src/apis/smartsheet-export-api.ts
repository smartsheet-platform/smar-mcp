import { SmartsheetAPI } from './smartsheet-api.js';
import axios from 'axios';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export class SmartsheetExportAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * Export a sheet to CSV format
   * Returns the CSV content as a string
   */
  async exportSheetToCsv(sheetId: number): Promise<string> {
    // Note: This endpoint returns raw CSV data, not JSON
    const response = await this.api.request<any>('GET', `/sheets/${sheetId}`, undefined, {
      format: 'csv',
    });
    return response;
  }

  /**
   * Export a sheet to Excel format
   * Returns base64 encoded Excel file content
   */
  async exportSheetToExcel(sheetId: number): Promise<Buffer> {
    const response = await this.api.request<any>('GET', `/sheets/${sheetId}`, undefined, {
      format: 'xlsx',
    });
    return response;
  }

  /**
   * Export a sheet to PDF format
   */
  async exportSheetToPdf(
    sheetId: number,
    options?: {
      paperSize?: 'LETTER' | 'LEGAL' | 'WIDE' | 'ARCHD' | 'A4' | 'A3' | 'A2' | 'A1' | 'A0';
    }
  ): Promise<Buffer> {
    const params: Record<string, any> = { format: 'pdf' };
    if (options?.paperSize) {
      params.paperSize = options.paperSize;
    }
    const response = await this.api.request<any>('GET', `/sheets/${sheetId}`, undefined, params);
    return response;
  }

  /**
   * Import a CSV file into a new sheet
   */
  async importCsvToNewSheet(
    csvContent: string,
    sheetName: string,
    options?: {
      headerRowIndex?: number;
      primaryColumnIndex?: number;
    }
  ): Promise<{ result: any }> {
    const params: Record<string, any> = {
      sheetName,
    };
    if (options?.headerRowIndex !== undefined) {
      params.headerRowIndex = options.headerRowIndex;
    }
    if (options?.primaryColumnIndex !== undefined) {
      params.primaryColumnIndex = options.primaryColumnIndex;
    }

    // Import endpoint requires multipart form data
    return this.api.request<{ result: any }>('POST', '/sheets/import', csvContent, {
      ...params,
      contentType: 'text/csv',
    });
  }

  /**
   * Import CSV data into an existing sheet (append rows)
   */
  async importCsvToExistingSheet(sheetId: number, csvContent: string): Promise<{ result: any }> {
    return this.api.request<{ result: any }>('POST', `/sheets/${sheetId}/rows/import`, csvContent, {
      contentType: 'text/csv',
    });
  }

  /**
   * Get sheet as JSON (already supported, but adding for completeness)
   */
  async getSheetAsJson(
    sheetId: number,
    options?: {
      include?: string[];
      exclude?: string[];
      rowIds?: number[];
      columnIds?: number[];
      filterId?: number;
      pageSize?: number;
      page?: number;
    }
  ): Promise<any> {
    const params: Record<string, any> = {};

    if (options?.include) params.include = options.include.join(',');
    if (options?.exclude) params.exclude = options.exclude.join(',');
    if (options?.rowIds) params.rowIds = options.rowIds.join(',');
    if (options?.columnIds) params.columnIds = options.columnIds.join(',');
    if (options?.filterId) params.filterId = options.filterId;
    if (options?.pageSize) params.pageSize = options.pageSize;
    if (options?.page) params.page = options.page;

    return this.api.request<any>('GET', `/sheets/${sheetId}`, undefined, params);
  }
}
