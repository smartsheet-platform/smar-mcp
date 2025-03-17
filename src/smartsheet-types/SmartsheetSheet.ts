import { SmartsheetColumn } from './SmartsheetColumn.js';
import { SmartsheetRow } from './SmartsheetRow.js';

export interface SmartsheetSheet {
  id: number;
  name: string;
  permalink: string;
  totalRowCount: number;
  createdAt: string;
  modifiedAt: string;
  columns: SmartsheetColumn[];
  rows: SmartsheetRow[];
}