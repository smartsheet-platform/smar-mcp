/**
 * MCP Logging Capability Implementation
 * 
 * This module implements the MCP logging capability as defined in the MCP specification:
 * https://modelcontextprotocol.io/specification/2025-03-26/server/utilities/logging
 * 
 * It registers the logging capability with the MCP server and implements
 * the logging/setLevel method for controlling log level.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LOG_LEVELS, logger } from "../utils/logger.js";
import { sendLogNotification } from "./notification-helpers.js";

/**
 * Register the logging capability with the MCP server
 * 
 * @param server - The MCP server instance
 */
interface McpServerExtended extends McpServer {
  capabilities: Record<string, any>;
  method: (name: string, handler: (params: any) => Promise<any>) => void;
  notify: (method: string, params: any) => void;
}

export function registerLoggingCapability(server: McpServer): void {
  const mcpServer = server as McpServerExtended;
  
  // Declare the logging capability
  mcpServer.capabilities.logging = {};

  // Register the logging/setLevel method handler
  mcpServer.method("logging/setLevel", async ({ level }: { level: string }) => {
    // Validate log level
    const validLevels = Object.values(LOG_LEVELS).map(l => l.toLowerCase());
    if (!validLevels.includes(level.toLowerCase())) {
      throw new Error(`Invalid log level: ${level}. Valid levels are: ${validLevels.join(", ")}`);
    }

    try {
      // Set the log level on the logger
      if (typeof logger.setLevel === 'function') {
        logger.setLevel(level.toLowerCase());
        logger.info(`Log level set to: ${level}`);
        sendLogNotification(mcpServer, "info", `Log level set to: ${level}`, "logging-capability");
      } else {
        logger.warn(`Logger doesn't support dynamic level setting, level change to ${level} ignored`);
        sendLogNotification(mcpServer, "warning", `Logger doesn't support dynamic level setting, level change ignored`, "logging-capability", { requestedLevel: level });
      }
      
      // Return empty result per specification
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logger.error(`Failed to set log level to ${level}`, {
        error: errorMessage,
        stack: errorStack
      });
      
      sendLogNotification(mcpServer, "error", `Failed to set log level`, "logging-capability", {
        requestedLevel: level,
        error: errorMessage
      });
      
      throw new Error(`Failed to set log level: ${errorMessage}`);
    }
  });
}