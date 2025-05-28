#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SmartsheetAPI } from "./apis/smartsheet-api.js";
import { config } from "dotenv";
import { getSearchTools } from "./tools/smartsheet-search-tools.js";
import { getSheetTools } from "./tools/smartsheet-sheet-tools.js";
import { getFolderTools } from "./tools/smartsheet-folder-tools.js";
import { getWorkspaceTools } from "./tools/smartsheet-workspace-tools.js";
import { getUpdateRequestTools } from "./tools/smartsheet-update-request-tools.js";
import { getUserTools } from "./tools/smartsheet-user-tools.js";

// Load environment variables
config();

// Control whether deletion operations are enabled
const allowDeleteTools = process.env.ALLOW_DELETE_TOOLS === 'true';
console.info(`[Config] Delete operations are ${allowDeleteTools ? 'enabled' : 'disabled'}`);
  
// Initialize the MCP server
const server = new McpServer({
  name: "smartsheet",
  version: "1.0.0",
});

// Initialize the direct API client
const api = new SmartsheetAPI(process.env.SMARTSHEET_API_KEY, process.env.SMARTSHEET_ENDPOINT);

// Tool: Search tools
getSearchTools(server, api);

// Tool: Sheet tools
getSheetTools(server, api, allowDeleteTools);

// Tool: Folder tools
getFolderTools(server, api);

// Tool: Workspace tools
getWorkspaceTools(server, api); 

// Tool: Update Request tools
getUpdateRequestTools(server, api);

// Tool: User tools
getUserTools(server, api);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.info("Smartsheet MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});