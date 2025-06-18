import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";
import { withComponent } from "../utils/logger.js";

// Create component-specific logger
const folderLogger = withComponent('folder-tools');

export function getFolderTools(server: McpServer, api: SmartsheetAPI) {

    // Tool: Get Folder
    server.tool(
        "get_folder",
        "Retrieves the current state of a folder, including its contents which can be sheets, reports, or other folders",
        {
        folderId: z.string().describe("The ID of the folder to retrieve")
        },
        async ({ folderId}) => {
        try {
            folderLogger.info(`Getting folder`, { folderId });
            const folder = await api.folders.getFolder(folderId);

            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(folder, null, 2)
                }
            ]
            };
        } catch (error: any) {
            folderLogger.error(`Failed to get folder`, { 
                folderId, 
                error: error instanceof Error ? error.message : String(error),
                stack: error.stack 
            });
            return {
            content: [
                {
                type: "text",
                text: `Failed to get_folder: ${error instanceof Error ? error.message : String(error)}`
                }
            ],
            isError: true
            };
        }
        }
    );

    // Tool: Create Folder in folder
    server.tool(
        "create_folder",
        "Creates a new folder in a folder",
        {
        folderId: z.string().describe("The ID of the folder to create the folder in"),
        folderName: z.string().describe("The name of the new folder")
        },
        async ({ folderId, folderName }) => {
        try {
            console.info(`Creating folder in workspace with ID: ${folderId}`);
            const folder = await api.folders.createFolder(folderId, folderName);

            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(folder, null, 2)
                }
            ]
            };
        } catch (error: any) {
            console.error(`Failed to create folder in workspace with ID: ${folderId}`, { error });
            return {
            content: [
                {
                type: "text",
                text: `Failed to create_folder: ${error.message}`
                }
            ],
            isError: true
            };
        }
        }
    );

    // Tool: Create Folder in workspace
    server.tool(
        "create_workspace_folder",
        "Creates a new folder in a workspace",
        {
        workspaceId: z.string().describe("The ID of the workspace to create the folder in"),
        folderName: z.string().describe("The name of the new folder")
        },
        async ({ workspaceId, folderName }) => {
        try {
            console.info(`Creating folder in workspace with ID: ${workspaceId}`);
            const folder = await api.workspaces.createWorkspaceFolder(workspaceId, folderName);

            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(folder, null, 2)
                }
            ]
            };
        } catch (error: any) {
            console.error(`Failed to create folder in workspace with ID: ${workspaceId}`, { error });
            return {
            content: [
                {
                type: "text",
                text: `Failed to create_workspace_folder: ${error.message}`
                }
            ],
            isError: true
            };
        }
        }
    );

}
