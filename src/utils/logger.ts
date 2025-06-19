/**
 * Centralized logging module for the Smartsheet MCP server
 * 
 * Uses the MCP SDK logger utilities to provide structured logging
 * capabilities with configurable log levels and context.
 */

// Define the Logger interface
interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  trace: (message: string, ...args: any[]) => void;
  child: (context: Record<string, any>) => Logger;
}

// Mock logger factory if MCP logger is not available
const createMockLogger = (config: { level: string; name: string }): Logger => {
  console.log(`Creating mock logger with level ${config.level} for ${config.name}`);
  
  const logger: Logger = {
    debug: (message: string, ...args: any[]) => console.debug(`[${config.name}] [DEBUG] ${message}`, ...args),
    info: (message: string, ...args: any[]) => console.info(`[${config.name}] [INFO] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => console.warn(`[${config.name}] [WARN] ${message}`, ...args),
    error: (message: string, ...args: any[]) => console.error(`[${config.name}] [ERROR] ${message}`, ...args),
    trace: (message: string, ...args: any[]) => console.trace(`[${config.name}] [TRACE] ${message}`, ...args),
    child: (context: Record<string, any>) => {
      // Create a new logger with combined context
      const childName = `${config.name}:${Object.values(context).join(':')}`;
      return createMockLogger({ level: config.level, name: childName });
    }
  };

  return logger;
};

// Try to import MCP logger or use mock if not available
let createLogger: (config: { level: string; name: string }) => any;

// We use a try-catch pattern here to handle the case where the MCP logger isn't available
let mcpLogger;
try {
  // Try to import MCP logger
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  mcpLogger = require("@modelcontextprotocol/sdk/server/logger.js");
  createLogger = mcpLogger.createLogger;
} catch {
  console.warn("MCP logger not available, using mock logger instead");
  createLogger = createMockLogger;
}

/**
 * Log levels supported by the logger
 */
export const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
  TRACE: "trace"
};

/**
 * Global logger instance configured with environment settings
 */
export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  name: "smartsheet-mcp"
});

/**
 * Add request context to the logger
 * 
 * @param requestId - Unique identifier for the current request
 * @param userId - Optional user identifier
 * @returns Logger instance with added context
 */
export function withRequestContext(requestId: string, userId?: string) {
  return logger.child({
    requestId,
    ...(userId && { userId })
  });
}

/**
 * Create a logger with component context
 * 
 * @param component - Component name (e.g., "sheet-api", "search-tools")
 * @returns Logger instance with component context
 */
export function withComponent(component: string) {
  return logger.child({
    component
  });
}

/**
 * Format error objects consistently for logging
 * 
 * @param error - Any error object or value
 * @returns A structured error object with message and stack properties
 */
export function formatError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack
    };
  }
  return {
    message: String(error)
  };
}