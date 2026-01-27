# Story 3.2: Tool - Paged Read

## Status

- **Epic**: Epic 3: Smart Retrieval
- **Status**: Ready for Dev
- **Priority**: Medium

## User Story

**As a** User or Agent,
**I want** to read a large sheet in smaller chunks (pages),
**So that** I don't hit context window limits.

## Context

Some sheets have thousands of rows. Reading `limit: -1` (all rows) is dangerous. Agents need a reliable way to say "Give me rows 1-50", then "Rows 51-100".

## Technical Notes

- **Tool**: `get_sheet` already exists.
- **Parameters**: `page`, `pageSize` (or `limit`).
- **Behavior**:
  - `get_sheet(id, page=1, pageSize=50)` -> Returns rows 1-50.
  - `get_sheet(id, page=2, pageSize=50)` -> Returns rows 51-100.

## Acceptance Criteria

- [ ] **Pagination**: Can request specific pages.
- [ ] **Metadata**: Response includes `totalRowCount` and `totalPages` (if avail) so agent knows when to stop.
- [ ] **Efficiency**: Only fetches requested page from API (no fetching all and slicing).
