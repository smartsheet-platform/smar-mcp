import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

export function getTemplateTools(server: McpServer, api: SmartsheetAPI) {

  server.tool(
    "list_public_templates",
    "Lists all publicly available Smartsheet templates",
    {},
    async () => {
      try {
        console.info("Listing public templates");
        const templates = await api.templates.listPublicTemplates();
        return {
          content: [{ type: "text", text: JSON.stringify(templates, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to list public templates", { error });
        return {
          content: [{ type: "text", text: `Failed to list public templates: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "list_user_templates",
    "Lists templates created by the user",
    {},
    async () => {
      try {
        console.info("Listing user templates");
        const templates = await api.templates.listUserTemplates();
        return {
          content: [{ type: "text", text: JSON.stringify(templates, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to list user templates", { error });
        return {
          content: [{ type: "text", text: `Failed to list user templates: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "create_sheet_from_template",
    "Creates a new sheet from a template",
    {
      templateId: z.number().describe("The ID of the template to use"),
      sheetName: z.string().describe("Name for the new sheet"),
      folderId: z.number().optional().describe("ID of the folder to create the sheet in"),
      workspaceId: z.number().optional().describe("ID of the workspace to create the sheet in"),
      includes: z.array(z.enum(["data", "attachments", "discussions", "cellLinks", "forms"])).optional()
        .describe("Elements to include from the template"),
    },
    async ({ templateId, sheetName, folderId, workspaceId, includes }) => {
      try {
        console.info(`Creating sheet "${sheetName}" from template ${templateId}`);
        const result = await api.templates.createSheetFromTemplate(templateId, sheetName, {
          folderId,
          workspaceId,
          includes,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to create sheet from template ${templateId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to create sheet from template: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "create_sheet_in_folder_from_template",
    "Creates a new sheet in a folder from a template",
    {
      folderId: z.number().describe("The ID of the destination folder"),
      templateId: z.number().describe("The ID of the template to use"),
      sheetName: z.string().describe("Name for the new sheet"),
      includes: z.array(z.enum(["data", "attachments", "discussions", "cellLinks", "forms"])).optional()
        .describe("Elements to include from the template"),
    },
    async ({ folderId, templateId, sheetName, includes }) => {
      try {
        console.info(`Creating sheet "${sheetName}" in folder ${folderId} from template ${templateId}`);
        const result = await api.templates.createSheetInFolderFromTemplate(
          folderId, templateId, sheetName, includes
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to create sheet in folder from template`, { error });
        return {
          content: [{ type: "text", text: `Failed to create sheet from template: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "create_sheet_in_workspace_from_template",
    "Creates a new sheet in a workspace from a template",
    {
      workspaceId: z.number().describe("The ID of the destination workspace"),
      templateId: z.number().describe("The ID of the template to use"),
      sheetName: z.string().describe("Name for the new sheet"),
      includes: z.array(z.enum(["data", "attachments", "discussions", "cellLinks", "forms"])).optional()
        .describe("Elements to include from the template"),
    },
    async ({ workspaceId, templateId, sheetName, includes }) => {
      try {
        console.info(`Creating sheet "${sheetName}" in workspace ${workspaceId} from template ${templateId}`);
        const result = await api.templates.createSheetInWorkspaceFromTemplate(
          workspaceId, templateId, sheetName, includes
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to create sheet in workspace from template`, { error });
        return {
          content: [{ type: "text", text: `Failed to create sheet from template: ${error.message}` }],
          isError: true
        };
      }
    }
  );
}
