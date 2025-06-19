import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";
import { withComponent, formatError } from "../utils/logger.js";

// Create component-specific logger
const sheetLogger = withComponent('sheet-tools');

export function getSheetTools(server: McpServer, api: SmartsheetAPI, allowDeleteTools: boolean) {

    server.tool(
      "get_sheet",
      "Retrieves the current state of a sheet, including rows, columns, and cells",
      {
        sheetId: z.string().describe("The ID of the sheet to retrieve"),
        include: z.string().optional().describe("Comma-separated list of elements to include (e.g., 'format,formulas')"),
        pageSize: z.number().optional().describe("Number of rows to return per page"),
        page: z.number().optional().describe("Page number to return"),
      },
      async ({ sheetId, include, pageSize, page }) => {
        try {
          sheetLogger.info(`Getting sheet`, { sheetId, include, pageSize, page });
          const sheet = await api.sheets.getSheet(sheetId, include, undefined, pageSize, page);
          
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(sheet, null, 2)
              }
            ]
          };
        } catch (error: any) {
          sheetLogger.error(`Failed to get sheet`, { 
            sheetId, 
            ...formatError(error)
          });
          return {
            content: [
              {
                type: "text",
                text: `Failed to get sheet: ${formatError(error).message}`
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
        pageSize: z.number().optional().describe("Number of rows to return per page"),
        page: z.number().optional().describe("Page number to return"),
      },
      async ({ url, include, pageSize, page }) => {
        try {
          sheetLogger.info(`Getting sheet by URL`, { url, include, pageSize, page });
          const regex = /\/sheets\/([^?/]+)/;
          const match = regex.exec(url);
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
          const sheet = await api.sheets.getSheetByDirectIdToken(directIdToken, include, undefined, pageSize, page);
          
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(sheet, null, 2)
              }
            ]
          };
        } catch (error: any) {
          sheetLogger.error(`Failed to get sheet by URL`, { 
            url, 
            ...formatError(error)
          });
          return {
            content: [
              {
                type: "text",
                text: `Failed to get sheet: ${formatError(error).message}`
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
            sheetLogger.info(`Getting sheet version`, { sheetId });
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
            sheetLogger.error(`Failed to get sheet version`, { 
              sheetId, 
              ...formatError(error)
            });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to get sheet version: ${formatError(error).message}`
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
            sheetLogger.info(`Getting cell history`, { 
              sheetId,
              rowId,
              columnId,
              include,
              pageSize,
              page 
            });
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
            sheetLogger.error(`Failed to get cell history`, { 
              sheetId,
              rowId,
              columnId,
              ...formatError(error)
            });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to get cell history: ${formatError(error).message}`
                }
              ],
              isError: true
            };
          }
        }
      );

      // Tool: Get Row
      server.tool(
        "get_row",
        "Retrieves a specific row from a sheet",
        {
          sheetId: z.string().describe("The ID of the sheet"),
          rowId: z.string().describe("The ID of the row"),
          include: z.string().optional().describe("Comma-separated list of elements to include (e.g., 'format,formulas')"),
        },
        async ({ sheetId, rowId, include }) => {
          try {
            sheetLogger.info(`Getting row`, { sheetId, rowId, include });
            const row = await api.sheets.getRow(sheetId, rowId, include);
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(row, null, 2)
                }
              ]
            };
          } catch (error: any) {
            sheetLogger.error(`Failed to get row`, { 
              sheetId,
              rowId,
              ...formatError(error)
            });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to get row: ${formatError(error).message}`
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
            sheetLogger.info(`Updating rows`, { 
              sheetId,
              rowCount: rows.length,
              rowIds: rows.map(r => r.id)
            });
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
            sheetLogger.error(`Failed to update rows`, { 
              sheetId,
              rowCount: rows.length,
              ...formatError(error)
            });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to update rows: ${formatError(error).message}`
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
            sheetLogger.info(`Adding rows`, { 
              sheetId,
              rowCount: rows.length 
            });
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
            sheetLogger.error(`Failed to add rows`, { 
              sheetId,
              rowCount: rows.length,
              ...formatError(error)
            });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to add rows: ${formatError(error).message}`
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
              sheetLogger.info(`Deleting rows`, { 
                sheetId,
                rowCount: rowIds.length,
                rowIds,
                ignoreRowsNotFound 
              });
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
              sheetLogger.error(`Failed to delete rows`, { 
                sheetId,
                rowCount: rowIds.length,
                ...formatError(error)
              });
              return {
                content: [
                  {
                    type: "text",
                    text: `Failed to delete rows: ${formatError(error).message}`
                  }
                ],
                isError: true
              };
            }
          }
        );
      } else {
        sheetLogger.warn("Delete operations are disabled", { 
          message: "Set ALLOW_DELETE_TOOLS=true to enable them" 
        });
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
            sheetLogger.info(`Getting sheet location`, { sheetId });
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
            sheetLogger.error(`Failed to get sheet location`, { 
              sheetId,
              ...formatError(error)
            });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to get sheet location: ${formatError(error).message}`
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
            sheetLogger.info(`Copying sheet`, { 
              sheetId,
              destinationName,
              destinationFolderId 
            });
            
            // If no destination folder is specified, get the current folder
            if (!destinationFolderId) {
              try {
                const location = await api.sheets.getSheetLocation(sheetId);
                destinationFolderId = location.folderId;
              } catch (error) {
                sheetLogger.warn("Failed to get sheet location, using default folder", { 
                  sheetId,
                  ...formatError(error)
                });
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
            sheetLogger.error(`Failed to copy sheet`, { 
              sheetId,
              destinationName,
              destinationFolderId,
              ...formatError(error)
            });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to copy sheet: ${formatError(error).message}`
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
            sheetLogger.info(`Creating new sheet`, { 
              name,
              columnCount: columns.length,
              folderId 
            });
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
            sheetLogger.error(`Failed to create sheet`, { 
              name,
              columnCount: columns.length,
              folderId,
              ...formatError(error)
            });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to create sheet: ${formatError(error).message}`
                }
              ],
              isError: true
            };
          }
        }
      );

}
