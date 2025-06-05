import { SmartsheetAPI } from "../apis/smartsheet-api.js";

export function getWorkspaceTools(api: SmartsheetAPI) {
    return {
        get_workspaces: {
            name: "get_workspaces",
            description: "Retrieves my Workspaces",
            inputSchema: {
                type: "object",
                properties: {},
                required: []
            },
            handler: async () => {
                try {
                    console.info("Getting workspaces");
                    const workspace = await api.workspaces.getWorkspaces();
            
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(workspace, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error("Failed to get workspaces", { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to get_workspaces: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        get_workspace: {
            name: "get_workspace",
            description: "Retrieves the current state of a Workspace, including its contents which can be sheets, reports, or other folders",
            inputSchema: {
                type: "object",
                properties: {
                    workspaceId: {
                        type: "string",
                        description: "The ID of the workspace to retrieve"
                    }
                },
                required: ["workspaceId"]
            },
            handler: async ({ workspaceId }: { workspaceId: string }) => {
                try {
                    console.info(`Getting workspace with ID: ${workspaceId}`);
                    const workspace = await api.workspaces.getWorkspace(workspaceId);
            
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(workspace, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to get workspace with ID: ${workspaceId}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to get_workspace: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        create_workspace: {
            name: "create_workspace",
            description: "Creates a new workspace",
            inputSchema: {
                type: "object",
                properties: {
                    workspaceName: {
                        type: "string",
                        description: "The name of the new workspace"
                    }
                },
                required: ["workspaceName"]
            },
            handler: async ({ workspaceName }: { workspaceName: string }) => {
                try {
                    console.info(`Creating workspace: ${workspaceName}`);
                    const workspace = await api.workspaces.createWorkspace(workspaceName);
            
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(workspace, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error("Failed to create workspace", { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to create_workspace: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        }
    };
}
