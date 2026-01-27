# Story 4.1: Reliability Utility (Queue & Concurrency)

## Status

- **Epic**: Epic 4: Reliability & Performance Hardening
- **Status**: Ready for Dev
- **Priority**: High

## User Story

**As a** System Owner,
**I want** to limit concurrent API calls to 50,
**So that** the server doesn't crash under load from multiple agents.

## Context

When multiple agents access the MCP server simultaneously, we risk hitting Smartsheet API rate limits or overwhelming the local Node process. We need a centralized queueing mechanism to throttle requests.

## Technical Notes

- **Component**: `src/utils/queue.ts`
- **Library**: Consider using `p-queue` or a simple internal array-based implementation.
- **Configuration**:
  - `concurrency`: 50 (from NFR-02)
  - `timeout`: 60s (from NFR-01) - Requests waiting longer than this should fail.

## Acceptance Criteria

- [ ] **Concurrency Limit**: System processes max 50 requests in parallel.
- [ ] **Queueing**: 51st request waits until a slot is free.
- [ ] **Timeout**: Queued requests time out after 60s if not processed.
- [ ] **Integration**: All API calls in `smartsheet-api.ts` must route through this queue.
