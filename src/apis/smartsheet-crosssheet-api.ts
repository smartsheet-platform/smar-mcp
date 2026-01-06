import { SmartsheetAPI } from './smartsheet-api.js';

export interface CellLink {
  sheetId: number;
  sheetName?: string;
  rowId: number;
  columnId: number;
  status?: 'OK' | 'BROKEN' | 'INACCESSIBLE' | 'NOT_SHARED' | 'BLOCKED' | 'CIRCULAR' | 'INVALID' | 'DISABLED';
}

export interface CrossSheetReference {
  id: number;
  name: string;
  sourceSheetId: number;
  startRowId?: number;
  endRowId?: number;
  startColumnId?: number;
  endColumnId?: number;
  status?: string;
}

export class SmartsheetCrossSheetAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * List all cross-sheet references for a sheet
   */
  async listCrossSheetReferences(sheetId: number): Promise<{ data: CrossSheetReference[] }> {
    return this.api.request<{ data: CrossSheetReference[] }>('GET', `/sheets/${sheetId}/crosssheetreferences`);
  }

  /**
   * Get a specific cross-sheet reference
   */
  async getCrossSheetReference(sheetId: number, referenceId: number): Promise<CrossSheetReference> {
    return this.api.request<CrossSheetReference>('GET', `/sheets/${sheetId}/crosssheetreferences/${referenceId}`);
  }

  /**
   * Create a cross-sheet reference
   */
  async createCrossSheetReference(
    sheetId: number,
    params: {
      name: string;
      sourceSheetId: number;
      startRowId?: number;
      endRowId?: number;
      startColumnId?: number;
      endColumnId?: number;
    }
  ): Promise<{ result: CrossSheetReference }> {
    return this.api.request<{ result: CrossSheetReference }>(
      'POST',
      `/sheets/${sheetId}/crosssheetreferences`,
      params
    );
  }

  /**
   * Create a cell link (link a cell to another sheet's cell)
   * This is done by updating a cell with a linkInFromCell property
   */
  async createCellLink(
    sheetId: number,
    rowId: number,
    columnId: number,
    sourceSheetId: number,
    sourceRowId: number,
    sourceColumnId: number
  ): Promise<any> {
    return this.api.request<any>('PUT', `/sheets/${sheetId}/rows`, [
      {
        id: rowId,
        cells: [
          {
            columnId,
            linkInFromCell: {
              sheetId: sourceSheetId,
              rowId: sourceRowId,
              columnId: sourceColumnId,
            },
          },
        ],
      },
    ]);
  }

  /**
   * Remove a cell link
   */
  async removeCellLink(sheetId: number, rowId: number, columnId: number): Promise<any> {
    return this.api.request<any>('PUT', `/sheets/${sheetId}/rows`, [
      {
        id: rowId,
        cells: [
          {
            columnId,
            value: null, // Clear the cell link
            linkInFromCell: null,
          },
        ],
      },
    ]);
  }

  /**
   * Get cell links info from a sheet
   * Returns cells that have inbound or outbound links
   */
  async getCellLinks(sheetId: number): Promise<any> {
    // Get the sheet with cell link information
    return this.api.request<any>('GET', `/sheets/${sheetId}`, undefined, {
      include: 'cellLinks',
    });
  }
}
