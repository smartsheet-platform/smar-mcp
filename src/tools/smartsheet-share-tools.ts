import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

const accessLevelSchema = z.enum(["VIEWER", "EDITOR", "EDITOR_SHARE", "ADMIN", "OWNER"]);

export function getShareTools(server: McpServer, api: SmartsheetAPI, allowDeleteTools: boolean) {

  // Sheet Sharing
  server.tool(
    "list_sheet_shares",
    "Lists all shares (users/groups with access) for a sheet",
    {
      sheetId: z.number().describe("The ID of the sheet"),
    },
    async ({ sheetId }) => {
      try {
        console.info(`Listing shares for sheet ${sheetId}`);
        const shares = await api.shares.listSheetShares(sheetId);
        return {
          content: [{ type: "text", text: JSON.stringify(shares, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to list shares for sheet ${sheetId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to list sheet shares: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "share_sheet",
    "Shares a sheet with users or groups",
    {
      sheetId: z.number().describe("The ID of the sheet to share"),
      shares: z.array(z.object({
        email: z.string().optional().describe("Email of the user to share with"),
        groupId: z.number().optional().describe("ID of the group to share with"),
        accessLevel: accessLevelSchema.describe("Access level to grant"),
        subject: z.string().optional().describe("Email subject line"),
        message: z.string().optional().describe("Email message body"),
        ccMe: z.boolean().optional().describe("CC the sender on the share email"),
      })).describe("Array of share objects"),
    },
    async ({ sheetId, shares }) => {
      try {
        console.info(`Sharing sheet ${sheetId} with ${shares.length} recipients`);
        const result = await api.shares.shareSheet(sheetId, shares);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to share sheet ${sheetId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to share sheet: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "update_sheet_share",
    "Updates the access level of an existing share",
    {
      sheetId: z.number().describe("The ID of the sheet"),
      shareId: z.string().describe("The ID of the share to update"),
      accessLevel: accessLevelSchema.describe("New access level"),
    },
    async ({ sheetId, shareId, accessLevel }) => {
      try {
        console.info(`Updating share ${shareId} for sheet ${sheetId}`);
        const result = await api.shares.updateSheetShare(sheetId, shareId, accessLevel);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to update share ${shareId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to update share: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  if (allowDeleteTools) {
    server.tool(
      "delete_sheet_share",
      "Removes sharing access from a sheet",
      {
        sheetId: z.number().describe("The ID of the sheet"),
        shareId: z.string().describe("The ID of the share to delete"),
      },
      async ({ sheetId, shareId }) => {
        try {
          console.info(`Deleting share ${shareId} from sheet ${sheetId}`);
          await api.shares.deleteSheetShare(sheetId, shareId);
          return {
            content: [{ type: "text", text: `Successfully removed share ${shareId}` }]
          };
        } catch (error: any) {
          console.error(`Failed to delete share ${shareId}`, { error });
          return {
            content: [{ type: "text", text: `Failed to delete share: ${error.message}` }],
            isError: true
          };
        }
      }
    );
  }

  // Workspace Sharing
  server.tool(
    "list_workspace_shares",
    "Lists all shares for a workspace",
    {
      workspaceId: z.number().describe("The ID of the workspace"),
    },
    async ({ workspaceId }) => {
      try {
        console.info(`Listing shares for workspace ${workspaceId}`);
        const shares = await api.shares.listWorkspaceShares(workspaceId);
        return {
          content: [{ type: "text", text: JSON.stringify(shares, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to list shares for workspace ${workspaceId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to list workspace shares: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "share_workspace",
    "Shares a workspace with users or groups",
    {
      workspaceId: z.number().describe("The ID of the workspace to share"),
      shares: z.array(z.object({
        email: z.string().optional().describe("Email of the user to share with"),
        groupId: z.number().optional().describe("ID of the group to share with"),
        accessLevel: accessLevelSchema.describe("Access level to grant"),
      })).describe("Array of share objects"),
    },
    async ({ workspaceId, shares }) => {
      try {
        console.info(`Sharing workspace ${workspaceId} with ${shares.length} recipients`);
        const result = await api.shares.shareWorkspace(workspaceId, shares);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to share workspace ${workspaceId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to share workspace: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  // Report Sharing
  server.tool(
    "list_report_shares",
    "Lists all shares for a report",
    {
      reportId: z.number().describe("The ID of the report"),
    },
    async ({ reportId }) => {
      try {
        console.info(`Listing shares for report ${reportId}`);
        const shares = await api.shares.listReportShares(reportId);
        return {
          content: [{ type: "text", text: JSON.stringify(shares, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to list shares for report ${reportId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to list report shares: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "share_report",
    "Shares a report with users or groups",
    {
      reportId: z.number().describe("The ID of the report to share"),
      shares: z.array(z.object({
        email: z.string().optional().describe("Email of the user to share with"),
        groupId: z.number().optional().describe("ID of the group to share with"),
        accessLevel: accessLevelSchema.describe("Access level to grant"),
      })).describe("Array of share objects"),
    },
    async ({ reportId, shares }) => {
      try {
        console.info(`Sharing report ${reportId} with ${shares.length} recipients`);
        const result = await api.shares.shareReport(reportId, shares);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to share report ${reportId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to share report: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  // Folder Sharing
  server.tool(
    "list_folder_shares",
    "Lists all shares for a folder",
    {
      folderId: z.number().describe("The ID of the folder"),
    },
    async ({ folderId }) => {
      try {
        console.info(`Listing shares for folder ${folderId}`);
        const shares = await api.shares.listFolderShares(folderId);
        return {
          content: [{ type: "text", text: JSON.stringify(shares, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to list shares for folder ${folderId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to list folder shares: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "share_folder",
    "Shares a folder with users or groups",
    {
      folderId: z.number().describe("The ID of the folder to share"),
      shares: z.array(z.object({
        email: z.string().optional().describe("Email of the user to share with"),
        groupId: z.number().optional().describe("ID of the group to share with"),
        accessLevel: accessLevelSchema.describe("Access level to grant"),
      })).describe("Array of share objects"),
    },
    async ({ folderId, shares }) => {
      try {
        console.info(`Sharing folder ${folderId} with ${shares.length} recipients`);
        const result = await api.shares.shareFolder(folderId, shares);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to share folder ${folderId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to share folder: ${error.message}` }],
          isError: true
        };
      }
    }
  );
}
