# Story 4.3: Resilience Policy (Retries & Rate Limits)

## Status

- **Epic**: Epic 4: Reliability & Performance Hardening
- **Status**: Ready for Dev
- **Priority**: High

## User Story

**As a** User,
**I want** the system to handle temporary API blips automatically,
**So that** my agent doesn't fail just because Smartsheet hiccuped.

## Context

APIs fail. Network glitches happen. Rate limits are hit. A robust agent tool must withstand these without crashing immediately. We need a "Retry Budget" logic wrapping our API calls.

## Technical Notes

- **Component**: `src/apis/smartsheet-api.ts` (API Wrapper)
- **Library**: `p-retry` or custom exponential backoff loop.
- **Errors to Retry**:
  - `429 Too Many Requests`
  - `503 Service Unavailable`
  - Network timeouts (ETIMEDOUT)
- **Non-Retriable**:
  - `400 Bad Request`
  - `401 Unauthorized` (Configuration error, not transient)
  - `403 Forbidden`
  - `404 Not Found` (Usually)

## Acceptance Criteria

- [ ] **Retry On 429/503**: System retries at least 2 times before giving up.
- [ ] **Exponential Backoff**: Wait time increases between tries (e.g. 1s -> 2s).
- [ ] **Fail Fast**: 400/401/403 errors throw immediately without retry.
- [ ] **Retry Budget**: Max 2 retries (Total 3 attempts) to prevent infinite loops (FR-12).
