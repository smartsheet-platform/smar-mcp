#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
import { getReportTools } from "./tools/smartsheet-report-tools.js";
import { getColumnTools } from "./tools/smartsheet-column-tools.js";
import { getAttachmentTools } from "./tools/smartsheet-attachment-tools.js";
import { getWebhookTools } from "./tools/smartsheet-webhook-tools.js";
import { getShareTools } from "./tools/smartsheet-share-tools.js";
import { getCrossSheetTools } from "./tools/smartsheet-crosssheet-tools.js";
import { getBulkTools } from "./tools/smartsheet-bulk-tools.js";
import { getExportTools } from "./tools/smartsheet-export-tools.js";
import { getSummaryTools } from "./tools/smartsheet-summary-tools.js";
import { getTemplateTools } from "./tools/smartsheet-template-tools.js";
import { getFavoritesTools } from "./tools/smartsheet-favorites-tools.js";
import { getGroupsTools } from "./tools/smartsheet-groups-tools.js";
import { getEventsTools } from "./tools/smartsheet-events-tools.js";

// Load environment variables
config();

// Control whether deletion operations are enabled
const allowDeleteTools = process.env.ALLOW_DELETE_TOOLS === 'true';
console.info(`Delete operations are ${allowDeleteTools ? 'enabled' : 'disabled'}`);
  
// Initialize the MCP server
const server = new McpServer({
  name: "smartsheet",
  version: "1.0.0",
});

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

// Tool: Report tools
getReportTools(server, api);

// Tool: Column tools
getColumnTools(server, api, allowDeleteTools);

// Tool: Attachment tools
getAttachmentTools(server, api, allowDeleteTools);

// Tool: Webhook tools
getWebhookTools(server, api, allowDeleteTools);

// Tool: Share tools
getShareTools(server, api, allowDeleteTools);

// Tool: Cross-sheet reference tools
getCrossSheetTools(server, api);

// Tool: Bulk operations tools
getBulkTools(server, api, allowDeleteTools);

// Tool: Export/Import tools
getExportTools(server, api);

// Tool: Summary fields tools
getSummaryTools(server, api, allowDeleteTools);

// Tool: Template tools
getTemplateTools(server, api);

// Tool: Favorites tools
getFavoritesTools(server, api, allowDeleteTools);

// Tool: Groups tools
getGroupsTools(server, api, allowDeleteTools);

// Tool: Events/Audit tools
getEventsTools(server, api);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.info("Smartsheet MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main()", { error });
  process.exit(1);
});