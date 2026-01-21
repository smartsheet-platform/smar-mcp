---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['_bmad-output/planning-artifacts/prd.md']
workflowType: 'architecture'
project_name: 'smar-mcp'
status: 'complete'
completedAt: '2026-01-11'
user_name: 'Mark'
date: '2026-01-11'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The core functional scope focuses on enabling AI agent autonomy within Smartsheet:
- **Hierarchy Management**: Critical capability to manipulate row structures (`parentId`, `siblingId`) to represent nested logical relationships (e.g., Epic > Story).
- **Content-Based Discovery**: precise locating of rows by business data (Column=Value) rather than internal IDs, solving the "lookup" problem for agents.
- **Agent-Friendly Feedback**: Structured error reporting (JSON codes) to allow agents to self-correct during failure modes.

**Non-Functional Requirements:**
- **Performance**: Strict latency targets (<5s) for search requiring efficient traversal or filtering strategies.
- **Security**: High-bar compliance (FedRAMP Moderate context) requiring strict secret sanitization (no logged keys) and zero-vulnerability dependencies.
- **Reliability**: Idempotency and recovery capabilities for network interruptions.

**Scale & Complexity:**
- Primary domain: Backend / MCP Server (Node.js)
- Complexity level: Medium (High rigour required for compliance and reliability, but bounded functional scope)
- Estimated architectural components: ~4 (Server, Typed Smartsheet Client, Tool Logic, Security/util Layer)

### Technical Constraints & Dependencies

- **Runtime**: Local Node.js execution.
- **Auth**: Environment variable only (`SMARTSHEET_API_KEY`).
- **Network**: Must support future egress filtering/whitelisting.
- **Compliance**: FedRAMP Moderate context implies conservative dependency choices and strict data handling.

### Cross-Cutting Concerns Identified

- **Security/Logging**: A unified logging layer is needed to enforce secret sanitization across all output.
- **Error Handling**: A centralized error normalization layer to convert upstream API errors into agent-consumable JSON codes.
- **Performance/Caching**: Search performance (<5s) may require a caching or an optimization strategy for large sheets if the native API doesn't support direct filtering.

## Starter Template Evaluation

### Primary Technology Domain

Backend / MCP Server (Node.js/TypeScript)

### Starter Options Considered

- **Official MCP TypeScript SDK Template**: The standard reference implementation.
- **Existing `smar-mcp` Codebase**: Custom implementation leveraging the official SDK.

### Selected Basis: Existing Codebase (Custom)

**Rationale for Selection:**
The existing project structure effectively implements the "Official SDK" pattern but is already tailored to the domain. It includes:
1.  **Correct Dependency**: Uses `@modelcontextprotocol/sdk` (v1.12.0).
2.  **Scalable Pattern**: The `get[Tool](server, api)` injection pattern in `src/tools` is excellent for adding the new tools (Hierarchy, Discovery) without cluttering `index.ts`.
3.  **Type Readiness**: The `smartsheet-types` namespace is already set up to support our typed API client needs.

**Architectural Decisions Provided:**

**Language & Runtime:**
-   **Language**: TypeScript (strict)
-   **Runtime**: Node.js (>=16.0.0)

**Framework & Protocol:**
-   **Library**: `@modelcontextprotocol/sdk`
-   **Transport**: `StdioServerTransport` (Standard input/output for local agent integration)

**Code Organization:**
-   **Entry Point**: `src/index.ts` (Server setup & Tool registration)
-   **Tool Logic**: `src/tools/*.ts` (Isolated business logic per domain)
-   **API Layer**: `src/apis/` (Wrappers for external Smartsheet API)
-   **Types**: `src/smartsheet-types/` (Shared interfaces)

**Configuration:**
-   **Environment**: `dotenv` loading `.env` variables (Safe secret management)

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data Architecture (Search Strategy)
- Security Architecture (Secret Sanitization)
- Error Handling Pattern

**Important Decisions (Shape Architecture):**
- Performance Optimization (Deferred)

### Data Architecture

**Decision: Linear Scan for `find_rows` (MVP)**
- **Rationale**: The 'stateless' nature of the MCP server and simplicity of MVP dictates avoiding complex local state/cache. We will fetch rows and scan them in memory.
- **Fallout**: Performance risk for sheets > 500 rows.
- **Mitigation**: If <5s target is missed, upgrade to "Local Indexing" in Phase 2.

### Authentication & Security

**Decision: Centralized Logging Wrapper**
- **Rationale**: prevent `SMARTSHEET_API_KEY` leakage.
- **Implementation**: A proxy logger that regex-replaces the API key pattern before writing to `stderr`/`stdout`.

### API & Communication Patterns

**Decision: Typed Error Mapping**
- **Rationale**: Agents need actionable JSON error codes, not stack traces.
- **Implementation**: `src/utils/error-mapper.ts` will convert Smartsheet errors (4004) -> `McpError(-32002, "Row not found")`.

### Infrastructure & Deployment

**Decision: Local Node.js Execution**
- **Rationale**: Confirmed by Project Context. Agent runs the server locally.

### Decision Impact Analysis

**Implementation Sequence:**
1.  **Security Layer**: Implement Logger & Secret Sanitization.
2.  **Error Layer**: Implement Error Mapper.
3.  **Data Layer**: Implement `find_rows` using Linear Scan.
4.  **Hierarchy**: Implement `add_rows` with `parentId`.

**Cross-Component Dependencies:**
-   `find_rows` logic depends on the Error Mapper for "No results found" cases.
-   All tools depend on the Logger for safe output.

## Implementation Patterns & Consistency Rules

### Structure Patterns

**Project Organization:**
-   **Tools**: `src/tools/smartsheet-[domain]-tools.ts`
-   **APIs**: `src/apis/smartsheet-[domain]-api.ts`
-   **Types**: `src/smartsheet-types/[Type].ts`

**Dependency Injection:**
All tool modules must export a function matching this signature:
`export function get[Domain]Tools(server: McpServer, api: SmartsheetAPI): void`

### Process Patterns

**Error Handling:**
-   **Catch Blocks**: All tool handlers must wrap logic in `try/catch`.
-   **Logging**: Must use the centralized logger for errors.
-   **User Feedback**: Must return `isError: true` with a human-readable message for logic failures.

### Naming Patterns

**Code Naming Conventions:**
-   **Classes**: `Smartsheet[Domain]API` (e.g. `SmartsheetRowAPI`)
-   **Tools**: `[verb]_[noun]` (e.g. `find_rows`, `add_rows`) - *snake_case for tool names*.
-   **Files**: `kebab-case` matching the primary export where possible.

### Enforcement Guidelines

**All AI Agents MUST:**
-   Use the `api` instance passed to the tool factory; do not instantiate new clients.
-   Define Zod schemas inline for tool arguments.
-   Log all tool invocations with `console.info` (or wrapped logger).

## Project Structure & Boundaries

### Complete Project Directory Structure
```
.
├── package.json
├── tsconfig.json
├── .env
├── src/
│   ├── index.ts                # Server Entry Point
│   ├── apis/                   # API Client Layer (Business Logic)
│   │   ├── smartsheet-api.ts
│   │   ├── smartsheet-sheet-api.ts  # INCLUDES: find_rows logic, add_rows (hierarchy)
│   │   ├── smartsheet-search-api.ts
│   │   └── ... (other domains)
│   ├── tools/                  # MCP Tool Definitions (Validation & Orchestration)
│   │   ├── smartsheet-sheet-tools.ts # Registers: find_rows, add_rows
│   │   └── ... (other domains)
│   ├── utils/                  # [NEW] Shared Utilities
│   │   ├── error-mapper.ts     # [NEW] StdSmartsheetError -> McpError
│   │   ├── logger.ts           # [NEW] Secret Sanitization Logger
│   └── smartsheet-types/       # Shared TypeScript Interfaces
```

### Architectural Boundaries

**API Boundaries:**
-   **Internal**: `src/apis/*` classes wrap all `axios` calls. Tools NEVER call `axios` directly.
-   **External**: Smartsheet API (v2.0).

**Component Boundaries:**
-   **Tools Layer**: Pure MCP logic (Validation -> Call API -> Format Response). Minimal business logic.
-   **API Layer**: Encapsulates all business logic, including the "Linear Scan" for `find_rows` and the Retry strategies.

### Requirements to Structure Mapping

1.  **Hierarchy (`add_rows` w/ parentId)**:
    -   Update `src/apis/smartsheet-sheet-api.ts`: Enhance `addRows` method signature.
    -   Update `src/tools/smartsheet-sheet-tools.ts`: Expose new parameters in schema.

2.  **Discovery (`find_rows`)**:
    -   New logic in `src/apis/smartsheet-sheet-api.ts` (e.g. `findRowsByColumn`).
    -   New tool in `src/tools/smartsheet-sheet-tools.ts`.

3.  **Security**:
    -   New file `src/utils/logger.ts`: Implements the `console` wrapper with redaction.
    -   Apply to `src/index.ts` and all API modules.

## Architecture Validation Results

### Coherence Validation ✅
-   **Data Flow**: The "Stateless" API Wrapper pattern aligns with the "Linear Scan" decision (no local DB to sync).
-   **Structure**: The `src/apis` vs `src/tools` split perfectly separates Business Logic from Protocol Logic.

### Requirements Coverage Validation ✅
-   **Hierarchy**: Fully covered by `add_rows` API enhancement.
-   **Discovery**: Covered by `find_rows` Linear Scan.
-   **Security**: Covered by Centralized Logger & strict `dotenv` usage.

### Implementation Readiness ✅
-   **Structure**: Complete. Files defined.
-   **Patterns**: Explicit. "Use `getTools` factory", "Use centralized logger".

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION
**Confidence Level:** High

**Key Strengths:**
1.  **Simplicity**: Leveraging the official SDK + Direct API wrappers avoids complex abstractions.
2.  **Safety**: Centralized logging ensures compliance by default.

**First Implementation Priority:**
Implement the `utils/logger.ts` and `utils/error-mapper.ts` to establish the safety harness before adding complex logic.

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-11
**Document Location:** _bmad-output/planning-artifacts/architecture.md

### Final Architecture Deliverables

**📋 Complete Architecture Document**
-   All architectural decisions documented with specific versions
-   Implementation patterns ensuring AI agent consistency
-   Complete project structure with all files and directories
-   Requirements to architecture mapping
-   Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**
-   **Core Decisions**: 4 (Starter, Data, Security, Error)
-   **Patterns**: 4 (Tool Injection, API Class, Error Map, Logger)
-   **Components**: 3 (APIs, Tools, Utils)
-   **Coverage**: 100% of PRD Requirements supported

### Implementation Handoff

**First Implementation Priority:**
Implement `src/utils/logger.ts` (Security) and `src/utils/error-mapper.ts` (Error Handling) to establish the safety harness.

**Development Sequence:**
1.  Setup: Ensure local node environment matches.
2.  Foundations: Create Utility modules (Logger, ErrorMapper).
3.  Feature 1: Update `SmartsheetSheetAPI` with `add_rows` hierarchy support.
4.  Feature 2: Implement `find_rows` logic (Linear Scan) in API layer.
5.  Tools: Expose new capabilities in `smartsheet-sheet-tools.ts`.
