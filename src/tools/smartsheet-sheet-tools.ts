import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Define a general type for the tool structure if needed, or use 'any'
// For simplicity, we'll use 'any' for the tools object for now.

export function getSheetTools(api: SmartsheetAPI, allowDeleteTools: boolean) {
    const tools: { [key: string]: any } = {};

    // Tool: get_sheet
    const getSheetSchema = z.object({
        sheetId: z.string().describe("The ID of the sheet to retrieve"),
        include: z.string().optional().describe("Comma-separated list of elements to include (e.g., 'format,formulas')"),
        pageSize: z.number().optional().describe("Number of rows to return per page"),
        page: z.number().optional().describe("Page number to return"),
    });
    tools["get_sheet"] = {
        name: "get_sheet",
        description: "Retrieves the current state of a sheet, including rows, columns, and cells",
        inputSchema: zodToJsonSchema(getSheetSchema),
        handler: async (params: z.infer<typeof getSheetSchema>) => {
            const { sheetId, include, pageSize, page } = params;
            try {
                console.error(`Getting sheet with ID: ${sheetId}`);
                const sheet = await api.sheets.getSheet(sheetId, include, undefined, pageSize, page);
                return { content: [{ type: "text", text: JSON.stringify(sheet, null, 2) }] };
            } catch (error: any) {
                console.error(`Failed to get sheet with ID: ${sheetId}`, { error });
                return { content: [{ type: "text", text: `Failed to get sheet: ${error.message}` }], isError: true };
            }
        }
    };

    // Tool: get_sheet_by_url
    const getSheetByUrlSchema = z.object({
        url: z.string().describe("The URL of the sheet to retrieve"),
        include: z.string().optional().describe("Comma-separated list of elements to include (e.g., 'format,formulas')"),
        pageSize: z.number().optional().describe("Number of rows to return per page"),
        page: z.number().optional().describe("Page number to return"),
    });
    tools["get_sheet_by_url"] = {
        name: "get_sheet_by_url",
        description: "Retrieves the current state of a sheet, including rows, columns, and cells",
        inputSchema: zodToJsonSchema(getSheetByUrlSchema),
        handler: async (params: z.infer<typeof getSheetByUrlSchema>) => {
            const { url, include, pageSize, page } = params;
            try {
                console.error(`Getting sheet with URL: ${url}`);
                const match = url.match(/\/sheets\/([^?]+)/);
                const directIdToken = match ? match[1] : null;
                if (!directIdToken) {
                    return { content: [{ type: "text", text: `Failed to get sheet: Invalid URL format` }], isError: true };
                }
                const sheet = await api.sheets.getSheetByDirectIdToken(directIdToken, include, undefined, pageSize, page);
                return { content: [{ type: "text", text: JSON.stringify(sheet, null, 2) }] };
            } catch (error: any) {
                console.error(`Failed to get sheet with URL: ${url}`, { error });
                return { content: [{ type: "text", text: `Failed to get sheet: ${error.message}` }], isError: true };
            }
        }
    };

    // Tool: get_sheet_version
    const getSheetVersionSchema = z.object({
        sheetId: z.string().describe("The ID of the sheet"),
    });
    tools["get_sheet_version"] = {
        name: "get_sheet_version",
        description: "Gets the current version number of a sheet",
        inputSchema: zodToJsonSchema(getSheetVersionSchema),
        handler: async (params: z.infer<typeof getSheetVersionSchema>) => {
            const { sheetId } = params;
            try {
                console.error(`Getting version for sheet with ID: ${sheetId}`);
                const version = await api.sheets.getSheetVersion(sheetId);
                return { content: [{ type: "text", text: JSON.stringify(version, null, 2) }] };
            } catch (error: any) {
                console.error(`Failed to get sheet version for sheet ID: ${sheetId}`, { error });
                return { content: [{ type: "text", text: `Failed to get sheet version: ${error.message}` }], isError: true };
            }
        }
    };

    // Tool: get_cell_history
    const getCellHistorySchema = z.object({
        sheetId: z.string().describe("The ID of the sheet"),
        rowId: z.string().describe("The ID of the row"),
        columnId: z.string().describe("The ID of the column"),
        include: z.string().optional().describe("Optional parameter to include additional information"),
        pageSize: z.number().optional().describe("Number of history entries to return per page"),
        page: z.number().optional().describe("Page number to return"),
    });
    tools["get_cell_history"] = {
        name: "get_cell_history",
        description: "Retrieves the history of changes for a specific cell",
        inputSchema: zodToJsonSchema(getCellHistorySchema),
        handler: async (params: z.infer<typeof getCellHistorySchema>) => {
            const { sheetId, rowId, columnId, include, pageSize, page } = params;
            try {
                console.error(`Getting history for cell at row ${rowId}, column ${columnId} in sheet ${sheetId}`);
                const history = await api.sheets.getCellHistory(sheetId, rowId, columnId, include, pageSize, page);
                return { content: [{ type: "text", text: JSON.stringify(history, null, 2) }] };
            } catch (error: any) {
                console.error(`Failed to get cell history for row ${rowId}, column ${columnId} in sheet ${sheetId}`, { error });
                return { content: [{ type: "text", text: `Failed to get cell history: ${error.message}` }], isError: true };
            }
        }
    };

    // Tool: get_row
    const getRowSchema = z.object({
        sheetId: z.string().describe("The ID of the sheet"),
        rowId: z.string().describe("The ID of the row"),
        include: z.string().optional().describe("Comma-separated list of elements to include (e.g., 'format,formulas')"),
    });
    tools["get_row"] = {
        name: "get_row",
        description: "Retrieves a specific row from a sheet",
        inputSchema: zodToJsonSchema(getRowSchema),
        handler: async (params: z.infer<typeof getRowSchema>) => {
            const { sheetId, rowId, include } = params;
            try {
                console.error(`Getting row ${rowId} in sheet ${sheetId}`);
                const row = await api.sheets.getRow(sheetId, rowId, include);
                return { content: [{ type: "text", text: JSON.stringify(row, null, 2) }] };
            } catch (error: any) {
                console.error(`Failed to get row ${rowId} in sheet ${sheetId}`, { error });
                return { content: [{ type: "text", text: `Failed to get row: ${error.message}` }], isError: true };
            }
        }
    };

    // Tool: update_rows
    const updateRowsSchema = z.object({
        sheetId: z.string().describe("The ID of the sheet"),
        rows: z.array(
            z.object({
                id: z.string().describe("Row ID"),
                cells: z.array(
                    z.object({
                        columnId: z.union([z.string(), z.number()]).describe("Column ID"),
                        value: z.any().optional().describe("Cell value"),
                        formula: z.string().optional().describe("Cell formula"),
                        format: z.string().optional().describe("Cell format"),
                    })
                ).describe("Array of cell objects"),
            })
        ).describe("Array of row objects to update"),
    });
    tools["update_rows"] = {
        name: "update_rows",
        description: "Updates rows in a sheet, including cell values, formatting, and formulae",
        inputSchema: zodToJsonSchema(updateRowsSchema),
        handler: async (params: z.infer<typeof updateRowsSchema>) => {
            const { sheetId, rows } = params;
            try {
                console.error(`Updating ${rows.length} rows in sheet ${sheetId}`);
                const result = await api.sheets.updateRows(sheetId, rows as any); // Cast rows if type inference mismatch with SDK
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                console.error(`Failed to update ${rows.length} rows in sheet ${sheetId}`, { error });
                return { content: [{ type: "text", text: `Failed to update rows: ${error.message}` }], isError: true };
            }
        }
    };

    // Tool: add_rows
    const addRowsSchema = z.object({
        sheetId: z.string().describe("The ID of the sheet"),
        rows: z.array(
            z.object({
                toTop: z.boolean().optional().describe("Add row to the top of the sheet"),
                toBottom: z.boolean().optional().describe("Add row to the bottom of the sheet"),
                cells: z.array(
                    z.object({
                        columnId: z.union([z.string(), z.number()]).describe("Column ID"),
                        value: z.any().optional().describe("Cell value"),
                        formula: z.string().optional().describe("Cell formula"),
                        format: z.string().optional().describe("Cell format"),
                    })
                ).describe("Array of cell objects"),
            })
        ).describe("Array of row objects to add"),
    });
    tools["add_rows"] = {
        name: "add_rows",
        description: "Adds new rows to a sheet",
        inputSchema: zodToJsonSchema(addRowsSchema),
        handler: async (params: z.infer<typeof addRowsSchema>) => {
            const { sheetId, rows } = params;
            try {
                console.error(`Adding ${rows.length} rows to sheet ${sheetId}`);
                const result = await api.sheets.addRows(sheetId, rows as any); // Cast rows if type inference mismatch with SDK
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                console.error(`Failed to add ${rows.length} rows to sheet ${sheetId}`, { error });
                return { content: [{ type: "text", text: `Failed to add rows: ${error.message}` }], isError: true };
            }
        }
    };

    // Tool: get_sheet_location
    const getSheetLocationSchema = z.object({
        sheetId: z.string().describe("The ID of the sheet"),
    });
    tools["get_sheet_location"] = {
        name: "get_sheet_location",
        description: "Gets the folder ID where a sheet is located",
        inputSchema: zodToJsonSchema(getSheetLocationSchema),
        handler: async (params: z.infer<typeof getSheetLocationSchema>) => {
            const { sheetId } = params;
            try {
                console.info(`Getting location for sheet ${sheetId}`);
                const location = await api.sheets.getSheetLocation(sheetId);
                return { content: [{ type: "text", text: JSON.stringify(location, null, 2) }] };
            } catch (error: any) {
                console.error(`Failed to get location for sheet ${sheetId}`, { error });
                return { content: [{ type: "text", text: `Failed to get sheet location: ${error.message}` }], isError: true };
            }
        }
    };

    // Tool: copy_sheet
    const copySheetSchema = z.object({
        sheetId: z.string().describe("The ID of the sheet to copy"),
        destinationName: z.string().describe("Name for the sheet copy"),
        destinationFolderId: z.string().optional().describe("ID of the destination folder (same as source if not specified)"),
    });
    tools["copy_sheet"] = {
        name: "copy_sheet",
        description: "Creates a copy of the specified sheet in the same folder",
        inputSchema: zodToJsonSchema(copySheetSchema),
        handler: async (params: z.infer<typeof copySheetSchema>) => {
            let { sheetId, destinationName, destinationFolderId } = params;
            try {
                console.info(`Copying sheet ${sheetId} to "${destinationName}"`);
                if (!destinationFolderId) {
                    try {
                        const location = await api.sheets.getSheetLocation(sheetId);
                        destinationFolderId = location.folderId;
                    } catch (error) {
                        console.warn("Failed to get sheet location, using default folder", { error });
                        // destinationFolderId remains undefined, Smartsheet API might handle it or use a default
                    }
                }
                const result = await api.sheets.copySheet(sheetId, destinationName, destinationFolderId);
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                console.error(`Failed to copy sheet ${sheetId} to "${destinationName}"`, { error });
                return { content: [{ type: "text", text: `Failed to copy sheet: ${error.message}` }], isError: true };
            }
        }
    };

    // Tool: create_sheet
    const createSheetSchema = z.object({
        name: z.string().describe("Name for the new sheet"),
        columns: z.array(
            z.object({
                title: z.string().describe("Column title"),
                type: z.string().describe("Column type"), // Consider using z.enum for specific column types if applicable
                primary: z.boolean().optional().describe("Whether this is the primary column"),
            })
        ).describe("Array of column objects"),
        folderId: z.string().optional().describe("ID of the folder where the sheet should be created"),
    });
    tools["create_sheet"] = {
        name: "create_sheet",
        description: "Creates a new sheet",
        inputSchema: zodToJsonSchema(createSheetSchema),
        handler: async (params: z.infer<typeof createSheetSchema>) => {
            const { name, columns, folderId } = params;
            try {
                console.info(`Creating new sheet "${name}"`);
                const result = await api.sheets.createSheet(name, columns as any, folderId); // Cast columns if type inference mismatch
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                console.error(`Failed to create sheet "${name}"`, { error });
                return { content: [{ type: "text", text: `Failed to create sheet: ${error.message}` }], isError: true };
            }
        }
    };

    // Conditionally add delete_rows tool
    if (allowDeleteTools) {
        const deleteRowsSchema = z.object({
            sheetId: z.string().describe("The ID of the sheet"),
            rowIds: z.array(z.string()).describe("Array of row IDs to delete"),
            ignoreRowsNotFound: z.boolean().optional().describe("If true, don't throw an error if rows are not found"),
        });
        tools["delete_rows"] = {
            name: "delete_rows",
            description: "Deletes rows from a sheet",
            inputSchema: zodToJsonSchema(deleteRowsSchema),
            handler: async (params: z.infer<typeof deleteRowsSchema>) => {
                const { sheetId, rowIds, ignoreRowsNotFound } = params;
                try {
                    console.info(`Deleting ${rowIds.length} rows from sheet ${sheetId}`);
                    const result = await api.sheets.deleteRows(sheetId, rowIds, ignoreRowsNotFound);
                    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
                } catch (error: any) {
                    console.error(`Failed to delete ${rowIds.length} rows from sheet ${sheetId}`, { error });
                    return { content: [{ type: "text", text: `Failed to delete rows: ${error.message}` }], isError: true };
                }
            }
        };
    } else {
        console.error("Delete operations are disabled. Set ALLOW_DELETE_TOOLS=true to enable them.");
    }

    return tools;
}
