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
| `/events`                                     | No                   | GET                | N/A                                                        | No          | Event stream. Potentially large/continuous. Needs specific handling.    |
| `/favorites`                                  | No                   | GET, POST          | N/A                                                        | Yes               | Manages user favorites.                                                 |
| `/favorites/{favoriteType}`                   | No                   | GET, POST          | N/A                                                        | Yes               | Manages user favorites by type.                                         |
| `/favorites/{favoriteType}/{favoriteId}`      | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Manages a specific user favorite.                                       |
| `/filteredEvents`                             | No                   | GET                | N/A                                                        | Consider          | Filtered event stream. Potentially large. Needs specific handling.      |
| `/folders/{folderId}`                         | Yes                  | GET, PUT, DELETE   | `get_folder` (GET)                                         | Yes               | Retrieves a specific folder.                                            |
| `/folders/{folderId}/copy`                    | No                   | POST               | N/A                                                        | Yes               | Copies a folder.                                                        |
| `/folders/{folderId}/folders`                 | Yes                  | POST               | `create_folder` (POST)                                     | Yes               | Manages sub-folders (create). List via `get_folder`.                  |
| `/folders/{folderId}/move`                    | No                   | POST               | N/A                                                        | Yes               | Moves a folder.                                                         |
| `/folders/{folderId}/sheets`                  | Yes                  | POST               | `create_sheet` (POST with folderId). List via `get_folder`. | Yes               | Manages sheets within a folder.                                         |
| `/folders/{folderId}/sheets/import`           | No                   | POST               | N/A                                                        | Yes               | Imports a sheet into a folder.                                          |
| `/folders/personal`                           | No                   | GET                | N/A                                                        | Yes               | Accesses personal folders (Smartsheet specific, likely `GET /home/folders`). |
| `/groups`                                     | No                   | GET, POST          | N/A                                                        | Consider          | List operation. Response size can vary.                                 |
| `/groups/{groupId}`                           | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Retrieves a specific group.                                             |
| `/groups/{groupId}/members`                   | No                   | GET, POST          | N/A                                                        | Consider          | List operation. Response size can vary.                                 |
| `/groups/{groupId}/members/{userId}`          | No                   | DELETE             | N/A                                                        | Yes               | Manages a specific group member.                                        |
| `/home/folders`                               | No                   | GET                | N/A                                                        | Yes               | Lists folders in the user's home.                                       |
| `/imageurls`                                  | No                   | POST               | N/A                                                        | Consider          | Generates URLs for images. Response size depends on request.            |
| `/reports`                                    | No                   | GET                | N/A                                                        | Consider          | List operation. Response size can vary.                                 |
| `/reports/{reportId}`                         | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Retrieves a specific report.                                            |
| `/reports/{reportId}/emails`                  | No                   | POST               | N/A                                                        | Yes               | Sends a report via email.                                               |
| `/reports/{reportId}/publish`                 | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Manages report publishing.                                              |
| `/reports/{reportId}/shares`                  | No                   | GET, POST          | N/A                                                        | Consider          | List operation. Manages report shares.                                  |
| `/reports/{reportId}/shares/{shareId}`        | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Manages a specific report share.                                        |
| `/search`                                     | No                   | GET                | N/A                                                        | Consider          | Global search. Response size can be very large.                         |
| `/search/sheets/{sheetId}`                    | No                   | GET                | N/A                                                        | Consider          | Search within a specific sheet. Response size can vary.                 |
| `/serverinfo`                                 | No                   | GET                | N/A                                                        | Yes               | Retrieves server information. Small response.                           |
| `/sheets`                                     | Yes                  | GET, POST          | `create_sheet` (POST without folderId). List not directly exposed. | Consider      | List operation (not exposed as tool). Response size can be very large.  |
| `/sheets/import`                              | No                   | POST               | N/A                                                        | Yes               | Imports a sheet.                                                        |
| `/sheets/{sheetId}`                           | Yes                  | GET, PUT, DELETE   | `get_sheet` (GET), `get_sheet_location` (uses GET)         | Yes               | Retrieves a specific sheet. Response can be large.                      |
| `/sheets/{sheetId}/attachments`               | No                   | GET, POST          | N/A                                                        | Consider          | List/Manage attachments. Involves binary data.                          |
| `/sheets/{sheetId}/attachments/{attachmentId}` | No                   | GET, DELETE        | N/A                                                        | Consider          | Get/Delete specific attachment. Involves binary data.                   |
| `/sheets/{sheetId}/attachments/{attachmentId}/versions` | No         | GET                | N/A                                                        | Consider          | List attachment versions.                                               |
| `/sheets/{sheetId}/automationrules`           | No                   | GET, POST          | N/A                                                        | Consider          | List/Manage automation rules.                                           |
| `/sheets/{sheetId}/automationrules/{automationRuleId}` | No          | GET, PUT, DELETE   | N/A                                                        | Yes               | Get/Update/Delete specific automation rule.                             |
| `/sheets/{sheetId}/columns`                   | No                   | GET, POST          | N/A                                                        | Consider          | List/Manage columns. Response size depends on sheet complexity.         |
| `/sheets/{sheetId}/columns/{columnId}`        | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Get/Update/Delete specific column.                                      |
| `/sheets/{sheetId}/comments/{commentId}`      | No                   | GET, DELETE        | N/A                                                        | Yes               | Get/Delete specific comment.                                            |
| `/sheets/{sheetId}/comments/{commentId}/attachments` | No            | GET, POST          | N/A                                                        | Consider          | Manage attachments for a comment. Involves binary data.                 |
| `/sheets/{sheetId}/copy`                      | Yes                  | POST               | `copy_sheet` (POST)                                        | Yes               | Copies a sheet.                                                         |
| `/sheets/{sheetId}/crosssheetreferences`      | No                   | GET, POST          | N/A                                                        | Consider          | List/Manage cross-sheet references.                                     |
| `/sheets/{sheetId}/crosssheetreferences/{crossSheetReferenceId}` | No | GET, DELETE        | N/A                                                        | Yes               | Get/Delete specific cross-sheet reference.                              |
| `/sheets/{sheetId}/discussions`               | Yes                  | GET, POST          | `get_sheet_discussions` (GET)                              | Consider          | List discussions. Response size can vary.                               |
| `/sheets/{sheetId}/discussions/{discussionId}` | No                  | GET, DELETE        | N/A                                                        | Yes               | Get/Delete specific discussion.                                         |
| `/sheets/{sheetId}/discussions/{discussionId}/attachments` | No      | GET, POST          | N/A                                                        | Consider          | Manage attachments for a discussion. Involves binary data.              |
| `/sheets/{sheetId}/discussions/{discussionId}/comments` | No         | GET, POST          | N/A                                                        | Consider          | List/Add comments to a discussion.                                      |
| `/sheets/{sheetId}/emails`                    | No                   | POST               | N/A                                                        | Yes               | Sends a sheet via email.                                                |
| `/sheets/{sheetId}/move`                      | No                   | POST               | N/A                                                        | Yes               | Moves a sheet.                                                          |
| `/sheets/{sheetId}/proofs`                    | No                   | GET, POST          | N/A                                                        | Consider          | List/Manage proofs.                                                     |
| `/sheets/{sheetId}/proofs/{proofId}`          | No                   | GET, PUT           | N/A                                                        | Yes               | Get/Update specific proof.                                              |
| `/sheets/{sheetId}/proofs/{proofId}/attachments` | No                | GET, POST          | N/A                                                        | Consider          | Manage attachments for a proof. Involves binary data.                   |
| `/sheets/{sheetId}/proofs/{proofId}/discussions` | No                | GET, POST          | N/A                                                        | Consider          | Manage discussions for a proof.                                         |
| `/sheets/{sheetId}/proofs/{proofId}/requestactions` | No             | POST               | N/A                                                        | Yes               | Manage request actions for a proof.                                     |
| `/sheets/{sheetId}/proofs/{proofId}/requests` | No                   | GET, POST          | N/A                                                        | Consider          | Manage requests for a proof.                                            |
| `/sheets/{sheetId}/proofs/{proofId}/versions` | No                   | GET                | N/A                                                        | Consider          | List versions of a proof.                                               |
| `/sheets/{sheetId}/publish`                   | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Manages sheet publishing.                                               |
| `/sheets/{sheetId}/rows`                      | Yes                  | GET, POST, PUT, DELETE | `update_rows` (PUT), `add_rows` (POST), `delete_rows` (DELETE) | Yes           | Manages rows. Individual row operations are fine. Bulk can be large.    |
| `/sheets/{sheetId}/rows/copy`                 | No                   | POST               | N/A                                                        | Yes               | Copies rows within or between sheets.                                   |
| `/sheets/{sheetId}/rows/emails`               | No                   | POST               | N/A                                                        | Yes               | Sends rows via email.                                                   |
| `/sheets/{sheetId}/rows/move`                 | No                   | POST               | N/A                                                        | Yes               | Moves rows within or between sheets.                                    |
| `/sheets/{sheetId}/rows/{rowId}`              | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Get/Update/Delete specific row.                                         |
| `/sheets/{sheetId}/rows/{rowId}/attachments`  | No                   | GET, POST          | N/A                                                        | Consider          | Manage attachments for a row. Involves binary data.                     |
| `/sheets/{sheetId}/rows/{rowId}/columns/{columnId}/cellimages` | No  | GET, POST, DELETE  | N/A                                                        | Consider          | Manage cell images. Involves binary data.                               |
| `/sheets/{sheetId}/rows/{rowId}/columns/{columnId}/history` | Yes    | GET                | `get_cell_history` (GET)                                   | Yes               | Retrieves cell history. Response size can vary.                         |
| `/sheets/{sheetId}/rows/{rowId}/discussions`  | Yes                  | GET, POST          | `create_row_discussion` (POST). List via parent.           | Yes               | Manages discussions for a row.                                          |
| `/sheets/{sheetId}/rows/{rowId}/proofs`       | No                   | GET, POST          | N/A                                                        | Consider          | Manage proofs for a row.                                                |
| `/sheets/{sheetId}/sentupdaterequests`        | No                   | GET                | N/A                                                        | Consider          | List sent update requests.                                              |
| `/sheets/{sheetId}/sentupdaterequests/{sentUpdateRequestId}` | No    | GET, DELETE        | N/A                                                        | Yes               | Get/Delete specific sent update request.                                |
| `/sheets/{sheetId}/shares`                    | No                   | GET, POST          | N/A                                                        | Consider          | List/Manage sheet shares.                                               |
| `/sheets/{sheetId}/shares/{shareId}`          | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Get/Update/Delete specific sheet share.                                 |
| `/sheets/{sheetId}/sort`                      | No                   | POST               | N/A                                                        | Yes               | Sorts a sheet.                                                          |
| `/sheets/{sheetId}/summary`                   | No                   | GET                | N/A                                                        | Yes               | Get sheet summary.                                                      |
| `/sheets/{sheetId}/summary/fields`            | No                   | GET, POST, PUT     | N/A                                                        | Yes               | List/Add/Update sheet summary fields.                                   |
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
| `/templates`                                  | No                   | GET                | N/A                                                        | Consider          | List templates. Response size can vary.                                 |
| `/templates/public`                           | No                   | GET                | N/A                                                        | Consider          | List public templates. Response size can vary.                          |
| `/token`                                      | No                   | POST               | N/A                                                        | No               | OAuth token endpoint. Handled by auth flow, not direct MCP tool.        |
| `/users`                                      | No                   | GET, POST          | N/A                                                        | Consider          | List users. Response size can be very large. Requires admin.            |
| `/users/me`                                   | No                   | GET                | N/A                                                        | Yes               | Retrieves current user details. Small response.                         |
| `/users/sheets`                               | No                   | GET                | N/A                                                        | Consider          | List sheets owned by or shared with users. Potentially large.           |
| `/users/{userId}`                             | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Get specific user.                                                      |
| `/users/{userId}/alternateemails`             | No                   | GET, POST          | N/A                                                        | Yes               | Manage alternate emails for a user.                                     |
| `/users/{userId}/alternateemails/{alternateEmailId}` | No            | GET, DELETE        | N/A                                                        | Yes               | Manage a specific alternate email.                                      |
| `/users/{userId}/alternateemails/{alternateEmailId}/makeprimary` | No | POST               | N/A                                                        | Yes               | Makes an alternate email primary.                                       |
| `/users/{userId}/deactivate`                  | No                   | DELETE             | N/A                                                        | Yes               | Deactivates a user. (Admin)                                             |
| `/users/{userId}/profileimage`                | No                   | GET, PUT, DELETE   | N/A                                                        | Consider          | Manage user profile image. Involves binary data.                        |
| `/users/{userId}/reactivate`                  | No                   | POST               | N/A                                                        | Yes               | Reactivates a user. (Admin)                                             |
| `/webhooks`                                   | No                   | GET, POST          | N/A                                                        | Consider          | List/Manage webhooks.                                                   |
| `/webhooks/{webhookId}`                       | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Get/Update/Delete specific webhook.                                     |
| `/webhooks/{webhookId}/resetSharedSecret`     | No                   | POST               | N/A                                                        | Yes               | Resets webhook shared secret.                                           |
| `/workspaces`                                 | Yes                  | GET, POST          | `get_workspaces` (GET), `create_workspace` (POST)          | Consider          | List workspaces. Response size can vary. Create is fine.                |
| `/workspaces/{workspaceId}`                   | Yes                  | GET, PUT, DELETE   | `get_workspace` (GET)                                      | Yes               | Get specific workspace. Response can be large.                          |
| `/workspaces/{workspaceId}/copy`              | No                   | POST               | N/A                                                        | Yes               | Copies a workspace.                                                     |
| `/workspaces/{workspaceId}/folders`           | Yes                  | POST               | `create_workspace_folder` (POST). List via `get_workspace`. | Yes              | Manages folders within a workspace.                                     |
| `/workspaces/{workspaceId}/shares`            | No                   | GET, POST          | N/A                                                        | Consider          | List/Manage workspace shares.                                           |
| `/workspaces/{workspaceId}/shares/{shareId}`  | No                   | GET, PUT, DELETE   | N/A                                                        | Yes               | Get/Update/Delete specific workspace share.                             |
| `/workspaces/{workspaceId}/sheets`            | No                   | GET                | N/A                                                        | Consider          | List sheets in workspace. List via `get_workspace`.                     |
| `/workspaces/{workspaceId}/sheets/import`     | No                   | POST               | N/A                                                        | Yes               | Imports a sheet into a workspace.                                       |