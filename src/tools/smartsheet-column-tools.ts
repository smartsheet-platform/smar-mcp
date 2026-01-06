import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

export function getColumnTools(server: McpServer, api: SmartsheetAPI, allowDeleteTools: boolean) {

  // Tool: Get Columns
  server.tool(
    "get_columns",
    "Gets all columns for a sheet",
    {
      sheetId: z.string().describe("The ID of the sheet"),
      include: z.string().optional().describe("Comma-separated list of elements to include (e.g., 'filters')"),
    },
    async ({ sheetId, include }) => {
      try {
        console.info(`Getting columns for sheet ${sheetId}`);
        const columns = await api.columns.getColumns(sheetId, include);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(columns, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Failed to get columns for sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: "text",
              text: `Failed to get columns: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool: Get Column
  server.tool(
    "get_column",
    "Gets a specific column by ID",
    {
      sheetId: z.string().describe("The ID of the sheet"),
      columnId: z.string().describe("The ID of the column"),
      include: z.string().optional().describe("Comma-separated list of elements to include"),
    },
    async ({ sheetId, columnId, include }) => {
      try {
        console.info(`Getting column ${columnId} for sheet ${sheetId}`);
        const column = await api.columns.getColumn(sheetId, columnId, include);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(column, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Failed to get column ${columnId} for sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: "text",
              text: `Failed to get column: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool: Add Column
  server.tool(
    "add_column",
    "Adds a new column to a sheet",
    {
      sheetId: z.string().describe("The ID of the sheet"),
      title: z.string().describe("Column title"),
      type: z.string().describe("Column type (TEXT_NUMBER, DATE, DATETIME, CONTACT_LIST, CHECKBOX, PICKLIST, DURATION, PREDECESSOR, ABSTRACT_DATETIME)"),
      index: z.number().optional().describe("Column index position (0-based)"),
      options: z.array(z.string()).optional().describe("Options for PICKLIST columns"),
      symbol: z.string().optional().describe("Symbol for CHECKBOX columns (STAR, FLAG, etc.)"),
      width: z.number().optional().describe("Column width in pixels"),
    },
    async ({ sheetId, title, type, index, options, symbol, width }) => {
      try {
        console.info(`Adding column "${title}" to sheet ${sheetId}`);
        const column = await api.columns.addColumn(sheetId, {
          title,
          type,
          index,
          options,
          symbol,
          width
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(column, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Failed to add column "${title}" to sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: "text",
              text: `Failed to add column: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool: Update Column
  server.tool(
    "update_column",
    "Updates an existing column",
    {
      sheetId: z.string().describe("The ID of the sheet"),
      columnId: z.string().describe("The ID of the column to update"),
      title: z.string().optional().describe("New column title"),
      type: z.string().optional().describe("New column type"),
      index: z.number().optional().describe("New column index position"),
      options: z.array(z.string()).optional().describe("New options for PICKLIST columns"),
      symbol: z.string().optional().describe("New symbol for CHECKBOX columns"),
      width: z.number().optional().describe("New column width in pixels"),
    },
    async ({ sheetId, columnId, title, type, index, options, symbol, width }) => {
      try {
        console.info(`Updating column ${columnId} in sheet ${sheetId}`);
        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (type !== undefined) updates.type = type;
        if (index !== undefined) updates.index = index;
        if (options !== undefined) updates.options = options;
        if (symbol !== undefined) updates.symbol = symbol;
        if (width !== undefined) updates.width = width;

        const column = await api.columns.updateColumn(sheetId, columnId, updates);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(column, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Failed to update column ${columnId} in sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: "text",
              text: `Failed to update column: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool: Delete Column (conditionally registered)
  if (allowDeleteTools) {
    server.tool(
      "delete_column",
      "Deletes a column from a sheet",
      {
        sheetId: z.string().describe("The ID of the sheet"),
        columnId: z.string().describe("The ID of the column to delete"),
      },
      async ({ sheetId, columnId }) => {
        try {
          console.info(`Deleting column ${columnId} from sheet ${sheetId}`);
          const result = await api.columns.deleteColumn(sheetId, columnId);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error: any) {
          console.error(`Failed to delete column ${columnId} from sheet ${sheetId}`, { error });
          return {
            content: [
              {
                type: "text",
                text: `Failed to delete column: ${error.message}`
              }
            ],
            isError: true
          };
        }
      }
    );
  }

}
