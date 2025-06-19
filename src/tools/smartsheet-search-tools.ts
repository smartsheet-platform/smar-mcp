import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";
import { withComponent, formatError } from "../utils/logger.js";

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
                ...formatError(error)
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for sheets: ${formatError(error).message}`
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
                ...formatError(error)
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search in sheet: ${formatError(error).message}`
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
                ...formatError(error)
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search in sheet: ${formatError(error).message}`
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
                ...formatError(error)
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for assigned tasks in sheet: ${formatError(error).message}`
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
                ...formatError(error)
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for assigned tasks in sheet: ${formatError(error).message}`
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
                ...formatError(error)
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for folders: ${formatError(error).message}`
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
                ...formatError(error)
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for workspaces: ${formatError(error).message}`
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
                ...formatError(error)
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for reports: ${formatError(error).message}`
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
                ...formatError(error)
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for dashboards: ${formatError(error).message}`
                }
            ],
            isError: true
            };
        }
        }
    );

}
