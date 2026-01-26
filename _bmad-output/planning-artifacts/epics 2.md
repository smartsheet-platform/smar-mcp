---
stepsCompleted:
  [
    step-01-validate-prerequisites,
    step-02-design-epics,
    step-03-create-stories,
    step-04-final-validation,
  ]
inputDocuments:
  ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md']
---

# smar-mcp - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for smar-mcp, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-01: Agent can search for User/Sheet/Workspace IDs by name (fuzzy match) to resolve context.
FR-02: Agent can retrieve a "Sheet Summary" (Metadata + Columns + Top 5 Rows) to verify context before reading data.
FR-03: Agent can retrieve Sheet Data with **Smart Truncation** (Default: 50 rows) to save tokens.
FR-04: Agent can override truncation (`limit=-1`) to read the full sheet if necessary.
FR-05: Agent can `paged_read` rows (Get rows 100-200) to support manual scanning.
FR-06: Agent can `update_rows` using structured column mapping.
FR-07: Agent can `add_rows` to the bottom of a sheet.
FR-08: Agent can `get_sheet_filtered` using **Case-Insensitive Exact Match** criteria (e.g., `status='complete'` matches "Complete").
FR-08b: `get_sheet_filtered` must support **Pagination** (page/pageSize) to prevent timeout on large result sets.
FR-09: System must block **Bulk Delete** operations (deleting >X rows or whole sheet) when `SMARTSHEET_SAFE_MODE=true`.
FR-10: Agent can `dry_run` any mutation to see the `diff` of what _would_ happen.
FR-11: System must handle Rate Limits by **sleeping/queueing** (Block & Wait), not failing immediately.
FR-12: System must enforce a **Retry Budget** (Max 2 autonomous retries per logical task) to prevent run-away loops.
FR-13: Agent can call `get_tool_docs()` to receive **Usage Examples** (Self-Correction).
FR-14: System must return meaningful errors (e.g., "Permissions Missing") instead of generic 403s.

### NonFunctional Requirements

NFR-01 (Latency Strategy): Prioritize **Completion** over Speed. Queue and wait up to 60s instead of failing fast.
NFR-02 (Concurrency): Sustain **50 concurrent agents** (Team Workload). Queue requests on overload.
NFR-03 (Token Efficiency): Default responses <4,000 tokens.
NFR-04 (Recovery): Docker Restart is sufficient for MVP.
NFR-05 (Data Persistence): **Stateless** for Row Data.
NFR-06 (Caching): **Metadata Caching** (Summaries/Headers) IS PERMITTED for performance.
NFR-07 (Sanitization): No PII in logs.

### Additional Requirements

- **Starter Template**: Use existing `smar-mcp` codebase (Custom) as basis.
- **Hierarchy Support**: `add_rows` must support `parentId` for nested task creation.
- **Security Utils**: Implement `src/utils/logger.ts` for centralized redaction.
- **Reliability Utils**: Implement `src/utils/queue.ts` (PQueue) and `src/utils/cache.ts` (LRU).
- **Error Handling**: Implement `src/utils/error-mapper.ts` for typed MCP errors.
- **Infrastructure**: Local Node.js execution environment.

### FR Coverage Map

### FR Coverage Map

FR-01: Epic 1 - Search IDs
FR-02: Epic 1 - Sheet Summary
FR-03: Epic 1 - Smart Truncation
FR-04: Epic 1 - Full Read Override
FR-05: Epic 2 - Paged Read / Epic 3 - Paged Read
FR-06: Epic 2 - Update Rows
FR-07: Epic 2 - Add Rows
FR-08: Epic 3 - Filtered Read
FR-08b: Epic 3 - Filter Pagination
FR-09: Epic 2 - Safe Mode
FR-10: Epic 2 - Dry Run
FR-11: Epic 4 - Rate Limits
FR-12: Epic 4 - Retry Budget
FR-13: Epic 1 - Self-Correction Docs
FR-14: Epic 1 - Typed Errors

## Epic List

## Epic List

### Epic 1: Intelligent Context & Discovery

**Goal**: Enable autonomous agents to "orient" themselves (find sheets, understand columns) before acting, minimizing token usage and manual user lookup.

#### Story 1.1: Project Initialization & Shared Types

**As a** Developer Agent,
**I want** the project structure, environment variables, and shared TypeScript definitions set up,
**So that** I have a stable foundation to build tools upon.

**Acceptance Criteria:**
**Given** a fresh clone of the repo
**When** I run `npm install` and `npm build`
**Then** the build should pass without errors
**And** the `src/smartsheet-types` folder should contain the core interfaces (Sheet, Row, Column)
**And** `SMARTSHEET_API_KEY` is readable from `.env`

#### Story 1.2: Developer Experience Foundation (Errors & Docs)

**As a** Developer Agent,
**I want** clear error messages and usage documentation tools,
**So that** I can self-correct when I make invalid requests without bothering the human user.

**Acceptance Criteria:**
**Given** an invalid request (e.g. invalid ID)
**When** the system catches the error
**Then** it should return a structured `McpError` (via `error-mapper.ts`)
**And** I can call `get_tool_docs()` to see text examples of valid usage

#### Story 1.3: Tool - Search Sheets

**As a** User or Agent,
**I want** to search for sheets by name,
**So that** I can find the `sheetId` without manually looking it up in the browser.

**Acceptance Criteria:**
**Given** a search query "Q3 Marketing"
**When** I call `search_sheets("Q3 Marketing")`
**Then** I should receive a list of matches with Names and IDs
**And** the search should be fuzzy/broad enough to find partial matches

#### Story 1.4: Tool - Sheet Summary

**As a** User or Agent,
**I want** to see a lightweight summary of a sheet (Columns + Top Rows),
**So that** I can verify I have the right sheet and understand the schema before reading all data.

**Acceptance Criteria:**
**Given** a valid `sheetId`
**When** I call `get_sheet_summary(sheetId)`
**Then** I should receive the Sheet Name, Total Row Count, and Column Definitions
**And** I should see the first 5 rows of data as a preview
**And** the response size should be small (token efficient)

#### Story 1.5: Tool - Sheet Data & Smart Truncation

**As a** User or Agent,
**I want** to read sheet data with automatic truncation,
**So that** I don't accidentally crash my context window by reading 5,000 rows.

**Acceptance Criteria:**
**Given** a large sheet (100+ rows)
**When** I call `get_sheet(sheetId)` without arguments
**Then** it should return only the first 50 rows (Default Limit)
**And** I can explicitly pass `limit: -1` to override this and get all rows

### Epic 2: Safe Data Mutation

**Goal**: Enable reliable data modification with strong safety rails to prevent accidental data loss or "hallucinated updates".
**FRs covered**: FR-05, FR-06, FR-07, FR-09, FR-10

#### Story 2.1: Safety Layer (Safe Mode & Dry Run)

**As a** System Owner,
**I want** to prevent agents from deleting bulk data accidentally,
**So that** I can trust the system to run autonomously without destroying my sheets.

**Acceptance Criteria:**
**Given** `SMARTSHEET_SAFE_MODE=true` environment variable
**When** an agent attempts to delete more than 1 row (or the whole sheet)
**Then** the operation must fail with `403 Forbidden`
**And** `dry_run=true` argument must allow agents to preview any mutation (Add/Update/Delete) without executing it

#### Story 2.2: Tool - Add Rows (Hierarchy Support)

**As a** User or Agent,
**I want** to add new rows with support for hierarchy (Parent/Sibling),
**So that** I can create structured project plans (e.g., nesting a Task under a Milestone).

**Acceptance Criteria:**
**Given** a parent row ID
**When** I call `add_rows` with `parentId`
**Then** the new row should be created as a child of that parent
**And** standard fields (Cells) should be populated correctly

#### Story 2.3: Tool - Update Rows

**As a** User or Agent,
**I want** to update specific cells in existing rows,
**So that** I can keep project status up to date.

**Acceptance Criteria:**
**Given** a map of `{ RowID: { ColumnID/Name: NewValue } }`
**When** I call `update_rows`
**Then** only the specified cells should be updated
**And** the rest of the row data must remain unchanged

### Epic 3: Smart Retrieval (Filtering)

**Goal**: Enable "SQL-like" precision queries to fetch specific rows without scanning entire sheets, ensuring performance and token efficiency.
**FRs covered**: FR-05, FR-08, FR-08b

#### Story 3.1: Tool - Filtered Read

**As a** User or Agent,
**I want** to get rows that match specific criteria (e.g., Status='Open'),
**So that** I don't waste tokens reading unrelated data.

**Acceptance Criteria:**
**Given** a filter criteria `{ Status: 'Open' }`
**When** I call `get_sheet_filtered(sheetId, filter)`
**Then** I should receive only the rows where the Status column equals 'Open' (Case-Insensitive)
**And** the response should be paginated if there are many matches

#### Story 3.2: Tool - Paged Read

**As a** User or Agent,
**I want** to read a specific range of rows (e.g., 100-200),
**So that** I can scan through a very large sheet manually if search fails.

**Acceptance Criteria:**
**Given** a sheet with 500 rows
**When** I call `get_sheet(sheetId, offset=100, limit=50)`
**Then** I should receive rows 101 to 150
**And** the response should include total row count

### Epic 4: Reliability & Performance Hardening

**Goal**: Ensure the system is production-ready for team workloads, handling concurrency and spikes without crashing.
**FRs covered**: FR-11, FR-12, NFR-01, NFR-02, NFR-06

#### Story 4.1: Reliability Utility (Queue & Concurrency)

**As a** System Owner,
**I want** to limit concurrent API calls to 50,
**So that** the server doesn't crash under load from multiple agents.

**Acceptance Criteria:**
**Given** 60 simultaneous requests
**When** they hit the server
**Then** the first 50 should process immediately
**And** the remaining 10 should be queued
**And** they should process as slots free up (or timeout after 60s)

#### Story 4.2: Performance Utility (Metadata Cache)

**As a** System Owner,
**I want** to cache sheet summaries in memory,
**So that** agents don't spam the API just to check column names.

**Acceptance Criteria:**
**Given** a `get_sheet_summary` call
**When** I call it a second time within 5 minutes
**Then** the result should come from the LRU cache (instant)
**And** no upstream API call should be made

#### Story 4.3: Resilience Policy (Retries & Rate Limits)

**As a** User,
**I want** the system to handle temporary API blips automatically,
**So that** my agent doesn't fail just because Smartsheet hiccuped.

**Acceptance Criteria:**
**Given** a 503 Service Unavailable or 429 Too Many Requests response
**When** the API wrapper sees it
**Then** it should wait and retry (Exponential Backoff)
**And** it should give up after 2 retries (Retry Budget)
