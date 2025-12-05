#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { SmartsheetAPI } from "./apis/smartsheet-api.js";
import { config } from "dotenv";
import { getDiscussionTools } from "./tools/smartsheet-discussion-tools.js";
import { getFolderTools } from "./tools/smartsheet-folder-tools.js";
import { getSearchTools } from "./tools/smartsheet-search-tools.js";
import { getSheetTools } from "./tools/smartsheet-sheet-tools.js";
import { getUpdateRequestTools } from "./tools/smartsheet-update-request-tools.js";
import { getUserTools } from "./tools/smartsheet-user-tools.js";
import { getWorkspaceTools } from "./tools/smartsheet-workspace-tools.js";

config();

const allowDeleteTools = process.env.ALLOW_DELETE_TOOLS === "true";

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "smartsheet",
    version: "1.0.0",
  });

  const api = new SmartsheetAPI(
    process.env.SMARTSHEET_API_KEY,
    process.env.SMARTSHEET_ENDPOINT
  );

  getDiscussionTools(server, api);
  getFolderTools(server, api);
  getSearchTools(server, api);
  getSheetTools(server, api, allowDeleteTools);
  getUpdateRequestTools(server, api);
  getUserTools(server, api);
  getWorkspaceTools(server, api);

  return server;
}

async function runStdioServer() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Smartsheet MCP Server running on stdio");
}

async function runHttpServer(port: number = 3000) {
  const app = express();
  app.use(express.json());

  const transports: Record<string, StreamableHTTPServerTransport> = {};

  app.post("/mcp", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
      } else if (!sessionId && req.body.method === "initialize") {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            transports[id] = transport;
            console.error(`Session initialized: ${id}`);
          },
        });

        transport.onclose = () => {
          if (transport.sessionId) {
            delete transports[transport.sessionId];
            console.error(`Session closed: ${transport.sessionId}`);
          }
        };

        const server = createMcpServer();
        await server.connect(transport);
      } else {
        res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Bad request: No valid session" },
          id: null,
        });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling POST /mcp:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (sessionId && transports[sessionId]) {
      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad request: No valid session" },
        id: null,
      });
    }
  });

  app.delete("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (sessionId && transports[sessionId]) {
      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad request: No valid session" },
        id: null,
      });
    }
  });

  app.listen(port, () => {
    console.error(`Smartsheet MCP Server running on http://localhost:${port}/mcp`);
  });
}

function parseArgs(): { mode: "stdio" | "http"; port: number } {
  const args = process.argv.slice(2);
  let mode: "stdio" | "http" = "stdio";
  let port = 3000;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--http") {
      mode = "http";
    } else if (args[i] === "--port" && args[i + 1]) {
      port = parseInt(args[i + 1], 10);
      i++;
    }
  }

  if (process.env.MCP_TRANSPORT === "http") {
    mode = "http";
  }
  if (process.env.MCP_PORT) {
    port = parseInt(process.env.MCP_PORT, 10);
  }

  return { mode, port };
}

async function main() {
  const { mode, port } = parseArgs();

  console.error(`Delete operations are ${allowDeleteTools ? "enabled" : "disabled"}`);

  if (mode === "http") {
    await runHttpServer(port);
  } else {
    await runStdioServer();
  }
}

main().catch((error) => {
  console.error("Fatal error in main()", { error });
  process.exit(1);
});
