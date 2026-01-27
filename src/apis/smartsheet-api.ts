import axios from 'axios';
import { SmartsheetDiscussionAPI } from './smartsheet-discussion-api.js';
import { SmartsheetFolderAPI } from './smartsheet-folder-api.js';
import { SmartsheetSearchAPI } from './smartsheet-search-api.js';
import { SmartsheetSheetAPI } from './smartsheet-sheet-api.js';
import { SmartsheetWorkspaceAPI } from './smartsheet-workspace-api.js';
import { SmartsheetUserAPI } from './smartsheet-user-api.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'));
import { Logger } from '../utils/logger.js';
import { SmartsheetErrorMapper } from '../utils/error-mapper.js';
import { RequestQueue } from '../utils/queue.js';

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
  private queue: RequestQueue;
  /**
   * Creates a new SmartsheetAPI instance
   * @param accessToken Smartsheet API access token (from SMARTSHEET_API_KEY env var)
   * @param baseUrl Smartsheet API base URL (from SMARTSHEET_ENDPOINT env var)
   *
   * Supported API endpoints based on deployment region:
   * - US Commercial: https://api.smartsheet.com/2.0
   * - EU: https://api.smartsheet.eu/2.0
   * - US Gov (FedRAMP): https://api.smartsheetgov.com/2.0
   * - Test/Sandbox: https://api.test.smartsheet.com/2.0
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
    this.queue = new RequestQueue(50); // Concurrency limit from NFR-02

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
    queryParams?: Record<string, any>,
  ): Promise<T> {
    return this.queue.run(async () => {
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

          Logger.info(`API Request: ${method} ${url.toString()}`);

          const response = await axios({
            method,
            url: url.toString(),
            data,
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
              'User-Agent': `smar-mcp/${packageJson.version}`,
            },
          });

          return response.data;
        } catch (error: any) {
          const status = error.response?.status;
          // Retry on Rate Limit (429) or Server Errors (502, 503, 504)
          if (
            (status === 429 || status === 503 || status === 502 || status === 504) &&
            retries < maxRetries
          ) {
            const retryAfterHeader = error.response?.headers
              ? error.response.headers['retry-after']
              : undefined;
            let delay = 1000 * Math.pow(2, retries); // Exponential backoff

            if (retryAfterHeader) {
              delay = parseInt(retryAfterHeader, 10) * 1000;
            }

            // Add jitter
            delay += Math.random() * 500;

            Logger.warn(`[Retryable Error ${status}] Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            retries++;
          } else {
            Logger.error(`API Error: ${error.message}`, { error: error.message });
            throw this.formatError(error);
          }
        }
      }
      throw new Error('Maximum retries exceeded');
    });
  }

  /**
   * Formats an error for consistent error handling
   * @param error Error to format
   * @returns Formatted error
   */
  private formatError(error: any): Error {
    const errorMessage = SmartsheetErrorMapper.getErrorMessage(error);
    const formattedError = new Error(errorMessage);

    // Add additional properties
    (formattedError as any).statusCode = error.response?.status;
    (formattedError as any).errorCode = error.response?.data?.errorCode;
    (formattedError as any).detail = error.response?.data?.detail;

    return formattedError;
  }
}
