#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SmartsheetAPI } from "./apis/smartsheet-api.js";
import { config } from "dotenv";
import { logger } from "./utils/logger.js";
import { createNotificationLogger } from "./utils/notification-logger.js";
import { registerLoggingCapability } from "./server/logging-capability.js";
import { getDiscussionTools } from "./tools/smartsheet-discussion-tools.js";
import { getFolderTools } from "./tools/smartsheet-folder-tools.js";
import { getSearchTools } from "./tools/smartsheet-search-tools.js";
import { getSheetTools } from "./tools/smartsheet-sheet-tools.js";
import { getUpdateRequestTools } from "./tools/smartsheet-update-request-tools.js";
import { getUserTools } from "./tools/smartsheet-user-tools.js";
import { getWorkspaceTools } from "./tools/smartsheet-workspace-tools.js";

// Load environment variables
config();

// Control whether deletion operations are enabled
const allowDeleteTools = process.env.ALLOW_DELETE_TOOLS === 'true';
const enableLogNotifications = process.env.ENABLE_LOG_NOTIFICATIONS !== 'false';
logger.info(`Delete operations are ${allowDeleteTools ? 'enabled' : 'disabled'}, log notifications are ${enableLogNotifications ? 'enabled' : 'disabled'}`, { allowDeleteTools, enableLogNotifications });
  
// Initialize the MCP server
const server = new McpServer({
  name: "smartsheet",
  version: "1.0.0",
  logger: logger
});

// Register the logging capability and enable notifications
registerLoggingCapability(server);

// Create a notification-enabled logger if enabled via environment variable
let serverLogger = logger;
if (process.env.ENABLE_LOG_NOTIFICATIONS !== 'false') {
  serverLogger = createNotificationLogger(server);
}

// Log server startup with notification if enabled
serverLogger.info("Smartsheet MCP server starting", { version: "1.0.0" });

// Initialize the direct API client
const api = new SmartsheetAPI(process.env.SMARTSHEET_API_KEY, process.env.SMARTSHEET_ENDPOINT);

// Tool: Discussion tools
getDiscussionTools(server, api);

// Tool: Folder tools
getFolderTools(server, api);

// Tool: Search tools
getSearchTools(server, api);

// Tool: Sheet tools
getSheetTools(server, api, allowDeleteTools);

// Tool: Update Request tools
getUpdateRequestTools(server, api);

// Tool: User tools
getUserTools(server, api);

// Tool: Workspace tools
getWorkspaceTools(server, api); 

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("Smartsheet MCP Server running on stdio", { transport: "stdio" });
}

main().catch((error) => {
  logger.error("Fatal error in main()", { 
    error: error.message,
    stack: error.stack 
  });
  process.exit(1);
});