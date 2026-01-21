# Component Inventory

## MCP Tools (AI Capabilities)
These are the primary components exposed by this server.

| Tool Module | Description | Key Capabilities |
|-------------|-------------|------------------|
| **Discussion Tools** | Manage sheet discussions | `get_discussion`, `add_discussion_comment` |
| **Folder Tools** | Folder navigation and management | `list_folders`, `get_folder`, `create_folder` |
| **Search Tools** | Global search capability | `search_everything` |
| **Sheet Tools** | Core sheet manipulation | `get_sheet`, `list_sheets`, `create_sheet`, `add_rows` |
| **Update Request Tools** | Manage update requests | `get_update_request` |
| **User Tools** | User management | `get_current_user`, `get_user`, `list_users` |
| **Workspace Tools** | Workspace organization | `list_workspaces`, `get_workspace` |

## API Clients (Internal Services)
Internal abstractions for calling Smartsheet API.

| Wrapper Component | Purpose |
|-------------------|---------|
| `SmartsheetAPI` | Central client, manages authentication and base URL |
| `SmartsheetSheetAPI` | Handles sheet-specific endpoints (`/sheets`) |
| `SmartsheetSearchAPI` | Handles search endpoints (`/search`) |
| `SmartsheetUserAPI` | Handles user endpoints (`/users`) |
| etc... | (Pattern repeats for other domains) |

## Shared Utilities
- **Configuration**: `dotenv` loading in `index.ts`.
- **Validation**: `zod` schemas used within tool definitions.
