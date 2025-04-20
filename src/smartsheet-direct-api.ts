import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Direct Smartsheet API client that doesn't rely on the SDK
 */
export class SmartsheetDirectAPI {
  private baseUrl: string;
  private accessToken: string;

  /**
   * Creates a new SmartsheetDirectAPI instance
   * @param accessToken Smartsheet API access token (defaults to SMARTSHEET_API_KEY env variable)
   * @param baseUrl Smartsheet API base URL (defaults to https://api.smartsheet.com/2.0)
   */
  constructor(accessToken?: string, baseUrl: string = 'https://api.smartsheet.com/2.0') {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken || process.env.SMARTSHEET_API_KEY || '';
    
    if (!this.accessToken) {
      throw new Error('SMARTSHEET_API_KEY environment variable is not set');
    }
  }

  /**
   * Makes a request to the Smartsheet API with retry logic
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param data Request body data
   * @param queryParams Query parameters
   * @returns API response
   */
  async request<T>(
    method: string, 
    endpoint: string, 
    data?: any, 
    queryParams?: Record<string, any>
  ): Promise<T> {
    const maxRetries = 3;
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        
        // Add query parameters if provided
        if (queryParams) {
          Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              url.searchParams.append(key, String(value));
            }
          });
        }
        
        console.error(`[API] ${method} ${url.toString()}`);
        
        const response = await axios({
          method,
          url: url.toString(),
          data,
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'mcp',
          }
        });
        
        return response.data;
      } catch (error: any) {
        // Check if rate limited
        if (error.response?.status === 429 && retries < maxRetries) {
          const retryAfter = error.response.headers['retry-after'] || 1;
          const delay = Math.max(
            parseInt(retryAfter, 10) * 1000,
            Math.pow(2, retries) * 1000 + Math.random() * 1000
          );
          console.error(`[Rate Limit] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else {
          console.error('[Error] API request failed:', error.response?.data || error.message);
          throw this.formatError(error);
        }
      }
    }
    
    throw new Error('Maximum retries exceeded');
  }
  
  /**
   * Formats an error for consistent error handling
   * @param error Error to format
   * @returns Formatted error
   */
  private formatError(error: any): Error {
    const errorMessage = error.response?.data?.message || error.message;
    const formattedError = new Error(errorMessage);
    
    // Add additional properties
    (formattedError as any).statusCode = error.response?.status;
    (formattedError as any).errorCode = error.response?.data?.errorCode;
    (formattedError as any).detail = error.response?.data?.detail;
    
    return formattedError;
  }
  
  /**
   * Gets a sheet by ID
   * @param sheetId Sheet ID
   * @param include Optional comma-separated list of elements to include
   * @returns Sheet data
   */
  async getSheet(sheetId: string, include?: string): Promise<any> {
    return this.request('GET', `/sheets/${sheetId}`, undefined, { include });
  }
  
  /**
   * Gets the version of a sheet
   * @param sheetId Sheet ID
   * @returns Sheet version
   */
  async getSheetVersion(sheetId: string): Promise<any> {
    return this.request('GET', `/sheets/${sheetId}/version`);
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
    page?: number
  ): Promise<any> {
    return this.request('GET', `/sheets/${sheetId}/rows/${rowId}/columns/${columnId}/history`, undefined, {
      include,
      pageSize,
      page
    });
  }
  
  /**
   * Updates rows in a sheet
   * @param sheetId Sheet ID
   * @param rows Array of row objects to update
   * @returns Update result
   */
  async updateRows(sheetId: string, rows: any[]): Promise<any> {
    return this.request('PUT', `/sheets/${sheetId}/rows`, rows);
  }
  
  /**
   * Adds rows to a sheet
   * @param sheetId Sheet ID
   * @param rows Array of row objects to add
   * @returns Add result
   */
  async addRows(sheetId: string, rows: any[]): Promise<any> {
    return this.request('POST', `/sheets/${sheetId}/rows`, rows);
  }
  
  /**
   * Deletes rows from a sheet
   * @param sheetId Sheet ID
   * @param rowIds Array of row IDs to delete
   * @param ignoreRowsNotFound Whether to ignore rows that don't exist
   * @returns Delete result
   */
  async deleteRows(sheetId: string, rowIds: string[], ignoreRowsNotFound: boolean = true): Promise<any> {
    return this.request('DELETE', `/sheets/${sheetId}/rows`, undefined, {
      ids: rowIds.join(','),
      ignoreRowsNotFound: ignoreRowsNotFound.toString()
    });
  }
  
  /**
   * Gets the location information for a sheet
   * @param sheetId Sheet ID
   * @returns Location information including folder ID
   */
  async getSheetLocation(sheetId: string): Promise<any> {
    const sheet = await this.getSheet(sheetId);
    return {
      folderId: sheet.parentId,
      folderType: sheet.parentType,
      workspaceId: sheet.workspaceId
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
    workspaceId?: string
  ): Promise<any> {
    const data: any = {
      newName: destinationName
    };
    
    if (destinationFolderId) {
      data.destinationType = 'folder';
      data.destinationId = destinationFolderId;
      console.error(`[API] Copying sheet to folder: ${destinationFolderId}`);
    } else if (workspaceId) {
      data.destinationType = 'workspace';
      data.destinationId = workspaceId;
      console.error(`[API] Copying sheet to workspace: ${workspaceId}`);
    } else {
      // Default to 'home' if no folder or workspace specified
      data.destinationType = 'home';
      console.error(`[API] Copying sheet to home`);
    }
    
    const result = await this.request('POST', `/sheets/${sheetId}/copy`, data);
    console.error(`[API] Copy sheet result: ${JSON.stringify((result as any).result?.id)}`);
    return result;
  }
  
  /**
   * Creates a new sheet
   * @param name Name for the new sheet
   * @param columns Array of column objects
   * @param folderId Optional folder ID where the sheet should be created
   * @returns New sheet data
   */
  async createSheet(name: string, columns: any[], folderId?: string): Promise<any> {
    const data = {
      name,
      columns
    };
    
    let endpoint = '/sheets';
    
    // If folder ID is provided, create in that folder
    if (folderId) {
      endpoint = `/folders/${folderId}/sheets`;
    }
    
    return this.request('POST', endpoint, data);
  }
  /**
   * Lists folders in a workspace
   * @param workspaceId Workspace ID
   * @returns List of folders in the workspace
   */
  async listWorkspaceFolders(workspaceId: string): Promise<any> {
    return this.request('GET', `/workspaces/${workspaceId}/folders`);
  }

  /**
   * Creates a folder in a workspace
   * @param workspaceId Workspace ID
   * @param folderName Name of the folder to create
   * @returns Created folder data
   */
  async createWorkspaceFolder(workspaceId: string, folderName: string): Promise<any> {
    const data = {
      name: folderName
    };
    
    return this.request('POST', `/workspaces/${workspaceId}/folders`, data);
  }
}

/**
 * Creates a Smartsheet API client using the access token from environment variables
 * @returns SmartsheetDirectAPI instance
 */
export function createSmartsheetDirectAPI(accessToken?: string): SmartsheetDirectAPI {
  return new SmartsheetDirectAPI(accessToken);
}