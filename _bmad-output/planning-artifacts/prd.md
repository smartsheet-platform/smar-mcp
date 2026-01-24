---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete', 'step-13-review-update', 'step-14-hygiene-review']
inputDocuments: [
  '_bmad-output/project-overview.md',
  '_bmad-output/architecture.md',
  '_bmad-output/component-inventory.md',
  '_bmad-output/source-tree-analysis.md',
  '_bmad-output/development-guide.md',
  '_bmad-output/index.md',
  'src/tools/smartsheet-sheet-tools.ts',
  'SECURITY_EVALUATION.md',
  'package.json',
  '.github/workflows/release.yml',
  '.lintstagedrc.json'
]
classification:
  projectType: 'Backend / MCP Server'
  domain: 'SaaS / B2B'
  complexity: 'Medium'
  projectContext: 'Brownfield'
workflowType: 'prd'
---

# Product Requirements Document - smar-mcp

**Author:** Mark (Updated by Agent)
**Date:** 2026-01-23

## 1. Executive Summary

The **Smartsheet MCP Server** (`@smartsheet/smar-mcp`) is a Model Context Protocol (MCP) server that provides AI agents with access to the Smartsheet API. It enables searching, retrieving, updating, and managing Smartsheet resources (sheets, row hierarchy, workspaces) directly through the MCP standard interface.

**Product Vision:**
To empower AI agents to be first-class citizens in Smartsheet project management, capable of navigating complex sheet hierarchies and performing precise, context-aware updates without human intervention.

**Status Update (2026-01-23):**
Phase 1 (MVP) implementation is **Complete**. However, a **Critical Hygiene Review** has identified that foundational quality gates (Linting, CI Testing) are broken or disabled. Fixing these is now the Top Priority before any further feature development or verification.

## 2. Success Criteria

### Technical Success
- **Hygiene (New)**: `npm run lint` passes with standard TypeScript rules.
- **Hygiene (New)**: CI Pipeline (GitHub Actions) runs `npm test` and `npm run lint` on every PR.
- **Discovery**: `find_rows` tool accurately locates rows by Column Value.
- **Hierarchy**: `add_rows` supports `parentId` and `siblingId` parameters.

### Security & Compliance
- **Audit**: Complete security evaluation of the codebase. **[Completed - Assessment: Safe]**
- **Hardening**: Implementation of recommended security fixes. **[Completed]**
- **Vulnerability Check**: Zero High/Critical vulnerabilities in dependency scans.
- **Sanitization**: Verification that secrets (API keys) are never logged.

## 3. Product Scope & Phased Roadmap

### Priority Phase: Project Hygiene Restore (Top Priority)
**Status: Critical Gaps Identified**
Before validating Phase 1 features, we must ensure the codebase is maintainable and testable.
- **Fix Linting**: Generate missing `.eslintrc.json`/`eslint.config.js` and fix all lint errors in `src/`.
- **Enable CI Tests**: Remove `echo "Tests temporarily skipped"` from `.github/workflows/release.yml` and ensure tests run on Push/PR.
- **Enforce Quality**: Update `.lintstagedrc.json` to actually run `eslint --fix` instead of echoing a placeholder.

### MVP Strategy (Phase 1) - Status: Implementation Complete
**Approach:** **Capabilities-First MVP**.

**Completed Capabilities:**
1.  **Hierarchical Data Management**: Enhancement to `add_rows` to support `parentId` and `siblingId`.
2.  **Content-Based Addressability**: New tool `find_rows` to locate rows by specific column values.

**Next Steps (Verification) - BLOCKED by Hygiene**:
- Verify `find_rows` performance on large sheets.
- Validate `add_rows` hierarchy logic.

### Growth Features (Phase 2) - Status: Prioritized (Post-Hygiene)
- **Advanced Filtering**: Support for complex search queries.
- **Batch Optimization**: Dedicated endpoints for bulk hierarchy updates.

### Vision (Phase 3) - Status: Planned
- **Schema Manipulation**: Tools to add/rename columns.
- **Attachment Support**: Capabilities to read/upload row attachments.

## 4. User Journeys (Updated)

### Journey 0: The Secure Developer (Hygiene)
**Narrative**: A developer pushes code to the repo. The git hook automatically fixes formatting and checks for unused variables. GitHub Actions runs the test suite. Verification ensures no regressions.
**Requirements**: **Functioning ESLint**, **Active CI Tests**.

### Journey 1: The Project Kickoff (Setup)
**Requirements**: `create_sheet`, Basic `add_rows`. **[Ready]**

### Journey 2: The Daily Standup (Sync)
**Requirements**: **`find_rows`**, `update_rows`. **[Ready for Testing]**

### Journey 3: The New Scope (Hierarchy)
**Requirements**: **`add_rows` with `parentId`**. **[Ready for Testing]**

## 5. Domain-Specific Requirements

### Compliance & Regulatory
- **FedRAMP Moderate Context**: System operates within a high-compliance boundary.
- **Data Classification**: Low impact / Non-sensitive data volume.

### Integration Requirements
- Standard API connectivity allowed for MVP.

## 6. Technical Specifications (Backend / MCP)

### Architecture Considerations
- **Deployment**: Local Node.js execution.
- **Authentication**: Environment variable (`SMARTSHEET_API_KEY`) based.
- **Error Handling**: Implementation of structured error codes to enable agentic recovery.
- **Versioning**: Rolling updates strategy.

### Risk Mitigation
- **Search Performance**: Linear scanning for `find_rows` is implemented.
- **Rate Limiting**: Burst updates might hit limits.

## 7. Functional Requirements

### Row Hierarchy Management
- **FR1**: Agent can add a new row as a child of an existing row (`parentId`). **[Done]**
- **FR2**: Agent can add a new row as a sibling of an existing row (`siblingId`). **[Done]**
- **FR3**: Agent can add a new row to the top or bottom of the sheet (Default). **[Done]**

### Content Discovery
- **FR4**: Agent can find all rows where a specific Column matches a specific Value. **[Done]**
- **FR5**: Agent receives the `rowId` and cell data for all matched rows. **[Done]**

## 8. Prioritized Recommendations (Revised 2026-01-23)

**Priority 0: Fix Project Hygiene (Critical)**
1.  **Repair ESLint**: Create `.eslintrc.json`, configure for TypeScript, and run `npm run lint`. Fix resulting errors.
2.  **Activate CI/CD Testing**: Modify `.github/workflows/release.yml` (and create a separate `ci.yml` if needed) to run `npm ci`, `npm run build`, and **`npm test`**.
3.  **Activate Pre-Commit Hooks**: Update `.lintstagedrc.json` to run valid lint commands.

**Priority 1: Verification of Phase 1 Features**
1.  **Verification Script**: Benchmark `find_rows` (>500 rows) and `add_rows` (deep nesting).

**Priority 2: Search Tool Consolidation**
1.  **Action**: Differentiated `find_rows` and `search_in_sheet`. Renamed `find_rows` to `find_rows_by_column_value` and updated descriptions to clarify the difference.

**Priority 3: Delete Protection**
1.  **Action**: Verified `allowDeleteTools` configuration. The `delete_rows` tool is correctly registered based on the `ALLOW_DELETE_TOOLS` environment variable.

**Priority 4: Phase 2**
1.  **Action**: Design Advanced Filtering.
