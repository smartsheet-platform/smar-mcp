# System-Level Test Design

## Testability Assessment

- Controllability: **PASS**. Architecture uses Dependency Injection (`getTools(server, api)`) allowing complete mocking of the Smartsheet API layer. Environment variables control critical flags (`SMARTSHEET_SAFE_MODE`).
- Observability: **PASS**. Centralized logger implementation ensures all operations and secrets are traceable (sanitized). Typed Error Mapper ensures failures are deterministic and structured JSON.
- Reliability: **PASS**. Stateless architecture (except metadata cache) simplifies testing. `PQueue` limits concurrency. Retry strategies handle upstream flakiness.

## Architecturally Significant Requirements (ASRs)

1.  **Secret Sanitization (NFR-07/Security)** - Critical. Must prevent API key leaks in logs. Risk Score: 9 (High Prob/High Impact).
    - _Mitigation_: Central Logger + Regex Redaction.
2.  **Concurrency Support (NFR-02)** - High. Must handle 50 concurrent agents. Risk Score: 6 (Med Prob/High Impact).
    - _Mitigation_: `p-queue` implementation.
3.  **Rate Limit Handling (FR-11)** - High. Must not fail on 429. Risk Score: 6.
    - _Mitigation_: Backoff/Retry logic in API wrapper.
4.  **Bulk Delete Safety (FR-07)** - High. Must block deletes in Safe Mode. Risk Score: 6.
    - _Mitigation_: Middleware check in `smartsheet-sheet-api.ts`.
5.  **Search Performance (NFR-06)** - Medium. Search must be efficient. Risk Score: 4 (Med Prob/Med Impact).
    - _Mitigation_: Metadata caching + Linear Scan optimizations.

## Test Levels Strategy

- **Unit: 70%** (Testing business logic in isolation)
  - _Rationale_: Major complexity lies in response parsing (Linear Scan), Error Mapping, and Tool Validation logic. Fast feedback loop essential. Mock `SmartsheetAPI`.
- **Integration: 20%** (Testing API Wrapper interactions)
  - _Rationale_: Validate `axios` usage, HTTP headers, and Smartsheet-specific error handling (4004 vs 403). Use `VCR` / `Nock` to record/replay API responses.
- **E2E: 10%** (Critical Path Validation)
  - _Rationale_: Verify the "Context Engine" flow: Search -> Summary -> Read -> Update. Requires an ephemeral test workspace.

## NFR Testing Approach

- **Security (Sanitization)**:
  - _Tool_: Unit Tests + Custom Stream Monitor.
  - _Approach_: Pipe `stdout`/`stderr` during test execution and assert regex matching of API keys returns false.
- **Performance (Concurrency)**:
  - _Tool_: `k6` or Custom Node.js Script.
  - _Approach_: Spawn 60 promises calling the mocked server. accurate metrics on queue depth and processing time.
- **Reliability (Rate Limits)**:
  - _Tool_: Integration Tests with Mocked 429 Responses.
  - _Approach_: Simulate 429 response sequence (429 -> 429 -> 200) and verify retry count = 2 and eventual success.
- **Maintainability**:
  - _Tool_: `eslint`, `prettier`.
  - _Approach_: Standard linting and strict TypeScript configuration.

## Test Environment Requirements

1.  **CI Environment**: Node.js 20.
2.  **Secrets**: `SMARTSHEET_API_KEY` (Sandbox/Dev Account) for E2E.
3.  **Ephemeral Workspaces**: E2E tests must create a temp workspace -> create sheet -> test -> delete workspace to ensure isolation.

## Testability Concerns

- **Live API Integration**: Smartsheet API rate limits on the test account could make CI flaky if not mocked properly.
  - _Recommendation_: Heavy reliance on VCR/Nock for Integration tests. E2E tests run only on nightly/merge builds, not every commit.

## Recommendations for Sprint 0

1.  **Mocking Strategy**: Establish the `SmartsheetAPI` mock factory immediately in `src/test/mocks`.
2.  **VCR Setup**: Configure `nock` or similar to capturing/replaying traffic for deterministic integration tests.
3.  **Sanitization Test Harness**: Create a reusable test utility that spies on `console.log` / `process.stdout` to verify secrecy.
