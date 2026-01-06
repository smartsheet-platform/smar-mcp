import axios from 'axios';
import { SmartsheetDiscussionAPI } from './smartsheet-discussion-api.js';
import { SmartsheetFolderAPI } from './smartsheet-folder-api.js';
import { SmartsheetSearchAPI } from './smartsheet-search-api.js';
import { SmartsheetSheetAPI } from './smartsheet-sheet-api.js';
import { SmartsheetWorkspaceAPI } from './smartsheet-workspace-api.js';
import { SmartsheetUserAPI } from './smartsheet-user-api.js';
import { SmartsheetReportAPI } from './smartsheet-report-api.js';
import { SmartsheetColumnAPI } from './smartsheet-column-api.js';
import { SmartsheetAttachmentAPI } from './smartsheet-attachment-api.js';
import { SmartsheetWebhookAPI } from './smartsheet-webhook-api.js';
import { SmartsheetShareAPI } from './smartsheet-share-api.js';
import { SmartsheetCrossSheetAPI } from './smartsheet-crosssheet-api.js';
import { SmartsheetBulkAPI } from './smartsheet-bulk-api.js';
import { SmartsheetExportAPI } from './smartsheet-export-api.js';
import { SmartsheetSummaryAPI } from './smartsheet-summary-api.js';
import { SmartsheetTemplateAPI } from './smartsheet-template-api.js';
import { SmartsheetFavoritesAPI } from './smartsheet-favorites-api.js';
import { SmartsheetGroupsAPI } from './smartsheet-groups-api.js';
import { SmartsheetEventsAPI } from './smartsheet-events-api.js';
import packageJson from '../../package.json' with { type: 'json' };

/**
 * Direct Smartsheet API client that doesn't rely on the SDK
 */
export class SmartsheetAPI {
  private baseUrl: string;
  private accessToken: string;
  public sheets: SmartsheetSheetAPI;
  public workspaces: SmartsheetWorkspaceAPI;
  public folders: SmartsheetFolderAPI;
  public users: SmartsheetUserAPI;
  public search: SmartsheetSearchAPI;
  public discussions: SmartsheetDiscussionAPI;
  public reports: SmartsheetReportAPI;
  public columns: SmartsheetColumnAPI;
  public attachments: SmartsheetAttachmentAPI;
  public webhooks: SmartsheetWebhookAPI;
  public shares: SmartsheetShareAPI;
  public crossSheet: SmartsheetCrossSheetAPI;
  public bulk: SmartsheetBulkAPI;
  public export: SmartsheetExportAPI;
  public summary: SmartsheetSummaryAPI;
  public templates: SmartsheetTemplateAPI;
  public favorites: SmartsheetFavoritesAPI;
  public groups: SmartsheetGroupsAPI;
  public events: SmartsheetEventsAPI;
  /** 
   * Creates a new SmartsheetAPI instance
   * @param accessToken Smartsheet API access token
   * @param baseUrl Smartsheet API base URL
   */
  constructor(accessToken?: string, baseUrl?: string) {
    this.baseUrl = baseUrl || '';
    this.accessToken = accessToken || '';
    this.sheets = new SmartsheetSheetAPI(this);
    this.workspaces = new SmartsheetWorkspaceAPI(this);
    this.folders = new SmartsheetFolderAPI(this);
    this.users = new SmartsheetUserAPI(this);
    this.search = new SmartsheetSearchAPI(this);
    this.discussions = new SmartsheetDiscussionAPI(this);
    this.reports = new SmartsheetReportAPI(this);
    this.columns = new SmartsheetColumnAPI(this);
    this.attachments = new SmartsheetAttachmentAPI(this);
    this.webhooks = new SmartsheetWebhookAPI(this);
    this.shares = new SmartsheetShareAPI(this);
    this.crossSheet = new SmartsheetCrossSheetAPI(this);
    this.bulk = new SmartsheetBulkAPI(this);
    this.export = new SmartsheetExportAPI(this);
    this.summary = new SmartsheetSummaryAPI(this);
    this.templates = new SmartsheetTemplateAPI(this);
    this.favorites = new SmartsheetFavoritesAPI(this);
    this.groups = new SmartsheetGroupsAPI(this);
    this.events = new SmartsheetEventsAPI(this);

    if (this.accessToken == '') {
      throw new Error('SMARTSHEET_API_KEY environment variable is not set');
    }

    if (this.baseUrl == '') {
      throw new Error('SMARTSHEET_ENDPOINT environment variable is not set');
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
        
        console.info(`API Request: ${method} ${url.toString()}`);
        
        const response = await axios({
          method,
          url: url.toString(),
          data,
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'User-Agent': `smar-mcp/${packageJson.version}`,
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
          console.error(`API Error: ${error.message}`, { error });
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
}
