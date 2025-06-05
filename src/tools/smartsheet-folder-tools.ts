import { SmartsheetAPI } from "../apis/smartsheet-api.js";

export function getFolderTools(api: SmartsheetAPI) {
    return {
        get_folder: {
            name: "get_folder",
            description: "Retrieves the current state of a folder, including its contents which can be sheets, reports, or other folders",
            inputSchema: {
                type: "object",
                properties: {
                    folderId: {
                        type: "string",
                        description: "The ID of the folder to retrieve"
                    }
                },
                required: ["folderId"]
            },
            handler: async ({ folderId }: { folderId: string }) => {
                try {
                    console.info(`Getting folder with ID: ${folderId}`);
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
                    console.error(`Failed to get folder with ID: ${folderId}`, { error });
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
        },

        create_folder: {
            name: "create_folder",
            description: "Creates a new folder in a folder",
            inputSchema: {
                type: "object",
                properties: {
                    folderId: {
                        type: "string",
                        description: "The ID of the folder to create the folder in"
                    },
                    folderName: {
                        type: "string",
                        description: "The name of the new folder"
                    }
                },
                required: ["folderId", "folderName"]
            },
            handler: async ({ folderId, folderName }: { folderId: string; folderName: string }) => {
                try {
                    console.info(`Creating folder '${folderName}' in folder with ID: ${folderId}`);
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
                    console.error(`Failed to create folder '${folderName}' in folder with ID: ${folderId}`, { error });
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
        },

        create_workspace_folder: {
            name: "create_workspace_folder",
            description: "Creates a new folder in a workspace",
            inputSchema: {
                type: "object",
                properties: {
                    workspaceId: {
                        type: "string",
                        description: "The ID of the workspace to create the folder in"
                    },
                    folderName: {
                        type: "string",
                        description: "The name of the new folder"
                    }
                },
                required: ["workspaceId", "folderName"]
            },
            handler: async ({ workspaceId, folderName }: { workspaceId: string; folderName: string }) => {
                try {
                    console.info(`Creating folder '${folderName}' in workspace with ID: ${workspaceId}`);
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
                    console.error(`Failed to create folder '${folderName}' in workspace with ID: ${workspaceId}`, { error });
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
        }
    };
}
