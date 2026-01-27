# Story 3.1: Tool - Filtered Read

## Status

- **Epic**: Epic 3: Smart Retrieval (Filtering)
- **Status**: Ready for Dev
- **Priority**: High

## User Story

**As a** User or Agent,
**I want** to get rows that match specific criteria (e.g., Status='Open'),
**So that** I don't waste tokens reading unrelated data.

## Context

Currently, agents have to read entire sheets or scan linearly column by column to find relevant rows. This is inefficient for filtering by multiple criteria or simple key-value lookups like "Status = 'Complete'". We need a dedicated tool that handles this efficiently.

## Technical Notes

- **Tool Name**: `get_sheet_filtered` (or upgrade `find_rows` to support this pattern)
- **Input**: `sheetId`, `filter` object (e.g. `{ "Status": "Open" }`)
- **Logic**:
  1. Retrieve sheet columns to map Column Names -> Column IDs
  2. Perform "smart scan" or filter logic
  3. Support Case-Insensitive Exact Match (e.g. 'open' matches 'Open')
  4. Should support simple pagination if result set is large (FR-08b)

## Acceptance Criteria

- [ ] **Exact Match Filtering**: Call `get_sheet_filtered(sheetId, { Status: 'Open' })` successfully returns only rows where "Status" column is "Open".
- [ ] **Case Insensitivity**: "open", "OPEN", "Open" should all match.
- [ ] **Multi-Column Support**: (Nice to have, but MVP requirement is at least single column filter).
- [ ] **Efficiency**: Should be more token-efficient than `get_sheet` for sparse matches.
- [ ] **Pagination**: If >50 matches, must support paging or return a warning/limited set.
