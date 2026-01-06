import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

const objectTypeSchema = z.enum([
  "SHEET", "WORKSPACE", "FOLDER", "REPORT", "DASHBOARD",
  "ROW", "COLUMN", "CELL", "ATTACHMENT", "DISCUSSION",
  "COMMENT", "USER", "GROUP", "ACCESS_TOKEN"
]);

const actionSchema = z.enum([
  "CREATE", "UPDATE", "DELETE", "MOVE", "COPY", "LOAD",
  "SHARE", "UNSHARE", "RENAME", "ACTIVATE", "DEACTIVATE",
  "PURGE", "RESTORE", "LOGIN", "SEND", "DOWNLOAD", "IMPORT"
]);

export function getEventsTools(server: McpServer, api: SmartsheetAPI) {

  server.tool(
    "get_events",
    "Gets events from the audit log (requires admin privileges)",
    {
      since: z.string().optional().describe("ISO 8601 datetime or stream position to start from"),
      maxCount: z.number().optional().describe("Maximum number of events to return (1-10000)"),
      numericDates: z.boolean().optional().describe("Return dates as milliseconds since epoch"),
    },
    async ({ since, maxCount, numericDates }) => {
      try {
        console.info("Getting events from audit log");
        const events = await api.events.getEvents({ since, maxCount, numericDates });
        return {
          content: [{ type: "text", text: JSON.stringify(events, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to get events", { error });
        return {
          content: [{ type: "text", text: `Failed to get events: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_events_since",
    "Gets events since a specific timestamp",
    {
      timestamp: z.string().describe("ISO 8601 datetime to start from"),
      maxCount: z.number().optional().describe("Maximum number of events to return"),
    },
    async ({ timestamp, maxCount }) => {
      try {
        console.info(`Getting events since ${timestamp}`);
        const events = await api.events.getEventsSince(timestamp, maxCount);
        return {
          content: [{ type: "text", text: JSON.stringify(events, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to get events since ${timestamp}`, { error });
        return {
          content: [{ type: "text", text: `Failed to get events: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_recent_events",
    "Gets events from the last 24 hours",
    {
      maxCount: z.number().optional().describe("Maximum number of events to return"),
    },
    async ({ maxCount }) => {
      try {
        console.info("Getting recent events (last 24 hours)");
        const events = await api.events.getRecentEvents(maxCount);
        return {
          content: [{ type: "text", text: JSON.stringify(events, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to get recent events", { error });
        return {
          content: [{ type: "text", text: `Failed to get recent events: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_events_by_object_type",
    "Gets events filtered by object type",
    {
      objectType: objectTypeSchema.describe("Type of object to filter by"),
      since: z.string().optional().describe("ISO 8601 datetime to start from"),
      maxCount: z.number().optional().describe("Maximum number of events to return"),
    },
    async ({ objectType, since, maxCount }) => {
      try {
        console.info(`Getting ${objectType} events`);
        const events = await api.events.getEventsByObjectType(objectType, { since, maxCount });
        return {
          content: [{ type: "text", text: JSON.stringify(events, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to get ${objectType} events`, { error });
        return {
          content: [{ type: "text", text: `Failed to get events: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_events_by_action",
    "Gets events filtered by action type",
    {
      action: actionSchema.describe("Action type to filter by"),
      since: z.string().optional().describe("ISO 8601 datetime to start from"),
      maxCount: z.number().optional().describe("Maximum number of events to return"),
    },
    async ({ action, since, maxCount }) => {
      try {
        console.info(`Getting ${action} events`);
        const events = await api.events.getEventsByAction(action, { since, maxCount });
        return {
          content: [{ type: "text", text: JSON.stringify(events, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to get ${action} events`, { error });
        return {
          content: [{ type: "text", text: `Failed to get events: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_all_events",
    "Gets all events by paginating through the stream (may take time for large result sets)",
    {
      since: z.string().describe("ISO 8601 datetime to start from"),
      maxTotal: z.number().optional().describe("Maximum total number of events to retrieve"),
    },
    async ({ since, maxTotal }) => {
      try {
        console.info(`Getting all events since ${since}`);
        const events = await api.events.getAllEvents(since, maxTotal);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              totalEvents: events.length,
              events: events
            }, null, 2)
          }]
        };
      } catch (error: any) {
        console.error("Failed to get all events", { error });
        return {
          content: [{ type: "text", text: `Failed to get all events: ${error.message}` }],
          isError: true
        };
      }
    }
  );
}
