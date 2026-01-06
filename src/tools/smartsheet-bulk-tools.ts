import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

export function getBulkTools(server: McpServer, api: SmartsheetAPI, allowDeleteTools: boolean) {

  server.tool(
    "move_rows",
    "Moves rows from one sheet to another",
    {
      sourceSheetId: z.number().describe("The ID of the source sheet"),
      rowIds: z.array(z.number()).describe("Array of row IDs to move"),
      destinationSheetId: z.number().describe("The ID of the destination sheet"),
      toTop: z.boolean().optional().describe("Move rows to the top of the destination sheet"),
      toBottom: z.boolean().optional().describe("Move rows to the bottom of the destination sheet"),
      parentId: z.number().optional().describe("ID of the parent row in the destination"),
      siblingId: z.number().optional().describe("ID of the sibling row in the destination"),
    },
    async ({ sourceSheetId, rowIds, destinationSheetId, toTop, toBottom, parentId, siblingId }) => {
      try {
        console.info(`Moving ${rowIds.length} rows from sheet ${sourceSheetId} to ${destinationSheetId}`);
        const result = await api.bulk.moveRows(sourceSheetId, rowIds, destinationSheetId, {
          toTop, toBottom, parentId, siblingId
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to move rows", { error });
        return {
          content: [{ type: "text", text: `Failed to move rows: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "copy_rows",
    "Copies rows from one sheet to another",
    {
      sourceSheetId: z.number().describe("The ID of the source sheet"),
      rowIds: z.array(z.number()).describe("Array of row IDs to copy"),
      destinationSheetId: z.number().describe("The ID of the destination sheet"),
      toTop: z.boolean().optional().describe("Copy rows to the top of the destination sheet"),
      toBottom: z.boolean().optional().describe("Copy rows to the bottom of the destination sheet"),
      parentId: z.number().optional().describe("ID of the parent row in the destination"),
      siblingId: z.number().optional().describe("ID of the sibling row in the destination"),
    },
    async ({ sourceSheetId, rowIds, destinationSheetId, toTop, toBottom, parentId, siblingId }) => {
      try {
        console.info(`Copying ${rowIds.length} rows from sheet ${sourceSheetId} to ${destinationSheetId}`);
        const result = await api.bulk.copyRows(sourceSheetId, rowIds, destinationSheetId, {
          toTop, toBottom, parentId, siblingId
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to copy rows", { error });
        return {
          content: [{ type: "text", text: `Failed to copy rows: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "move_sheet",
    "Moves a sheet to a different folder or workspace",
    {
      sheetId: z.number().describe("The ID of the sheet to move"),
      folderId: z.number().optional().describe("ID of the destination folder"),
      workspaceId: z.number().optional().describe("ID of the destination workspace"),
    },
    async ({ sheetId, folderId, workspaceId }) => {
      try {
        const destination = folderId ? `folder ${folderId}` : `workspace ${workspaceId}`;
        console.info(`Moving sheet ${sheetId} to ${destination}`);
        const result = await api.bulk.moveSheet(sheetId, { folderId, workspaceId });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to move sheet ${sheetId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to move sheet: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  if (allowDeleteTools) {
    server.tool(
      "bulk_delete_rows",
      "Deletes multiple rows from a sheet",
      {
        sheetId: z.number().describe("The ID of the sheet"),
        rowIds: z.array(z.number()).describe("Array of row IDs to delete"),
        ignoreRowsNotFound: z.boolean().optional().describe("If true, don't error if rows are not found"),
      },
      async ({ sheetId, rowIds, ignoreRowsNotFound }) => {
        try {
          console.info(`Bulk deleting ${rowIds.length} rows from sheet ${sheetId}`);
          const result = await api.bulk.deleteRows(sheetId, rowIds, ignoreRowsNotFound);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
          };
        } catch (error: any) {
          console.error("Failed to bulk delete rows", { error });
          return {
            content: [{ type: "text", text: `Failed to bulk delete rows: ${error.message}` }],
            isError: true
          };
        }
      }
    );
  }

  server.tool(
    "bulk_add_rows",
    "Adds multiple rows to a sheet in a single operation",
    {
      sheetId: z.number().describe("The ID of the sheet"),
      rows: z.array(z.object({
        toTop: z.boolean().optional().describe("Add row to the top of the sheet"),
        toBottom: z.boolean().optional().describe("Add row to the bottom of the sheet"),
        parentId: z.number().optional().describe("ID of the parent row"),
        siblingId: z.number().optional().describe("ID of the sibling row"),
        cells: z.array(z.object({
          columnId: z.number().describe("Column ID"),
          value: z.any().describe("Cell value"),
        })).describe("Array of cell objects"),
      })).describe("Array of row objects to add"),
    },
    async ({ sheetId, rows }) => {
      try {
        console.info(`Bulk adding ${rows.length} rows to sheet ${sheetId}`);
        // Ensure value is present in each cell (default to null if missing)
        const normalizedRows = rows.map(row => ({
          ...row,
          cells: row.cells.map(cell => ({
            columnId: cell.columnId,
            value: cell.value ?? null
          }))
        }));
        const result = await api.bulk.addRows(sheetId, normalizedRows);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to bulk add rows", { error });
        return {
          content: [{ type: "text", text: `Failed to bulk add rows: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "bulk_update_rows",
    "Updates multiple rows in a sheet in a single operation",
    {
      sheetId: z.number().describe("The ID of the sheet"),
      rows: z.array(z.object({
        id: z.number().describe("Row ID"),
        cells: z.array(z.object({
          columnId: z.number().describe("Column ID"),
          value: z.any().describe("New cell value"),
        })).describe("Array of cell objects"),
      })).describe("Array of row objects to update"),
    },
    async ({ sheetId, rows }) => {
      try {
        console.info(`Bulk updating ${rows.length} rows in sheet ${sheetId}`);
        // Ensure value is present in each cell (default to null if missing)
        const normalizedRows = rows.map(row => ({
          id: row.id,
          cells: row.cells.map(cell => ({
            columnId: cell.columnId,
            value: cell.value ?? null
          }))
        }));
        const result = await api.bulk.updateRows(sheetId, normalizedRows);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to bulk update rows", { error });
        return {
          content: [{ type: "text", text: `Failed to bulk update rows: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "sort_rows",
    "Sorts rows in a sheet by one or more columns",
    {
      sheetId: z.number().describe("The ID of the sheet"),
      sortCriteria: z.array(z.object({
        columnId: z.number().describe("Column ID to sort by"),
        direction: z.enum(["ASCENDING", "DESCENDING"]).describe("Sort direction"),
      })).describe("Array of sort criteria (applied in order)"),
    },
    async ({ sheetId, sortCriteria }) => {
      try {
        console.info(`Sorting rows in sheet ${sheetId} by ${sortCriteria.length} criteria`);
        const result = await api.bulk.sortRows(sheetId, sortCriteria);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to sort rows in sheet ${sheetId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to sort rows: ${error.message}` }],
          isError: true
        };
      }
    }
  );
}
