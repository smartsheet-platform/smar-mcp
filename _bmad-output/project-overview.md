# Project Overview: Smartsheet MCP Server

## Executive Summary

The **Smartsheet MCP Server** (`@smartsheet/smar-mcp`) is a Model Context Protocol (MCP) server that provides AI agents with access to the Smartsheet API. It enables searching, retrieving, updating, and managing Smartsheet resources (sheets, workspaces, users, etc.) directly through the MCP standard interface.

## Technology Stack

| Category          | Technology                | Version | Justification                                |
| ----------------- | ------------------------- | ------- | -------------------------------------------- |
| **Language**      | TypeScript                | 5.x     | Type safety and modern JS features           |
| **Runtime**       | Node.js                   | >=16    | Server-side execution environment            |
| **Framework**     | @modelcontextprotocol/sdk | ^1.12.0 | Core MCP server implementation               |
| **HTTP Client**   | Axios                     | ^1.8.4  | REST API interaction with Smartsheet         |
| **Validation**    | Zod                       | ^3.24.2 | Runtime schema validation for tool arguments |
| **Configuration** | Dotenv                    | ^16.4.x | Environment variable management              |
| **Testing**       | Jest                      | ^29.5.0 | Unit and integration testing                 |

## Architecture Classification

- **Type**: Backend / Service
- **Style**: Layered Architecture (Interface layer -> Tool Adapters -> API Client)
- **Repository Structure**: Monolith
- **Primary Pattern**: Adapter Pattern (Adapts Smartsheet API to MCP Tools)

## Key Features

- **Project Structure**: Organized by domain (Sheets, Workspaces, Users, Search)
- **Security**: Environment-based API key configuration
- **Transport**: Stdio transport for local process communication

## Documentation Status

- [x] Project Overview
- [ ] Architecture
- [ ] Source Tree Analysis
- [ ] Development Guide
- [ ] Tool/API Reference
