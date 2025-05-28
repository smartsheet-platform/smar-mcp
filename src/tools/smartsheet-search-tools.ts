import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

export function getSearchTools(server: McpServer, api: SmartsheetAPI) {

    server.tool(
        "search_sheets",
        "Search for sheets by name, cell data, or summary fields",
        {
        query: z.string().describe("Text to search for in sheet names, cell data, or summary fields"),
        },
        async ({ query }) => {
        try {
            console.info(`[Tool] Searching for sheets with query: ${query}`);
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
            console.error("[Error] in search_sheets:", error);
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

}
