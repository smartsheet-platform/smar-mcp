# Smartsheet MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for interacting with the Smartsheet API. This server provides tools for searching, retrieving, and updating Smartsheet sheets through the MCP protocol.

## Table of Contents

- [Disclaimer](#disclaimer)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Available MCP Tools](#available-mcp-tools)
- [API Endpoint Coverage](#api-endpoint-coverage)
- [Example Usage](#example-usage)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Contributing](#contributing)

## Disclaimer

MCP is a new technology. This integration relies on a SMARTSHEET API token allowing access to your account. While powerful, they can be susceptible to prompt injection when processing untrusted data. We recommend exercising caution and reviewing actions taken through these clients to ensure secure operation.

## Features

- Get detailed information about sheets in Smartsheet
- Create, update, and delete sheets and rows
- Create version backups of sheets at specific timestamps
- **Webhooks**: Create and manage real-time notifications
- **Sharing**: Share sheets, workspaces, reports, and folders
- **Cross-Sheet References**: Create cell links and cross-sheet formulas
- **Bulk Operations**: Move/copy rows, bulk updates, sorting
- **Export/Import**: Export to CSV/Excel/PDF, import CSV data
- **Summary Fields**: Manage sheet summary sections
- **Templates**: Create sheets from templates
- **Favorites**: Manage user favorites
- **Groups**: Manage groups and members
- **Events/Audit**: Access audit logs and event streams
- Formatted responses optimized for AI consumption

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/smartsheet-platform/smar-mcp.git
   cd smar-mcp
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

---

## Webhook Tools

### list_webhooks

Lists all webhooks for the authenticated user.

### get_webhook

Gets details of a specific webhook.

**Parameters:**
- `webhookId` (number, required): The ID of the webhook to retrieve

### create_webhook

Creates a new webhook to receive notifications when a sheet changes.

**Parameters:**
- `name` (string, required): Name for the webhook
- `callbackUrl` (string, required): URL to receive webhook callbacks
- `scope` (string, required): Scope of the webhook (currently only 'sheet' is supported)
- `scopeObjectId` (number, required): ID of the object to monitor (e.g., sheet ID)
- `events` (array, required): Events to trigger the webhook (e.g., ['*.*'] for all events)
- `version` (number, optional): API version for webhook callbacks (default: 1)

### update_webhook

Updates an existing webhook (enable/disable or change callback URL).

**Parameters:**
- `webhookId` (number, required): The ID of the webhook to update
- `enabled` (boolean, optional): Whether the webhook is enabled
- `callbackUrl` (string, optional): New callback URL for the webhook

### delete_webhook

Deletes a webhook. Only available when `ALLOW_DELETE_TOOLS=true`.

**Parameters:**
- `webhookId` (number, required): The ID of the webhook to delete

### reset_webhook_secret

Resets the shared secret for a webhook.

**Parameters:**
- `webhookId` (number, required): The ID of the webhook

---

## Sharing Tools

### list_sheet_shares

Lists all shares (users/groups with access) for a sheet.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet

### share_sheet

Shares a sheet with users or groups.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet to share
- `shares` (array, required): Array of share objects with `email`, `groupId`, `accessLevel`, `subject`, `message`, `ccMe`

### update_sheet_share

Updates the access level of an existing share.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet
- `shareId` (string, required): The ID of the share to update
- `accessLevel` (string, required): New access level (VIEWER, EDITOR, EDITOR_SHARE, ADMIN, OWNER)

### delete_sheet_share

Removes sharing access from a sheet. Only available when `ALLOW_DELETE_TOOLS=true`.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet
- `shareId` (string, required): The ID of the share to delete

### list_workspace_shares / share_workspace

Similar to sheet sharing but for workspaces.

### list_report_shares / share_report

Similar to sheet sharing but for reports.

### list_folder_shares / share_folder

Similar to sheet sharing but for folders.

---

## Cross-Sheet Reference Tools

### list_cross_sheet_references

Lists all cross-sheet references defined for a sheet.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet

### get_cross_sheet_reference

Gets a specific cross-sheet reference.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet
- `referenceId` (number, required): The ID of the cross-sheet reference

### create_cross_sheet_reference

Creates a cross-sheet reference to use in formulas like VLOOKUP, INDEX, etc.

**Parameters:**
- `sheetId` (number, required): The ID of the destination sheet
- `name` (string, required): Name for the cross-sheet reference
- `sourceSheetId` (number, required): ID of the source sheet to reference
- `startRowId` (number, optional): ID of the first row in the range
- `endRowId` (number, optional): ID of the last row in the range
- `startColumnId` (number, optional): ID of the first column in the range
- `endColumnId` (number, optional): ID of the last column in the range

### create_cell_link

Creates a cell link that syncs a cell's value from another sheet.

**Parameters:**
- `sheetId` (number, required): The ID of the destination sheet
- `rowId` (number, required): The ID of the destination row
- `columnId` (number, required): The ID of the destination column
- `sourceSheetId` (number, required): The ID of the source sheet
- `sourceRowId` (number, required): The ID of the source row
- `sourceColumnId` (number, required): The ID of the source column

### remove_cell_link

Removes a cell link from a cell.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet
- `rowId` (number, required): The ID of the row
- `columnId` (number, required): The ID of the column

### get_cell_links

Gets all cell links information for a sheet.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet

---

## Bulk Operations Tools

### move_rows

Moves rows from one sheet to another.

**Parameters:**
- `sourceSheetId` (number, required): The ID of the source sheet
- `rowIds` (array, required): Array of row IDs to move
- `destinationSheetId` (number, required): The ID of the destination sheet
- `toTop` (boolean, optional): Move rows to the top
- `toBottom` (boolean, optional): Move rows to the bottom
- `parentId` (number, optional): ID of the parent row in the destination
- `siblingId` (number, optional): ID of the sibling row in the destination

### copy_rows

Copies rows from one sheet to another.

**Parameters:**
- Same as `move_rows`

### move_sheet

Moves a sheet to a different folder or workspace.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet to move
- `folderId` (number, optional): ID of the destination folder
- `workspaceId` (number, optional): ID of the destination workspace

### bulk_delete_rows

Deletes multiple rows from a sheet. Only available when `ALLOW_DELETE_TOOLS=true`.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet
- `rowIds` (array, required): Array of row IDs to delete
- `ignoreRowsNotFound` (boolean, optional): If true, don't error if rows are not found

### bulk_add_rows

Adds multiple rows to a sheet in a single operation.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet
- `rows` (array, required): Array of row objects with `toTop`, `toBottom`, `parentId`, `siblingId`, `cells`

### bulk_update_rows

Updates multiple rows in a sheet in a single operation.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet
- `rows` (array, required): Array of row objects with `id` and `cells`

### sort_rows

Sorts rows in a sheet by one or more columns.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet
- `sortCriteria` (array, required): Array of sort criteria with `columnId` and `direction` (ASCENDING/DESCENDING)

---

## Export/Import Tools

### export_sheet_to_csv

Exports a sheet to CSV format.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet to export

### export_sheet_to_excel

Exports a sheet to Excel format (returns base64 encoded content).

**Parameters:**
- `sheetId` (number, required): The ID of the sheet to export

### export_sheet_to_pdf

Exports a sheet to PDF format (returns base64 encoded content).

**Parameters:**
- `sheetId` (number, required): The ID of the sheet to export
- `paperSize` (string, optional): Paper size (LETTER, LEGAL, WIDE, ARCHD, A4, A3, A2, A1, A0)

### import_csv_to_new_sheet

Imports CSV content into a new sheet.

**Parameters:**
- `csvContent` (string, required): The CSV content to import
- `sheetName` (string, required): Name for the new sheet
- `headerRowIndex` (number, optional): Row index for headers (default: 0)
- `primaryColumnIndex` (number, optional): Column index for the primary column (default: 0)

### import_csv_to_existing_sheet

Imports CSV content as new rows in an existing sheet.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet to import into
- `csvContent` (string, required): The CSV content to import

### get_sheet_as_json

Gets a sheet in JSON format with optional filtering and pagination.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet
- `include` (array, optional): Elements to include (e.g., ['attachments', 'discussions'])
- `exclude` (array, optional): Elements to exclude
- `rowIds` (array, optional): Specific row IDs to return
- `columnIds` (array, optional): Specific column IDs to return
- `filterId` (number, optional): Filter ID to apply
- `pageSize` (number, optional): Number of rows per page
- `page` (number, optional): Page number

---

## Summary Fields Tools

### get_summary_fields

Gets all summary fields for a sheet (the sheet summary section).

**Parameters:**
- `sheetId` (number, required): The ID of the sheet

### get_summary_field

Gets a specific summary field by ID.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet
- `fieldId` (number, required): The ID of the summary field

### add_summary_fields

Adds new summary fields to a sheet.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet
- `fields` (array, required): Array of field objects with `title`, `type`, `formula`, `objectValue`, `index`

### update_summary_fields

Updates existing summary fields.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet
- `fields` (array, required): Array of field objects with `id`, `title`, `formula`, `objectValue`, `index`, `locked`

### delete_summary_fields

Deletes summary fields from a sheet. Only available when `ALLOW_DELETE_TOOLS=true`.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet
- `fieldIds` (array, required): Array of summary field IDs to delete

---

## Template Tools

### list_public_templates

Lists all publicly available Smartsheet templates.

### list_user_templates

Lists templates created by the user.

### create_sheet_from_template

Creates a new sheet from a template.

**Parameters:**
- `templateId` (number, required): The ID of the template to use
- `sheetName` (string, required): Name for the new sheet
- `folderId` (number, optional): ID of the folder to create the sheet in
- `workspaceId` (number, optional): ID of the workspace to create the sheet in
- `includes` (array, optional): Elements to include from the template (data, attachments, discussions, cellLinks, forms)

### create_sheet_in_folder_from_template

Creates a new sheet in a folder from a template.

**Parameters:**
- `folderId` (number, required): The ID of the destination folder
- `templateId` (number, required): The ID of the template to use
- `sheetName` (string, required): Name for the new sheet
- `includes` (array, optional): Elements to include from the template

### create_sheet_in_workspace_from_template

Creates a new sheet in a workspace from a template.

**Parameters:**
- `workspaceId` (number, required): The ID of the destination workspace
- `templateId` (number, required): The ID of the template to use
- `sheetName` (string, required): Name for the new sheet
- `includes` (array, optional): Elements to include from the template

---

## Favorites Tools

### list_favorites

Lists all favorites for the current user.

### add_favorites

Adds items to favorites.

**Parameters:**
- `favorites` (array, required): Array of objects with `type` (sheet, folder, report, template, workspace, sight) and `objectId`

### add_sheet_to_favorites

Adds a sheet to favorites.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet to favorite

### add_folder_to_favorites / add_workspace_to_favorites / add_report_to_favorites / add_dashboard_to_favorites

Similar tools for other object types.

### remove_favorites

Removes items from favorites. Only available when `ALLOW_DELETE_TOOLS=true`.

**Parameters:**
- `type` (string, required): Type of items to remove
- `objectIds` (array, required): Array of item IDs to remove from favorites

### remove_sheet_from_favorites

Removes a sheet from favorites. Only available when `ALLOW_DELETE_TOOLS=true`.

**Parameters:**
- `sheetId` (number, required): The ID of the sheet to remove from favorites

---

## Groups Tools

### list_groups

Lists all groups in the organization.

### get_group

Gets details of a specific group.

**Parameters:**
- `groupId` (number, required): The ID of the group

### create_group

Creates a new group.

**Parameters:**
- `name` (string, required): Name for the group
- `description` (string, optional): Description for the group
- `members` (array, optional): Initial members to add (array of objects with `email`)

### update_group

Updates an existing group.

**Parameters:**
- `groupId` (number, required): The ID of the group to update
- `name` (string, optional): New name for the group
- `description` (string, optional): New description for the group
- `ownerId` (number, optional): ID of the new owner

### delete_group

Deletes a group. Only available when `ALLOW_DELETE_TOOLS=true`.

**Parameters:**
- `groupId` (number, required): The ID of the group to delete

### add_group_members

Adds members to a group.

**Parameters:**
- `groupId` (number, required): The ID of the group
- `members` (array, required): Array of members to add (objects with `email`)

### remove_group_member

Removes a member from a group. Only available when `ALLOW_DELETE_TOOLS=true`.

**Parameters:**
- `groupId` (number, required): The ID of the group
- `userId` (number, required): The ID of the user to remove

### get_group_members

Gets all members of a group.

**Parameters:**
- `groupId` (number, required): The ID of the group

---

## Events/Audit Tools

### get_events

Gets events from the audit log (requires admin privileges).

**Parameters:**
- `since` (string, optional): ISO 8601 datetime or stream position to start from
- `maxCount` (number, optional): Maximum number of events to return (1-10000)
- `numericDates` (boolean, optional): Return dates as milliseconds since epoch

### get_events_since

Gets events since a specific timestamp.

**Parameters:**
- `timestamp` (string, required): ISO 8601 datetime to start from
- `maxCount` (number, optional): Maximum number of events to return

### get_recent_events

Gets events from the last 24 hours.

**Parameters:**
- `maxCount` (number, optional): Maximum number of events to return

### get_events_by_object_type

Gets events filtered by object type.

**Parameters:**
- `objectType` (string, required): Type of object to filter by (SHEET, WORKSPACE, FOLDER, REPORT, etc.)
- `since` (string, optional): ISO 8601 datetime to start from
- `maxCount` (number, optional): Maximum number of events to return

### get_events_by_action

Gets events filtered by action type.

**Parameters:**
- `action` (string, required): Action type to filter by (CREATE, UPDATE, DELETE, MOVE, COPY, etc.)
- `since` (string, optional): ISO 8601 datetime to start from
- `maxCount` (number, optional): Maximum number of events to return

### get_all_events

Gets all events by paginating through the stream (may take time for large result sets).

**Parameters:**
- `since` (string, required): ISO 8601 datetime to start from
- `maxTotal` (number, optional): Maximum total number of events to retrieve

---

## API Endpoint Coverage

This table outlines the Smartsheet API endpoints, whether they are currently covered by SMAR-MCP tools, and their suitability for MCP.

**Legend:**
- **Yes**: Endpoint is well-suited for MCP integration
- **No**: Endpoint is not suitable for MCP (e.g., binary data, streaming, or requires specialized handling)
- **Consider**: Endpoint could work with MCP but may have limitations (e.g., potentially large responses that need pagination or filtering)

| API Path                                      | Covered by SMAR-MCP? | HTTP Method(s) | SMAR-MCP Tool(s)                                           | Suitable for MCP? | Reason for Unsuitability/Consideration                                  |
|-----------------------------------------------|----------------------|----------------|------------------------------------------------------------|--------------------|-------------------------------------------------------------------------|
| `/contacts`                                   | No                   | GET                | N/A                                                        | Consider          | List operation. Response size can vary. Consider pagination/filters.    |
| `/contacts/{contactId}`                       | No                   | GET                | N/A                                                        | Yes               | Retrieves a specific contact.                                           |
| `/events`                                     | Yes                  | GET                | `get_events`, `get_recent_events`, `get_events_by_object_type`, `get_events_by_action`, `get_all_events` | Yes | Event stream with pagination support.    |
| `/favorites`                                  | Yes                  | GET, POST          | `list_favorites`, `add_favorites`                          | Yes               | Manages user favorites.                                                 |
| `/favorites/{favoriteType}`                   | Yes                  | GET, POST          | `add_sheet_to_favorites`, `add_folder_to_favorites`, etc.  | Yes               | Manages user favorites by type.                                         |
| `/favorites/{favoriteType}/{favoriteId}`      | Yes                  | GET, PUT, DELETE   | `remove_favorites`, `remove_sheet_from_favorites`          | Yes               | Manages a specific user favorite.                                       |
| `/filteredEvents`                             | No                   | GET                | N/A                                                        | Consider          | Filtered event stream. Potentially large. Needs specific handling.      |
| `/folders/{folderId}`                         | Yes                  | GET, PUT, DELETE   | `get_folder` (GET)                                         | Yes               | Retrieves a specific folder.                                            |
| `/folders/{folderId}/copy`                    | No                   | POST               | N/A                                                        | Yes               | Copies a folder.                                                        |
| `/folders/{folderId}/folders`                 | Yes                  | POST               | `create_folder` (POST)                                     | Yes               | Manages sub-folders (create). List via `get_folder`.                  |
| `/folders/{folderId}/move`                    | No                   | POST               | N/A                                                        | Yes               | Moves a folder.                                                         |
| `/folders/{folderId}/shares`                  | Yes                  | GET, POST          | `list_folder_shares`, `share_folder`                       | Yes               | List/Manage folder shares.                                              |
| `/folders/{folderId}/sheets`                  | Yes                  | POST               | `create_sheet` (POST with folderId). List via `get_folder`. | Yes               | Manages sheets within a folder.                                         |
| `/folders/{folderId}/sheets/import`           | No                   | POST               | N/A                                                        | Yes               | Imports a sheet into a folder.                                          |
| `/folders/personal`                           | No                   | GET                | N/A                                                        | Yes               | Accesses personal folders (Smartsheet specific, likely `GET /home/folders`). |
| `/groups`                                     | Yes                  | GET, POST          | `list_groups`, `create_group`                              | Yes               | List/Create groups.                                                     |
| `/groups/{groupId}`                           | Yes                  | GET, PUT, DELETE   | `get_group`, `update_group`, `delete_group`                | Yes               | Get/Update/Delete specific group.                                       |
| `/groups/{groupId}/members`                   | Yes                  | GET, POST          | `get_group_members`, `add_group_members`                   | Yes               | List/Add group members.                                                 |
| `/groups/{groupId}/members/{userId}`          | Yes                  | DELETE             | `remove_group_member`                                      | Yes               | Removes a specific group member.                                        |
| `/home/folders`                               | No                   | GET                | N/A                                                        | Yes               | Lists folders in the user's home.                                       |
| `/imageurls`                                  | No                   | POST               | N/A                                                        | Consider          | Generates URLs for images. Response size depends on request.            |
| `/reports`                                    | Yes                  | GET                | `list_reports`, `get_report`                               | Consider          | List operation. Response size can vary.                                 |
| `/reports/{reportId}`                         | Yes                  | GET, PUT, DELETE   | `get_report`                                               | Yes               | Retrieves a specific report.                                            |
| `/reports/{reportId}/emails`                  | No                   | POST               | N/A                                                        | Yes               | Sends a report via email.                                               |
| `/reports/{reportId}/publish`                 | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Manages report publishing.                                              |
| `/reports/{reportId}/shares`                  | Yes                  | GET, POST          | `list_report_shares`, `share_report`                       | Yes               | List/Manage report shares.                                              |
| `/reports/{reportId}/shares/{shareId}`        | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Manages a specific report share.                                        |
| `/search`                                     | Yes                  | GET                | `search_sheets`, `search_folders`, `search_workspaces`     | Consider          | Global search. Response size can be very large.                         |
| `/search/sheets/{sheetId}`                    | Yes                  | GET                | `search_sheet`                                             | Consider          | Search within a specific sheet. Response size can vary.                 |
| `/serverinfo`                                 | No                   | GET                | N/A                                                        | Yes               | Retrieves server information. Small response.                           |
| `/sheets`                                     | Yes                  | GET, POST          | `create_sheet` (POST without folderId). List not directly exposed. | Consider      | List operation (not exposed as tool). Response size can be very large.  |
| `/sheets/import`                              | Yes                  | POST               | `import_csv_to_new_sheet`                                  | Yes               | Imports a sheet from CSV.                                               |
| `/sheets/{sheetId}`                           | Yes                  | GET, PUT, DELETE   | `get_sheet`, `get_sheet_location`, `export_sheet_to_csv`, `export_sheet_to_excel`, `export_sheet_to_pdf` | Yes | Retrieves/exports a specific sheet.    |
| `/sheets/{sheetId}/attachments`               | Yes                  | GET, POST          | `list_sheet_attachments`, `add_sheet_attachment`           | Consider          | List/Manage attachments. Involves binary data.                          |
| `/sheets/{sheetId}/attachments/{attachmentId}` | Yes                  | GET, DELETE        | `get_attachment`, `delete_attachment`                      | Consider          | Get/Delete specific attachment. Involves binary data.                   |
| `/sheets/{sheetId}/attachments/{attachmentId}/versions` | No         | GET                | N/A                                                        | Consider          | List attachment versions.                                               |
| `/sheets/{sheetId}/automationrules`           | No                   | GET, POST          | N/A                                                        | Consider          | List/Manage automation rules.                                           |
| `/sheets/{sheetId}/automationrules/{automationRuleId}` | No          | GET, PUT, DELETE   | N/A                                                        | Yes               | Get/Update/Delete specific automation rule.                             |
| `/sheets/{sheetId}/columns`                   | Yes                  | GET, POST          | `list_columns`, `add_column`                               | Yes               | List/Add columns.                                                       |
| `/sheets/{sheetId}/columns/{columnId}`        | Yes                  | GET, PUT, DELETE   | `get_column`, `update_column`, `delete_column`             | Yes               | Get/Update/Delete specific column.                                      |
| `/sheets/{sheetId}/comments/{commentId}`      | No                   | GET, DELETE        | N/A                                                        | Yes               | Get/Delete specific comment.                                            |
| `/sheets/{sheetId}/comments/{commentId}/attachments` | No            | GET, POST          | N/A                                                        | Consider          | Manage attachments for a comment. Involves binary data.                 |
| `/sheets/{sheetId}/copy`                      | Yes                  | POST               | `copy_sheet` (POST)                                        | Yes               | Copies a sheet.                                                         |
| `/sheets/{sheetId}/crosssheetreferences`      | Yes                  | GET, POST          | `list_cross_sheet_references`, `create_cross_sheet_reference` | Yes            | List/Create cross-sheet references.                                     |
| `/sheets/{sheetId}/crosssheetreferences/{crossSheetReferenceId}` | Yes | GET, DELETE        | `get_cross_sheet_reference`                                | Yes               | Get specific cross-sheet reference.                                     |
| `/sheets/{sheetId}/discussions`               | Yes                  | GET, POST          | `get_sheet_discussions` (GET)                              | Consider          | List discussions. Response size can vary.                               |
| `/sheets/{sheetId}/discussions/{discussionId}` | No                  | GET, DELETE        | N/A                                                        | Yes               | Get/Delete specific discussion.                                         |
| `/sheets/{sheetId}/discussions/{discussionId}/attachments` | No      | GET, POST          | N/A                                                        | Consider          | Manage attachments for a discussion. Involves binary data.              |
| `/sheets/{sheetId}/discussions/{discussionId}/comments` | No         | GET, POST          | N/A                                                        | Consider          | List/Add comments to a discussion.                                      |
| `/sheets/{sheetId}/emails`                    | No                   | POST               | N/A                                                        | Yes               | Sends a sheet via email.                                                |
| `/sheets/{sheetId}/move`                      | Yes                  | POST               | `move_sheet`                                               | Yes               | Moves a sheet to folder/workspace.                                      |
| `/sheets/{sheetId}/proofs`                    | No                   | GET, POST          | N/A                                                        | Consider          | List/Manage proofs.                                                     |
| `/sheets/{sheetId}/proofs/{proofId}`          | No                   | GET, PUT           | N/A                                                        | Yes               | Get/Update specific proof.                                              |
| `/sheets/{sheetId}/proofs/{proofId}/attachments` | No                | GET, POST          | N/A                                                        | Consider          | Manage attachments for a proof. Involves binary data.                   |
| `/sheets/{sheetId}/proofs/{proofId}/discussions` | No                | GET, POST          | N/A                                                        | Consider          | Manage discussions for a proof.                                         |
| `/sheets/{sheetId}/proofs/{proofId}/requestactions` | No             | POST               | N/A                                                        | Yes               | Manage request actions for a proof.                                     |
| `/sheets/{sheetId}/proofs/{proofId}/requests` | No                   | GET, POST          | N/A                                                        | Consider          | Manage requests for a proof.                                            |
| `/sheets/{sheetId}/proofs/{proofId}/versions` | No                   | GET                | N/A                                                        | Consider          | List versions of a proof.                                               |
| `/sheets/{sheetId}/publish`                   | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Manages sheet publishing.                                               |
| `/sheets/{sheetId}/rows`                      | Yes                  | GET, POST, PUT, DELETE | `update_rows`, `add_rows`, `delete_rows`, `bulk_add_rows`, `bulk_update_rows`, `bulk_delete_rows` | Yes | Manages rows with bulk support.    |
| `/sheets/{sheetId}/rows/copy`                 | Yes                  | POST               | `copy_rows`                                                | Yes               | Copies rows within or between sheets.                                   |
| `/sheets/{sheetId}/rows/emails`               | No                   | POST               | N/A                                                        | Yes               | Sends rows via email.                                                   |
| `/sheets/{sheetId}/rows/import`               | Yes                  | POST               | `import_csv_to_existing_sheet`                             | Yes               | Imports CSV rows to existing sheet.                                     |
| `/sheets/{sheetId}/rows/move`                 | Yes                  | POST               | `move_rows`                                                | Yes               | Moves rows within or between sheets.                                    |
| `/sheets/{sheetId}/rows/{rowId}`              | Yes                  | GET, PUT, DELETE   | `get_row`                                                  | Yes               | Get/Update/Delete specific row.                                         |
| `/sheets/{sheetId}/rows/{rowId}/attachments`  | Yes                  | GET, POST          | `list_row_attachments`, `add_row_attachment`               | Consider          | Manage attachments for a row. Involves binary data.                     |
| `/sheets/{sheetId}/rows/{rowId}/columns/{columnId}/cellimages` | No  | GET, POST, DELETE  | N/A                                                        | Consider          | Manage cell images. Involves binary data.                               |
| `/sheets/{sheetId}/rows/{rowId}/columns/{columnId}/history` | Yes    | GET                | `get_cell_history` (GET)                                   | Yes               | Retrieves cell history. Response size can vary.                         |
| `/sheets/{sheetId}/rows/{rowId}/discussions`  | Yes                  | GET, POST          | `create_row_discussion` (POST). List via parent.           | Yes               | Manages discussions for a row.                                          |
| `/sheets/{sheetId}/rows/{rowId}/proofs`       | No                   | GET, POST          | N/A                                                        | Consider          | Manage proofs for a row.                                                |
| `/sheets/{sheetId}/sentupdaterequests`        | No                   | GET                | N/A                                                        | Consider          | List sent update requests.                                              |
| `/sheets/{sheetId}/sentupdaterequests/{sentUpdateRequestId}` | No    | GET, DELETE        | N/A                                                        | Yes               | Get/Delete specific sent update request.                                |
| `/sheets/{sheetId}/shares`                    | Yes                  | GET, POST          | `list_sheet_shares`, `share_sheet`                         | Yes               | List/Manage sheet shares.                                               |
| `/sheets/{sheetId}/shares/{shareId}`          | Yes                  | GET, PUT, DELETE   | `update_sheet_share`, `delete_sheet_share`                 | Yes               | Get/Update/Delete specific sheet share.                                 |
| `/sheets/{sheetId}/sort`                      | Yes                  | POST               | `sort_rows`                                                | Yes               | Sorts a sheet.                                                          |
| `/sheets/{sheetId}/summary`                   | Yes                  | GET                | `get_summary_fields`                                       | Yes               | Get sheet summary.                                                      |
| `/sheets/{sheetId}/summary/fields`            | Yes                  | GET, POST, PUT, DELETE | `get_summary_fields`, `add_summary_fields`, `update_summary_fields`, `delete_summary_fields` | Yes | Full summary field management.       |
| `/sheets/{sheetId}/summary/fields/{fieldId}/images` | No             | GET, POST, DELETE  | N/A                                                        | Consider          | Manage images for a sheet summary field. Involves binary data.          |
| `/sheets/{sheetId}/updaterequests`            | Yes                  | GET, POST          | `create_update_request` (POST). List not directly exposed. | Consider          | List/Manage update requests.                                            |
| `/sheets/{sheetId}/updaterequests/{updateRequestId}` | No            | GET, PUT, DELETE   | N/A                                                        | Yes               | Get/Update/Delete specific update request.                              |
| `/sheets/{sheetId}/version`                   | Yes                  | GET                | `get_sheet_version` (GET)                                  | Yes               | Retrieves sheet version. Small response.                                |
| `/sights`                                     | No                   | GET, POST          | N/A                                                        | Consider          | List dashboards. Response size can vary.                                |
| `/sights/{sightId}`                           | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Get specific dashboard. Response can be large.                          |
| `/sights/{sightId}/copy`                      | No                   | POST               | N/A                                                        | Yes               | Copies a dashboard.                                                     |
| `/sights/{sightId}/move`                      | No                   | POST               | N/A                                                        | Yes               | Moves a dashboard.                                                      |
| `/sights/{sightId}/publish`                   | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Manages dashboard publishing.                                           |
| `/sights/{sightId}/shares`                    | No                   | GET, POST          | N/A                                                        | Consider          | List/Manage dashboard shares.                                           |
| `/sights/{sightId}/shares/{shareId}`          | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Get/Update/Delete specific dashboard share.                             |
| `/templates`                                  | Yes                  | GET                | `list_user_templates`                                      | Yes               | List user templates.                                                    |
| `/templates/public`                           | Yes                  | GET                | `list_public_templates`                                    | Yes               | List public templates.                                                  |
| `/token`                                      | No                   | POST               | N/A                                                        | No               | OAuth token endpoint. Handled by auth flow, not direct MCP tool.        |
| `/users`                                      | Yes                  | GET, POST          | `list_users`, `get_current_user`                           | Consider          | List users. Response size can be very large. Requires admin.            |
| `/users/me`                                   | Yes                  | GET                | `get_current_user`                                         | Yes               | Retrieves current user details. Small response.                         |
| `/users/sheets`                               | No                   | GET                | N/A                                                        | Consider          | List sheets owned by or shared with users. Potentially large.           |
| `/users/{userId}`                             | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Get specific user.                                                      |
| `/users/{userId}/alternateemails`             | No                   | GET, POST          | N/A                                                        | Yes               | Manage alternate emails for a user.                                     |
| `/users/{userId}/alternateemails/{alternateEmailId}` | No            | GET, DELETE        | N/A                                                        | Yes               | Manage a specific alternate email.                                      |
| `/users/{userId}/alternateemails/{alternateEmailId}/makeprimary` | No | POST               | N/A                                                        | Yes               | Makes an alternate email primary.                                       |
| `/users/{userId}/deactivate`                  | No                   | DELETE             | N/A                                                        | Yes               | Deactivates a user. (Admin)                                             |
| `/users/{userId}/profileimage`                | No                   | GET, PUT, DELETE   | N/A                                                        | Consider          | Manage user profile image. Involves binary data.                        |
| `/users/{userId}/reactivate`                  | No                   | POST               | N/A                                                        | Yes               | Reactivates a user. (Admin)                                             |
| `/webhooks`                                   | Yes                  | GET, POST          | `list_webhooks`, `create_webhook`                          | Yes               | List/Create webhooks.                                                   |
| `/webhooks/{webhookId}`                       | Yes                  | GET, PUT, DELETE   | `get_webhook`, `update_webhook`, `delete_webhook`          | Yes               | Get/Update/Delete specific webhook.                                     |
| `/webhooks/{webhookId}/resetSharedSecret`     | Yes                  | POST               | `reset_webhook_secret`                                     | Yes               | Resets webhook shared secret.                                           |
| `/workspaces`                                 | Yes                  | GET, POST          | `get_workspaces` (GET), `create_workspace` (POST)          | Consider          | List workspaces. Response size can vary. Create is fine.                |
| `/workspaces/{workspaceId}`                   | Yes                  | GET, PUT, DELETE   | `get_workspace` (GET)                                      | Yes               | Get specific workspace. Response can be large.                          |
| `/workspaces/{workspaceId}/copy`              | No                   | POST               | N/A                                                        | Yes               | Copies a workspace.                                                     |
| `/workspaces/{workspaceId}/folders`           | Yes                  | POST               | `create_workspace_folder` (POST). List via `get_workspace`. | Yes              | Manages folders within a workspace.                                     |
| `/workspaces/{workspaceId}/shares`            | Yes                  | GET, POST          | `list_workspace_shares`, `share_workspace`                 | Yes               | List/Manage workspace shares.                                           |
| `/workspaces/{workspaceId}/shares/{shareId}`  | Yes                  | GET, PUT, DELETE   | `update_workspace_share`, `delete_workspace_share`         | Yes               | Get/Update/Delete specific workspace share.                             |
| `/workspaces/{workspaceId}/sheets`            | No                   | GET                | N/A                                                        | Consider          | List sheets in workspace. List via `get_workspace`.                     |
| `/workspaces/{workspaceId}/sheets/import`     | No                   | POST               | N/A                                                        | Yes               | Imports a sheet into a workspace.                                       |

*Note: The `create_version_backup` tool is a workflow using multiple underlying API calls and is not listed as a direct endpoint coverer but its constituent calls are.*

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

## Environment Variables

- `SMARTSHEET_API_KEY`: Your Smartsheet API token (required)
- `ALLOW_DELETE_TOOLS`: Set to 'true' to enable deletion operations like delete_rows (default: false)

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
- `src/smartsheet-direct-api.ts`: Direct API client for Smartsheet
- `src/smartsheet-utils.ts`: Utility functions for common operations
- `src/smartsheet-workflows.ts`: Implementation of complex workflows
- `src/smartsheet-types`: Classes representing Smartsheet API objects
- `tests/`: Test files for various functionality
- `scripts/`: Utility scripts
- `examples/`: Example usage files
- `.env`: Environment variables
- `.env.example`: Template for environment variables
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
