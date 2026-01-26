# Developer Implementation Task List

**Project:** smar-mcp
**Date:** 2026-01-25
**Status:** 5 Stories Remaining (62% Complete)

## Overview

This document provides a clear task list for developer agents to complete the remaining implementation work for smar-mcp. Based on the Implementation Readiness Review, 8 of 13 stories are complete. The following 5 stories remain to be implemented.

---

## Epic 3: Smart Retrieval (Filtering)

### Task 3.1: Implement Filtered Read Tool ❌

**Story:** Tool - Filtered Read  
**Priority:** HIGH  
**Complexity:** MEDIUM

**Requirement:**
Implement `get_sheet_filtered` tool that enables agents to query specific rows matching criteria without scanning entire sheets.

**Acceptance Criteria:**

- Given a filter criteria `{ Status: 'Open' }`
- When I call `get_sheet_filtered(sheetId, filter)`
- Then I should receive only rows where Status column equals 'Open' (Case-Insensitive)
- And the response should be paginated if there are many matches

**Implementation Tasks:**

1. Create `get_sheet_filtered` function in `src/apis/smartsheet-sheet-api.ts`
   - Accept `sheetId`, `filter` object, `page`, `pageSize` parameters
   - Implement case-insensitive exact match logic
   - Support pagination (page/pageSize)
2. Add tool definition in `src/tools/smartsheet-sheet-tools.ts`
   - Register `get_sheet_filtered` tool with MCP server
   - Define Zod schema for input validation
   - Document usage examples
3. Write unit tests in `tests/unit/sheet-tools-filters.test.ts`
   - Test case-insensitive matching
   - Test pagination behavior
   - Test multiple filter criteria
   - Test empty results

**Related Files:**

- `src/apis/smartsheet-sheet-api.ts`
- `src/tools/smartsheet-sheet-tools.ts`
- `tests/unit/sheet-tools-filters.test.ts` (create new)

**Related FR:** FR-03, FR-08 (from epics doc)

---

### Task 3.2: Implement Paged Read with Offset ❌

**Story:** Tool - Paged Read  
**Priority:** MEDIUM  
**Complexity:** LOW

**Requirement:**
Add proper offset/limit support to `get_sheet` to enable reading specific row ranges (e.g., rows 100-200).

**Acceptance Criteria:**

- Given a sheet with 500 rows
- When I call `get_sheet(sheetId, offset=100, limit=50)`
- Then I should receive rows 101 to 150
- And the response should include total row count

**Implementation Tasks:**

1. Modify `get_sheet` in `src/tools/smartsheet-sheet-tools.ts`
   - Add `offset` parameter to existing tool
   - Update logic to skip first N rows
   - Maintain existing `limit` functionality
2. Update API client if needed in `src/apis/smartsheet-sheet-api.ts`
   - Ensure API supports row offset
   - Handle pagination correctly
3. Update existing tests
   - Add offset test cases to `src/tools/smartsheet-sheet-tools.test.ts`
   - Test offset + limit combinations
   - Test boundary conditions (offset > total rows)

**Related Files:**

- `src/tools/smartsheet-sheet-tools.ts` (modify existing)
- `src/apis/smartsheet-sheet-api.ts` (modify if needed)
- `src/tools/smartsheet-sheet-tools.test.ts` (add tests)

**Related FR:** FR-05 (from epics doc)

---

## Epic 4: Reliability & Performance Hardening

### Task 4.1: Implement Queue & Concurrency Control ❌

**Story:** Reliability Utility (Queue & Concurrency)  
**Priority:** HIGH  
**Complexity:** HIGH

**Requirement:**
Implement request queueing to limit concurrent API calls to 50, preventing server overload from multiple agents.

**Acceptance Criteria:**

- Given 60 simultaneous requests
- When they hit the server
- Then the first 50 should process immediately
- And the remaining 10 should be queued
- And they should process as slots free up (or timeout after 60s)

**Implementation Tasks:**

1. Create `src/utils/queue.ts`
   - Install PQueue: `npm install p-queue @types/p-queue`
   - Create QueueManager class
   - Set concurrency limit to 50
   - Set timeout to 60 seconds
2. Integrate queue into API client
   - Wrap all Smartsheet API calls in `src/apis/smartsheet-api.ts`
   - Ensure all endpoints use the queue
   - Add queue metrics (optional for monitoring)
3. Write tests in `tests/unit/queue.test.ts`
   - Test concurrency limits
   - Test queue overflow behavior
   - Test timeout handling
   - Test queue emptying

**Related Files:**

- `src/utils/queue.ts` (create new)
- `src/apis/smartsheet-api.ts` (modify)
- `tests/unit/queue.test.ts` (create new)
- `package.json` (add p-queue dependency)

**Related NFR:** NFR-02, NFR-03

---

### Task 4.2: Implement Metadata Cache ❌

**Story:** Performance Utility (Metadata Cache)  
**Priority:** MEDIUM  
**Complexity:** MEDIUM

**Requirement:**
Cache sheet summaries in memory to avoid repeated API calls for column names and metadata.

**Acceptance Criteria:**

- Given a `get_sheet_summary` call
- When I call it a second time within 5 minutes
- Then the result should come from the LRU cache (instant)
- And no upstream API call should be made

**Implementation Tasks:**

1. Create `src/utils/cache.ts`
   - Install lru-cache: `npm install lru-cache @types/lru-cache`
   - Create CacheManager class
   - Set TTL to 5 minutes (300000ms)
   - Set max size appropriately
2. Integrate cache into sheet summary API
   - Modify `getSheetSummary` in `src/apis/smartsheet-sheet-api.ts`
   - Check cache before making API call
   - Store results in cache after successful API call
3. Add cache invalidation logic
   - Invalidate on sheet updates
   - Provide cache clear utility
4. Write tests in `tests/unit/cache.test.ts`
   - Test cache hit/miss
   - Test TTL expiration
   - Test cache invalidation
   - Test LRU eviction

**Related Files:**

- `src/utils/cache.ts` (create new)
- `src/apis/smartsheet-sheet-api.ts` (modify)
- `tests/unit/cache.test.ts` (create new)
- `package.json` (add lru-cache dependency)

**Related NFR:** NFR-07

---

### Task 4.3: Implement Retry Policy & Rate Limit Handling ❌

**Story:** Resilience Policy (Retries & Rate Limits)  
**Priority:** HIGH  
**Complexity:** MEDIUM

**Requirement:**
Automatically handle temporary API failures (503, 429) with exponential backoff, limiting autonomous retries to prevent runaway loops.

**Acceptance Criteria:**

- Given a 503 Service Unavailable or 429 Too Many Requests response
- When the API wrapper sees it
- Then it should wait and retry (Exponential Backoff)
- And it should give up after 2 retries (Retry Budget)

**Implementation Tasks:**

1. Modify base API client in `src/apis/smartsheet-api.ts`
   - Add retry logic for 503 and 429 status codes
   - Implement exponential backoff (e.g., 1s, 2s, 4s)
   - Enforce max 2 retries per request
   - Parse Retry-After header from 429 responses
2. Add retry configuration
   - Make retry count configurable via env var
   - Make backoff multiplier configurable
   - Log retry attempts for debugging
3. Write tests in `tests/unit/retry-policy.test.ts`
   - Test 503 retry behavior
   - Test 429 retry with Retry-After header
   - Test retry budget enforcement
   - Test exponential backoff timing
   - Test eventual success after retries
   - Test final failure after exhausting retries

**Related Files:**

- `src/apis/smartsheet-api.ts` (modify)
- `tests/unit/retry-policy.test.ts` (create new)
- `.env.example` (add retry config)

**Related FR:** FR-09, FR-10, FR-11, FR-12
**Related NFR:** NFR-01

---

## Implementation Order Recommendation

Based on dependencies and priority:

1. **Task 4.3** (Retry Policy) - HIGH priority, enables resilience
2. **Task 4.1** (Queue & Concurrency) - HIGH priority, prevents overload
3. **Task 3.1** (Filtered Read) - HIGH priority, core functionality
4. **Task 4.2** (Metadata Cache) - MEDIUM priority, performance optimization
5. **Task 3.2** (Paged Read) - MEDIUM priority, nice-to-have feature

---

## Definition of Done

For each task to be considered complete:

✅ All acceptance criteria met  
✅ Unit tests written and passing  
✅ Integration tests passing (if applicable)  
✅ Code reviewed and merged  
✅ Documentation updated  
✅ No new linter errors  
✅ Story marked complete in epics document

---

## Reference Documents

- **PRD:** `_bmad-output/planning-artifacts/prd 2.md`
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md`
- **Epics & Stories:** `_bmad-output/planning-artifacts/epics 2.md`
- **Implementation Readiness Report:** `_bmad-output/planning-artifacts/implementation-readiness-report-2026-01-25.md`

---

## Current Codebase Status

**Already Implemented (8/13 stories):**

- ✅ Epic 1: Stories 1.1-1.5 (Context & Discovery)
- ✅ Epic 2: Stories 2.1-2.3 (Safe Data Mutation)

**Remaining (5/13 stories):**

- ❌ Epic 3: Stories 3.1-3.2 (Smart Retrieval)
- ❌ Epic 4: Stories 4.1-4.3 (Reliability & Performance)

---

**Last Updated:** 2026-01-25
**Prepared By:** Winston (Architect Agent)
