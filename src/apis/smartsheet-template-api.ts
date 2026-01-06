import { SmartsheetAPI } from './smartsheet-api.js';

export interface Template {
  id: number;
  name: string;
  description?: string;
  accessLevel: 'VIEWER' | 'ADMIN' | 'OWNER';
  globalTemplate?: boolean;
  image?: string;
  largeImage?: string;
  blank?: boolean;
  categories?: string[];
  locales?: string[];
  type: 'sheet' | 'report';
}

export class SmartsheetTemplateAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * List all public templates
   */
  async listPublicTemplates(): Promise<{ data: Template[] }> {
    return this.api.request<{ data: Template[] }>('GET', '/templates/public');
  }

  /**
   * List user-created templates
   */
  async listUserTemplates(): Promise<{ data: Template[] }> {
    return this.api.request<{ data: Template[] }>('GET', '/templates');
  }

  /**
   * Create a sheet from a template
   */
  async createSheetFromTemplate(
    templateId: number,
    sheetName: string,
    options?: {
      folderId?: number;
      workspaceId?: number;
      includes?: ('data' | 'attachments' | 'discussions' | 'cellLinks' | 'forms')[];
    }
  ): Promise<{ result: any }> {
    const body: any = {
      name: sheetName,
      fromId: templateId,
    };

    if (options?.includes) {
      body.include = options.includes;
    }

    let endpoint = '/sheets';
    if (options?.folderId) {
      endpoint = `/folders/${options.folderId}/sheets`;
    } else if (options?.workspaceId) {
      endpoint = `/workspaces/${options.workspaceId}/sheets`;
    }

    return this.api.request<{ result: any }>('POST', endpoint, body);
  }

  /**
   * Create a sheet in a folder from a template
   */
  async createSheetInFolderFromTemplate(
    folderId: number,
    templateId: number,
    sheetName: string,
    includes?: ('data' | 'attachments' | 'discussions' | 'cellLinks' | 'forms')[]
  ): Promise<{ result: any }> {
    return this.createSheetFromTemplate(templateId, sheetName, {
      folderId,
      includes,
    });
  }

  /**
   * Create a sheet in a workspace from a template
   */
  async createSheetInWorkspaceFromTemplate(
    workspaceId: number,
    templateId: number,
    sheetName: string,
    includes?: ('data' | 'attachments' | 'discussions' | 'cellLinks' | 'forms')[]
  ): Promise<{ result: any }> {
    return this.createSheetFromTemplate(templateId, sheetName, {
      workspaceId,
      includes,
    });
  }
}
