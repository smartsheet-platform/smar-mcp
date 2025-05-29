import { SmartsheetAPI } from "./smartsheet-api.js";

export class SmartsheetSearchAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * Search in Sheet
   * @param sheetId ID of the sheet to search in
   * @param query Text to search for
   * @returns Search results
   */
  async searchSheet(sheetId: string, query: string): Promise<any> {
    return this.api.request('GET', `/search/sheet/${sheetId}?query=${query}`);
  }

  /**
   * Search for Sheets
   * @param query Text to search for
   * @returns Search results
   */
  async searchSheets(query: string): Promise<any> {
    return this.api.request('GET', `/search?query=${query}&scopes=sheetNames,cellData,summaryFields`);
  }

  /**
   * Search for Folders
   * @param query Text to search for
   * @returns Search results
   */
  async searchFolders(query: string): Promise<any> {
    return this.api.request('GET', `/search?query=${query}&scopes=folderNames`);
  }

  /**
   * Search for Workspaces
   * @param query Text to search for
   * @returns Search results
   */
  async searchWorkspaces(query: string): Promise<any> {
    return this.api.request('GET', `/search?query=${query}&scopes=workspaceNames`);
  }

  /**
   * Search for Reports 
   * @param query Text to search for
   * @returns Search results
   */
  async searchReports(query: string): Promise<any> {
    return this.api.request('GET', `/search?query=${query}&scopes=reportNames`);
  }

  /**
   * Search for Dashboards
   * @param query Text to search for
   * @returns Search results
   */
  async searchDashboards(query: string): Promise<any> {
    return this.api.request('GET', `/search?query=${query}&scopes=sightNames`);
  }
  
}