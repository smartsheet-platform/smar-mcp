import { SmartsheetAPI } from "./smartsheet-api.js";

/**
 * Report-specific API methods for Smartsheet
 */
export class SmartsheetReportAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * Lists all reports accessible to the user
   * @param pageSize Number of reports per page
   * @param page Page number
   * @param includeAll Include all results
   * @returns List of reports
   */
  async listReports(pageSize?: number, page?: number, includeAll?: boolean): Promise<any> {
    return this.api.request('GET', '/reports', undefined, {
      pageSize,
      page,
      includeAll
    });
  }

  /**
   * Gets a report by ID
   * @param reportId Report ID
   * @param pageSize Number of rows per page
   * @param page Page number
   * @param include Optional comma-separated list of elements to include
   * @returns Report data with rows
   */
  async getReport(
    reportId: string,
    pageSize?: number,
    page?: number,
    include?: string
  ): Promise<any> {
    return this.api.request('GET', `/reports/${reportId}`, undefined, {
      pageSize,
      page,
      include
    });
  }

  /**
   * Gets report as Excel file URL
   * @param reportId Report ID
   * @returns Export URL
   */
  async getReportAsExcel(reportId: string): Promise<any> {
    return this.api.request('GET', `/reports/${reportId}`, undefined, {
      Accept: 'application/vnd.ms-excel'
    });
  }

  /**
   * Gets report as CSV
   * @param reportId Report ID
   * @returns CSV data
   */
  async getReportAsCsv(reportId: string): Promise<any> {
    return this.api.request('GET', `/reports/${reportId}`, undefined, {
      Accept: 'text/csv'
    });
  }

  /**
   * Sends a report via email
   * @param reportId Report ID
   * @param options Email options
   * @returns Send result
   */
  async sendReport(
    reportId: string,
    options: {
      sendTo: { email: string }[];
      subject: string;
      message?: string;
      ccMe?: boolean;
      format?: 'PDF' | 'EXCEL' | 'PDF_GANTT';
      formatDetails?: {
        paperSize?: 'LETTER' | 'LEGAL' | 'WIDE' | 'ARCHD' | 'A4' | 'A3' | 'A2' | 'A1' | 'A0';
      };
    }
  ): Promise<any> {
    return this.api.request('POST', `/reports/${reportId}/emails`, options);
  }

  /**
   * Gets the publish status of a report
   * @param reportId Report ID
   * @returns Publish status
   */
  async getReportPublishStatus(reportId: string): Promise<any> {
    return this.api.request('GET', `/reports/${reportId}/publish`);
  }

  /**
   * Sets the publish status of a report
   * @param reportId Report ID
   * @param publishOptions Publish options
   * @returns Updated publish status
   */
  async setReportPublishStatus(
    reportId: string,
    publishOptions: {
      readOnlyFullEnabled?: boolean;
      readOnlyFullAccessibleBy?: 'ALL' | 'ORG';
      readOnlyFullDefaultView?: 'GRID' | 'GANTT' | 'CALENDAR';
    }
  ): Promise<any> {
    return this.api.request('PUT', `/reports/${reportId}/publish`, publishOptions);
  }
}
