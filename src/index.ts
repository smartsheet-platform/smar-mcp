#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SmartsheetAPI } from './apis/smartsheet-api.js';
import { config } from 'dotenv';
// Tool imports moved to server.ts

import { Logger } from './utils/logger.js';
import { createServer } from './server.js';

// Load environment variables
config();

// Control whether deletion operations are enabled
const allowDeleteTools = process.env.ALLOW_DELETE_TOOLS === 'true';
const safeMode = process.env.SMARTSHEET_SAFE_MODE !== 'false'; // Default to true
Logger.info(`Delete operations are ${allowDeleteTools ? 'enabled' : 'disabled'}`);
Logger.info(`Safe Mode is ${safeMode ? 'enabled' : 'disabled'}`);

// Initialize the direct API client
const api = new SmartsheetAPI(process.env.SMARTSHEET_API_KEY, process.env.SMARTSHEET_ENDPOINT);

// Create the MCP server
const server = createServer(api, allowDeleteTools, safeMode);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  Logger.info('Smartsheet MCP Server running on stdio');
}

main().catch((error) => {
  Logger.error('Fatal error in main()', { error });
  process.exit(1);
});
