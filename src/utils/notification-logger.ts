/**
 * Logger implementation that sends notifications to MCP clients
 * 
 * This module extends the standard logger to also send notifications
 * to MCP clients when log messages are generated, following the MCP specification:
 * https://modelcontextprotocol.io/specification/2025-03-26/server/utilities/logging
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpLogger, logger as baseLogger } from "./logger.js";
import { sendLogNotification } from "../server/notification-helpers.js";

/**
 * Logger that wraps the base logger and sends notifications
 */
interface McpServerWithNotify extends McpServer {
  notify: (method: string, params: any) => void;
}

class NotificationLogger implements McpLogger {
  private server: McpServer;
  private component?: string;

  constructor(server: McpServer, component?: string) {
    this.server = server;
    this.component = component;
  }

  debug(message: string, ...args: any[]): void {
    baseLogger.debug(message, ...args);
    const data = args.length > 0 && typeof args[0] === 'object' ? args[0] : undefined;
    sendLogNotification(this.server as McpServerWithNotify, "debug", message, this.component, data);
  }

  info(message: string, ...args: any[]): void {
    baseLogger.info(message, ...args);
    const data = args.length > 0 && typeof args[0] === 'object' ? args[0] : undefined;
    sendLogNotification(this.server as McpServerWithNotify, "info", message, this.component, data);
  }

  notice(message: string, ...args: any[]): void {
    if (baseLogger.notice) {
      baseLogger.notice(message, ...args);
    } else {
      baseLogger.info(message, ...args); // Fallback to info
    }
    const data = args.length > 0 && typeof args[0] === 'object' ? args[0] : undefined;
    sendLogNotification(this.server as McpServerWithNotify, "notice", message, this.component, data);
  }

  warn(message: string, ...args: any[]): void {
    baseLogger.warn(message, ...args);
    const data = args.length > 0 && typeof args[0] === 'object' ? args[0] : undefined;
    sendLogNotification(this.server as McpServerWithNotify, "warning", message, this.component, data);
  }

  error(message: string, ...args: any[]): void {
    baseLogger.error(message, ...args);
    const data = args.length > 0 && typeof args[0] === 'object' ? args[0] : undefined;
    sendLogNotification(this.server as McpServerWithNotify, "error", message, this.component, data);
  }

  critical(message: string, ...args: any[]): void {
    if (baseLogger.critical) {
      baseLogger.critical(message, ...args);
    } else {
      baseLogger.error(message, ...args); // Fallback to error
    }
    const data = args.length > 0 && typeof args[0] === 'object' ? args[0] : undefined;
    sendLogNotification(this.server as McpServerWithNotify, "critical", message, this.component, data);
  }

  alert(message: string, ...args: any[]): void {
    if (baseLogger.alert) {
      baseLogger.alert(message, ...args);
    } else {
      baseLogger.error(message, ...args); // Fallback to error
    }
    const data = args.length > 0 && typeof args[0] === 'object' ? args[0] : undefined;
    sendLogNotification(this.server as McpServerWithNotify, "alert", message, this.component, data);
  }

  emergency(message: string, ...args: any[]): void {
    if (baseLogger.emergency) {
      baseLogger.emergency(message, ...args);
    } else {
      baseLogger.error(message, ...args); // Fallback to error
    }
    const data = args.length > 0 && typeof args[0] === 'object' ? args[0] : undefined;
    sendLogNotification(this.server as McpServerWithNotify, "emergency", message, this.component, data);
  }

  trace(message: string, ...args: any[]): void {
    if (baseLogger.trace) {
      baseLogger.trace(message, ...args);
    } else {
      baseLogger.debug(message, ...args); // Fallback to debug
    }
    const data = args.length > 0 && typeof args[0] === 'object' ? args[0] : undefined;
    sendLogNotification(this.server as McpServerWithNotify, "debug", message, this.component, data);
  }

  child(context: Record<string, any>): McpLogger {
    // Determine the new component name based on context
    let childComponent = this.component;
    
    if (context.component) {
      childComponent = this.component 
        ? `${this.component}:${context.component}` 
        : context.component;
    }
    
    return new NotificationLogger(this.server, childComponent);
  }

  setLevel(level: string): void {
    if (typeof baseLogger.setLevel === 'function') {
      baseLogger.setLevel(level);
    } else {
      console.warn(`Base logger doesn't support dynamic level setting, ignoring level change to ${level}`);
    }
  }
}

/**
 * Create a notification-enabled logger for use with MCP
 * 
 * @param server - The MCP server instance
 * @param component - Optional component name
 * @returns A logger that sends notifications to the client
 */
export function createNotificationLogger(server: McpServer, component?: string): McpLogger {
  return new NotificationLogger(server, component);
}

/**
 * Create a component-specific notification logger
 * 
 * @param server - The MCP server instance
 * @param component - Component name (e.g., "sheet-api", "search-tools")
 * @returns Logger instance with component context that sends notifications
 */
export function withNotificationComponent(server: McpServer, component: string): McpLogger {
  return createNotificationLogger(server, component);
}