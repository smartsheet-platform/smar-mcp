---
project_name: 'smar-mcp'
user_name: 'Mark'
date: '2026-01-11'
sections_completed: ['technology_stack', 'critical_rules', 'anti_patterns']
status: 'complete'
rule_count: 10
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

-   **Runtime**: Node.js >=16.0.0
-   **Language**: TypeScript v5.8.2 (Strict Mode: true)
-   **Framework**: `@modelcontextprotocol/sdk` v1.12.0
-   **HTTP Client**: `axios` v1.8.4
-   **Validation**: `zod` v3.24.2
-   **Environment**: `dotenv` v16.4.7
-   **Testing**: `jest` v29.5.0, `ts-jest`
-   **Linting**: `eslint` v8.57.0
-   **Build**: `tsc` (Target: ES2022, Module: NodeNext)

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)
-   **Module Extension**: All local imports must use the `.js` extension (e.g., `import { Foo } from "./foo.js"`).
-   **Strict Typing**: `tsconfig.json` enforces `strict: true`. Avoid `any`.
-   **Async/Await**: Prefer `async/await` over raw Promises.

### Framework-Specific Rules (MCP)
-   **Tool Pattern**: Define tools in `src/tools/` exports `get[Domain]Tools(server, api)`.
-   **Schema Validation**: Use `zod` for all tool arguments.
-   **Return Format**: Text tools must return `{ content: [{ type: "text", text: string }] }`.

### Error Handling Rules
-   **No Crashes**: Tools must NEVER throw unhandled exceptions. Wrap implementation in `try/catch`.
-   **User Feedback**: On error, return `isError: true` with a descriptive message.
-   **Logging**: Log full error details to `stderr` (console.error) but return compliant messages to the client.

### Anti-Patterns to Avoid
-   ❌ **Instantiating API clients locally**: Always use the injected `api` instance.
-   ❌ **Console.log**: Use `console.info` (stderr) for logs; stdout is reserved for MCP protocol json-rpc.

---

## Usage Guidelines

**For AI Agents:**
-   Read this file before implementing any code
-   Follow ALL rules exactly as documented
-   When in doubt, prefer the more restrictive option
-   Update this file if new patterns emerge

**For Humans:**
-   Keep this file lean and focused on agent needs
-   Update when technology stack changes
-   Review quarterly for outdated rules
-   Remove rules that become obvious over time

Last Updated: 2026-01-11
