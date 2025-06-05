#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SmartsheetAPI } from "./apis/smartsheet-api.js";
import { config } from "dotenv";
import { getDiscussionTools } from "./tools/smartsheet-discussion-tools.js";
import { getFolderTools } from "./tools/smartsheet-folder-tools.js";
import { getSearchTools } from "./tools/smartsheet-search-tools.js";
import { getSheetTools } from "./tools/smartsheet-sheet-tools.js";
import { getUpdateRequestTools } from "./tools/smartsheet-update-request-tools.js";
import { getUserTools } from "./tools/smartsheet-user-tools.js";
import { getWorkspaceTools } from "./tools/smartsheet-workspace-tools.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Load environment variables
config();

// Control whether deletion operations are enabled
const allowDeleteTools = process.env.ALLOW_DELETE_TOOLS === 'true';
// Log to stderr to avoid interfering with JSON-RPC on stdout
console.error(`Delete operations are ${allowDeleteTools ? 'enabled' : 'disabled'}`);
  
// Initialize the MCP server
const server = new Server({
  name: "smartsheet",
  version: "1.0.0",
  capabilities: {
    requestHandlers: true,
    tools: true // Explicitly enable tools capability
  }
});

// Log capabilities immediately after server initialization for debugging
console.error("DEBUG: Server capabilities after init:", (server as any).capabilities);

// Initialize the direct API client
const api = new SmartsheetAPI(process.env.SMARTSHEET_API_KEY, process.env.SMARTSHEET_ENDPOINT);

// Collect all tool definitions
const allTools = {
    ...getFolderTools(api),
    ...getDiscussionTools(api),
    ...getSearchTools(api),
    ...getUserTools(api),
    ...getWorkspaceTools(api),
    ...getUpdateRequestTools(api),
    ...getSheetTools(api, allowDeleteTools)
};

// Log capabilities before setRequestHandler for debugging
console.error("DEBUG: Server capabilities before ListToolsRequestSchema:", (server as any).capabilities);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: Object.values(allTools).map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
        }))
    };
});

// Call a specific tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    if (!(name in allTools)) {
        throw new Error(`Unknown tool: ${name}`);
    }
    
    const tool = allTools[name as keyof typeof allTools];
    // Ensure args is an object, defaulting to empty if undefined or null
    const handlerArgs = args && typeof args === 'object' ? args : {};
    return await tool.handler(handlerArgs as any);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr to avoid interfering with JSON-RPC on stdout
  console.error("Smartsheet MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main()", { error });
  process.exit(1);
});