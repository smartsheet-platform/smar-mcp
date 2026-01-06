#!/usr/bin/env node

/**
 * Smartsheet CLI - Direct API access wrapper
 * Usage: npx ts-node src/cli.ts <command> [options]
 */

import { config } from 'dotenv';
import { SmartsheetAPI } from './apis/smartsheet-api.js';

// Load environment variables
config();

const api = new SmartsheetAPI(process.env.SMARTSHEET_API_KEY, process.env.SMARTSHEET_ENDPOINT);

interface CommandHandler {
  description: string;
  usage: string;
  handler: (args: string[]) => Promise<void>;
}

const commands: Record<string, CommandHandler> = {
  // User commands
  'me': {
    description: 'Get current user information',
    usage: 'me',
    handler: async () => {
      const user = await api.users.getCurrentUser();
      console.log(JSON.stringify(user, null, 2));
    }
  },

  'list-users': {
    description: 'List all users (requires admin)',
    usage: 'list-users',
    handler: async () => {
      const users = await api.users.listUsers();
      console.log(JSON.stringify(users, null, 2));
    }
  },

  // Workspace commands
  'workspaces': {
    description: 'List all workspaces',
    usage: 'workspaces',
    handler: async () => {
      const workspaces = await api.workspaces.getWorkspaces();
      console.log(JSON.stringify(workspaces, null, 2));
    }
  },

  'workspace': {
    description: 'Get workspace details',
    usage: 'workspace <workspaceId>',
    handler: async (args) => {
      if (!args[0]) throw new Error('Workspace ID required');
      const workspace = await api.workspaces.getWorkspace(args[0]);
      console.log(JSON.stringify(workspace, null, 2));
    }
  },

  'create-workspace': {
    description: 'Create a new workspace',
    usage: 'create-workspace <name>',
    handler: async (args) => {
      if (!args[0]) throw new Error('Workspace name required');
      const workspace = await api.workspaces.createWorkspace(args[0]);
      console.log(JSON.stringify(workspace, null, 2));
    }
  },

  // Folder commands
  'folder': {
    description: 'Get folder contents',
    usage: 'folder <folderId>',
    handler: async (args) => {
      if (!args[0]) throw new Error('Folder ID required');
      const folder = await api.folders.getFolder(args[0]);
      console.log(JSON.stringify(folder, null, 2));
    }
  },

  'create-folder': {
    description: 'Create a folder in a parent folder',
    usage: 'create-folder <parentFolderId> <name>',
    handler: async (args) => {
      if (!args[0] || !args[1]) throw new Error('Parent folder ID and name required');
      const folder = await api.folders.createFolder(args[0], args[1]);
      console.log(JSON.stringify(folder, null, 2));
    }
  },

  // Sheet commands
  'sheet': {
    description: 'Get sheet data',
    usage: 'sheet <sheetId> [include]',
    handler: async (args) => {
      if (!args[0]) throw new Error('Sheet ID required');
      const sheet = await api.sheets.getSheet(args[0], args[1]);
      console.log(JSON.stringify(sheet, null, 2));
    }
  },

  'sheet-version': {
    description: 'Get sheet version',
    usage: 'sheet-version <sheetId>',
    handler: async (args) => {
      if (!args[0]) throw new Error('Sheet ID required');
      const version = await api.sheets.getSheetVersion(args[0]);
      console.log(JSON.stringify(version, null, 2));
    }
  },

  'sheet-location': {
    description: 'Get sheet location (folder/workspace)',
    usage: 'sheet-location <sheetId>',
    handler: async (args) => {
      if (!args[0]) throw new Error('Sheet ID required');
      const location = await api.sheets.getSheetLocation(args[0]);
      console.log(JSON.stringify(location, null, 2));
    }
  },

  'copy-sheet': {
    description: 'Copy a sheet',
    usage: 'copy-sheet <sheetId> <newName> [folderId]',
    handler: async (args) => {
      if (!args[0] || !args[1]) throw new Error('Sheet ID and new name required');
      const result = await api.sheets.copySheet(args[0], args[1], args[2]);
      console.log(JSON.stringify(result, null, 2));
    }
  },

  // Row commands
  'row': {
    description: 'Get a specific row',
    usage: 'row <sheetId> <rowId>',
    handler: async (args) => {
      if (!args[0] || !args[1]) throw new Error('Sheet ID and Row ID required');
      const row = await api.sheets.getRow(args[0], args[1]);
      console.log(JSON.stringify(row, null, 2));
    }
  },

  'cell-history': {
    description: 'Get cell history',
    usage: 'cell-history <sheetId> <rowId> <columnId>',
    handler: async (args) => {
      if (!args[0] || !args[1] || !args[2]) throw new Error('Sheet ID, Row ID, and Column ID required');
      const history = await api.sheets.getCellHistory(args[0], args[1], args[2]);
      console.log(JSON.stringify(history, null, 2));
    }
  },

  // Column commands
  'columns': {
    description: 'List all columns in a sheet',
    usage: 'columns <sheetId>',
    handler: async (args) => {
      if (!args[0]) throw new Error('Sheet ID required');
      const columns = await api.columns.getColumns(args[0]);
      console.log(JSON.stringify(columns, null, 2));
    }
  },

  'column': {
    description: 'Get a specific column',
    usage: 'column <sheetId> <columnId>',
    handler: async (args) => {
      if (!args[0] || !args[1]) throw new Error('Sheet ID and Column ID required');
      const column = await api.columns.getColumn(args[0], args[1]);
      console.log(JSON.stringify(column, null, 2));
    }
  },

  // Report commands
  'reports': {
    description: 'List all reports',
    usage: 'reports',
    handler: async () => {
      const reports = await api.reports.listReports();
      console.log(JSON.stringify(reports, null, 2));
    }
  },

  'report': {
    description: 'Get a report',
    usage: 'report <reportId>',
    handler: async (args) => {
      if (!args[0]) throw new Error('Report ID required');
      const report = await api.reports.getReport(args[0]);
      console.log(JSON.stringify(report, null, 2));
    }
  },

  // Attachment commands
  'attachments': {
    description: 'List sheet attachments',
    usage: 'attachments <sheetId>',
    handler: async (args) => {
      if (!args[0]) throw new Error('Sheet ID required');
      const attachments = await api.attachments.listSheetAttachments(args[0]);
      console.log(JSON.stringify(attachments, null, 2));
    }
  },

  'attachment': {
    description: 'Get attachment details',
    usage: 'attachment <sheetId> <attachmentId>',
    handler: async (args) => {
      if (!args[0] || !args[1]) throw new Error('Sheet ID and Attachment ID required');
      const attachment = await api.attachments.getAttachment(args[0], args[1]);
      console.log(JSON.stringify(attachment, null, 2));
    }
  },

  // Discussion commands
  'discussions': {
    description: 'List sheet discussions',
    usage: 'discussions <sheetId>',
    handler: async (args) => {
      if (!args[0]) throw new Error('Sheet ID required');
      const discussions = await api.discussions.getDiscussionsBySheetId(args[0]);
      console.log(JSON.stringify(discussions, null, 2));
    }
  },

  // Search commands
  'search': {
    description: 'Search sheets globally',
    usage: 'search <query>',
    handler: async (args) => {
      if (!args[0]) throw new Error('Search query required');
      const results = await api.search.searchSheets(args.join(' '));
      console.log(JSON.stringify(results, null, 2));
    }
  },

  'search-sheet': {
    description: 'Search within a sheet',
    usage: 'search-sheet <sheetId> <query>',
    handler: async (args) => {
      if (!args[0] || !args[1]) throw new Error('Sheet ID and query required');
      const results = await api.search.searchSheet(args[0], args.slice(1).join(' '));
      console.log(JSON.stringify(results, null, 2));
    }
  },

  'search-folders': {
    description: 'Search for folders',
    usage: 'search-folders <query>',
    handler: async (args) => {
      if (!args[0]) throw new Error('Search query required');
      const results = await api.search.searchFolders(args.join(' '));
      console.log(JSON.stringify(results, null, 2));
    }
  },

  'search-workspaces': {
    description: 'Search for workspaces',
    usage: 'search-workspaces <query>',
    handler: async (args) => {
      if (!args[0]) throw new Error('Search query required');
      const results = await api.search.searchWorkspaces(args.join(' '));
      console.log(JSON.stringify(results, null, 2));
    }
  },

  // Help
  'help': {
    description: 'Show this help message',
    usage: 'help',
    handler: async () => {
      console.log('\nSmartsheet CLI - Direct API Access\n');
      console.log('Usage: npm run cli <command> [options]\n');
      console.log('Commands:\n');

      const categories: Record<string, string[]> = {
        'User': ['me', 'list-users'],
        'Workspace': ['workspaces', 'workspace', 'create-workspace'],
        'Folder': ['folder', 'create-folder'],
        'Sheet': ['sheet', 'sheet-version', 'sheet-location', 'copy-sheet'],
        'Row': ['row', 'cell-history'],
        'Column': ['columns', 'column'],
        'Report': ['reports', 'report'],
        'Attachment': ['attachments', 'attachment'],
        'Discussion': ['discussions'],
        'Search': ['search', 'search-sheet', 'search-folders', 'search-workspaces'],
      };

      for (const [category, cmds] of Object.entries(categories)) {
        console.log(`  ${category}:`);
        for (const cmd of cmds) {
          const handler = commands[cmd];
          console.log(`    ${cmd.padEnd(20)} ${handler.description}`);
          console.log(`      Usage: ${handler.usage}`);
        }
        console.log('');
      }
    }
  }
};

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const commandArgs = args.slice(1);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    await commands['help'].handler([]);
    process.exit(0);
  }

  const handler = commands[command];
  if (!handler) {
    console.error(`Unknown command: ${command}`);
    console.error('Run "npm run cli help" for available commands');
    process.exit(1);
  }

  try {
    await handler.handler(commandArgs);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
