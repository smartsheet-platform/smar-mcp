import { SmartsheetAPI } from "./smartsheet-api.js";

export class SmartsheetDiscussionAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * Get discussions by sheet ID 
   * @param sheetId ID of the sheet to get discussions for
   * @returns Discussions data
   */
  async getDiscussionsBySheetId(sheetId: string): Promise<any> {
    return this.api.request('GET', `/sheets/${sheetId}/discussions`);
  }

  /**
   * Get discussions by row ID
   * @param sheetId ID of the sheet to get discussions for
   * @param rowId ID of the row to get discussions for
   * @returns Discussions data
   */
  async getDiscussionsByRowId(sheetId: string, rowId: string): Promise<any> {
    return this.api.request('GET', `/sheets/${sheetId}/rows/${rowId}/discussions`);
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