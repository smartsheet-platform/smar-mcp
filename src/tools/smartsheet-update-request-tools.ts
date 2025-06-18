import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";
import { withComponent } from "../utils/logger.js";

// Create component-specific logger
const updateRequestLogger = withComponent('update-request-tools');

export function getUpdateRequestTools(server: McpServer, api: SmartsheetAPI) {

    // Tool: Create Update Request
    server.tool(
      "create_update_request",
      "Creates an update request for a sheet",
      {
        sheetId: z.string().describe("The ID of the sheet"),
        rowIds: z.array(z.number()).optional().describe("Array of row IDs to include in the update request"),
        columnIds: z.array(z.number()).optional().describe("Array of column IDs to include in the update request"),
        includeAttachments: z.boolean().optional().describe("Whether to include attachments in the update request"),
        includeDiscussions: z.boolean().optional().describe("Whether to include discussions in the update request"),
        message: z.string().optional().describe("Message to include in the update request email"),
        subject: z.string().optional().describe("Subject line for the update request email"),
        ccMe: z.boolean().optional().describe("Whether to CC the sender on the update request email"),
        sendTo: z.array(
          z.object({
            email: z.string().describe("Email address of the recipient")
          })
        ).describe("Array of recipients for the update request"),
      },
      async ({ sheetId, rowIds, columnIds, includeAttachments, includeDiscussions, message, subject, ccMe, sendTo }) => {
        try {
          updateRequestLogger.info(`Creating update request`, { 
            sheetId,
            rowCount: rowIds?.length || 0,
            columnCount: columnIds?.length || 0,
            recipientCount: sendTo.length
          });
          const result = await api.sheets.createUpdateRequest(sheetId, {
            rowIds,
            columnIds,
            includeAttachments,
            includeDiscussions,
            message,
            subject,
            ccMe,
            sendTo
          });
          
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error: any) {
          updateRequestLogger.error(`Failed to create update request`, { 
            sheetId,
            error: error instanceof Error ? error.message : String(error),
            stack: error.stack 
          });
          return {
            content: [
              {
                type: "text",
                text: `Failed to create update request: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

}
