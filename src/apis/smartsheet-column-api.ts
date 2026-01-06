import { SmartsheetAPI } from "./smartsheet-api.js";

/**
 * Column-specific API methods for Smartsheet
 */
export class SmartsheetColumnAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * Gets all columns for a sheet
   * @param sheetId Sheet ID
   * @param include Optional elements to include (e.g., 'filters')
   * @returns List of columns
   */
  async getColumns(sheetId: string, include?: string): Promise<any> {
    return this.api.request('GET', `/sheets/${sheetId}/columns`, undefined, {
      include
    });
  }

  /**
   * Gets a specific column by ID
   * @param sheetId Sheet ID
   * @param columnId Column ID
   * @param include Optional elements to include
   * @returns Column data
   */
  async getColumn(sheetId: string, columnId: string, include?: string): Promise<any> {
    return this.api.request('GET', `/sheets/${sheetId}/columns/${columnId}`, undefined, {
      include
    });
  }

  /**
   * Adds a column to a sheet
   * @param sheetId Sheet ID
   * @param column Column configuration
   * @returns Created column
   */
  async addColumn(
    sheetId: string,
    column: {
      title: string;
      type: string;
      index?: number;
      primary?: boolean;
      options?: string[];
      symbol?: string;
      systemColumnType?: string;
      autoNumberFormat?: {
        prefix?: string;
        suffix?: string;
        fill?: string;
        startingNumber?: number;
      };
      contactOptions?: { name?: string; email: string }[];
      formula?: string;
      validation?: boolean;
      width?: number;
    }
  ): Promise<any> {
    return this.api.request('POST', `/sheets/${sheetId}/columns`, column);
  }

  /**
   * Adds multiple columns to a sheet
   * @param sheetId Sheet ID
   * @param columns Array of column configurations
   * @returns Created columns
   */
  async addColumns(
    sheetId: string,
    columns: Array<{
      title: string;
      type: string;
      index?: number;
      options?: string[];
      symbol?: string;
      width?: number;
    }>
  ): Promise<any> {
    return this.api.request('POST', `/sheets/${sheetId}/columns`, columns);
  }

  /**
   * Updates a column
   * @param sheetId Sheet ID
   * @param columnId Column ID
   * @param column Column updates
   * @returns Updated column
   */
  async updateColumn(
    sheetId: string,
    columnId: string,
    column: {
      title?: string;
      type?: string;
      index?: number;
      options?: string[];
      symbol?: string;
      systemColumnType?: string;
      autoNumberFormat?: {
        prefix?: string;
        suffix?: string;
        fill?: string;
        startingNumber?: number;
      };
      validation?: boolean;
      width?: number;
    }
  ): Promise<any> {
    return this.api.request('PUT', `/sheets/${sheetId}/columns/${columnId}`, column);
  }

  /**
   * Deletes a column
   * @param sheetId Sheet ID
   * @param columnId Column ID
   * @returns Deletion result
   */
  async deleteColumn(sheetId: string, columnId: string): Promise<any> {
    return this.api.request('DELETE', `/sheets/${sheetId}/columns/${columnId}`);
  }
}
