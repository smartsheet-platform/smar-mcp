# System Architecture

## Executive Summary
This project implements a Model Context Protocol (MCP) server for Smartsheet. It acts as a bridge between AI agents (Anthropic Claude, etc.) and the Smartsheet Platform.

## Architecture Pattern
**Layered Architecture (Monolith)**

The application is structured in three distinct layers:

1.  **Interface Layer (`src/tools/`)**:
    - Defines the contact surface with the AI Agent.
    - Implements the MCP Tool specification.
    - Handles input validation (Zod schemas) and output formatting.
    - **Pattern**: Command / Adapter.

2.  **Logic Layer (`src/index.ts` & Tools)**:
    - Orchestration of requests.
    - Tool registration.
    - Configuration management.

3.  **Data Access Layer (`src/apis/`)**:
    - Direct wrapper around the Smartsheet REST API.
    - Manages HTTP transport (`axios`).
    - Handles authentication headers and base URLs.

## Data Flow Diagram
```mermaid
graph TD
    Agent[AI Agent] <-->|MCP Protocol (Stdio)| Server[MCP Server (index.ts)]
    Server -->|Dispatch| Tool[Tool Adapter (src/tools/)]
    Tool -->|Call| API[API Client (src/apis/)]
    API <-->|REST/HTTP| Smartsheet[Smartsheet Platform]
```

## Security Design
- **Authentication**: Usage of `SMARTSHEET_API_KEY` environment variable.
- **Authorization**: Inherits permissions of the API token user.
- **Input Validation**: Strict Zod schemas prevent malformed requests to the API.
