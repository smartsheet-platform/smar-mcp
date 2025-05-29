import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";
import logger from "../utils/logger.js";

export function getSearchTools(server: McpServer, api: SmartsheetAPI) {

    server.tool(
        "search_sheets",
        "Search for sheets by name, cell data, or summary fields",
        {
        query: z.string().describe("Text to search for in sheet names, cell data, or summary fields"),
        },
        async ({ query }) => {
        try {
            logger.info(`Searching for sheets with query: ${query}`);
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
            logger.error(`Failed to search for sheets with query "${query}": ${error.message}`, { error });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for sheets: ${error.message}`
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
            logger.info(`Searching for sheet with ID: ${sheetId} with query: ${query}`);
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
            logger.error(`Failed to search in sheet ${sheetId} with query "${query}": ${error.message}`, { error });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search in sheet: ${error.message}`
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
            logger.info(`Searching for folders with query: ${query}`);
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
            logger.error(`Failed to search for folders with query: ${query}`, { error });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for folders: ${error.message}`
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
            logger.info(`Searching for workspaces with query: ${query}`);
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
            logger.error(`Failed to search for workspaces with query: ${query}`, { error });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for workspaces: ${error.message}`
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
            logger.info(`Searching for reports with query: ${query}`);
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
            logger.error(`Failed to search for reports with query: ${query}`, { error });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for reports: ${error.message}`
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
            logger.info(`Searching for dashboards with query: ${query}`);
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
            logger.error(`Failed to search for dashboards with query: ${query}`, { error });
            return {
            content: [
                {
                type: "text",
                text: `Failed to search for dashboards: ${error.message}`
                }
            ],
            isError: true
            };
        }
        }
    );

}
