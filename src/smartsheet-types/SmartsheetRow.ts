import { SmartsheetCell } from './SmartsheetCell.js';

export interface SmartsheetRow {
  id: number;
  rowNumber: number;
  cells: SmartsheetCell[];
}