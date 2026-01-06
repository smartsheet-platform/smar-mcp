import { SmartsheetAPI } from './smartsheet-api.js';

export interface MoveRowResult {
  rowMappings: { from: number; to: number }[];
}

export interface CopyRowResult {
  rowMappings: { from: number; to: number }[];
}

export class SmartsheetBulkAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * Move rows from one sheet to another
   */
  async moveRows(
    sourceSheetId: number,
    rowIds: number[],
    destinationSheetId: number,
    options?: {
      toTop?: boolean;
      toBottom?: boolean;
      parentId?: number;
      siblingId?: number;
    }
  ): Promise<{ result: MoveRowResult }> {
    const body: any = {
      rowIds,
      to: {
        sheetId: destinationSheetId,
      },
    };

    if (options?.toTop) body.to.toTop = true;
    if (options?.toBottom) body.to.toBottom = true;
    if (options?.parentId) body.to.parentId = options.parentId;
    if (options?.siblingId) body.to.siblingId = options.siblingId;

    return this.api.request<{ result: MoveRowResult }>(
      'POST',
      `/sheets/${sourceSheetId}/rows/move`,
      body
    );
  }

  /**
   * Copy rows from one sheet to another
   */
  async copyRows(
    sourceSheetId: number,
    rowIds: number[],
    destinationSheetId: number,
    options?: {
      toTop?: boolean;
      toBottom?: boolean;
      parentId?: number;
      siblingId?: number;
    }
  ): Promise<{ result: CopyRowResult }> {
    const body: any = {
      rowIds,
      to: {
        sheetId: destinationSheetId,
      },
    };

    if (options?.toTop) body.to.toTop = true;
    if (options?.toBottom) body.to.toBottom = true;
    if (options?.parentId) body.to.parentId = options.parentId;
    if (options?.siblingId) body.to.siblingId = options.siblingId;

    return this.api.request<{ result: CopyRowResult }>(
      'POST',
      `/sheets/${sourceSheetId}/rows/copy`,
      body
    );
  }

  /**
   * Move a sheet to a different location (folder/workspace)
   */
  async moveSheet(
    sheetId: number,
    destination: { folderId?: number; workspaceId?: number }
  ): Promise<{ result: any }> {
    return this.api.request<{ result: any }>('POST', `/sheets/${sheetId}/move`, {
      destinationType: destination.folderId ? 'folder' : 'workspace',
      destinationId: destination.folderId || destination.workspaceId,
    });
  }

  /**
   * Bulk delete rows
   */
  async deleteRows(sheetId: number, rowIds: number[], ignoreRowsNotFound?: boolean): Promise<{ result: number[] }> {
    const params: Record<string, any> = {
      ids: rowIds.join(','),
    };
    if (ignoreRowsNotFound) {
      params.ignoreRowsNotFound = true;
    }
    return this.api.request<{ result: number[] }>('DELETE', `/sheets/${sheetId}/rows`, undefined, params);
  }

  /**
   * Bulk add rows to a sheet
   */
  async addRows(
    sheetId: number,
    rows: Array<{
      toTop?: boolean;
      toBottom?: boolean;
      parentId?: number;
      siblingId?: number;
      cells: Array<{ columnId: number; value: any }>;
    }>
  ): Promise<{ result: any[] }> {
    return this.api.request<{ result: any[] }>('POST', `/sheets/${sheetId}/rows`, rows);
  }

  /**
   * Bulk update rows
   */
  async updateRows(
    sheetId: number,
    rows: Array<{
      id: number;
      cells: Array<{ columnId: number; value: any }>;
    }>
  ): Promise<{ result: any[] }> {
    return this.api.request<{ result: any[] }>('PUT', `/sheets/${sheetId}/rows`, rows);
  }

  /**
   * Sort rows in a sheet
   */
  async sortRows(
    sheetId: number,
    sortCriteria: Array<{ columnId: number; direction: 'ASCENDING' | 'DESCENDING' }>
  ): Promise<{ result: any }> {
    return this.api.request<{ result: any }>('POST', `/sheets/${sheetId}/sort`, {
      sortCriteria,
    });
  }
}
