import { config } from "dotenv";

// Load environment variables from .env file
config();

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { smartsheetClient } from "./smartsheet-utils.js";
import { SmartsheetCell, SmartsheetColumn, SmartsheetRow, SmartsheetSheet } from "./smartsheet-types/index.js";

const server = new McpServer({
  name: "smartsheet",
  version: "1.0.0",
});

interface FormattedSheet {
  id: number;
  name: string;
  permalink: string;
  totalRowCount: number;
  createdAt: string;
  modifiedAt: string;
  columns: {
    id: number;
    title: string;
    type: string;
    index: number;
    primary: boolean;
  }[];
  rows: {
    id: number;
    rowNumber: number;
    cells: Record<string, any>;
  }[];
}

/**
 * Formats a Smartsheet sheet response to be more readable and concise for Claude
 * @param sheet The sheet response from the Smartsheet API
 * @param smartsheetClient The Smartsheet client instance
 * @returns A formatted version of the sheet
 */
export function formatSheet(sheet: SmartsheetSheet, smartsheetClient: any): FormattedSheet {
  // Extract basic sheet information
  const formattedSheet: FormattedSheet = {
    id: sheet.id,
    name: sheet.name,
    permalink: sheet.permalink,
    totalRowCount: sheet.totalRowCount,
    createdAt: sheet.createdAt,
    modifiedAt: sheet.modifiedAt,
    
    // Format columns to be more concise
    columns: sheet.columns.map((column: SmartsheetColumn) => ({
      id: column.id,
      title: column.title,
      type: column.type,
      index: column.index,
      primary: column.primary || false
    })),
    
    // Format rows to be more readable
    rows: sheet.rows.map((row: SmartsheetRow) => {
      // Create a map of column titles to cell values for easier reading
      const cellMap: Record<string, any> = {};
      
      row.cells.forEach((cell: SmartsheetCell) => {
        // Find the column for this cell
        const column = sheet.columns.find(col => col.id === cell.columnId);
        if (column && column.title) {
          // Use the display value if available, otherwise use the raw value
          cellMap[column.title] = cell.displayValue || cell.value || null;
        }
      });
      
      return {
        id: row.id,
        rowNumber: row.rowNumber,
        cells: cellMap
      };
    })
  };
  
  return formattedSheet;
}

/**
 * Formats a Smartsheet sheet response as a CSV string
 * @param sheet The sheet response from the Smartsheet API
 * @param smartsheetClient The Smartsheet client instance
 * @returns The sheet data as a CSV string
 */
function formatSheetAsCSV(sheet: SmartsheetSheet, smartsheetClient: any): string {
  // Get the column titles
  const columnTitles = sheet.columns.map(col => col.title);

  // Build the CSV rows
  const csvRows = [columnTitles.join(',')];
  sheet.rows.forEach(row => {
    const cellValues = row.cells.map(cell => {
      const column = sheet.columns.find(col => col.id === cell.columnId);
      return column ? (cell.displayValue || cell.value || '').toString() : '';
    });
    csvRows.push(cellValues.join(','));
  });

  return csvRows.join('\n');
}

server.tool(
  "search-sheets",
  "Searches for sheets in Smartsheet",
  {
    query: z.string().describe("Search criteria"),
    options: z.object({
      page: z.number().optional(),
      size: z.number().optional(),
      sortBy: z.string().optional(),
    }).optional().describe("Optional parameters for pagination and sorting"),
  },
  async ({ query, options }) => {
    try {
      const response = await smartsheetClient.sheets.listSheets({
        query,
        ...(options || {}),
      });
      
      // Format the response to only include name and permalink
      const formattedResponse = {
        totalCount: response.totalCount,
        sheets: response.data.map((sheet: any) => ({
          name: sheet.name,
          permalink: sheet.permalink
        }))
      };
      
      // Convert to the expected MCP response format
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(formattedResponse, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error("Error in search-sheets:", error);
      throw new Error(`Failed to search sheets: ${(error as Error).message}`);
    }
  }
);

server.tool(
  "get-sheet",
  "Gets a sheet from Smartsheet by its ID",
  {
    sheetId: z.string().describe("The ID of the sheet to retrieve"),
  },
  async ({ sheetId }) => {
    try {
      console.log(`Fetching sheet with ID: ${sheetId}`);
      
      // Convert sheetId to a number if it's a string
      const id = Number(sheetId);
      if (isNaN(id)) {
        throw new Error(`Invalid sheet ID: ${sheetId}`);
      }
      
      const sheet = await smartsheetClient.sheets.getSheet({
        id
      });
      
      console.log(`Successfully fetched sheet: ${sheet.name}`);
      
      // Format the sheet to be more readable for Claude
      const formattedSheet = formatSheet(sheet, smartsheetClient);
      
      // Convert to the expected MCP response format
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(formattedSheet, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error("Error in get-sheet:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch sheet: ${(error as Error).message}`
          }
        ],
        isError: true
      };
    }
  }
);

server.tool(
  "get-sheet-as-csv",
  "Gets a sheet from Smartsheet by its ID and returns it as a CSV",
  {
    sheetId: z.string().describe("The ID of the sheet to retrieve"),
  },
  async ({ sheetId }) => {
    try {
      console.log(`Fetching sheet with ID: ${sheetId}`);
      
      // Convert sheetId to a number if it's a string
      const id = Number(sheetId);
      if (isNaN(id)) {
        throw new Error(`Invalid sheet ID: ${sheetId}`);
      }
      
      const sheet = await smartsheetClient.sheets.getSheet({
        id
      });
      
      console.log(`Successfully fetched sheet: ${sheet.name}`);
      
      // Format the sheet as a CSV string
      const csvData = formatSheetAsCSV(sheet, smartsheetClient);
      
      // Convert to the expected MCP response format
      return {
        content: [
          {
            type: "text",
            text: csvData
          }
        ]
      };
    } catch (error) {
      console.error("Error in get-sheet-as-csv:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch sheet: ${(error as Error).message}`
          }
        ],
        isError: true
      };
    }
  }
);

server.tool(
  "write-row-to-sheet",
  "Adds a new row to a Smartsheet sheet",
  {
    sheetId: z.string().describe("The ID of the sheet to add the row to"),
    cells: z.array(
      z.object({
        columnId: z.number().describe("The ID of the column for this cell"),
        value: z.any().describe("The value to set for this cell")
      })
    ).describe("Array of cells with column IDs and values"),
    toTop: z.boolean().optional().describe("If true, the row will be added to the top of the sheet. Default is false (add to bottom)."),
    toBottom: z.boolean().optional().describe("If true, the row will be added to the bottom of the sheet. Default is true."),
    siblingId: z.number().optional().describe("The row ID to position this row relative to"),
    above: z.boolean().optional().describe("If true and siblingId is specified, the row will be added above the sibling row"),
  },
  async ({ sheetId, cells, toTop, toBottom, siblingId, above }) => {
    try {
      console.log(`Adding row to sheet with ID: ${sheetId}`);
      
      // Convert sheetId to a number if it's a string
      const id = Number(sheetId);
      if (isNaN(id)) {
        throw new Error(`Invalid sheet ID: ${sheetId}`);
      }
      
      // Prepare the row to add with all possible properties
      const rowToAdd: {
        toTop: boolean;
        toBottom: boolean;
        cells: { columnId: number; value: any }[];
        siblingId?: number;
        above?: boolean;
      } = {
        toTop: toTop || false,
        toBottom: toBottom !== false, // Default to true if not specified
        cells: cells.map(cell => ({
          columnId: cell.columnId,
          value: cell.value
        })),
        // Add optional properties if they exist
        ...(siblingId ? { siblingId } : {}),
        ...(above !== undefined ? { above } : {})
      };
      
      // Add the row to the sheet
      const response = await smartsheetClient.sheets.addRows({
        sheetId: id,
        body: [rowToAdd]
      });
      
      console.log(`Successfully added row to sheet: ${response.result[0].id}`);
      
      // Return the response
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Row added successfully",
              rowId: response.result[0].id,
              rowNumber: response.result[0].rowNumber
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error("Error in write-row-to-sheet:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to add row to sheet: ${(error as Error).message}`
          }
        ],
        isError: true
      };
    }
  }
);


async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Smartsheet MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});