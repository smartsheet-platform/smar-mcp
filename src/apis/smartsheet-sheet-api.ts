import { SmartsheetAPI } from './smartsheet-api.js';
import { Logger } from '../utils/logger.js';
import {
  Sheet,
  Row,
  BulkItemResult,
  Result,
  CellHistory,
  SheetLocation,
  UpdateRequest,
  SheetSummary,
} from '../smartsheet-types/index.js';
import { MetadataCache } from '../utils/cache.js';

/**
 * Sheet-specific API methods for Smartsheet
 */
export class SmartsheetSheetAPI {
  private api: SmartsheetAPI;
  private summaryCache: MetadataCache<SheetSummary>;

  constructor(api: SmartsheetAPI) {
    this.api = api;
    this.summaryCache = new MetadataCache<SheetSummary>();
  }

  /**
   * Gets a sheet by ID
   * @param sheetId Sheet ID
   * @param include Optional comma-separated list of elements to include
   * @returns Sheet data
   */
  async getSheet(
    sheetId: string,
    include?: string,
    exclude?: string,
    pageSize?: number,
    page?: number,
  ): Promise<Sheet> {
    return this.api.request('GET', `/sheets/${sheetId}`, undefined, {
      include,
      exclude,
      pageSize,
      page,
    });
  }

  /**
   * Gets all rows of a sheet, handling pagination automatically
   * @param sheetId Sheet ID
   * @param include Optional comma-separated list of elements to include
   * @param exclude Optional comma-separated list of elements to exclude
   * @returns Sheet with all rows
   */
  async getAllRows(sheetId: string, include?: string, exclude?: string): Promise<Sheet> {
    const pageSize = 500; // Maximize page size for efficiency
    let page = 1;
    let hasMore = true;
    let allRows: Row[] = [];
    let sheetMetadata: Sheet | null = null;

    Logger.info(`Fetching all rows for sheet ${sheetId}...`);

    while (hasMore) {
      const sheet = await this.getSheet(sheetId, include, exclude, pageSize, page);

      // Capture metadata from the first page
      if (!sheetMetadata) {
        sheetMetadata = { ...sheet, rows: [] };
      }

      const rows = sheet.rows || [];
      allRows = allRows.concat(rows);
      Logger.info(`Fetched page ${page}, total rows: ${allRows.length}`);

      if (sheet.totalPageCount && page < sheet.totalPageCount) {
        page++;
      } else {
        hasMore = false;
      }
    }

    if (!sheetMetadata) {
      throw new Error(`Failed to fetch sheet ${sheetId}`);
    }

    sheetMetadata.rows = allRows;
    return sheetMetadata;
  }

  /**
   * Gets a lightweight summary of a sheet
   * @param sheetId Sheet ID
   * @returns Sheet summary with top 5 rows
   */
  async getSheetSummary(sheetId: string): Promise<SheetSummary> {
    const cached = this.summaryCache.get(`summary-${sheetId}`);
    if (cached) {
      Logger.debug(`Cache hit for sheet summary ${sheetId}`);
      return cached;
    }

    const sheet = (await this.api.request('GET', `/sheets/${sheetId}`, undefined, {
      include: 'columnType,rowPermalink',
      pageSize: 5, // Truncate to top 5 rows for efficiency
      page: 1,
    })) as Sheet;

    const result = {
      id: sheet.id,
      name: sheet.name,
      totalRowCount: sheet.totalRowCount,
      columns: sheet.columns,
      rows: sheet.rows,
    };
    this.summaryCache.set(`summary-${sheetId}`, result);
    return result;
  }

  /**
   * Gets a sheet by directIdToken
   * @param directIdToken Sheet directIdToken
   * @param include Optional comma-separated list of elements to include
   * @returns Sheet data
   */
  async getSheetByDirectIdToken(
    directIdToken: string,
    include?: string,
    exclude?: string,
    pageSize?: number,
    page?: number,
  ): Promise<Sheet> {
    return this.api.request('GET', `/sheets/${directIdToken}`, undefined, {
      include,
      exclude,
      pageSize,
      page,
    });
  }

  /**
   * Gets the version of a sheet
   * @param sheetId Sheet ID
   * @returns Sheet version
   */
  async getSheetVersion(sheetId: string): Promise<Result> {
    return this.api.request('GET', `/sheets/${sheetId}/version`);
  }

  /**
   * Gets the history of a specific cell
   * @param sheetId Sheet ID
   * @param rowId Row ID
   * @param columnId Column ID
   * @param include Optional parameter to include additional information
   * @param pageSize Number of history entries to return per page
   * @param page Page number to return
   * @returns Cell history
   */
  async getCellHistory(
    sheetId: string,
    rowId: string,
    columnId: string,
    include?: string,
    pageSize?: number,
    page?: number,
  ): Promise<CellHistory[]> {
    return this.api.request(
      'GET',
      `/sheets/${sheetId}/rows/${rowId}/columns/${columnId}/history`,
      undefined,
      {
        include,
        pageSize,
        page,
      },
    );
  }

  /**
   * Get Row
   * @param sheetId Sheet ID
   * @param rowId Row ID
   * @param include Optional comma-separated list of elements to include
   * @returns Row data
   */
  async getRow(sheetId: string, rowId: string, include?: string, exclude?: string): Promise<Row> {
    return this.api.request('GET', `/sheets/${sheetId}/rows/${rowId}`, undefined, {
      include,
      exclude,
    });
  }

  /**
   * Updates rows in a sheet
   * @param sheetId Sheet ID
   * @param rows Array of row objects to update
   * @returns Update result
   */
  async updateRows(sheetId: string, rows: any[]): Promise<BulkItemResult> {
    return this.api.request('PUT', `/sheets/${sheetId}/rows`, rows);
  }

  /**
   * Adds rows to a sheet
   * @param sheetId Sheet ID
   * @param rows Array of row objects to add
   * @returns Add result
   */
  async addRows(
    sheetId: string,
    rows: any[],
    options?: {
      parentId?: string | number;
      siblingId?: string | number;
      toTop?: boolean;
      toBottom?: boolean;
    },
  ): Promise<BulkItemResult> {
    return this.api.request('POST', `/sheets/${sheetId}/rows`, rows, options);
  }

  /**
   * Deletes rows from a sheet
   * @param sheetId Sheet ID
   * @param rowIds Array of row IDs to delete
   * @param ignoreRowsNotFound Whether to ignore rows that don't exist
   * @returns Delete result
   */
  async deleteRows(
    sheetId: string,
    rowIds: string[],
    ignoreRowsNotFound: boolean = true,
  ): Promise<BulkItemResult> {
    return this.api.request('DELETE', `/sheets/${sheetId}/rows`, undefined, {
      ids: rowIds.join(','),
      ignoreRowsNotFound: ignoreRowsNotFound.toString(),
    });
  }

  /**
   * Gets the location information for a sheet
   * @param sheetId Sheet ID
   * @returns Location information including folder ID
   */
  async getSheetLocation(sheetId: string): Promise<SheetLocation> {
    const sheet = await this.getSheet(sheetId);
    return {
      folderId: sheet.parentId,
      folderType: sheet.parentType,
      workspaceId: sheet.workspaceId,
    };
  }

  /**
   * Creates a copy of a sheet
   * @param sheetId Sheet ID to copy
   * @param destinationName Name for the new sheet
   * @param destinationFolderId Optional folder ID for the new sheet
   * @param workspaceId Optional workspace ID for the new sheet
   * @returns New sheet data
   */
  async copySheet(
    sheetId: string,
    destinationName: string,
    destinationFolderId?: string,
    workspaceId?: string,
  ): Promise<Result> {
    const data: any = {
      newName: destinationName,
    };

    if (destinationFolderId) {
      data.destinationType = 'folder';
      data.destinationId = destinationFolderId;
      console.debug(`Copying sheet to folder: ${destinationFolderId}`);
    } else if (workspaceId) {
      data.destinationType = 'workspace';
      data.destinationId = workspaceId;
      Logger.info(`Copying sheet to workspace: ${workspaceId}`);
    } else {
      // Default to 'home' if no folder or workspace specified
      data.destinationType = 'home';
      Logger.info('Copying sheet to home');
    }

    const result = await this.api.request('POST', `/sheets/${sheetId}/copy`, data);
    Logger.info(`Copy sheet result: ${JSON.stringify((result as any).result?.id)}`);
    return result as Result;
  }

  /**
   * Creates a new sheet
   * @param name Name for the new sheet
   * @param columns Array of column objects
   * @param folderId Optional folder ID where the sheet should be created
   * @returns New sheet data
   */
  async createSheet(name: string, columns: any[], folderId?: string): Promise<Sheet> {
    const data = {
      name,
      columns,
    };

    let endpoint = '/sheets';

    // If folder ID is provided, create in that folder
    if (folderId) {
      endpoint = `/folders/${folderId}/sheets`;
    }

    return this.api.request('POST', endpoint, data);
  }

  /**
   * Creates an update request for a sheet
   * @param sheetId Sheet ID
   * @param options Update request options
   * @returns Created update request data
   */
  async createUpdateRequest(
    sheetId: string,
    options: {
      rowIds?: number[];
      columnIds?: number[];
      includeAttachments?: boolean;
      includeDiscussions?: boolean;
      message?: string;
      sendTo: { email: string }[];
      subject?: string;
      ccMe?: boolean;
    },
  ): Promise<UpdateRequest> {
    return this.api.request('POST', `/sheets/${sheetId}/updaterequests`, options);
  }

  /**
   * Finds rows in a sheet where a specific column has a specific value.
   * Uses a linear scan strategy (fetching pages).
   * @param sheetId Sheet ID
   * @param columnId Column ID to search
   * @param value Value to search for (case-insensitive string match)
   * @returns Array of matching rows
   */
  async findRows(sheetId: string, columnId: number, value: string): Promise<Row[]> {
    const pageSize = 500; // Maximize page size for efficiency
    let page = 1;
    let hasMore = true;
    const matches: any[] = [];
    const searchVal = String(value).toLowerCase();

    Logger.info(`Searching sheet ${sheetId} for rows where column ${columnId} equals "${value}"`);

    while (hasMore) {
      const sheet = await this.getSheet(sheetId, undefined, undefined, pageSize, page);
      const rows = sheet.rows || [];

      let pageMatches = 0;
      for (const row of rows) {
        const cell = row.cells.find((c: any) => c.columnId === columnId);
        // Robust comparison: handle nulls/undefined in cell.value
        const cellVal = cell?.value !== undefined && cell?.value !== null ? String(cell.value) : '';

        if (cellVal.toLowerCase() === searchVal) {
          matches.push(row);
          pageMatches++;
        }
      }
      Logger.info(`Found ${pageMatches} matches on page ${page}`);

      // Pagination Logic
      if (sheet.totalPageCount && page < sheet.totalPageCount) {
        page++;
      } else {
        hasMore = false;
      }
    }

    Logger.info(`Search complete. Found total ${matches.length} matching rows.`);
    return matches;
  }

  /**
   * Deletes a sheet
   * @param sheetId Sheet ID
   * @returns Delete result
   */
  async deleteSheet(sheetId: string): Promise<Result> {
    return this.api.request('DELETE', `/sheets/${sheetId}`);
  }
}
