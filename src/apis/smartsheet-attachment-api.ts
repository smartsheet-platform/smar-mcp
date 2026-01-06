import { SmartsheetAPI } from "./smartsheet-api.js";

/**
 * Attachment-specific API methods for Smartsheet
 * Note: This API handles metadata only - binary file operations are not supported via MCP
 */
export class SmartsheetAttachmentAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * Lists all attachments on a sheet
   * @param sheetId Sheet ID
   * @param pageSize Number of attachments per page
   * @param page Page number
   * @param includeAll Include all results
   * @returns List of attachments
   */
  async listSheetAttachments(
    sheetId: string,
    pageSize?: number,
    page?: number,
    includeAll?: boolean
  ): Promise<any> {
    return this.api.request('GET', `/sheets/${sheetId}/attachments`, undefined, {
      pageSize,
      page,
      includeAll
    });
  }

  /**
   * Lists attachments on a specific row
   * @param sheetId Sheet ID
   * @param rowId Row ID
   * @param pageSize Number of attachments per page
   * @param page Page number
   * @param includeAll Include all results
   * @returns List of row attachments
   */
  async listRowAttachments(
    sheetId: string,
    rowId: string,
    pageSize?: number,
    page?: number,
    includeAll?: boolean
  ): Promise<any> {
    return this.api.request('GET', `/sheets/${sheetId}/rows/${rowId}/attachments`, undefined, {
      pageSize,
      page,
      includeAll
    });
  }

  /**
   * Lists attachments on a discussion
   * @param sheetId Sheet ID
   * @param discussionId Discussion ID
   * @param pageSize Number of attachments per page
   * @param page Page number
   * @param includeAll Include all results
   * @returns List of discussion attachments
   */
  async listDiscussionAttachments(
    sheetId: string,
    discussionId: string,
    pageSize?: number,
    page?: number,
    includeAll?: boolean
  ): Promise<any> {
    return this.api.request('GET', `/sheets/${sheetId}/discussions/${discussionId}/attachments`, undefined, {
      pageSize,
      page,
      includeAll
    });
  }

  /**
   * Gets attachment metadata by ID
   * @param sheetId Sheet ID
   * @param attachmentId Attachment ID
   * @returns Attachment metadata including download URL
   */
  async getAttachment(sheetId: string, attachmentId: string): Promise<any> {
    return this.api.request('GET', `/sheets/${sheetId}/attachments/${attachmentId}`);
  }

  /**
   * Deletes an attachment
   * @param sheetId Sheet ID
   * @param attachmentId Attachment ID
   * @returns Deletion result
   */
  async deleteAttachment(sheetId: string, attachmentId: string): Promise<any> {
    return this.api.request('DELETE', `/sheets/${sheetId}/attachments/${attachmentId}`);
  }

  /**
   * Attaches a URL to a sheet
   * @param sheetId Sheet ID
   * @param name Name for the attachment
   * @param url URL to attach
   * @param attachmentType Type of URL (LINK, BOX_COM, DROPBOX, EGNYTE, EVERNOTE, GOOGLE_DRIVE, ONEDRIVE)
   * @param attachmentSubType Optional subtype
   * @returns Created attachment metadata
   */
  async attachUrlToSheet(
    sheetId: string,
    name: string,
    url: string,
    attachmentType: string,
    attachmentSubType?: string
  ): Promise<any> {
    const data: any = {
      name,
      url,
      attachmentType
    };
    if (attachmentSubType) {
      data.attachmentSubType = attachmentSubType;
    }
    return this.api.request('POST', `/sheets/${sheetId}/attachments`, data);
  }

  /**
   * Attaches a URL to a row
   * @param sheetId Sheet ID
   * @param rowId Row ID
   * @param name Name for the attachment
   * @param url URL to attach
   * @param attachmentType Type of URL
   * @param attachmentSubType Optional subtype
   * @returns Created attachment metadata
   */
  async attachUrlToRow(
    sheetId: string,
    rowId: string,
    name: string,
    url: string,
    attachmentType: string,
    attachmentSubType?: string
  ): Promise<any> {
    const data: any = {
      name,
      url,
      attachmentType
    };
    if (attachmentSubType) {
      data.attachmentSubType = attachmentSubType;
    }
    return this.api.request('POST', `/sheets/${sheetId}/rows/${rowId}/attachments`, data);
  }

  /**
   * Attaches a URL to a comment/discussion
   * @param sheetId Sheet ID
   * @param commentId Comment ID
   * @param name Name for the attachment
   * @param url URL to attach
   * @param attachmentType Type of URL
   * @param attachmentSubType Optional subtype
   * @returns Created attachment metadata
   */
  async attachUrlToComment(
    sheetId: string,
    commentId: string,
    name: string,
    url: string,
    attachmentType: string,
    attachmentSubType?: string
  ): Promise<any> {
    const data: any = {
      name,
      url,
      attachmentType
    };
    if (attachmentSubType) {
      data.attachmentSubType = attachmentSubType;
    }
    return this.api.request('POST', `/sheets/${sheetId}/comments/${commentId}/attachments`, data);
  }
}
