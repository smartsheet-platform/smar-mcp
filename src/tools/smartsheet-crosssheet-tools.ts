import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

export function getCrossSheetTools(server: McpServer, api: SmartsheetAPI) {

  server.tool(
    "list_cross_sheet_references",
    "Lists all cross-sheet references defined for a sheet",
    {
      sheetId: z.number().describe("The ID of the sheet"),
    },
    async ({ sheetId }) => {
      try {
        console.info(`Listing cross-sheet references for sheet ${sheetId}`);
        const refs = await api.crossSheet.listCrossSheetReferences(sheetId);
        return {
          content: [{ type: "text", text: JSON.stringify(refs, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to list cross-sheet references for sheet ${sheetId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to list cross-sheet references: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_cross_sheet_reference",
    "Gets a specific cross-sheet reference",
    {
      sheetId: z.number().describe("The ID of the sheet"),
      referenceId: z.number().describe("The ID of the cross-sheet reference"),
    },
    async ({ sheetId, referenceId }) => {
      try {
        console.info(`Getting cross-sheet reference ${referenceId} for sheet ${sheetId}`);
        const ref = await api.crossSheet.getCrossSheetReference(sheetId, referenceId);
        return {
          content: [{ type: "text", text: JSON.stringify(ref, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to get cross-sheet reference ${referenceId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to get cross-sheet reference: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "create_cross_sheet_reference",
    "Creates a cross-sheet reference to use in formulas like VLOOKUP, INDEX, etc.",
    {
      sheetId: z.number().describe("The ID of the destination sheet where the reference will be used"),
      name: z.string().describe("Name for the cross-sheet reference"),
      sourceSheetId: z.number().describe("ID of the source sheet to reference"),
      startRowId: z.number().optional().describe("ID of the first row in the range"),
      endRowId: z.number().optional().describe("ID of the last row in the range"),
      startColumnId: z.number().optional().describe("ID of the first column in the range"),
      endColumnId: z.number().optional().describe("ID of the last column in the range"),
    },
    async ({ sheetId, name, sourceSheetId, startRowId, endRowId, startColumnId, endColumnId }) => {
      try {
        console.info(`Creating cross-sheet reference "${name}" for sheet ${sheetId}`);
        const result = await api.crossSheet.createCrossSheetReference(sheetId, {
          name,
          sourceSheetId,
          startRowId,
          endRowId,
          startColumnId,
          endColumnId,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to create cross-sheet reference "${name}"`, { error });
        return {
          content: [{ type: "text", text: `Failed to create cross-sheet reference: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "create_cell_link",
    "Creates a cell link that syncs a cell's value from another sheet",
    {
      sheetId: z.number().describe("The ID of the destination sheet"),
      rowId: z.number().describe("The ID of the destination row"),
      columnId: z.number().describe("The ID of the destination column"),
      sourceSheetId: z.number().describe("The ID of the source sheet"),
      sourceRowId: z.number().describe("The ID of the source row"),
      sourceColumnId: z.number().describe("The ID of the source column"),
    },
    async ({ sheetId, rowId, columnId, sourceSheetId, sourceRowId, sourceColumnId }) => {
      try {
        console.info(`Creating cell link from sheet ${sourceSheetId} to sheet ${sheetId}`);
        const result = await api.crossSheet.createCellLink(
          sheetId, rowId, columnId,
          sourceSheetId, sourceRowId, sourceColumnId
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to create cell link", { error });
        return {
          content: [{ type: "text", text: `Failed to create cell link: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "remove_cell_link",
    "Removes a cell link from a cell",
    {
      sheetId: z.number().describe("The ID of the sheet"),
      rowId: z.number().describe("The ID of the row"),
      columnId: z.number().describe("The ID of the column"),
    },
    async ({ sheetId, rowId, columnId }) => {
      try {
        console.info(`Removing cell link from sheet ${sheetId}, row ${rowId}, column ${columnId}`);
        const result = await api.crossSheet.removeCellLink(sheetId, rowId, columnId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to remove cell link", { error });
        return {
          content: [{ type: "text", text: `Failed to remove cell link: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_cell_links",
    "Gets all cell links information for a sheet",
    {
      sheetId: z.number().describe("The ID of the sheet"),
    },
    async ({ sheetId }) => {
      try {
        console.info(`Getting cell links for sheet ${sheetId}`);
        const result = await api.crossSheet.getCellLinks(sheetId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to get cell links for sheet ${sheetId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to get cell links: ${error.message}` }],
          isError: true
        };
      }
    }
  );
}
