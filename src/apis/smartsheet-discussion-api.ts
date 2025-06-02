import { SmartsheetAPI } from "./smartsheet-api.js";

export class SmartsheetDiscussionAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * Get discussions by sheet ID 
   * @param sheetId Sheet ID
   * @param include Optional parameter to include additional information (e.g., 'attachments')
   * @param pageSize Number of discussions to return per page
   * @param page Page number to return
   * @param includeAll Whether to include all results
   * @returns Discussions data
   */
  async getDiscussionsBySheetId(
    sheetId: string,
    include?: string,
    pageSize?: number,
    page?: number,
    includeAll?: boolean
  ): Promise<any> {
    return this.api.request('GET', `/sheets/${sheetId}/discussions`, undefined, {
      include,
      pageSize,
      page,
      includeAll,
    });
  }

  /**
   * Get discussions by row ID
   * @param sheetId Sheet ID
   * @param rowId Row ID
   * @param include Optional parameter to include additional information (e.g., 'attachments')
   * @param pageSize Number of discussions to return per page
   * @param page Page number to return
   * @param includeAll Whether to include all results
   * @returns Discussions data
   */
  async getDiscussionsByRowId(
    sheetId: string,
    rowId: string,
    include?: string,
    pageSize?: number,
    page?: number,
    includeAll?: boolean
  ): Promise<any> {
    return this.api.request('GET', `/sheets/${sheetId}/rows/${rowId}/discussions`, undefined, {
      include,
      pageSize,
      page,
      includeAll,
    });
  }

  /**
   * Create a discussion on a sheet
   * @param sheetId Sheet ID
   * @param commentText Text of the comment to add
   * @returns Created discussion data
   */
  async createSheetDiscussion(sheetId: string, commentText: string): Promise<any> {
    const data = {
      comment: {
        text: commentText
      }
    };
    
    return this.api.request('POST', `/sheets/${sheetId}/discussions`, data);
  }

  /**
   * Create a discussion on a row
   * @param sheetId Sheet ID
   * @param rowId Row ID
   * @param commentText Text of the comment to add
   * @returns Created discussion data
   */
  async createRowDiscussion(sheetId: string, rowId: string, commentText: string): Promise<any> {
    const data = {
      comment: {
        text: commentText
      }
    };
    
    return this.api.request('POST', `/sheets/${sheetId}/rows/${rowId}/discussions`, data);
  }

}