# Development Guide

## Prerequisites

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Smartsheet API Key**: Obtained from Smartsheet Developer Tools.

## Environment Setup

1. Clone the repository.
2. Copy `.env.example` to `.env`.
3. Add your API Key:
   ```bash
   SMARTSHEET_API_KEY=your_key_here
   ALLOW_DELETE_TOOLS=false
   ```

## Build and Run

- **Install Dependencies**:
  ```bash
  npm install
  ```
- **Build (TypeScript -> JS)**:
  ```bash
  npm run build
  ```
- **Run Locally**:
  ```bash
  npm start
  ```
  _Note: This runs over stdio, so it's meant to be called by an MCP client (like Claude Desktop)._

## Testing

- **Run Unit/Integration Tests**:
  ```bash
  npm test
  ```
- **Linting**:
  ```bash
  npm run lint
  ```

## Adding a New Tool

1. Create a new file in `src/tools/`.
2. Define the tool using `server.tool()`.
3. Add z schema for arguments.
4. Implement API call logic (add to `src/apis/` if needed).
5. Register the tool in `src/index.ts`.
