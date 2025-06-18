import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";
import { withComponent } from "../utils/logger.js";

// Create component-specific logger
const workspaceLogger = withComponent('workspace-tools');

export function getWorkspaceTools(server: McpServer, api: SmartsheetAPI) {

    // Tool: Get Workspaces
    server.tool(
        "get_workspaces",
        "Retrieves my Workspaces",
        {},
        async () => {
          try {
            workspaceLogger.info("Getting workspaces");
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
            workspaceLogger.error("Failed to get workspaces", { 
                error: error instanceof Error ? error.message : String(error),
                stack: error.stack 
            });
            return {
              content: [
                {
                  type: "text",
                  text: `Failed to get workspaces: ${error instanceof Error ? error.message : String(error)}`
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
                  text: `Failed to get workspace: ${error.message}`
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
    );

}
