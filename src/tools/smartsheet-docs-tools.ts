import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const DOCS_CONTENT = `
# Smartsheet MCP Tool Documentation

## Search

### find_rows (Search by Column Value)
Find rows where a specific column matches a value.
**Usage Tip:** Use precise string matching (case-insensitive).

\`\`\`json
{
  "sheetId": "123456789",
  "columnId": 987654321,
  "value": "In Progress"
}
\`\`\`

## Data Manipulation

### add_rows (Add New Rows)
Add rows to the bottom (default) or top of a sheet.
**Important:** Use valid column IDs.

\`\`\`json
{
  "sheetId": "123456789",
  "rows": [
    {
      "toBottom": true,
      "cells": [
         { "columnId": 111, "value": "New Task Name" },
         { "columnId": 222, "value": "Pending" }
      ]
    }
  ]
}
\`\`\`

### Reading Data
Use \`get_sheet\` to read the entire sheet (up to page limit).
Use \`get_row\` to read a specific row if you have the ID.

## Formatting
Cells format follows Smartsheet API 2.0 structure:
\`{ "columnId": <id>, "value": <val> }\`
Display value is read-only.
`;

export function getDocsTools(server: McpServer) {
  server.tool(
    'get_tool_docs',
    'Get usage documentation and examples for Smartsheet tools to help construct valid requests.',
    {},
    async () => {
      return {
        content: [
          {
            type: 'text' as const,
            text: DOCS_CONTENT,
          },
        ],
      };
    },
  );
}
