# Story 4.2: Performance Utility (Metadata Cache)

## Status

- **Epic**: Epic 4: Reliability & Performance Hardening
- **Status**: Ready for Dev
- **Priority**: Medium

## User Story

**As a** System Owner,
**I want** to cache sheet summaries in memory,
**So that** agents don't spam the API just to check column names.

## Context

Agents frequently call `get_sheet_summary` to understand the schema before acting. These calls are redundant if the sheet structure hasn't changed. Caching these responses will improve speed and reduce API quota usage.

## Technical Notes

- **Component**: `src/utils/cache.ts`
- **Library**: `lru-cache` (standard choice)
- **Configuration**:
  - `max`: 100 items (keep memory low)
  - `ttl`: 5 minutes (300,000 ms) - tradeoff between freshness and performance.

## Acceptance Criteria

- [ ] **Cache Hits**: Second call to `get_sheet_summary` within 5 mins returns cached result.
- [ ] **Cache Misses**: First call hits the API.
- [ ] **Expiration**: After 5 minutes, next call hits API again.
- [ ] **Integration**: `get_sheet_summary` tool implementation updated to use this cache.
