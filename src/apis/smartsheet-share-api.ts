import { SmartsheetAPI } from './smartsheet-api.js';

export type AccessLevel = 'VIEWER' | 'EDITOR' | 'EDITOR_SHARE' | 'ADMIN' | 'OWNER';

export interface Share {
  id: string;
  type: 'USER' | 'GROUP';
  userId?: number;
  groupId?: number;
  email?: string;
  name?: string;
  accessLevel: AccessLevel;
  scope?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface ShareParams {
  email?: string;
  groupId?: number;
  accessLevel: AccessLevel;
  subject?: string;
  message?: string;
  ccMe?: boolean;
}

export class SmartsheetShareAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  // Sheet Sharing
  async listSheetShares(sheetId: number): Promise<{ data: Share[] }> {
    return this.api.request<{ data: Share[] }>('GET', `/sheets/${sheetId}/shares`);
  }

  async getSheetShare(sheetId: number, shareId: string): Promise<Share> {
    return this.api.request<Share>('GET', `/sheets/${sheetId}/shares/${shareId}`);
  }

  async shareSheet(sheetId: number, shares: ShareParams[]): Promise<{ result: Share[] }> {
    return this.api.request<{ result: Share[] }>('POST', `/sheets/${sheetId}/shares`, shares, {
      sendEmail: true,
    });
  }

  async updateSheetShare(sheetId: number, shareId: string, accessLevel: AccessLevel): Promise<{ result: Share }> {
    return this.api.request<{ result: Share }>('PUT', `/sheets/${sheetId}/shares/${shareId}`, {
      accessLevel,
    });
  }

  async deleteSheetShare(sheetId: number, shareId: string): Promise<void> {
    await this.api.request<void>('DELETE', `/sheets/${sheetId}/shares/${shareId}`);
  }

  // Workspace Sharing
  async listWorkspaceShares(workspaceId: number): Promise<{ data: Share[] }> {
    return this.api.request<{ data: Share[] }>('GET', `/workspaces/${workspaceId}/shares`);
  }

  async shareWorkspace(workspaceId: number, shares: ShareParams[]): Promise<{ result: Share[] }> {
    return this.api.request<{ result: Share[] }>('POST', `/workspaces/${workspaceId}/shares`, shares);
  }

  async updateWorkspaceShare(workspaceId: number, shareId: string, accessLevel: AccessLevel): Promise<{ result: Share }> {
    return this.api.request<{ result: Share }>('PUT', `/workspaces/${workspaceId}/shares/${shareId}`, {
      accessLevel,
    });
  }

  async deleteWorkspaceShare(workspaceId: number, shareId: string): Promise<void> {
    await this.api.request<void>('DELETE', `/workspaces/${workspaceId}/shares/${shareId}`);
  }

  // Report Sharing
  async listReportShares(reportId: number): Promise<{ data: Share[] }> {
    return this.api.request<{ data: Share[] }>('GET', `/reports/${reportId}/shares`);
  }

  async shareReport(reportId: number, shares: ShareParams[]): Promise<{ result: Share[] }> {
    return this.api.request<{ result: Share[] }>('POST', `/reports/${reportId}/shares`, shares);
  }

  // Folder Sharing
  async listFolderShares(folderId: number): Promise<{ data: Share[] }> {
    return this.api.request<{ data: Share[] }>('GET', `/folders/${folderId}/shares`);
  }

  async shareFolder(folderId: number, shares: ShareParams[]): Promise<{ result: Share[] }> {
    return this.api.request<{ result: Share[] }>('POST', `/folders/${folderId}/shares`, shares);
  }
}
