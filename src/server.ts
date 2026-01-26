import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SmartsheetAPI } from './apis/smartsheet-api.js';
import { getDiscussionTools } from './tools/smartsheet-discussion-tools.js';
import { getFolderTools } from './tools/smartsheet-folder-tools.js';
import { getSearchTools } from './tools/smartsheet-search-tools.js';
import { getSheetTools } from './tools/smartsheet-sheet-tools.js';
import { getUpdateRequestTools } from './tools/smartsheet-update-request-tools.js';
import { getUserTools } from './tools/smartsheet-user-tools.js';
import { getWorkspaceTools } from './tools/smartsheet-workspace-tools.js';
import { getDocsTools } from './tools/smartsheet-docs-tools.js';

export function createServer(
  api: SmartsheetAPI,
  allowDeleteTools: boolean = false,
  safeMode: boolean = true,
): McpServer {
  const server = new McpServer({
    name: 'smartsheet',
    version: '1.0.0',
  });

  // Tool: Discussion tools
  getDiscussionTools(server, api);

  // Tool: Documentation tools
  getDocsTools(server);

  // Tool: Folder tools
  getFolderTools(server, api);

  // Tool: Search tools
  getSearchTools(server, api);

  // Tool: Sheet tools
  getSheetTools(server, api, allowDeleteTools, safeMode); // safeMode will be passed here in next step or via global config? Plan said "Load SMARTSHEET_SAFE_MODE env var. Pass safeMode config to tool registration."
  // Wait, createServer signature needs update too.

  // Tool: Update Request tools
  getUpdateRequestTools(server, api);

  // Tool: User tools
  getUserTools(server, api);

  // Tool: Workspace tools
  getWorkspaceTools(server, api);

  return server;
}
