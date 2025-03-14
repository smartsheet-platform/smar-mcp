# Smartsheet MCP Server

A Model Context Protocol[https://modelcontextprotocol.io/] (MCP) server for interacting with the Smartsheet API. This server provides tools for searching, retrieving, and updating Smartsheet sheets through the MCP protocol.

## Features

- Search for sheets in Smartsheet
- Get detailed information about a specific sheet
- Formatted responses optimized for AI consumption

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smartsheet-mcp.git
   cd smartsheet-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with your Smartsheet API token:
   ```
   SMARTSHEET_API_KEY=your_smartsheet_api_token
   ```

   You can obtain a Smartsheet API token from the [Smartsheet Developer Portal](https://developers.smartsheet.com/).

4. Build the project:
   ```bash
   npm run build
   ```

## Usage

There are several ways to run the MCP server with the `.env` file loaded:

### Using npm scripts (recommended)

Start the server with environment variables loaded from the `.env` file:

```bash
npm run start
```

This uses the `-r dotenv/config` flag to ensure dotenv is loaded before the application code runs.

Or build and start in one command:

```bash
npm run dev
```

### Using node directly

You can also run the server directly with Node.js and the `-r` flag:

```bash
node -r dotenv/config build/index.js
```

This ensures that dotenv is loaded before the application code runs.

Alternatively, you can run without the `-r` flag:

```bash
node build/index.js
```

In this case, the application code will load dotenv itself (we've included `import { config } from "dotenv"; config();` at the top of the entry file).

The server will start and display: "Smartsheet MCP Server running on stdio"

## Available MCP Tools

### search-sheets

Searches for sheets in Smartsheet.

**Parameters:**
- `query` (string): Search criteria
- `options` (object, optional):
  - `page` (number, optional): Page number for pagination
  - `size` (number, optional): Number of results per page
  - `sortBy` (string, optional): Field to sort by

**Example Response:**
```json
{
  "totalCount": 2,
  "sheets": [
    {
      "name": "Project Plan",
      "permalink": "https://app.smartsheet.com/sheets/abcdef"
    },
    {
      "name": "Budget Tracker",
      "permalink": "https://app.smartsheet.com/sheets/ghijkl"
    }
  ]
}
```

### get-sheet

Gets a sheet from Smartsheet by its ID.

**Parameters:**
- `sheetId` (string): The ID of the sheet to retrieve

### get-sheet-as-csv

Gets a sheet from Smartsheet by its ID. Return in CSV format

**Parameters:**
- `sheetId` (string): The ID of the sheet to retrieve

## Environment Variables

- `SMARTSHEET_API_KEY`: Your Smartsheet API token (required)

## Development

### Prerequisites

- Node.js 16 or higher
- npm 7 or higher

### Building

```bash
npm run build
```

### Project Structure

- `src/index.ts`: Main entry point and MCP tool definitions
- `src/smartsheet-utils.ts`: Smartsheet client initialization
- `.env`: Environment variables
- `.env.example`: Template for environment variables
-  `claude_desktop_config-example.json`: Example claude desktop config to connect with the tool - Set your Smartsheet key in the env setting. 

### Testing 

Follow the steps at https://modelcontextprotocol.io/quickstart/server under "Testing your server with Claude for Desktop
"

See claude_desktop_config-example.json as an example config to use 
## License

Smartsheet Internal for now 

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request