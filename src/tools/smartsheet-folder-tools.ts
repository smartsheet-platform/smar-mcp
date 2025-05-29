import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";
import logger from "../utils/logger.js";

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
            logger.info(`Getting folder with ID: ${folderId}`);
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
            logger.error(`Failed to get folder with ID: ${folderId}`, { error });
            return {
            content: [
                {
                type: "text",
                text: `Failed to get_folder: ${error.message}`
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
            logger.info(`Creating folder in workspace with ID: ${folderId}`);
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
            logger.error(`Failed to create folder in workspace with ID: ${folderId}`, { error });
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
            logger.info(`Creating folder in workspace with ID: ${workspaceId}`);
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
            logger.error(`Failed to create folder in workspace with ID: ${workspaceId}`, { error });
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
