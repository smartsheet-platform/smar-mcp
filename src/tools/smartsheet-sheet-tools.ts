import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";
import logger from "../utils/logger.js";

export function getSheetTools(server: McpServer, api: SmartsheetAPI, allowDeleteTools: boolean) {

    server.tool(
      "get_sheet",
      "Retrieves the current state of a sheet, including rows, columns, and cells",
      {
        sheetId: z.string().describe("The ID of the sheet to retrieve"),
        include: z.string().optional().describe("Comma-separated list of elements to include (e.g., 'format,formulas')"),
      },
      async ({ sheetId, include }) => {
        try {
          logger.info(`Getting sheet with ID: ${sheetId}`);
          const sheet = await api.sheets.getSheet(sheetId, include);
          
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(sheet, null, 2)
              }
            ]
          };
        } catch (error: any) {
          logger.error(`Failed to get sheet with ID: ${sheetId}`, { error });
          return {
            content: [
              {
                type: "text",
                text: `Failed to get sheet: ${error.message}`
              }
            ],
            isError: true
          };
        }
      }
    );

    server.tool(
      "get_sheet_by_url",
      "Retrieves the current state of a sheet, including rows, columns, and cells",
      {
        url: z.string().describe("The URL of the sheet to retrieve"),
        include: z.string().optional().describe("Comma-separated list of elements to include (e.g., 'format,formulas')"),
      },
      async ({ url, include }) => {
        try {
          logger.info(`Getting sheet with URL: ${url}`);
          const match = url.match(/\/sheets\/([^?\/]+)/);
          const directIdToken = match ? match[1] : null;
          if (!directIdToken) {
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to get sheet: Invalid URL format`
                }
              ],
              isError: true
            };
          }
          const sheet = await api.sheets.getSheetByDirectIdToken(directIdToken, include);
          
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(sheet, null, 2)
              }
            ]
          };
        } catch (error: any) {
          logger.error(`Failed to get sheet with URL: ${url}`, { error });
          return {
            content: [
              {
                type: "text",
                text: `Failed to get sheet: ${error.message}`
              }
            ],
            isError: true
          };
        }
      }
    );

    server.tool(
        "get_sheet_version",
        "Gets the current version number of a sheet",
        {
          sheetId: z.string().describe("The ID of the sheet"),
        },
        async ({ sheetId }) => {
          try {
            logger.info(`Getting version for sheet with ID: ${sheetId}`);
            const version = await api.sheets.getSheetVersion(sheetId);
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(version, null, 2)
                }
              ]
            };
          } catch (error: any) {
            logger.error(`Failed to get sheet version for sheet ID: ${sheetId}`, { error });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to get sheet version: ${error.message}`
                }
              ],
              isError: true
            };
          }
        }
      );
      
      // Tool: Get Cell History
      server.tool(
        "get_cell_history",
        "Retrieves the history of changes for a specific cell",
        {
          sheetId: z.string().describe("The ID of the sheet"),
          rowId: z.string().describe("The ID of the row"),
          columnId: z.string().describe("The ID of the column"),
          include: z.string().optional().describe("Optional parameter to include additional information"),
          pageSize: z.number().optional().describe("Number of history entries to return per page"),
          page: z.number().optional().describe("Page number to return"),
        },
        async ({ sheetId, rowId, columnId, include, pageSize, page }) => {
          try {
            logger.info(`Getting history for cell at row ${rowId}, column ${columnId} in sheet ${sheetId}`);
            const history = await api.sheets.getCellHistory(sheetId, rowId, columnId, include, pageSize, page);
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(history, null, 2)
                }
              ]
            };
          } catch (error: any) {
            logger.error(`Failed to get cell history for row ${rowId}, column ${columnId} in sheet ${sheetId}`, { error });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to get cell history: ${error.message}`
                }
              ],
              isError: true
            };
          }
        }
      );
      
      // Tool: Update Rows
      server.tool(
        "update_rows",
        "Updates rows in a sheet, including cell values, formatting, and formulae",
        {
          sheetId: z.string().describe("The ID of the sheet"),
          rows: z.array(
            z.object({
              id: z.string().describe("Row ID"),
              cells: z.array(
                z.object({
                  columnId: z.number().or(z.string()).describe("Column ID"),
                  value: z.any().optional().describe("Cell value"),
                  formula: z.string().optional().describe("Cell formula"),
                  format: z.string().optional().describe("Cell format"),
                })
              ).describe("Array of cell objects"),
            })
          ).describe("Array of row objects to update"),
        },
        async ({ sheetId, rows }) => {
          try {
            logger.info(`Updating ${rows.length} rows in sheet ${sheetId}`);
            const result = await api.sheets.updateRows(sheetId, rows);
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          } catch (error: any) {
            logger.error(`Failed to update ${rows.length} rows in sheet ${sheetId}`, { error });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to update rows: ${error.message}`
                }
              ],
              isError: true
            };
          }
        }
      );
      
      // Tool: Add Rows
      server.tool(
        "add_rows",
        "Adds new rows to a sheet",
        {
          sheetId: z.string().describe("The ID of the sheet"),
          rows: z.array(
            z.object({
              toTop: z.boolean().optional().describe("Add row to the top of the sheet"),
              toBottom: z.boolean().optional().describe("Add row to the bottom of the sheet"),
              cells: z.array(
                z.object({
                  columnId: z.number().or(z.string()).describe("Column ID"),
                  value: z.any().optional().describe("Cell value"),
                  formula: z.string().optional().describe("Cell formula"),
                  format: z.string().optional().describe("Cell format"),
                })
              ).describe("Array of cell objects"),
            })
          ).describe("Array of row objects to add"),
        },
        async ({ sheetId, rows }) => {
          try {
            logger.info(`Adding ${rows.length} rows to sheet ${sheetId}`);
            const result = await api.sheets.addRows(sheetId, rows);
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          } catch (error: any) {
            logger.error(`Failed to add ${rows.length} rows to sheet ${sheetId}`, { error });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to add rows: ${error.message}`
                }
              ],
              isError: true
            };
          }
        }
      );
      
      // Tool: Delete Rows (conditionally registered)
      if (allowDeleteTools) {
        server.tool(
          "delete_rows",
          "Deletes rows from a sheet",
          {
            sheetId: z.string().describe("The ID of the sheet"),
            rowIds: z.array(z.string()).describe("Array of row IDs to delete"),
            ignoreRowsNotFound: z.boolean().optional().describe("If true, don't throw an error if rows are not found"),
          },
          async ({ sheetId, rowIds, ignoreRowsNotFound }) => {
            try {
              logger.info(`Deleting ${rowIds.length} rows from sheet ${sheetId}`);
              const result = await api.sheets.deleteRows(sheetId, rowIds, ignoreRowsNotFound);
              
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                  }
                ]
              };
            } catch (error: any) {
              logger.error(`Failed to delete ${rowIds.length} rows from sheet ${sheetId}`, { error });
              return {
                content: [
                  {
                    type: "text",
                    text: `Failed to delete rows: ${error.message}`
                  }
                ],
                isError: true
              };
            }
          }
        );
      } else {
        logger.warn("Delete operations are disabled. Set ALLOW_DELETE_TOOLS=true to enable them.");
      }
      
      // Tool: Get Sheet Location
      server.tool(
        "get_sheet_location",
        "Gets the folder ID where a sheet is located",
        {
          sheetId: z.string().describe("The ID of the sheet"),
        },
        async ({ sheetId }) => {
          try {
            logger.info(`Getting location for sheet ${sheetId}`);
            const location = await api.sheets.getSheetLocation(sheetId);
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(location, null, 2)
                }
              ]
            };
          } catch (error: any) {
            logger.error(`Failed to get location for sheet ${sheetId}`, { error });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to get sheet location: ${error.message}`
                }
              ],
              isError: true
            };
          }
        }
      );
      
      // Tool: Copy Sheet
      server.tool(
        "copy_sheet",
        "Creates a copy of the specified sheet in the same folder",
        {
          sheetId: z.string().describe("The ID of the sheet to copy"),
          destinationName: z.string().describe("Name for the sheet copy"),
          destinationFolderId: z.string().optional().describe("ID of the destination folder (same as source if not specified)"),
        },
        async ({ sheetId, destinationName, destinationFolderId }) => {
          try {
            logger.info(`Copying sheet ${sheetId} to "${destinationName}"`);
            
            // If no destination folder is specified, get the current folder
            if (!destinationFolderId) {
              try {
                const location = await api.sheets.getSheetLocation(sheetId);
                destinationFolderId = location.folderId;
              } catch (error) {
                logger.warn("Failed to get sheet location, using default folder", { error });
              }
            }
            
            const result = await api.sheets.copySheet(sheetId, destinationName, destinationFolderId);
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          } catch (error: any) {
            logger.error(`Failed to copy sheet ${sheetId} to "${destinationName}"`, { error });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to copy sheet: ${error.message}`
                }
              ],
              isError: true
            };
          }
        }
      );
      
      // Tool: Create Sheet
      server.tool(
        "create_sheet",
        "Creates a new sheet",
        {
          name: z.string().describe("Name for the new sheet"),
          columns: z.array(
            z.object({
              title: z.string().describe("Column title"),
              type: z.string().describe("Column type"),
              primary: z.boolean().optional().describe("Whether this is the primary column"),
            })
          ).describe("Array of column objects"),
          folderId: z.string().optional().describe("ID of the folder where the sheet should be created"),
        },
        async ({ name, columns, folderId }) => {
          try {
            logger.info(`Creating new sheet "${name}"`);
            const result = await api.sheets.createSheet(name, columns, folderId);
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          } catch (error: any) {
            logger.error(`Failed to create sheet "${name}"`, { error });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to create sheet: ${error.message}`
                }
              ],
              isError: true
            };
          }
        }
      );
      
      // Tool: Get Sheet Discussions
      server.tool(
        "get_sheet_discussions",
        "Retrieves the discussions for a sheet",
        {
          sheetId: z.string().describe("The ID of the sheet"),
          include: z.string().optional().describe("Optional parameter to include additional information (e.g., 'attachments')"),
          pageSize: z.number().optional().describe("Number of discussions to return per page"),
          page: z.number().optional().describe("Page number to return"),
          includeAll: z.boolean().optional().describe("Whether to include all results"),
        },
        async ({ sheetId, include, pageSize, page, includeAll }) => {
          try {
            logger.info(`Getting discussions for sheet ${sheetId}`);
            const discussions = await api.sheets.getSheetDiscussions(sheetId, include, pageSize, page, includeAll);
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(discussions, null, 2)
                }
              ]
            };
          } catch (error: any) {
            logger.error(`Failed to get discussions for sheet ${sheetId}`, { error });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to get sheet discussions: ${error.message}`
                }
              ],
              isError: true
            };
          }
        }
      );
      
      // Tool: Create Row Discussion
      server.tool(
        "create_row_discussion",
        "Creates a discussion on a specific row",
        {
          sheetId: z.string().describe("The ID of the sheet"),
          rowId: z.string().describe("The ID of the row"),
          commentText: z.string().describe("Text of the comment to add"),
        },
        async ({ sheetId, rowId, commentText }) => {
          try {
            logger.info(`Creating discussion on row ${rowId} in sheet ${sheetId}`);
            const result = await api.sheets.createRowDiscussion(sheetId, rowId, commentText);
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          } catch (error: any) {
            logger.error(`Failed to create discussion on row ${rowId} in sheet ${sheetId}`, { error });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to create row discussion: ${error.message}`
                }
              ],
              isError: true
            };
          }
        }
      );

}
