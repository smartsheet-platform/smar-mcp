---
stepsCompleted:
  - 'step-01-init'
  - 'step-02-discovery'
  - 'step-03-success'
  - 'step-04-journeys'
  - 'step-05-domain'
  - 'step-06-innovation'
  - 'step-07-project-type'
  - 'step-08-scoping'
  - 'step-09-functional'
  - 'step-10-nonfunctional'
  - 'step-11-polish'
inputDocuments:
  - 'prd.md'
workflowType: 'prd'
classification:
  projectType: developer_tool
  domain: general
  complexity: medium
  projectContext: brownfield
---

# Product Requirements Document - smar-mcp

**Author:** Mark
**Date:** 2026-01-25

## Executive Summary

**smar-mcp** is an AI-Native MCP Server designed to bridge the gap between Large Language Models and Smartsheet. Unlike traditional API wrappers, it acts as a **"Context Engine"**, intelligently managing token limits, rate limits, and data safety. It assumes the role of a "Smart Proxy" that prioritizes **Reliability** and **Safety** over raw access, enabling agents to autonomously manage complex project data without hallucination or accidental data loss.

## Success Criteria

### User Success

- **Reliable Completion**: Complex tasks (e.g., "Find and update rows") complete without 429 errors or token overflows.
- **Zero Config Context**: Agents resolve Context (Sheet IDs, Column IDs) autonomously via Search, removing manual user lookup.

### Business Success

- **90% Token Reduction**: "Summary Views" and "Filtered Reads" drastically reduce cost vs. full-sheet dumps.
- **Zero Data Disasters**: "Safe Mode" prevents accidental bulk deletions by rogue agents.

### Technical Success

- **Resilient Queuing**: Middleware absorbs traffic spikes (up to 500 requests) using a "Block & Wait" strategy.
- **Self-Healing Agents**: Comprehensive `tools_docs` allow agents to correct their own malformed requests.
- **Least Privilege**: Default data views are truncated and filtered to minimize exposure.

## Key Innovation: The Context Engine

Moving beyond a "dumb pipe", `smar-mcp` introduces three key patterns:

1.  **Progressive Disclosure**:
    - _Level 1_: **Summary** (Metadata + Headers).
    - _Level 2_: **Filtered View** (Search Results).
    - _Level 3_: **Full Access** (Explicit Override only).
2.  **Server-Side Filtering (The Magic Wand)**: Simulates a SQL experience (`WHERE Status='Open'`) over the API, delivering instant relevance without token burn.
3.  **Agentic Self-Healing**: First-class support for agent autonomy via rich, example-driven documentation endpoints.

## User Journeys

### 1. Alice & The "One-Shot" Update (Efficiency)

**Narrative**: Alice asks: _"Update 'Q3 Marketing' status to 'Done'."_
The Agent:

1.  Calls `search_sheets("Q3 Marketing")` -> Gets ID.
2.  Calls `get_sheet_summary(ID)` -> Sees "Status" column.
3.  Calls `update_rows(ID, {Status: 'Done'})`.
    **Result**: Task complete in seconds with minimal token usage.

### 2. Sam & The Near-Miss (Safety)

**Narrative**: An experimental agent attempts `delete_rows(all_rows)`.
**System**: Intercepts request via **Safe Mode**.
**Result**: Returns `403 Bulk Delete Prohibited`. Sam gets an alert log. No data lost.

### 3. Casey & The Self-Correction (DevEx)

**Narrative**: Casey's agent sends a malformed `get_sheet` request.
**System**: Returns `400 Bad Request`.
**Agent**: autonomously calls `get_tool_docs()`, reads the example, and retries successfully.

## Technical Architecture & System Design

### Core Stack (Developer Tool)

- **Runtime**: Node.js 20 LTS (Compat >=18.0.0).
- **Package Manager**: `npm`.
- **Distribution**: `Dockerfile` (Distroless/Alpine) + `npx` executable.
- **Testing**: Hybrid Strategy.
  - _Unit_: Jest + Mocks.
  - _Integration_: **Ephemeral Harness** (Create/Delete Workspace) + **VCR Replay** for CI stability.

### Domain Constraints

- **Rate Limiting**: In-Memory "Block & Wait" strategy (Sleeps up to 60s on 429 risk).
- **Statelessness**: No customer data persisted to disk.
- **RBAC Preservation**: Pass-through of Smartsheet Permissions (403s are translated, not ignored).

## Functional Requirements (The Contract)

### Context & Access

- **FR-01**: Agent can search IDs (User/Sheet/Workspace) by fuzzy name.
- **FR-02**: Agent can retrieve **Sheet Summary** (Metadata + Headers + Top 5 Rows).
- **FR-03**: Agent can retrieve filtered data (`get_sheet_filtered`) with **Case-Insensitive Exact Match** and **Pagination**.
- **FR-04**: Agent can retrieve full data only via explicit `limit=-1` override.

### Mutation & Safety

- **FR-05**: Agent can `update_rows` via column mapping.
- **FR-06**: Agent can `add_rows`.
- **FR-07**: System must block **Bulk Deletes** when `SMARTSHEET_SAFE_MODE=true`.
- **FR-08**: Agent can `dry_run` mutations to preview changes.

### Reliability & DevEx

- **FR-09**: System must handle Rate Limits by suspending execution (not failing).
- **FR-10**: System must enforce a **Retry Budget** (Max 2 autonomous retries) to prevent loops.
- **FR-11**: Agent can retrieve **Usage Examples** via `get_tool_docs`.

## Non-Functional Requirements (QA)

### Performance & Scalability

- **Latency Strategy**: Prioritize **Completion** over Speed. System should queue requests and wait (up to 60s) rather than fail fast with 429s.
- **Concurrency**: Support **50 concurrent agents** (Team workload) via Node.js Event Loop.
- **Overload Policy**: **Queue** requests when limit reached (do not reject).
- **Efficiency**: Default responses <4,000 tokens.

### Reliability & Security

- **Recovery**: Automatic restart on crash (Docker policy) is sufficient for MVP.
- **State Recovery**: Deferred to Roadmap.
- **Data Persistence**: **Stateless** for Row Data (No disk persistence).
- **Caching Exceptions**: **Metadata Caching** (Sheet Summaries, Column Headers) is permitted Day 1 for performance.
- **Sanitization**: No PII (Email/Phone) in stderr/stdout logs.

## Roadmap & Scoping

### Phase 1: MVP (The Reliable Core)

Focus: **Reliability, Safety, Basic Context.**

- All Core CRUD + Context Tools (`search`, `summary`).
- Safe Mode + Dry Run.
- Simple Filtering (Exact Match).
- Hybrid Test Harness.

### Phase 2: Growth (Security & Scale)

- **Advanced Filtering**: Inequalities (`>`), Dates, Multi-select.
- **PII Masking**: Pattern-based redaction.
- **Extended Objects**: Workspaces, Reports.
- **Persisted Queue**: Redis backing for scale.

### Phase 3: Vision (Semantic Intelligence & Resilience)

- **RAG / Vector Sync**: Semantic Search.
- **Stateful Sessions**: User-specific context memory.
- **State Recovery**: Persisted cursor state to recover logical position after server crash.
