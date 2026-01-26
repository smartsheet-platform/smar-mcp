/**
 * Shared Type Definitions for smar-mcp
 *
 * Based on Smartsheet API 2.0
 */

export interface Cell {
  columnId: number;
  value: string | number | boolean | null;
  displayValue?: string;
  formula?: string;
}

export interface Row {
  id: number;
  rowNumber: number;
  parentId?: number;
  siblingId?: number;
  expanded?: boolean;
  cells: Cell[];
  createdAt?: string;
  modifiedAt?: string;
}

export interface Column {
  id: number;
  index: number;
  title: string;
  type: string;
  primary?: boolean;
  validation?: boolean;
  width?: number;
}

export interface Sheet {
  id: number;
  name: string;
  totalRowCount: number;
  columns: Column[];
  rows: Row[];
  permalink?: string;
  createdAt?: string;
  modifiedAt?: string;
  accessLevel?: string;
  parentId?: number;
  parentType?: string;
  workspaceId?: number;
  totalPageCount?: number;
}

export interface SheetSummary {
  id: number;
  name: string;
  totalRowCount: number;
  columns: Column[];
  rows: Row[]; // Truncated to top 5
}

export interface Result {
  resultCode: number;
  message: string;
  id?: number;
  version?: number;
}

export interface BulkItemResult {
  resultCode: number;
  message: string;
  result: Row[];
  version?: number;
}

export interface CellHistory {
  id: number | string; // Cell ID, type varies in some contexts but usually number/string
  rowId: number;
  columnId: number;
  value: string | number | boolean | null;
  displayValue?: string;
  modifiedAt: string;
  modifiedBy: { email: string; name?: string };
}

export interface SheetLocation {
  folderId?: number;
  folderType?: string;
  workspaceId?: number;
}

export interface UpdateRequest {
  id: number;
  sheetId: number;
  rowIds: number[];
  columnIds: number[];
  message?: string;
  sentBy?: { email: string };
  createdAt?: string;
  modifiedAt?: string;
  status?: string;
}

export interface SearchResultItem {
  id: number;
  objectId: number; // Seems consistent with Smartsheet search response
  name: string;
  permalink: string;
  objectType: string;
  parentObjectName?: string;
  parentObjectId?: number;
  contextData?: string[];
}

export interface SearchResult {
  totalCount: number;
  results: SearchResultItem[];
}
