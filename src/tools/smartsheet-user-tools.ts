import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

export function getUserTools(server: McpServer, api: SmartsheetAPI) {

    // Tool: Get Current User
    server.tool(
        "get_current_user",
        "Gets the current user's information",
        async () => {
        try {
            console.info("[Tool] Getting current user");
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
            console.error("[Error] in get_current_user:", error);
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
    );

    // Tool: Get User
    server.tool(
        "get_user",
        "Gets a user's information by ID",
        {
        userId: z.string().describe("ID of the user to get")
        },
        async ({ userId }) => {
        try {
            console.info(`[Tool] Getting user with ID: ${userId}`);
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
            console.error("[Error] in get_user:", error);
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
    );

    server.tool(
        "list_users",
        "Lists all users",
        async () => {
            try {
                console.info("[Tool] Listing all users");
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
                console.error("[Error] in list_users:", error);
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
    );

}
