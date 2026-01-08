import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

type LogLevel = "debug" | "info" | "notice" | "warning" | "error" | "critical" | "alert" | "emergency";

let _server: McpServer | null = null;
let _connected = false;

/**
 * Initialize the logger with the MCP server instance.
 * Call this after creating the server.
 */
export function initLogger(server: McpServer): void {
  _server = server;
}

/**
 * Mark the server as connected.
 * Call this after server.connect() succeeds.
 */
export function setConnected(): void {
  _connected = true;
}

/**
 * Send a log message through the MCP protocol.
 * Falls back to stderr if server is not connected yet.
 */
function log(level: LogLevel, message: string, loggerName = "smartsheet"): void {
  if (_server && _connected) {
    _server.sendLoggingMessage({
      level,
      data: message,
      logger: loggerName,
    }).catch((err) => {
      // If sending fails, fall back to stderr
      console.error(`[${level.toUpperCase()}] ${message}`);
    });
  } else {
    // Before connection, use stderr
    console.error(`[${level.toUpperCase()}] ${message}`);
  }
}

export const logger = {
  debug: (message: string, loggerName?: string) => log("debug", message, loggerName),
  info: (message: string, loggerName?: string) => log("info", message, loggerName),
  notice: (message: string, loggerName?: string) => log("notice", message, loggerName),
  warning: (message: string, loggerName?: string) => log("warning", message, loggerName),
  error: (message: string, loggerName?: string) => log("error", message, loggerName),
  critical: (message: string, loggerName?: string) => log("critical", message, loggerName),
};
