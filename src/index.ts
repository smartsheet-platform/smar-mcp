#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { mcpAuthRouter } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { OAuthServerProvider, AuthorizationParams } from "@modelcontextprotocol/sdk/server/auth/provider.js";
import { OAuthRegisteredClientsStore } from "@modelcontextprotocol/sdk/server/auth/clients.js";
import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { OAuthClientInformationFull, OAuthTokenRevocationRequest, OAuthTokens } from "@modelcontextprotocol/sdk/shared/auth.js";
import { SmartsheetAPI } from "./apis/smartsheet-api.js";
import { config } from "dotenv";
import { randomUUID, randomBytes, createHmac, timingSafeEqual } from "crypto";
import express, { Request, Response } from "express";
import { getDiscussionTools } from "./tools/smartsheet-discussion-tools.js";
import { getFolderTools } from "./tools/smartsheet-folder-tools.js";
import { getSearchTools } from "./tools/smartsheet-search-tools.js";
import { getSheetTools } from "./tools/smartsheet-sheet-tools.js";
import { getUpdateRequestTools } from "./tools/smartsheet-update-request-tools.js";
import { getUserTools } from "./tools/smartsheet-user-tools.js";
import { getWorkspaceTools } from "./tools/smartsheet-workspace-tools.js";

// Load environment variables
config();

const allowDeleteTools = process.env.ALLOW_DELETE_TOOLS === 'true';

// Resolve a granular override: explicit 'true'/'false' trumps the general flag; absent defers to it.
function resolveDeleteFlag(envVar: string | undefined, fallback: boolean): boolean {
  if (envVar === 'true') return true;
  if (envVar === 'false') return false;
  return fallback;
}

const sheetToolFlags = {
  deleteRows:           resolveDeleteFlag(process.env.ALLOW_DELETE_ROWS,           allowDeleteTools),
  deleteSummaryFields:  resolveDeleteFlag(process.env.ALLOW_DELETE_SUMMARY_FIELDS,  allowDeleteTools),
};

console.info(`Delete flags — rows: ${sheetToolFlags.deleteRows}, summaryFields: ${sheetToolFlags.deleteSummaryFields}`);

function buildMcpServer(api: SmartsheetAPI): McpServer {
  const server = new McpServer({ name: "smartsheet", version: "1.0.0" });
  getDiscussionTools(server, api);
  getFolderTools(server, api);
  getSearchTools(server, api);
  getSheetTools(server, api, sheetToolFlags);
  getUpdateRequestTools(server, api);
  getUserTools(server, api);
  getWorkspaceTools(server, api);
  return server;
}

// ---------------------------------------------------------------------------
// Single-user OAuth provider
//
// Security model:
//   - Tokens are JWTs signed with HMAC-SHA256.
//   - If JWT_SIGNING_KEY is set (hex-encoded 32 bytes), that key is used and
//     tokens survive server restarts. If unset, an ephemeral key is generated
//     at startup and all tokens are invalidated when the process restarts.
//   - Token state is in-memory only.
//   - The /authorize page presents a consent form protected by a per-request
//     CSRF token stored server-side; /oauth/approve validates the token before
//     issuing an authorization code.
//   - The OAuth redirect_uri goes to claude.ai (your account), so only you
//     can receive the issued token.
//   - IP allowlist (separate firewall task) restricts /mcp to Anthropic egress
// ---------------------------------------------------------------------------

// Ephemeral signing key — generated once at process start, never written to disk
const JWT_KEY = process.env.JWT_SIGNING_KEY
  ? Buffer.from(process.env.JWT_SIGNING_KEY, "hex")
  : randomBytes(32); // ephemeral fallback for stdio/dev

/** Escape a string for safe interpolation into HTML attribute values and text content. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function jwtSign(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body   = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig    = createHmac("sha256", JWT_KEY).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function jwtVerify(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed token");
  const [header, body, sig] = parts;
  const expected = createHmac("sha256", JWT_KEY).update(`${header}.${body}`).digest("base64url");
  // Constant-time comparison to prevent timing attacks
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) throw new Error("Invalid token signature");
  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    throw new Error("Malformed token payload");
  }
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Token payload must be a non-null object");
  }
  const p = payload as Record<string, unknown>;
  if (typeof p.sub !== "string") throw new Error("Token payload missing valid sub claim");
  if (p.exp !== undefined && typeof p.exp !== "number") throw new Error("Token payload exp claim must be a number");
  if (typeof p.exp === "number" && p.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }
  return p;
}

interface PendingCode {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  expiresAt: number;
}

/** Pending authorization: stored by CSRF token, used to validate /oauth/approve POSTs. */
interface PendingAuthorization {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  expiresAt: number;
}

class PersonalOAuthProvider implements OAuthServerProvider {
  private readonly clients    = new Map<string, OAuthClientInformationFull>();
  private readonly pendingCodes = new Map<string, PendingCode>();
  /** CSRF token → authorization params; populated in authorize(), consumed in /oauth/approve. */
  readonly pendingAuthorizations = new Map<string, PendingAuthorization>();

  constructor() {
    // Periodically purge expired auth codes (every 60 seconds)
    setInterval(() => {
      const now = Date.now();
      for (const [code, entry] of this.pendingCodes) {
        if (entry.expiresAt < now) this.pendingCodes.delete(code);
      }
      for (const [csrf, entry] of this.pendingAuthorizations) {
        if (entry.expiresAt < now) this.pendingAuthorizations.delete(csrf);
      }
    }, 60_000).unref(); // unref() so the timer doesn't keep the process alive
  }

  get clientsStore(): OAuthRegisteredClientsStore {
    return {
      getClient: (clientId: string) => this.clients.get(clientId),
      registerClient: (client: OAuthClientInformationFull) => {
        this.clients.set(client.client_id, client);
        return client;
      },
    };
  }

  async authorize(
    client: OAuthClientInformationFull,
    params: AuthorizationParams,
    res: Response
  ): Promise<void> {
    // Generate a per-request CSRF token and store the authorization params server-side.
    const csrfToken = randomBytes(16).toString("hex");
    this.pendingAuthorizations.set(csrfToken, {
      clientId: client.client_id,
      redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minute window to click Authorize
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smartsheet MCP — Authorize</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center;
           align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1);
            width: 360px; }
    h1 { font-size: 1.2rem; margin: 0 0 .5rem; }
    p  { font-size: .9rem; color: #555; margin: 0 0 1.5rem; }
    button { width: 100%; padding: .6rem; background: #0073e6; color: white;
             border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
    button:hover { background: #005bb5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Smartsheet MCP</h1>
    <p><strong>${escapeHtml(client.client_name ?? client.client_id)}</strong> is requesting access to your Smartsheet data.</p>
    <form method="POST" action="/oauth/approve">
      <input type="hidden" name="csrf_token" value="${escapeHtml(csrfToken)}">
      <button type="submit">Authorize</button>
    </form>
  </div>
</body>
</html>`;
    res.send(html);
  }

  async challengeForAuthorizationCode(
    _client: OAuthClientInformationFull,
    authorizationCode: string
  ): Promise<string> {
    const entry = this.pendingCodes.get(authorizationCode);
    if (!entry || entry.expiresAt < Date.now()) throw new Error("Invalid or expired code");
    return entry.codeChallenge;
  }

  async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string
  ): Promise<OAuthTokens> {
    const entry = this.pendingCodes.get(authorizationCode);
    if (!entry || entry.expiresAt < Date.now()) throw new Error("Invalid or expired code");
    this.pendingCodes.delete(authorizationCode);

    const ttl = 365 * 24 * 3600; // 1 year
    const token = jwtSign({
      sub: client.client_id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + ttl,
    });

    return { access_token: token, token_type: "bearer", expires_in: ttl };
  }

  async exchangeRefreshToken(): Promise<OAuthTokens> {
    throw new Error("Refresh tokens not supported");
  }

  async verifyAccessToken(token: string): Promise<AuthInfo> {
    const payload = jwtVerify(token);
    const exp = typeof payload.exp === "number" ? payload.exp : 0;
    return {
      token,
      clientId: payload.sub as string,
      scopes: [],
      expiresAt: exp,
    };
  }

  issueCode(params: { clientId: string; redirectUri: string; codeChallenge: string }): string {
    const code = randomUUID();
    this.pendingCodes.set(code, { ...params, expiresAt: Date.now() + 5 * 60 * 1000 });
    return code;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function runHttp(api: SmartsheetAPI) {
  const port = parseInt(process.env.PORT ?? "3000", 10);
  const issuerUrl = process.env.ISSUER_URL;

  if (!issuerUrl) throw new Error("ISSUER_URL environment variable is not set");

  const provider = new PersonalOAuthProvider();
  const app = express();
  app.set("trust proxy", 1); // Caddy sits in front; trust one hop of X-Forwarded-For
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // OAuth endpoints (/.well-known/..., /authorize, /token, /register)
  app.use(mcpAuthRouter({
    provider,
    issuerUrl: new URL(issuerUrl),
    resourceName: "Smartsheet MCP",
  }));

  // Consent POST handler — validated by CSRF token; security via CSRF + OAuth redirect + IP allowlist
  app.post("/oauth/approve", (req: Request, res: Response) => {
    try {
      const { csrf_token } = req.body;

      // Validate required fields
      if (!csrf_token || typeof csrf_token !== "string") {
        return res.status(400).send("Bad request");
      }

      // Look up the pending authorization by CSRF token
      const pending = provider.pendingAuthorizations.get(csrf_token);
      if (!pending || pending.expiresAt < Date.now()) {
        return res.status(400).send("Bad request: invalid or expired authorization session");
      }
      provider.pendingAuthorizations.delete(csrf_token);

      const { clientId, redirectUri, codeChallenge } = pending;

      // Validate that the redirect_uri matches the registered client
      const registeredClient = provider.clientsStore.getClient(clientId);
      if (!registeredClient) {
        return res.status(400).send("Bad request: unknown client");
      }
      const registeredUris: string[] = (registeredClient as any).redirect_uris ?? [];
      if (!registeredUris.includes(redirectUri)) {
        return res.status(400).send("Bad request: redirect_uri does not match registered client");
      }

      const code = provider.issueCode({ clientId, redirectUri, codeChallenge });

      const state = req.body.state as string | undefined;
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.set("code", code);
      if (state) redirectUrl.searchParams.set("state", state);
      return res.redirect(redirectUrl.toString());
    } catch (err) {
      console.error("Error in /oauth/approve handler", { err });
      return res.status(400).send("Bad request");
    }
  });

  // MCP endpoint — one transport per session
  const transports = new Map<string, StreamableHTTPServerTransport>();
  const transportCreatedAt = new Map<string, number>();

  // Periodically evict MCP sessions older than 24 hours
  setInterval(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const [id, createdAt] of transportCreatedAt) {
      if (createdAt < cutoff) {
        transports.delete(id);
        transportCreatedAt.delete(id);
      }
    }
  }, 5 * 60 * 1000).unref();

  app.all("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (sessionId && transports.has(sessionId)) {
      await transports.get(sessionId)!.handleRequest(req, res, req.body);
      return;
    }

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => {
        transports.set(id, transport);
        transportCreatedAt.set(id, Date.now());
      },
    });
    transport.onclose = () => {
      if (transport.sessionId) {
        transports.delete(transport.sessionId);
        transportCreatedAt.delete(transport.sessionId);
      }
    };

    const server = buildMcpServer(api);
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.listen(port, () => {
    console.info(`Smartsheet MCP Server running on HTTP port ${port}`);
  });
}

async function runStdio(api: SmartsheetAPI) {
  const server = buildMcpServer(api);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.info("Smartsheet MCP Server running on stdio");
}

async function main() {
  const api = new SmartsheetAPI(
    process.env.SMARTSHEET_API_KEY,
    process.env.SMARTSHEET_ENDPOINT || "https://api.smartsheet.com/2.0"
  );

  if (process.env.PORT) {
    await runHttp(api);
  } else {
    await runStdio(api);
  }
}

main().catch((error) => {
  console.error("Fatal error in main()", { error });
  process.exit(1);
});
