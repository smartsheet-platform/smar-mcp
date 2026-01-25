import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SmartsheetAPI } from '../apis/smartsheet-api.js';

export function getWorkspaceTools(server: McpServer, api: SmartsheetAPI) {
  server.tool('list_workspaces', 'Lists all workspaces', async () => {
    const result = await api.workspaces.listWorkspaces();
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  });

  const getWorkspaceSchema = {
    workspaceId: z.number().describe('The ID of the workspace'),
  };

  server.tool(
    'get_workspace',
    'Gets a single workspace',
    getWorkspaceSchema as any,
    async (args: any) => {
      const { workspaceId } = args;
      const result = await api.workspaces.getWorkspace(workspaceId.toString());
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  const createWorkspaceSchema = {
    name: z.string().describe('The name of the new workspace'),
  };

  server.tool(
    'create_workspace',
    'Creates a new workspace',
    createWorkspaceSchema as any,
    async (args: any) => {
      const { name } = args;
      const result = await api.workspaces.createWorkspace(name);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  const updateWorkspaceSchema = {
    workspaceId: z.number().describe('The ID of the workspace to update'),
    name: z.string().describe('The new name of the workspace'),
  };

  server.tool(
    'update_workspace',
    'Updates a workspace',
    updateWorkspaceSchema as any,
    async (args: any) => {
      const { workspaceId, name } = args;
      const result = await api.workspaces.updateWorkspace(workspaceId, name);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  const deleteWorkspaceSchema = {
    workspaceId: z.number().describe('The ID of the workspace to delete'),
  };

  server.tool(
    'delete_workspace',
    'Deletes a workspace',
    deleteWorkspaceSchema as any,
    async (args: any) => {
      const { workspaceId } = args;
      const result = await api.workspaces.deleteWorkspace(workspaceId);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );
}
