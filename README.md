# Smartsheet MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for interacting with the Smartsheet API. This server provides tools for searching, retrieving, and updating Smartsheet sheets through the MCP protocol.

## Table of Contents

- [Disclaimer](#disclaimer)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Available MCP Tools](docs/tool-coverage.md)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Contributing](#contributing)

## Disclaimer

MCP is a new technology. This integration relies on a SMARTSHEET API token allowing access to your account. While powerful, they can be susceptible to prompt injection when processing untrusted data. We recommend exercising caution and reviewing actions taken through these clients to ensure secure operation.

## Features

- Get detailed information about sheets in Smartsheet
- Create, update, and delete sheets and rows
- Create version backups of sheets at specific timestamps
- Formatted responses optimized for AI consumption

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/smartsheet-platform/smar-mcp.git
   cd smar-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with your Smartsheet API token:
   ```
   SMARTSHEET_API_KEY=your_smartsheet_api_token
   ```

   You can obtain a Smartsheet API token from the [Smartsheet Developer Portal](https://developers.smartsheet.com/).

4. Build the project:
   ```bash
   npm run build
   ```

## Usage

There are several ways to run the MCP server with the `.env` file loaded:

### Using npm scripts (recommended)

Start the server with environment variables loaded from the `.env` file:

```bash
npm run start
```

This uses the `-r dotenv/config` flag to ensure dotenv is loaded before the application code runs.

Or build and start in one command:

```bash
npm run dev
```

### Using node directly

You can also run the server directly with Node.js and the `-r` flag:

```bash
node -r dotenv/config build/index.js
```

This ensures that dotenv is loaded before the application code runs.

Alternatively, you can run without the `-r` flag:

```bash
node build/index.js
```

In this case, the application code will load dotenv itself (we've included `import { config } from "dotenv"; config();` at the top of the entry file).

The server will start and display: "Smartsheet MCP Server running on stdio"


## Environment Variables

- `SMARTSHEET_API_KEY`: Your Smartsheet API token (required)
- `ALLOW_DELETE_TOOLS`: Set to 'true' to enable deletion operations like delete_rows (default: false)

## Development

### Prerequisites

- Node.js 16 or higher
- npm 7 or higher

### Building

```bash
npm run build
```

### Project Structure

- `src/index.ts`: Main entry point and MCP tool definitions
- `src/smartsheet-direct-api.ts`: Direct API client for Smartsheet
- `src/smartsheet-utils.ts`: Utility functions for common operations
- `src/smartsheet-workflows.ts`: Implementation of complex workflows
- `src/smartsheet-types`: Classes representing Smartsheet API objects
- `tests/`: Test files for various functionality
- `scripts/`: Utility scripts
- `examples/`: Example usage files
- `.env`: Environment variables
- `.env.example`: Template for environment variables
- `claude_desktop_config-example.json`: Example claude desktop config to connect with the tool - Set your Smartsheet key in the env setting. 

### Testing 

Follow the steps at https://modelcontextprotocol.io/quickstart/server under "Testing your server with Claude for Desktop"

See claude_desktop_config-example.json as an example config to use

Roo:
Run `npm run dev` and make sure your MCP is running locally.

In the Roo Code plug-in, click on the MCP Servers button then Edit MCP Settings. Copy over the text in the `claude_desktop_config-example.json` file over (it should be the same) and make the necessary changes to match your environment.

You should see the MCP Service listed above the Edit MCP Settings button. If not, check that your config is correct and your API key is properly set. If it is, try restarting VS Code.


## Contributing

This project uses [Semantic Release](https://github.com/semantic-release/semantic-release) for automated versioning and changelog generation based on conventional commits and PR descriptions.

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types

- `feat`: A new feature (minor version bump)
- `fix`: A bug fix (patch version bump)
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

#### Breaking Changes

Breaking changes should be indicated by adding `BREAKING CHANGE:` in the commit message body or by appending a `!` after the type/scope:

```
feat!: remove deprecated API
```

or

```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes using the conventional commit format
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request following the PR template

### Automated Release Process

When your PR is merged to the main branch, semantic-release will automatically:

1. Determine the next version number based on commit messages
2. Extract detailed release notes from PR descriptions
3. Generate a comprehensive CHANGELOG.md file
4. Create a GitHub release with formatted release notes
5. Publish the package to npm
6. Add a "released" label to the merged PR

For more detailed information about our release process, see [Release Process Documentation](./docs/release-process.md).
