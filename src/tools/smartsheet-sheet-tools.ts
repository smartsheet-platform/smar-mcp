import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SmartsheetAPI } from '../apis/smartsheet-api.js';
import { z } from 'zod';
import { Logger } from '../utils/logger.js';

export function getSheetTools(
  server: McpServer,
  api: SmartsheetAPI,
  allowDeleteTools: boolean,
  safeMode: boolean,
) {
  // Tool: Get Sheet
  const getSheetSchema = {
    sheetId: z.string().describe('The ID of the sheet to retrieve'),
    include: z
      .string()
      .optional()
      .describe("Comma-separated list of elements to include (e.g., 'format,formulas')"),
    pageSize: z.number().optional().describe('Deprecated. Use `limit` instead.'),
    page: z.number().optional().describe('Deprecated. Use `limit` instead.'),
    limit: z
      .number()
      .optional()
      .describe('Number of rows to return. Default is 50. Set to -1 for all rows.'),
  };

  server.tool(
    'get_sheet',
    'Retrieves the current state of a sheet, including rows, columns, and cells',
    getSheetSchema as any,
    async (args: any) => {
      const { sheetId, include, pageSize, page, limit } = args;
      try {
        Logger.info(`Getting sheet with ID: ${sheetId}. Limit: ${limit}`);

        let sheet;
        if (limit === -1) {
          // Unlimited read - fetch all rows
          sheet = await api.sheets.getAllRows(sheetId, include);
        } else {
          // Smart Truncation
          const effectiveLimit = limit !== undefined ? limit : 50; // Default to 50
          const effectivePageSize = pageSize || effectiveLimit; // Map limit to pageSize if possible
          const effectivePage = page || 1;

          // If limit is specific (e.g. 10), we can just set pageSize=10
          // If limit is larger than max pageSize (500?), we might need multiple pages, but for now
          // we will rely on mapped pageSize for simplicity unless -1 is used.

          sheet = await api.sheets.getSheet(
            sheetId,
            include,
            undefined,
            effectivePageSize,
            effectivePage,
          );
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(sheet, null, 2),
            },
          ],
        };
      } catch (error: any) {
        Logger.error(`Failed to get sheet with ID: ${sheetId}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to get sheet: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  const getSheetSummarySchema = {
    sheetId: z.string().describe('The ID of the sheet to summarize'),
  };

  server.tool(
    'get_sheet_summary',
    'Retrieves a lightweight summary of a sheet (columns + top 5 rows). Use this before `get_sheet` to verify context.',
    getSheetSummarySchema as any,
    async (args: any) => {
      const { sheetId } = args;
      try {
        Logger.info(`Getting summary for sheet: ${sheetId}`);
        const summary = await api.sheets.getSheetSummary(sheetId);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      } catch (error: any) {
        Logger.error(`Failed to get summary for sheet: ${sheetId}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to get sheet summary: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  const getSheetByUrlSchema = {
    url: z.string().describe('The URL of the sheet to retrieve'),
    include: z
      .string()
      .optional()
      .describe("Comma-separated list of elements to include (e.g., 'format,formulas')"),
    pageSize: z.number().optional().describe('Number of rows to return per page'),
    page: z.number().optional().describe('Page number to return'),
  };

  server.tool(
    'get_sheet_by_url',
    'Retrieves the current state of a sheet, including rows, columns, and cells',
    getSheetByUrlSchema as any,
    async (args: any) => {
      const { url, include, pageSize, page } = args;
      try {
        Logger.info(`Getting sheet with URL: ${url}`);
        const match = url.match(/sheets\/([^/?]+)/);
        const directIdToken = match ? match[1] : null;
        if (!directIdToken) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Failed to get sheet: Invalid URL format`,
              },
            ],
            isError: true,
          };
        }
        const sheet = await api.sheets.getSheetByDirectIdToken(
          directIdToken,
          include,
          undefined,
          pageSize,
          page,
        );

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(sheet, null, 2),
            },
          ],
        };
      } catch (error: any) {
        Logger.error(`Failed to get sheet with URL: ${url}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to get sheet: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  const getSheetVersionSchema = {
    sheetId: z.string().describe('The ID of the sheet'),
  };

  server.tool(
    'get_sheet_version',
    'Gets the current version number of a sheet',
    getSheetVersionSchema as any,
    async (args: any) => {
      const { sheetId } = args;
      try {
        Logger.info(`Getting version for sheet with ID: ${sheetId}`);
        const version = await api.sheets.getSheetVersion(sheetId);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(version, null, 2),
            },
          ],
        };
      } catch (error: any) {
        Logger.error(`Failed to get sheet version for sheet ID: ${sheetId}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to get sheet version: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Tool: Get Cell History
  const getCellHistorySchema = {
    sheetId: z.string().describe('The ID of the sheet'),
    rowId: z.string().describe('The ID of the row'),
    columnId: z.string().describe('The ID of the column'),
    include: z.string().optional().describe('Optional parameter to include additional information'),
    pageSize: z.number().optional().describe('Number of history entries to return per page'),
    page: z.number().optional().describe('Page number to return'),
  };

  server.tool(
    'get_cell_history',
    'Retrieves the history of changes for a specific cell',
    getCellHistorySchema as any,
    async (args: any) => {
      const { sheetId, rowId, columnId, include, pageSize, page } = args;
      try {
        Logger.info(
          `Getting history for cell at row ${rowId}, column ${columnId} in sheet ${sheetId}`,
        );
        const history = await api.sheets.getCellHistory(
          sheetId,
          rowId,
          columnId,
          include,
          pageSize,
          page,
        );
        // Wait, original call: getCellHistory(..., include, pageSize, page, 167?) lines 166-167?
        // Let's check original. 'page' was last arg.
        // Step 941 line 166: page,
        // line 167: );
        // So no extra arg.

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(history, null, 2),
            },
          ],
        };
      } catch (error: any) {
        Logger.error(
          `Failed to get cell history for row ${rowId}, column ${columnId} in sheet ${sheetId}`,
          { error },
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to get cell history: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Tool: Get Row
  const getRowSchema = {
    sheetId: z.string().describe('The ID of the sheet'),
    rowId: z.string().describe('The ID of the row'),
    include: z
      .string()
      .optional()
      .describe("Comma-separated list of elements to include (e.g., 'format,formulas')"),
  };

  server.tool(
    'get_row',
    'Retrieves a specific row from a sheet',
    getRowSchema as any,
    async (args: any) => {
      const { sheetId, rowId, include } = args;
      try {
        Logger.info(`Getting row ${rowId} in sheet ${sheetId}`);
        const row = await api.sheets.getRow(sheetId, rowId, include);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(row, null, 2),
            },
          ],
        };
      } catch (error: any) {
        Logger.error(`Failed to get row ${rowId} in sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to get row: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Tool: Update Rows
  const updateRowsSchema = {
    sheetId: z.string().describe('The ID of the sheet'),
    rows: z
      .array(
        z.object({
          id: z.string().describe('Row ID'),
          cells: z
            .array(
              z.object({
                columnId: z.number().or(z.string()).describe('Column ID'),
                value: z.any().optional().describe('Cell value'),
                formula: z.string().optional().describe('Cell formula'),
                format: z.string().optional().describe('Cell format'),
              }),
            )
            .describe('Array of cell objects'),
        }),
      )
      .describe('Array of row objects to update'),
    dry_run: z.boolean().optional().describe('Simulate the update only (no actual change)'),
  };

  server.tool(
    'update_rows',
    'Updates rows in a sheet, including cell values, formatting, and formulae',
    updateRowsSchema as any,
    async (args: any) => {
      const { sheetId, rows, dry_run } = args;
      try {
        Logger.info(`Updating ${rows.length} rows in sheet ${sheetId}. Dry Run: ${dry_run}`);

        if (dry_run) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  {
                    resultCode: 0,
                    message: `[Dry Run] Would update ${rows.length} rows in sheet ${sheetId}`,
                    result: rows,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        const result = await api.sheets.updateRows(sheetId, rows);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        Logger.error(`Failed to update ${rows.length} rows in sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to update rows: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Tool: Add Rows
  const addRowsSchema = {
    sheetId: z.string().describe('The ID of the sheet'),
    // Batch options
    toTop: z.boolean().optional().describe('Add all rows to the top of the sheet'),
    toBottom: z.boolean().optional().describe('Add all rows to the bottom of the sheet'),
    parentId: z
      .string()
      .or(z.number())
      .optional()
      .describe('ID of parent row to nest all rows under'),
    siblingId: z
      .string()
      .or(z.number())
      .optional()
      .describe('ID of sibling row to insert all rows next to'),
    rows: z
      .array(
        z.object({
          // Row-specific options (fallback if batch options not used)
          toTop: z.boolean().optional().describe('Add THIS row to the top'),
          toBottom: z.boolean().optional().describe('Add THIS row to the bottom'),
          cells: z
            .array(
              z.object({
                columnId: z.number().or(z.string()).describe('Column ID'),
                value: z.any().optional().describe('Cell value'),
                formula: z.string().optional().describe('Cell formula'),
                format: z.string().optional().describe('Cell format'),
              }),
            )
            .describe('Array of cell objects'),
        }),
      )
      .describe('Array of row objects to add'),
    dry_run: z.boolean().optional().describe('Simulate the add only (no actual change)'),
  };

  server.tool('add_rows', 'Adds new rows to a sheet', addRowsSchema as any, async (args: any) => {
    const { sheetId, rows, toTop, toBottom, parentId, siblingId, dry_run } = args;
    try {
      Logger.info(`Adding ${rows.length} rows to sheet ${sheetId}. Dry Run: ${dry_run}`);

      if (dry_run) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  resultCode: 0,
                  message: `[Dry Run] Would add ${rows.length} rows to sheet ${sheetId}`,
                  result: rows,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      const result = await api.sheets.addRows(sheetId, rows, {
        toTop,
        toBottom,
        parentId,
        siblingId,
      });

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      Logger.error(`Failed to add ${rows.length} rows to sheet ${sheetId}`, { error });
      return {
        content: [
          {
            type: 'text' as const,
            text: `Failed to add rows: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Tool: Delete Rows (conditionally registered)
  if (allowDeleteTools) {
    const deleteRowsSchema = {
      sheetId: z.string().describe('The ID of the sheet'),
      rowIds: z.array(z.string()).describe('Array of row IDs to delete'),
      ignoreRowsNotFound: z
        .boolean()
        .optional()
        .describe("If true, don't throw an error if rows are not found"),
      dry_run: z.boolean().optional().describe('Simulate the delete only (no actual change)'),
    };

    server.tool(
      'delete_rows',
      'Deletes rows from a sheet',
      deleteRowsSchema as any,
      async (args: any) => {
        const { sheetId, rowIds, ignoreRowsNotFound, dry_run } = args;
        try {
          Logger.info(
            `Deleting ${rowIds.length} rows from sheet ${sheetId}. SafeMode: ${safeMode}, DryRun: ${dry_run}`,
          );

          // Safety Check: Bulk Delete Protection
          if (safeMode && rowIds.length > 1) {
            const errorMsg =
              'Bulk delete is disabled in Safe Mode. You can only delete 1 row at a time.';
            Logger.warn(errorMsg);
            return {
              content: [
                {
                  type: 'text' as const,
                  text: `Failed to delete rows: ${errorMsg}`,
                },
              ],
              isError: true,
            };
          }

          if (dry_run) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify(
                    {
                      resultCode: 0,
                      message: `[Dry Run] Would delete ${rowIds.length} rows from sheet ${sheetId}`,
                      result: rowIds,
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          }

          const result = await api.sheets.deleteRows(sheetId, rowIds, ignoreRowsNotFound);

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error: any) {
          Logger.error(`Failed to delete ${rowIds.length} rows from sheet ${sheetId}`, { error });
          return {
            content: [
              {
                type: 'text' as const,
                text: `Failed to delete rows: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );
  } else {
    Logger.warn('Delete operations are disabled. Set ALLOW_DELETE_TOOLS=true to enable them.');
  }

  // Tool: Get Sheet Location
  const getSheetLocationSchema = {
    sheetId: z.string().describe('The ID of the sheet'),
  };

  server.tool(
    'get_sheet_location',
    'Gets the folder ID where a sheet is located',
    getSheetLocationSchema as any,
    async (args: any) => {
      const { sheetId } = args;
      try {
        Logger.info(`Getting location for sheet ${sheetId}`);
        const location = await api.sheets.getSheetLocation(sheetId);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(location, null, 2),
            },
          ],
        };
      } catch (error: any) {
        Logger.error(`Failed to get location for sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to get sheet location: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Tool: Copy Sheet
  const copySheetSchema = {
    sheetId: z.string().describe('The ID of the sheet to copy'),
    destinationName: z.string().describe('Name for the sheet copy'),
    destinationFolderId: z
      .string()
      .optional()
      .describe('ID of the destination folder (same as source if not specified)'),
  };

  server.tool(
    'copy_sheet',
    'Creates a copy of the specified sheet in the same folder',
    copySheetSchema as any,
    async (args: any) => {
      const { sheetId, destinationName, destinationFolderId } = args;
      try {
        Logger.info(`Copying sheet ${sheetId} to "${destinationName}"`);

        // If no destination folder is specified, get the current folder
        let folderId = destinationFolderId;
        if (!folderId) {
          try {
            const location = await api.sheets.getSheetLocation(sheetId);
            folderId = location.folderId;
          } catch (error) {
            Logger.warn('Failed to get sheet location, using default folder');
          }
        }

        const result = await api.sheets.copySheet(sheetId, destinationName, folderId);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        Logger.error(`Failed to copy sheet ${sheetId} to "${destinationName}"`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to copy sheet: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Tool: Create Sheet
  const createSheetSchema = {
    name: z.string().describe('Name for the new sheet'),
    columns: z
      .array(
        z.object({
          title: z.string().describe('Column title'),
          type: z.string().describe('Column type'),
          primary: z.boolean().optional().describe('Whether this is the primary column'),
        }),
      )
      .describe('Array of column objects'),
    folderId: z.string().optional().describe('ID of the folder where the sheet should be created'),
  };

  server.tool(
    'create_sheet',
    'Creates a new sheet',
    createSheetSchema as any,
    async (args: any) => {
      const { name, columns, folderId } = args;
      try {
        Logger.info(`Creating new sheet "${name}"`);
        const result = await api.sheets.createSheet(name, columns, folderId);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        Logger.error(`Failed to create sheet "${name}"`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to create sheet: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  const getSheetFilteredSchema = {
    sheetId: z.string().describe('The ID of the sheet'),
    filter: z
      .record(z.string())
      .describe(
        "Key-value pairs for filtering (e.g. { 'Status': 'Open' }). Case-insensitive exact match.",
      ),
  };

  server.tool(
    'get_sheet_filtered',
    'Retrieves rows from a sheet that match specific criteria (Smart Scan). More efficient than reading the whole sheet.',
    getSheetFilteredSchema as any,
    async (args: any) => {
      const { sheetId, filter } = args;
      try {
        Logger.info(`Filtering sheet ${sheetId} with criteria: ${JSON.stringify(filter)}`);

        // 1. Get All Rows to ensure we can filter comprehensively
        const fullSheet = await api.sheets.getAllRows(sheetId);

        const rows = fullSheet.rows || [];
        const columns = fullSheet.columns || [];

        // 2. Map Column Names to IDs
        const criteria = Object.keys(filter);
        const columnMap = new Map<string, number>();

        for (const colName of criteria) {
          const col = columns.find((c: any) => c.title.toLowerCase() === colName.toLowerCase());
          if (!col) {
            throw new Error(`Column '${colName}' not found in sheet.`);
          }
          columnMap.set(colName, col.id);
        }

        // 3. Filter Rows
        const matches = rows.filter((row: any) => {
          return Object.entries(filter).every(([colName, searchVal]) => {
            const colId = columnMap.get(colName);
            const cell = row.cells.find((c: any) => c.columnId === colId);
            const cellVal =
              cell?.value !== undefined && cell?.value !== null ? String(cell.value) : '';
            return cellVal.toLowerCase() === (searchVal as string).toLowerCase();
          });
        });

        Logger.info(`Found ${matches.length} matches.`);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(matches, null, 2),
            },
          ],
        };
      } catch (error: any) {
        Logger.error(`Failed to filter sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to filter sheet: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  const findRowsByColumnValueSchema = {
    sheetId: z.string().describe('The ID of the sheet'),
    columnId: z.number().describe('The ID of the column to search'),
    value: z.string().describe('The value to search for'),
  };

  server.tool(
    'find_rows_by_column_value',
    'Finds rows in a sheet where a specific column has a specific value (case-insensitive, linear scan)',
    findRowsByColumnValueSchema as any,
    async (args: any) => {
      const { sheetId, columnId, value } = args;
      try {
        Logger.info(
          `Searching sheet ${sheetId} for rows where column ${columnId} equals "${value}"`,
        );
        const rows = await api.sheets.findRows(sheetId, columnId, value);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(rows, null, 2),
            },
          ],
        };
      } catch (error: any) {
        Logger.error(`Failed to find rows in sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to find rows: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
