import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SmartsheetAPI } from '../apis/smartsheet-api.js';
import { z } from 'zod';

export function getFolderTools(server: McpServer, api: SmartsheetAPI) {
  // Tool: Get Folder
  const getFolderSchema = {
    folderId: z.string().describe('The ID of the folder to retrieve'),
  };

  server.tool(
    'get_folder',
    'Retrieves the current state of a folder, including its contents which can be sheets, reports, or other folders',
    getFolderSchema as any,
    async (args: any) => {
      const { folderId } = args;
      try {
        console.info(`Getting folder with ID: ${folderId}`);
        const folder = await api.folders.getFolder(folderId);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(folder, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to get folder with ID: ${folderId}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to get_folder: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Tool: Create Folder in folder
  const createFolderSchema = {
    folderId: z.string().describe('The ID of the folder to create the folder in'),
    folderName: z.string().describe('The name of the new folder'),
  };

  server.tool(
    'create_folder',
    'Creates a new folder in a folder',
    createFolderSchema as any,
    async (args: any) => {
      const { folderId, folderName } = args;
      try {
        console.info(`Creating folder in workspace with ID: ${folderId}`);
        const folder = await api.folders.createFolder(folderId, folderName);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(folder, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to create folder in workspace with ID: ${folderId}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to create_folder: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Tool: Create Folder in workspace
  const createWorkspaceFolderSchema = {
    workspaceId: z.string().describe('The ID of the workspace to create the folder in'),
    folderName: z.string().describe('The name of the new folder'),
  };

  server.tool(
    'create_workspace_folder',
    'Creates a new folder in a workspace',
    createWorkspaceFolderSchema as any,
    async (args: any) => {
      const { workspaceId, folderName } = args;
      try {
        console.info(`Creating folder in workspace with ID: ${workspaceId}`);
        const folder = await api.workspaces.createWorkspaceFolder(workspaceId, folderName);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(folder, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Failed to create folder in workspace with ID: ${workspaceId}`, { error });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to create_workspace_folder: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
