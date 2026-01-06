import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

export function getAttachmentTools(server: McpServer, api: SmartsheetAPI, allowDeleteTools: boolean) {

  // Tool: List Sheet Attachments
  server.tool(
    "list_sheet_attachments",
    "Lists all attachments on a sheet",
    {
      sheetId: z.string().describe("The ID of the sheet"),
      pageSize: z.number().optional().describe("Number of attachments to return per page"),
      page: z.number().optional().describe("Page number to return"),
      includeAll: z.boolean().optional().describe("Include all results without pagination"),
    },
    async ({ sheetId, pageSize, page, includeAll }) => {
      try {
        console.info(`Listing attachments for sheet ${sheetId}`);
        const attachments = await api.attachments.listSheetAttachments(sheetId, pageSize, page, includeAll);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(attachments, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Failed to list attachments for sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: "text",
              text: `Failed to list attachments: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool: List Row Attachments
  server.tool(
    "list_row_attachments",
    "Lists all attachments on a specific row",
    {
      sheetId: z.string().describe("The ID of the sheet"),
      rowId: z.string().describe("The ID of the row"),
      pageSize: z.number().optional().describe("Number of attachments to return per page"),
      page: z.number().optional().describe("Page number to return"),
      includeAll: z.boolean().optional().describe("Include all results without pagination"),
    },
    async ({ sheetId, rowId, pageSize, page, includeAll }) => {
      try {
        console.info(`Listing attachments for row ${rowId} in sheet ${sheetId}`);
        const attachments = await api.attachments.listRowAttachments(sheetId, rowId, pageSize, page, includeAll);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(attachments, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Failed to list attachments for row ${rowId} in sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: "text",
              text: `Failed to list row attachments: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool: Get Attachment
  server.tool(
    "get_attachment",
    "Gets attachment metadata including download URL",
    {
      sheetId: z.string().describe("The ID of the sheet"),
      attachmentId: z.string().describe("The ID of the attachment"),
    },
    async ({ sheetId, attachmentId }) => {
      try {
        console.info(`Getting attachment ${attachmentId} from sheet ${sheetId}`);
        const attachment = await api.attachments.getAttachment(sheetId, attachmentId);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(attachment, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Failed to get attachment ${attachmentId} from sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: "text",
              text: `Failed to get attachment: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool: Attach URL to Sheet
  server.tool(
    "attach_url_to_sheet",
    "Attaches a URL (link, Google Drive, Dropbox, etc.) to a sheet",
    {
      sheetId: z.string().describe("The ID of the sheet"),
      name: z.string().describe("Display name for the attachment"),
      url: z.string().describe("The URL to attach"),
      attachmentType: z.enum(['LINK', 'BOX_COM', 'DROPBOX', 'EGNYTE', 'EVERNOTE', 'GOOGLE_DRIVE', 'ONEDRIVE'])
        .describe("Type of URL attachment"),
    },
    async ({ sheetId, name, url, attachmentType }) => {
      try {
        console.info(`Attaching URL to sheet ${sheetId}`);
        const attachment = await api.attachments.attachUrlToSheet(sheetId, name, url, attachmentType);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(attachment, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Failed to attach URL to sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: "text",
              text: `Failed to attach URL: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool: Attach URL to Row
  server.tool(
    "attach_url_to_row",
    "Attaches a URL (link, Google Drive, Dropbox, etc.) to a specific row",
    {
      sheetId: z.string().describe("The ID of the sheet"),
      rowId: z.string().describe("The ID of the row"),
      name: z.string().describe("Display name for the attachment"),
      url: z.string().describe("The URL to attach"),
      attachmentType: z.enum(['LINK', 'BOX_COM', 'DROPBOX', 'EGNYTE', 'EVERNOTE', 'GOOGLE_DRIVE', 'ONEDRIVE'])
        .describe("Type of URL attachment"),
    },
    async ({ sheetId, rowId, name, url, attachmentType }) => {
      try {
        console.info(`Attaching URL to row ${rowId} in sheet ${sheetId}`);
        const attachment = await api.attachments.attachUrlToRow(sheetId, rowId, name, url, attachmentType);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(attachment, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Failed to attach URL to row ${rowId} in sheet ${sheetId}`, { error });
        return {
          content: [
            {
              type: "text",
              text: `Failed to attach URL to row: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool: Delete Attachment (conditionally registered)
  if (allowDeleteTools) {
    server.tool(
      "delete_attachment",
      "Deletes an attachment from a sheet",
      {
        sheetId: z.string().describe("The ID of the sheet"),
        attachmentId: z.string().describe("The ID of the attachment to delete"),
      },
      async ({ sheetId, attachmentId }) => {
        try {
          console.info(`Deleting attachment ${attachmentId} from sheet ${sheetId}`);
          const result = await api.attachments.deleteAttachment(sheetId, attachmentId);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error: any) {
          console.error(`Failed to delete attachment ${attachmentId} from sheet ${sheetId}`, { error });
          return {
            content: [
              {
                type: "text",
                text: `Failed to delete attachment: ${error.message}`
              }
            ],
            isError: true
          };
        }
      }
    );
  }

}
