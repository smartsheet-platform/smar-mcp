import { SmartsheetAPI } from './smartsheet-api.js';

export interface SummaryField {
  id: number;
  index: number;
  title: string;
  type: string;
  formula?: string;
  objectValue?: any;
  displayValue?: string;
  hyperlink?: {
    url?: string;
    sheetId?: number;
    reportId?: number;
  };
  image?: {
    id: string;
    height: number;
    width: number;
  };
  contactOptions?: Array<{ email: string; name?: string }>;
  locked?: boolean;
  lockedForUser?: boolean;
  createdAt?: string;
  modifiedAt?: string;
  createdBy?: { email: string; name?: string };
  modifiedBy?: { email: string; name?: string };
}

export class SmartsheetSummaryAPI {
  private api: SmartsheetAPI;

  constructor(api: SmartsheetAPI) {
    this.api = api;
  }

  /**
   * Get all summary fields for a sheet
   */
  async getSummaryFields(sheetId: number): Promise<{ data: SummaryField[] }> {
    return this.api.request<{ data: SummaryField[] }>('GET', `/sheets/${sheetId}/summary/fields`);
  }

  /**
   * Add summary fields to a sheet
   */
  async addSummaryFields(
    sheetId: number,
    fields: Array<{
      title: string;
      type: 'TEXT_NUMBER' | 'DATE' | 'DATETIME' | 'CONTACT_LIST' | 'CHECKBOX' | 'PICKLIST' | 'DURATION' | 'PREDECESSOR' | 'ABSTRACT_DATETIME';
      formula?: string;
      objectValue?: any;
      index?: number;
    }>
  ): Promise<{ result: SummaryField[] }> {
    return this.api.request<{ result: SummaryField[] }>('POST', `/sheets/${sheetId}/summary/fields`, fields);
  }

  /**
   * Update summary fields
   */
  async updateSummaryFields(
    sheetId: number,
    fields: Array<{
      id: number;
      title?: string;
      formula?: string;
      objectValue?: any;
      index?: number;
      locked?: boolean;
    }>
  ): Promise<{ result: SummaryField[] }> {
    return this.api.request<{ result: SummaryField[] }>('PUT', `/sheets/${sheetId}/summary/fields`, fields);
  }

  /**
   * Delete summary fields
   */
  async deleteSummaryFields(sheetId: number, fieldIds: number[]): Promise<{ result: number[] }> {
    return this.api.request<{ result: number[] }>(
      'DELETE',
      `/sheets/${sheetId}/summary/fields`,
      undefined,
      { ids: fieldIds.join(',') }
    );
  }

  /**
   * Get a single summary field
   */
  async getSummaryField(sheetId: number, fieldId: number): Promise<SummaryField> {
    const response = await this.getSummaryFields(sheetId);
    const field = response.data.find(f => f.id === fieldId);
    if (!field) {
      throw new Error(`Summary field ${fieldId} not found`);
    }
    return field;
  }

  /**
   * Add an image to a summary field
   */
  async addSummaryImage(
    sheetId: number,
    fieldId: number,
    imageFile: Buffer,
    contentType: string
  ): Promise<{ result: SummaryField }> {
    // This would need special handling for file upload
    return this.api.request<{ result: SummaryField }>(
      'POST',
      `/sheets/${sheetId}/summary/fields/${fieldId}/images`,
      imageFile
    );
  }
}
