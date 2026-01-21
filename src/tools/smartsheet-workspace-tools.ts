import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";

export function getWorkspaceTools(server: McpServer, api: SmartsheetAPI) {
  server.tool("list_workflows", {
    // Tool: List Workflow Runs
    server.tool(
      "list_workflow_runs",
      "Lists all workflow runs in a repository",
    parameters: {
      owner: {
        type: "string",
        description: "Repository owner (username or organization)",
      },
      repo: {
        type: "string",
        description: "Repository name",
      },
      page: {
        type: "number",
        minimum: 1,
        description: "Page number for pagination",
      },
      per_page: {
        type: "number",
        maximum: 100,
        minimum: 1,
        description: "Number of results per page",
      },
    },
    inputSchema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      page: z.number().optional(),
      per_page: z.number().optional(),
    }),
  });

  server.tool("list_workflow_runs", {
    // Tool: List Workflows
    server.tool(
      "list_workflows",
      "Lists all workflows in a repository",
    parameters: {
      owner: {
        type: "string",
        description: "Repository owner (username or organization)",
      },
      repo: {
        type: "string",
        description: "Repository name",
      },
      workflow_id: {
        type: "string",
        description: "The workflow ID or filename",
      },
      page: {
        type: "number",
        minimum: 1,
        description: "Page number for pagination",
      },
      per_page: {
        type: "number",
        maximum: 100,
        minimum: 1,
        description: "Number of results per page",
      },
    },
    inputSchema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      workflow_id: z.string().describe("The workflow ID or filename"),
      page: z.number().optional(),
      per_page: z.number().optional(),
    }),
  });

  server.tool("list_workflow_run_artifacts", {
    // Tool: List Workflow Run Artifacts
    server.tool(
      "list_workflow_run_artifacts",
      "Lists all artifacts for a specific workflow run",
    parameters: {
      owner: {
        type: "string",
        description: "Repository owner (username or organization)",
      },
      repo: {
        type: "string",
        description: "Repository name",
      },
      run_id: {
        type: "number",
        description: "The workflow run ID",
      },
      page: {
        type: "number",
        minimum: 1,
        description: "Page number for pagination",
      },
      per_page: {
        type: "number",
        maximum: 100,
        minimum: 1,
        description: "Number of results per page",
      },
    },
    inputSchema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      run_id: z.number().describe("The workflow run ID"),
      page: z.number().optional(),
      per_page: z.number().optional(),
    }),
  });

  server.tool("list_workflow_run_artifacts", {
    // Tool: List Workflows (continued)
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
    parameters: {
      owner: {
        type: "string",
        description: "Repository owner (username or organization)",
      },
      repo: {
        type: "string",
        description: "Repository name",
      },
      run_id: {
        type: "number",
        description: "The workflow run ID",
      },
      page: {
        type: "number",
        minimum: 1,
        description: "Page number for pagination",
      },
      per_page: {
        type: "number",
        maximum: 100,
        minimum: 1,
        description: "Number of results per page",
      },
    },
    inputSchema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      run_id: z.number().describe("The workflow run ID"),
      page: z.number().optional(),
      per_page: z.number().optional(),
    }),
  });

  server.tool("list_workflow_runs", {
    // Tool: List Workflow Runs (continued)
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
    parameters: {
      owner: {
        type: "string",
        description: "Repository owner (username or organization)",
      },
      repo: {
        type: "string",
        description: "Repository name",
      },
      workflow_id: {
        type: "string",
        description: "The workflow ID or filename",
      },
      page: {
        type: "number",
        minimum: 1,
        description: "Page number for pagination",
      },
      per_page: {
        type: "number",
        maximum: 100,
        minimum: 1,
        description: "Number of results per page",
      },
    },
    inputSchema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      workflow_id: z.string().describe("The workflow ID or filename"),
      page: z.number().optional(),
      per_page: z.number().optional(),
    }),
  });

  server.tool("list_workflows", {
    // Tool: List Workflows (continued)
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
    parameters: {
      owner: {
        type: "string",
        description: "Repository owner (username or organization)",
      },
      repo: {
        type: "string",
        description: "Repository name",
      },
      page: {
        type: "number",
        minimum: 1,
        description: "Page number for pagination",
      },
      per_page: {
        type: "number",
        maximum: 100,
        minimum: 1,
        description: "Number of results per page",
      },
    },
    inputSchema: z.object({
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      page: z.number().optional(),
      per_page: z.number().optional(),
    }),
  });
}
