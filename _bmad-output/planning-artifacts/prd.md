---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments: [
  '_bmad-output/project-overview.md',
  '_bmad-output/architecture.md',
  '_bmad-output/component-inventory.md',
  '_bmad-output/source-tree-analysis.md',
  '_bmad-output/development-guide.md',
  '_bmad-output/index.md'
]
classification:
  projectType: 'Backend / MCP Server'
  domain: 'SaaS / B2B'
  complexity: 'Medium'
  projectContext: 'Brownfield'
workflowType: 'prd'
---

# Product Requirements Document - smar-mcp

**Author:** Mark
**Date:** 2026-01-11

## 1. Executive Summary

The **Smartsheet MCP Server** (`@smartsheet/smar-mcp`) is a Model Context Protocol (MCP) server that provides AI agents with access to the Smartsheet API. It enables searching, retrieving, updating, and managing Smartsheet resources (sheets, row hierarchy, workspaces) directly through the MCP standard interface.

**Product Vision:**
To empower AI agents to be first-class citizens in Smartsheet project management, capable of navigating complex sheet hierarchies and performing precise, context-aware updates without human intervention.

## 2. Success Criteria

### Technical Success
- **Discovery**: `find_rows` tool accurately locates rows by Column Value (e.g., "Issue Key" = "JIRA-123").
- **Hierarchy**: `add_rows` supports `parentId` and `siblingId` parameters effectively.
- **Performance**: Find operations complete within 5s for standard sheets (>500 rows).
- **Quality**: 0% orphaned rows during sync operations.

### Security & Compliance
- **Audit**: Complete security evaluation of the codebase.
- **Hardening**: Implementation of recommended security fixes (input sanitization, secret management check).
- **Vulnerability Check**: Zero High/Critical vulnerabilities in dependency scans.
- **Sanitization**: Verification that secrets (API keys) are never logged, even on error.

## 3. Product Scope & Phased Roadmap

### MVP Strategy (Phase 1)
**Approach:** **Capabilities-First MVP**.
The goal is to provide the missing "primitive" capabilities (Hierarchy, Value-based Search) on the MCP server that enable external agents/scripts to perform complex logic (like synchronization).

**Must-Have Capabilities:**
1.  **Hierarchical Data Management**: Enhancement to `add_rows` to support `parentId` and `siblingId`.
2.  **Content-Based Addressability**: New tool `find_rows` to locate rows by specific column values.

**Out of Scope:**
- Business logic for synchronization (handled by external scripts).
- External data fetching (Jira API).
- "Lookup Table" management.

### Growth Features (Phase 2)
- **Advanced Filtering**: Support for complex search queries (AND/OR logic) in `find_rows`.
- **Batch Optimization**: Dedicated endpoints for bulk hierarchy updates.

### Vision (Phase 3)
- **Schema Manipulation**: Tools to add/rename columns and change column types.
- **Attachment Support**: Capabilities to read/upload row attachments.

## 4. User Journeys

### Journey 1: The Project Kickoff (Setup)
**Narrative**: Mark tells the Agent: "Create a tracking sheet for Project Alpha." The Agent creates the sheet with standard columns (Issue Key, Status). It fetches Epics from Jira and uses `add_rows` to insert them as top-level items. Mark sees the project skeleton ready instantly.
**Requirements**: `create_sheet`, Basic `add_rows`.

### Journey 2: The Daily Standup (Sync)
**Narrative**: A nightly sync agent queries Jira for updated issues. It finds "ALPHA-123" moved to "Done". It uses `find_rows` to locate the exact row by "Issue Key" = "ALPHA-123" and updates the status cell.
**Requirements**: **`find_rows`** (Critical Gap), `update_rows`.

### Journey 3: The New Scope (Hierarchy)
**Narrative**: Mark says "Add ticket ALPHA-99 under the Mobile Epic." The Agent uses `find_rows` to locate "Mobile Epic", gets its `rowId`, then uses `add_rows` with `parentId` to nest the new ticket effectively.
**Requirements**: **`add_rows` with `parentId`** (Critical Gap).

## 5. Domain-Specific Requirements

### Compliance & Regulatory
- **FedRAMP Moderate Context**: System operates within a high-compliance boundary.
- **Data Classification**: Low impact / Non-sensitive data volume.

### Technical Constraints
- **Rate Limiting**: Low priority for MVP (standard handling acceptable).
- **Network Security**: Architecture must support future whitelisting/egress filtering.

### Integration Requirements
- Standard API connectivity allowed for MVP.

## 6. Technical Specifications (Backend / MCP)

### Architecture Considerations
- **Deployment**: Local Node.js execution.
- **Authentication**: Environment variable (`SMARTSHEET_API_KEY`) based.
- **Error Handling**: Implementation of structured error codes (e.g., `ROW_NOT_FOUND`, `RATE_LIMIT_EXCEEDED`) to enable agentic recovery.
- **Versioning**: Rolling updates strategy; no backward compatibility requirement for MVP.

### Risk Mitigation
- **Search Performance**: Linear scanning for `find_rows` might be slow on large sheets. *Mitigation:* Implement server-side filtering if API supports it, or efficient local caching strategies.
- **Rate Limiting**: Burst updates might hit limits. *Mitigation:* Implement standard exponential backoff in the API client wrapper.

## 7. Functional Requirements

### Row Hierarchy Management
- **FR1**: Agent can add a new row as a child of an existing row (`parentId`).
- **FR2**: Agent can add a new row as a sibling of an existing row (`siblingId`).
- **FR3**: Agent can add a new row to the top or bottom of the sheet (Default).

### Content Discovery
- **FR4**: Agent can find all rows where a specific Column matches a specific Value (Exact Match).
- **FR5**: Agent receives the `rowId` and cell data for all matched rows.

### System Reliability
- **FR6**: Agent receives structured error codes (e.g., `ROW_NOT_FOUND`) instead of just text descriptions.
- **FR7**: Agent receives clear feedback if a provided `parentId` does not exist.

### Security
- **FR8**: System suppresses raw API keys from all logging outputs.

## 8. Non-Functional Requirements

### Performance
- **Latency**: `find_rows` should return results within **5 seconds** for sheets under 5,000 rows.

### Security
- **Secret Hygiene**: Start-up logs must be free of local API keys.
- **Dependency Safety**: Zero "High" or "Critical" vulnerabilities in `npm audit`.

### Reliability
- **Recovery**: Agent must be able to resume a partial update if a network error occurs (Idempotency).
- **Error Clarity**: 100% of "Logic Errors" (e.g. invalid column) must return a structured JSON error, not a text stack trace.
