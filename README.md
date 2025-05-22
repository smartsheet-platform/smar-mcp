# Smartsheet MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for interacting with the Smartsheet API. This server provides tools for searching, retrieving, and updating Smartsheet sheets through the MCP protocol.


## Disclaimer

MCP is a new technology. This integration relies on a SMARTSHEET API token allowing access to your account.

## Features

- Get detailed information about sheets in Smartsheet
- Create, update, and delete sheets and rows
- Create version backups of sheets at specific timestamps
- Formatted responses optimized for AI consumption

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/smar-imran-khawaja/smar-mcp.git
   cd smar-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   
## Usage

There are several ways to run the MCP server with the `.env` file loaded:

### Run locally using wrangler (recommended)

Start the server with environment variables loaded from the `.env` file:

```bash
npm run dev
```

### Deploy to Cloudflare

```bash
npm run deploy
```

## Available MCP Tools

### get_sheet

Retrieves the current state of a sheet, including rows, columns, and cells.

**Parameters:**
- `sheetId` (string, required): The ID of the sheet to retrieve
- `include` (string, optional): Comma-separated list of elements to include (e.g., 'format,formulas')

### get_sheet_version

Gets the current version number of a sheet.

**Parameters:**
- `sheetId` (string, required): The ID of the sheet

### get_cell_history

Retrieves the history of changes for a specific cell.

**Parameters:**
- `sheetId` (string, required): The ID of the sheet
- `rowId` (string, required): The ID of the row
- `columnId` (string, required): The ID of the column
- `include` (string, optional): Optional parameter to include additional information
- `pageSize` (number, optional): Number of history entries to return per page
- `page` (number, optional): Page number to return

### update_rows

Updates rows in a sheet, including cell values, formatting, and formulae.

**Parameters:**
- `sheetId` (string, required): The ID of the sheet
- `rows` (array, required): Array of row objects to update

### add_rows

Adds new rows to a sheet.

**Parameters:**
- `sheetId` (string, required): The ID of the sheet
- `rows` (array, required): Array of row objects to add

### delete_rows

Deletes rows from a sheet. This tool is only available when the ALLOW_DELETE_TOOLS environment variable is set to 'true'.

**Parameters:**
- `sheetId` (string, required): The ID of the sheet
- `rowIds` (array, required): Array of row IDs to delete
- `ignoreRowsNotFound` (boolean, optional): If true, don't throw an error if rows are not found

### get_sheet_location

Gets the folder ID where a sheet is located.

**Parameters:**
- `sheetId` (string, required): The ID of the sheet

### copy_sheet

Creates a copy of the specified sheet in the same folder.

**Parameters:**
- `sheetId` (string, required): The ID of the sheet to copy
- `destinationName` (string, required): Name for the sheet copy
- `destinationFolderId` (string, optional): ID of the destination folder (same as source if not specified)

### create_sheet

Creates a new sheet.

**Parameters:**
- `name` (string, required): Name for the new sheet
- `columns` (array, required): Array of column objects
- `folderId` (string, optional): ID of the folder where the sheet should be created

### create_version_backup

Creates a backup sheet with data from a specific timestamp.

**Parameters:**
- `sheetId` (string, required): The ID of the source sheet
- `timestamp` (string, required): The ISO 8601 timestamp to use for historical data (e.g., '2025-03-27T13:00:00Z')
- `archiveName` (string, optional): Name for the archive sheet (defaults to 'Original Sheet Name - Archive YYYY-MM-DD')
- `includeFormulas` (boolean, optional, default: true): Whether to include formulas in the archive
- `includeFormatting` (boolean, optional, default: true): Whether to include formatting in the archive
- `batchSize` (number, optional, default: 100): Number of rows to process in each batch
- `maxConcurrentRequests` (number, optional, default: 5): Maximum number of concurrent API requests

### get_workspace

Retrieves the current state of a Workspace, including its contents which can be sheets, reports, or other folders

**Parameters:**
- `workspaceId` (string, required): The ID of the workspace to retrieve

### create_workspace

Creates a new workspace

**Parameters:**
- `workspaceName` (string, required): The name of the new workspace

### get_folder

Retrieves the current state of a folder, including its contents which can be sheets, reports, or other folders

**Parameters:**
- `folderId` (string, required): The ID of the folder to retrieve 

### create_folder

Creates a new folder in a folder

**Parameters:**
- `folderId` (string, required): The ID of the folder to create the folder in
- `folderName` (string, required): The name of the new folder

### create_workspace_folder

Creates a new folder in a workspace

**Parameters:**
- `workspaceId` (string, required): The ID of the workspace to create the folder in
- `folderName` (string, required): The name of the new folder

## Example Usage

Here's an example of how to use the `create_version_backup` tool to create a backup of a sheet at a specific timestamp:

```javascript
// Using the MCP tool from an AI assistant
const result = await use_mcp_tool({
  server_name: "smartsheet",
  tool_name: "create_version_backup",
  arguments: {
    sheetId: "7532263697764228",
    timestamp: "2025-03-27T17:00:00Z",
    archiveName: "Project Timeline - Version Backup 17:00 27/03/2025",
    includeFormulas: true,
    includeFormatting: true,
    batchSize: 100,
    maxConcurrentRequests: 5
  }
});

// Result:
// {
//   "success": true,
//   "message": "Archive sheet created with data from 2025-03-27T17:00:00Z",
//   "details": {
//     "sourceSheetId": "7532263697764228",
//     "archiveSheetId": 4346247226806148,
//     "archiveSheetName": "Project Timeline - Version Backup 17:00 27/03/2025",
//     "timestamp": "2025-03-27T17:00:00Z",
//     "rowsProcessed": 6,
//     "cellsProcessed": 50,
//     "rowsUpdated": 0
//   }
// }
```

## Request Headers

- `authToken`: Your Smartsheet API token (required)
- `baseUrl`: The base URL of the Smartsheet API (required)
- `allowDeleteTools`: Set to 'true' to enable deletion operations like delete_rows (default: false)

## Development

### Prerequisites

- Node.js 16 or higher
- npm 7 or higher

### Project Structure

- `src/index.ts`: Main entry point and MCP tool definitions
- `src/smartsheet-direct-api.ts`: Direct API client for Smartsheet
- `src/smartsheet-utils.ts`: Utility functions for common operations
- `src/smartsheet-workflows.ts`: Implementation of complex workflows
- `src/smartsheet-types`: Classes representing Smartsheet API objects
- `tests/`: Test files for various functionality
- `scripts/`: Utility scripts
- `claude_desktop_config-example.json`: Example claude desktop config to connect with the tool - Set your Smartsheet key in the env setting. 

### Testing 

Follow the steps at https://modelcontextprotocol.io/quickstart/server under "Testing your server with Claude for Desktop"

See claude_desktop_config-example.json as an example config to use

Roo:
Run `npm run dev` and make sure your MCP is running locally.

In the Roo Code plug-in, click on the MCP Servers button then Edit MCP Settings. Copy over the text in the `claude_desktop_config-example.json` file over (it should be the same) and make the necessary changes to match your environment.

You should see the MCP Service listed above the Edit MCP Settings button. If not, check that your config is correct and your API key is properly set. If it is, try restarting VS Code.


## Contributing

This project uses [Semantic Release](https://github.com/semantic-release/semantic-release) for automated versioning and changelog generation based on commit messages.

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types

- `feat`: A new feature (minor version bump)
- `fix`: A bug fix (patch version bump)
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

#### Breaking Changes

Breaking changes should be indicated by adding `BREAKING CHANGE:` in the commit message body or by appending a `!` after the type/scope:

```
feat!: remove deprecated API
```

or

```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes using the conventional commit format
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

When your PR is merged to the main branch, semantic-release will automatically:
1. Determine the next version number based on commit messages
2. Generate release notes
3. Create a GitHub release
4. Update the CHANGELOG.md file
