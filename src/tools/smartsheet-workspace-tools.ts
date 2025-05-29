import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

export function getWorkspaceTools(server: McpServer, api: SmartsheetAPI) {

    // Tool: Get Workspaces
    server.tool(
        "get_workspaces",
        "Retrieves my Workspaces",
        {},
        async ({ }) => {
          try {
            console.info(`[Tool] Getting workspaces`);
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
            console.error("[Error] in get_workspace:", error);
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to get workspace: ${error.message}`
                }
              ],
              isError: true
            };
          }
        }
    );
    
    // Tool: Get Workspace
    server.tool(
        "get_workspace",
        "Retrieves the current state of a Workspace, including its contents which can be sheets, reports, or other folders",
        {
          workspaceId: z.string().describe("The ID of the workspace to retrieve")
        },
        async ({ workspaceId}) => {
          try {
            console.info(`[Tool] Getting workspace with ID: ${workspaceId}`);
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
            console.error("[Error] in get_workspace:", error);
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to get get_workspace: ${error.message}`
                }
              ],
              isError: true
            };
          }
        }
    );
    
    // Tool: Create workspace
    server.tool(
        "create_workspace",
        "Creates a new workspace",
        {
          workspaceName: z.string().describe("The name of the new workspace")
        },
        async ({ workspaceName }) => {
          try {
            console.info(`[Tool] Creating workspace: ${workspaceName}`);
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
            console.error("[Error] in create_workspace:", error);
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
    );

}
