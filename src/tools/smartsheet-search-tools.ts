import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";
import { withComponent } from "../utils/logger.js";

// Create component-specific logger
const searchLogger = withComponent('search-tools');

export function getSearchTools(server: McpServer, api: SmartsheetAPI) {

    server.tool(
        "search_sheets",
        "Search for sheets by name, cell data, or summary fields",
        {
        query: z.string().describe("Text to search for in sheet names, cell data, or summary fields"),
        },
        async ({ query }) => {
        try {
            searchLogger.info(`Searching for sheets`, { query });
            const results = await api.search.searchSheets(query);
            
            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(results, null, 2)
                }
            ]
            };
        } catch (error: any) {
            searchLogger.error(`Failed to search for sheets`, { 
                query,
                error: error instanceof Error ? error.message : String(error),
                stack: error.stack 
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for sheets: ${error instanceof Error ? error.message : String(error)}`
                }
            ],
            isError: true
            };
        }
        }
    );

    server.tool(
        "search_in_sheet",
        "Search cell data and summary fields for a specific sheet",
        {
            sheetId: z.string().describe("The ID of the sheet to retrieve"),
            query: z.string().describe("Text to search for in sheet names, cell data, or summary fields"),
        },
        async ({ sheetId, query }) => {
        try {
            searchLogger.info(`Searching in sheet`, { sheetId, query });
            const results = await api.search.searchSheet(sheetId, query);
            
            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(results, null, 2)
                }
            ]
            };
        } catch (error: any) {
            searchLogger.error(`Failed to search in sheet`, { 
                sheetId,
                query,
                error: error instanceof Error ? error.message : String(error),
                stack: error.stack 
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search in sheet: ${error instanceof Error ? error.message : String(error)}`
                }
            ],
            isError: true
            };
        }
        }
    );

    server.tool(
        "search_in_sheet_by_url",
        "Search cell data and summary fields for a specific sheet by URL",
        {
            url: z.string().describe("The URL of the sheet to retrieve"),
            query: z.string().describe("Text to search for in sheet names, cell data, or summary fields"),
        },
        async ({ url, query }) => {
        try {
            searchLogger.info(`Searching in sheet by URL`, { url, query });
            const match = url.match(/\/sheets\/([^?/]+)/);
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
            const sheet = await api.sheets.getSheetByDirectIdToken(directIdToken);
            const results = await api.search.searchSheet(sheet.id, query);
            
            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(results, null, 2)
                }
            ]
            };
        } catch (error: any) {
            searchLogger.error(`Failed to search in sheet by URL`, { 
                url,
                query,
                error: error instanceof Error ? error.message : String(error),
                stack: error.stack 
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search in sheet: ${error instanceof Error ? error.message : String(error)}`
                }
            ],
            isError: true
            };
        }
        }
    );

    server.tool(
        "what_am_i_assigned_to_by_sheet_id",
        "Search a sheet by ID to find assigned tasks",
        {
            sheetId: z.string().describe("The ID of the sheet to retrieve"),
        },
        async ({ sheetId }) => {
        try {
            const user = await api.users.getCurrentUser();
            const results = await api.search.searchSheet(sheetId, user.email);
            
            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(results, null, 2)
                }
            ]
            };
        } catch (error: any) {
            searchLogger.error(`Failed to search for assigned tasks`, { 
                sheetId,
                error: error instanceof Error ? error.message : String(error),
                stack: error.stack 
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for assigned tasks in sheet: ${error instanceof Error ? error.message : String(error)}`
                }
            ],
            isError: true
            };
        }
        }
    );

    server.tool(
        "what_am_i_assigned_to_by_sheet_url",
        "Search a sheet by URL to find assigned tasks",
        {
            url: z.string().describe("The URL of the sheet to retrieve"),
        },
        async ({ url }) => {
        try {
            const user = await api.users.getCurrentUser();
            const match = url.match(/\/sheets\/([^?/]+)/);
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
            const sheet = await api.sheets.getSheetByDirectIdToken(directIdToken);
            const results = await api.search.searchSheet(sheet.id, user.email);
            
            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(results, null, 2)
                }
            ]
            };
        } catch (error: any) {
            searchLogger.error(`Failed to search for assigned tasks by URL`, { 
                url,
                error: error instanceof Error ? error.message : String(error),
                stack: error.stack 
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for assigned tasks in sheet: ${error instanceof Error ? error.message : String(error)}`
                }
            ],
            isError: true
            };
        }
        }
    );

    server.tool(
        "search_folders",
        "Search for folders by name",
        {
        query: z.string().describe("Text to search for in folder names"),
        },
        async ({ query }) => {
        try {
            searchLogger.info(`Searching for folders`, { query });
            const results = await api.search.searchFolders(query);
            
            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(results, null, 2)
                }
            ]
            };
        } catch (error: any) {
            searchLogger.error(`Failed to search for folders`, { 
                query,
                error: error instanceof Error ? error.message : String(error),
                stack: error.stack 
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for folders: ${error instanceof Error ? error.message : String(error)}`
                }
            ],
            isError: true
            };
        }
        }
    );

    server.tool(
        "search_workspaces",
        "Search for workspaces by name",
        {
        query: z.string().describe("Text to search for in workspace names"),
        },
        async ({ query }) => {
        try {
            searchLogger.info(`Searching for workspaces`, { query });
            const results = await api.search.searchWorkspaces(query);
            
            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(results, null, 2)
                }
            ]
            };
        } catch (error: any) {
            searchLogger.error(`Failed to search for workspaces`, { 
                query,
                error: error instanceof Error ? error.message : String(error),
                stack: error.stack 
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for workspaces: ${error instanceof Error ? error.message : String(error)}`
                }
            ],
            isError: true
            };
        }
        }
    );

    server.tool(
        "search_reports",
        "Search for reports by name",
        {
        query: z.string().describe("Text to search for in report names"),
        },
        async ({ query }) => {
        try {
            searchLogger.info(`Searching for reports`, { query });
            const results = await api.search.searchReports(query);
            
            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(results, null, 2)
                }
            ]
            };
        } catch (error: any) {
            searchLogger.error(`Failed to search for reports`, { 
                query,
                error: error instanceof Error ? error.message : String(error),
                stack: error.stack 
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for reports: ${error instanceof Error ? error.message : String(error)}`
                }
            ],
            isError: true
            };
        }
        }
    );

    server.tool(
        "search_dashboards",
        "Search for dashboards by name",
        {
        query: z.string().describe("Text to search for in dashboard names"),
        },
        async ({ query }) => {
        try {
            searchLogger.info(`Searching for dashboards`, { query });
            const results = await api.search.searchDashboards(query);
            
            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(results, null, 2)
                }
            ]
            };
        } catch (error: any) {
            searchLogger.error(`Failed to search for dashboards`, { 
                query,
                error: error instanceof Error ? error.message : String(error),
                stack: error.stack 
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for dashboards: ${error instanceof Error ? error.message : String(error)}`
                }
            ],
            isError: true
            };
        }
        }
    );

}
