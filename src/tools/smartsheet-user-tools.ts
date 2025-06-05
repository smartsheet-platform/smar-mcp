import { SmartsheetAPI } from "../apis/smartsheet-api.js";

export function getUserTools(api: SmartsheetAPI) {
    return {
        get_current_user: {
            name: "get_current_user",
            description: "Gets the current user's information",
            inputSchema: {
                type: "object",
                properties: {},
                required: []
            },
            handler: async () => {
                try {
                    console.info("Getting current user");
                    const user = await api.users.getCurrentUser();
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(user, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error("Failed to get current user", { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to get current user: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        get_user: {
            name: "get_user",
            description: "Gets a user's information by ID",
            inputSchema: {
                type: "object",
                properties: {
                    userId: {
                        type: "string",
                        description: "ID of the user to get"
                    }
                },
                required: ["userId"]
            },
            handler: async ({ userId }: { userId: string }) => {
                try {
                    console.info(`Getting user with ID: ${userId}`);
                    const user = await api.users.getUserById(userId);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(user, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error(`Failed to get user with ID: ${userId}`, { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to get user: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        },

        list_users: {
            name: "list_users",
            description: "Lists all users",
            inputSchema: {
                type: "object",
                properties: {},
                required: []
            },
            handler: async () => {
                try {
                    console.info("Listing users");
                    const users = await api.users.listUsers();
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(users, null, 2)
                            }
                        ]
                    };
                } catch (error: any) {
                    console.error("Failed to list users", { error });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to list users: ${error.message}`
                            }
                        ],
                        isError: true
                    };
                }
            }
        }
    };
}
