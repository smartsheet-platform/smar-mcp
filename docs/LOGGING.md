# Logging Strategy

This document describes the logging strategy used in the Smartsheet MCP Server.

## Overview

The codebase uses a centralized logging utility located at `src/utils/logger.ts` that provides consistent logging across all modules. This approach ensures logs are properly integrated with the Model Context Protocol (MCP) and visible in Claude Desktop's logs.

## Why Centralized Logging?

1. **MCP Protocol Compliance**: MCP uses stdout exclusively for JSON-RPC messages. Any non-JSON output to stdout breaks the protocol. Our logger ensures all log messages go through the proper channels.

2. **Consistency**: All modules use the same logging interface with standardized log levels, making it easier to filter and monitor logs.

3. **Protocol Integration**: When connected, logs are sent via MCP's `sendLoggingMessage` API, making them visible in Claude Desktop's MCP logs panel.

## Log Levels

The logger provides six log levels that are exposed in the API:

- `debug`: Detailed diagnostic information for development
- `info`: General informational messages about normal operations
- `notice`: Significant but normal events
- `warning`: Warning messages for potentially problematic situations
- `error`: Error messages for failures that need attention
- `critical`: Critical failures requiring immediate attention

*Note: The MCP protocol specification includes additional log levels (`alert`, `emergency`) which are defined in the internal type but not currently exposed in the public logger API, as they are rarely needed for typical server logging.*

## Usage

### Importing the Logger

```typescript
import { logger } from '../utils/logger.js';
```

### Basic Logging

```typescript
// Debug information
logger.debug('API Request: GET /sheets/123');

// Informational messages
logger.info('Processing sheet data');

// Warnings
logger.warning('Rate limit approaching');

// Errors
logger.error('Failed to fetch sheet: Network timeout');
```

### When to Use Each Level

- **`debug`**: API requests, internal state changes, detailed flow information
  ```typescript
  logger.debug(`Copying sheet to folder: ${destinationFolderId}`);
  ```

- **`info`**: Normal operations, successful completions
  ```typescript
  logger.info(`Getting sheet with ID: ${sheetId}`);
  ```

- **`warning`**: Recoverable issues, deprecation notices, rate limiting
  ```typescript
  logger.warning(`Failed to get sheet location, using default folder: ${error.message}`);
  ```

- **`error`**: Failures, exceptions, error conditions
  ```typescript
  logger.error(`Failed to update rows in sheet ${sheetId}: ${error.message}`);
  ```

## Implementation Details

### Behavior Before Server Connection

Before the MCP server is connected, logs are written to stderr with a formatted prefix:

```
[DEBUG] API Request: GET /sheets/123
[INFO] Processing sheet data
[WARNING] Rate limit approaching
[ERROR] Failed to fetch sheet
```

### Behavior After Server Connection

Once the MCP server is connected (via `setConnected()`), logs are sent through MCP's `sendLoggingMessage` API. This allows Claude Desktop to:
- Display logs in its MCP logs panel
- Filter logs by level
- Provide better debugging experience

### Initialization

The logger must be initialized with the MCP server instance before use:

```typescript
import { initLogger, setConnected } from './utils/logger.js';

// After creating the server
initLogger(server);

// After server.connect() succeeds
await server.connect(transport);
setConnected();
```

## Migration from console.*

If you encounter any direct `console.*` calls in the codebase (except in `src/utils/logger.ts` itself), they should be migrated to use the logger:

| Old Code | New Code |
|----------|----------|
| `console.log(msg)` | `logger.info(msg)` |
| `console.debug(msg)` | `logger.debug(msg)` |
| `console.info(msg)` | `logger.info(msg)` |
| `console.warn(msg)` | `logger.warning(msg)` |
| `console.error(msg)` | `logger.error(msg)` |

## Testing Logs

### In Development

When running the server locally with `npm run dev`, logs will appear in stderr:

```bash
npm run dev
```

### In Claude Desktop

When the server is running through Claude Desktop:
1. Open Claude Desktop
2. Open Developer Tools (View → Developer Tools)
3. Click on the "MCP Logs" tab
4. In the logs panel, you can filter logs by typing "smartsheet" in the search/filter field to see only logs from this server

## Best Practices

1. **Always use the logger**: Never use `console.*` directly (except in the logger utility itself)

2. **Include context**: Add relevant identifiers and context to help with debugging
   ```typescript
   logger.error(`Failed to update ${rows.length} rows in sheet ${sheetId}: ${error.message}`);
   ```

3. **Choose appropriate levels**: Use the right log level for each message
   - Don't use `error` for warnings
   - Don't use `info` for debug-level details

4. **Keep messages concise**: Log messages should be clear and to the point

5. **Avoid sensitive data**: Never log API tokens, user passwords, or other sensitive information

## Related Files

- `src/utils/logger.ts`: Logger implementation
- `src/index.ts`: Logger initialization
- All API and tool files: Logger usage examples
