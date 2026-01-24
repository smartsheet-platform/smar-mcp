# Source Tree Analysis

## Directory Structure

```
smar-mcp/
├── src/
│   ├── apis/                # Direct Smartsheet API interaction layer
│   │   ├── smartsheet-api.ts          # Main API client wrapper
│   │   └── smartsheet-*-api.ts        # Domain-specific API implementations
│   ├── tools/               # MCP Protocol Tool Definitions
│   │   └── smartsheet-*-tools.ts      # Tool implementations (Adapters)
│   ├── smartsheet-types/    # TypeScript interfaces for API responses
│   └── index.ts             # Entry Point: Server setup and tool registration
├── scripts/                 # Utility scripts (e.g., Claude config setup)
├── build/                   # Compiled JavaScript output (generated)
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Critical Directories

| Directory               | Purpose                                                                                                             | Key Files                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `src/`                  | Root source code                                                                                                    | `index.ts`                                                |
| `src/tools/`            | **Core Logic**: Defines the tools exposed to AI agents via MCP. Acts as the interface layer.                        | `smartsheet-sheet-tools.ts`, `smartsheet-search-tools.ts` |
| `src/apis/`             | **Data Layer**: Handles raw HTTP communication with Smartsheet API. Encapsulates authentication and error handling. | `smartsheet-api.ts`                                       |
| `src/smartsheet-types/` | **Types**: Shared type definitions to ensure type safety across layers.                                             | N/A                                                       |

## Entry Points

- **Application Root**: `src/index.ts`
  - Initializes `McpServer`.
  - Configures `SmartsheetAPI` client with env vars.
  - Registers all tool modules.
  - Connects to `StdioServerTransport`.

## Data Flow

1. **Request**: AI Agent sends tool execution request (e.g., `get_sheet`).
2. **Interface (Tools)**: `src/tools/smartsheet-sheet-tools.ts` receives request, validates args (Zod).
3. **Internal Logic**: Tool calls appropriate method on `SmartsheetAPI`.
4. **Data Layer (APIs)**: `src/apis/smartsheet-api.ts` makes HTTP request to Smartsheet.
5. **Response**: Data flows back up, is formatted by Tool, and sent to Agent.
