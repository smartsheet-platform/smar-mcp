import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function getPrompts(server: McpServer) {
    server.prompt(
        "my-tasks",
        { url: z.string() },
        async ({ url }) => {
            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: `Retrieve current user, then search the sheet with ${url} for tasks assigned to them.`
                        }
                    }
                ]   
            };
        }
    )
}
