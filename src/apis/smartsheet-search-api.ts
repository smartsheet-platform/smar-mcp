import { SmartsheetAPI } from "./smartsheet-api.js";

export class SmartsheetSearchAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * Search for Sheets
   * @param query Text to search for
   * @returns Search results
   */
  async searchSheets(query: string): Promise<any> {
    return this.api.request('GET', `/search?query=${query}&scopes=sheetNames,cellData,summaryFields`);
  }


}