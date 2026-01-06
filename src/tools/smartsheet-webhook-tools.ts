import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

export function getWebhookTools(server: McpServer, api: SmartsheetAPI, allowDeleteTools: boolean) {

  server.tool(
    "list_webhooks",
    "Lists all webhooks for the authenticated user",
    {},
    async () => {
      try {
        console.info("Listing all webhooks");
        const webhooks = await api.webhooks.listWebhooks();
        return {
          content: [{ type: "text", text: JSON.stringify(webhooks, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to list webhooks", { error });
        return {
          content: [{ type: "text", text: `Failed to list webhooks: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_webhook",
    "Gets details of a specific webhook",
    {
      webhookId: z.number().describe("The ID of the webhook to retrieve"),
    },
    async ({ webhookId }) => {
      try {
        console.info(`Getting webhook ${webhookId}`);
        const webhook = await api.webhooks.getWebhook(webhookId);
        return {
          content: [{ type: "text", text: JSON.stringify(webhook, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to get webhook ${webhookId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to get webhook: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "create_webhook",
    "Creates a new webhook to receive notifications when a sheet changes",
    {
      name: z.string().describe("Name for the webhook"),
      callbackUrl: z.string().describe("URL to receive webhook callbacks"),
      scope: z.enum(["sheet"]).describe("Scope of the webhook (currently only 'sheet' is supported)"),
      scopeObjectId: z.number().describe("ID of the object to monitor (e.g., sheet ID)"),
      events: z.array(z.string()).describe("Events to trigger the webhook (e.g., ['*.*'] for all events)"),
      version: z.number().optional().describe("API version for webhook callbacks (default: 1)"),
    },
    async ({ name, callbackUrl, scope, scopeObjectId, events, version }) => {
      try {
        console.info(`Creating webhook "${name}" for ${scope} ${scopeObjectId}`);
        const result = await api.webhooks.createWebhook({
          name,
          callbackUrl,
          scope,
          scopeObjectId,
          events,
          version,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to create webhook "${name}"`, { error });
        return {
          content: [{ type: "text", text: `Failed to create webhook: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "update_webhook",
    "Updates an existing webhook (enable/disable or change callback URL)",
    {
      webhookId: z.number().describe("The ID of the webhook to update"),
      enabled: z.boolean().optional().describe("Whether the webhook is enabled"),
      callbackUrl: z.string().optional().describe("New callback URL for the webhook"),
    },
    async ({ webhookId, enabled, callbackUrl }) => {
      try {
        console.info(`Updating webhook ${webhookId}`);
        const result = await api.webhooks.updateWebhook(webhookId, { enabled, callbackUrl });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to update webhook ${webhookId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to update webhook: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  if (allowDeleteTools) {
    server.tool(
      "delete_webhook",
      "Deletes a webhook",
      {
        webhookId: z.number().describe("The ID of the webhook to delete"),
      },
      async ({ webhookId }) => {
        try {
          console.info(`Deleting webhook ${webhookId}`);
          await api.webhooks.deleteWebhook(webhookId);
          return {
            content: [{ type: "text", text: `Successfully deleted webhook ${webhookId}` }]
          };
        } catch (error: any) {
          console.error(`Failed to delete webhook ${webhookId}`, { error });
          return {
            content: [{ type: "text", text: `Failed to delete webhook: ${error.message}` }],
            isError: true
          };
        }
      }
    );
  }

  server.tool(
    "reset_webhook_secret",
    "Resets the shared secret for a webhook",
    {
      webhookId: z.number().describe("The ID of the webhook"),
    },
    async ({ webhookId }) => {
      try {
        console.info(`Resetting secret for webhook ${webhookId}`);
        const result = await api.webhooks.resetWebhookSecret(webhookId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to reset webhook secret for ${webhookId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to reset webhook secret: ${error.message}` }],
          isError: true
        };
      }
    }
  );
}
