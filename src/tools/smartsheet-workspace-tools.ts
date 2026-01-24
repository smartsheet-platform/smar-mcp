import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";

export function getWorkspaceTools(server: McpServer, api: SmartsheetAPI) {
  server.tool(
    "list_workspaces",
    "Lists all workspaces",
    {},
    z.object({}),
    async () => {
      const result = await api.workspaces.listWorkspaces();
      return result;
    }
  );

  server.tool(
    "get_workspace",
    "Gets a single workspace",
    {
      workspaceId: {
        type: "number",
        description: "The ID of the workspace",
      },
    },
    z.object({
      workspaceId: z.number().describe("The ID of the workspace"),
    }),
    async ({ workspaceId }) => {
      const result = await api.workspaces.getWorkspace(workspaceId);
      return result;
    }
  );

  server.tool(
    "create_workspace",
    "Creates a new workspace",
    {
      name: {
        type: "string",
        description: "The name of the new workspace",
      },
    },
    z.object({
      name: z.string().describe("The name of the new workspace"),
    }),
    async ({ name }) => {
      const result = await api.workspaces.createWorkspace(name);
      return result;
    }
  );

  server.tool(
    "update_workspace",
    "Updates a workspace",
    {
      workspaceId: {
        type: "number",
        description: "The ID of the workspace to update",
      },
      name: {
        type: "string",
        description: "The new name of the workspace",
      },
    },
    z.object({
      workspaceId: z.number().describe("The ID of the workspace to update"),
      name: z.string().describe("The new name of the workspace"),
    }),
    async ({ workspaceId, name }) => {
      const result = await api.workspaces.updateWorkspace(workspaceId, name);
      return result;
    }
  );

  server.tool(
    "delete_workspace",
    "Deletes a workspace",
    {
      workspaceId: {
        type: "number",
        description: "The ID of the workspace to delete",
      },
    },
    z.object({
      workspaceId: z.number().describe("The ID of the workspace to delete"),
    }),
    async ({ workspaceId }) => {
      const result = await api.workspaces.deleteWorkspace(workspaceId);
      return result;
    }
  );
}