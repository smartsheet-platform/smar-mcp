// Example script for testing the create_archive_sheet tool
import { McpClient } from '@modelcontextprotocol/sdk/client/mcp.js';
import { ChildProcessServerTransport } from '@modelcontextprotocol/sdk/client/child-process.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables
config();

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  try {
    console.log('Starting Smartsheet MCP test...');
    
    // Create an MCP client that connects to the Smartsheet MCP server
    const transport = new ChildProcessServerTransport({
      command: 'node',
      args: [
        path.resolve(__dirname, '../build/index.js')
      ],
      env: {
        SMARTSHEET_API_KEY: process.env.SMARTSHEET_API_KEY
      }
    });
    
    console.log('Connecting to Smartsheet MCP server...');
    const client = new McpClient();
    await client.connect(transport);
    
    console.log('Connected to Smartsheet MCP server');
    
    // Get the server info
    const serverInfo = await client.getServerInfo();
    console.log('Server info:', serverInfo);
    
    // Define the sheet ID and timestamp
    const sheetId = '7532263697764228';
    const timestamp = '2025-03-27T13:00:00Z'; // 1:00 PM in UTC format
    
    console.log(`Creating archive sheet for sheet ${sheetId} at timestamp ${timestamp}...`);
    
    // Call the create_archive_sheet tool
    const result = await client.callTool('create_archive_sheet', {
      sheetId: sheetId,
      timestamp: timestamp,
      archiveName: `Sheet Version at 1:00 PM (${new Date().toISOString().split('T')[0]})`,
      createBackup: false, // Not needed for archive sheet
      includeFormulas: true, // Preserve formulas
      includeFormatting: true, // Preserve formatting
      batchSize: 100, // Process 100 rows at a time
      maxConcurrentRequests: 5 // Process 5 cells in parallel
    });
    
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Close the connection
    await client.close();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();