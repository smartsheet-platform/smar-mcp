/**
 * Helpers for sending notifications to MCP clients
 * 
 * This module provides utilities for sending standardized MCP notifications,
 * particularly log notifications following the MCP specification.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "../utils/logger.js";

/**
 * Rate limiting state for log notifications
 */
const rateLimiting = {
  counts: new Map<string, number>(),
  lastReset: Date.now(),
  windowMs: 60000, // 1 minute window
  maxPerWindow: 100, // max 100 messages of a specific level per minute
};

/**
 * Send a log message notification to the client
 * 
 * @param server - The MCP server instance
 * @param level - Log level (debug, info, notice, warning, error, critical, alert, emergency)
 * @param message - Log message text
 * @param loggerName - Optional logger name for categorization
 * @param data - Additional structured data for the log message
 */
interface McpServerWithNotify extends McpServer {
  notify: (method: string, params: any) => void;
}

export function sendLogNotification(
  server: McpServer,
  level: string,
  message: string,
  loggerName?: string,
  data?: Record<string, any>
): void {
  try {
    // Rate limit check
    if (isRateLimited(level)) {
      return;
    }

    // Clean data to ensure no sensitive information is included
    const sanitizedData = sanitizeLogData(data);

    // Send the notification
    (server as McpServerWithNotify).notify("notifications/message", {
      level,
      message,
      ...(loggerName && { logger: loggerName }),
      ...(sanitizedData && { data: sanitizedData })
    });
  } catch (error) {
    // Don't log errors from logging to avoid potential infinite loops
    console.error(`Failed to send log notification: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if a log level is currently rate limited
 * 
 * @param level - Log level to check
 * @returns True if rate limited, false otherwise
 */
function isRateLimited(level: string): boolean {
  const now = Date.now();
  
  // Reset counters if window has passed
  if (now - rateLimiting.lastReset > rateLimiting.windowMs) {
    rateLimiting.counts.clear();
    rateLimiting.lastReset = now;
  }
  
  // Get current count for this level
  const key = `log:${level}`;
  const count = rateLimiting.counts.get(key) ?? 0;
  
  // Check if rate limited
  if (count >= rateLimiting.maxPerWindow) {
    // Only log once when rate limiting starts
    if (count === rateLimiting.maxPerWindow) {
      logger.warn(`Log notifications for level ${level} are being rate limited`);
      rateLimiting.counts.set(key, count + 1);
    }
    return true;
  }
  
  // Increment counter
  rateLimiting.counts.set(key, count + 1);
  return false;
}

/**
 * Remove sensitive data from log data
 * 
 * @param data - Input data object
 * @returns Sanitized data object
 */
function sanitizeLogData(data?: Record<string, any>): Record<string, any> | undefined {
  if (!data) return undefined;
  
  const result: Record<string, any> = {};
  
  // Copy safe properties while filtering out potential sensitive ones
  for (const [key, value] of Object.entries(data)) {
    // Skip properties that might contain sensitive information
    if (
      key.toLowerCase().includes("token") || 
      key.toLowerCase().includes("password") ||
      key.toLowerCase().includes("secret") ||
      key.toLowerCase().includes("credential") ||
      key.toLowerCase().includes("auth") ||
      key.toLowerCase().includes("key")
    ) {
      result[key] = "[REDACTED]";
      continue;
    }
    
    // Handle nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeLogData(value as Record<string, any>);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}