# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains a Smartsheet Model Context Protocol (MCP) server that provides tools for interacting with the Smartsheet API. It allows AI assistants to search, retrieve, update, and manage Smartsheet resources through the MCP protocol.

## Development Commands

### Installation and Setup

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
# Edit .env and add your Smartsheet API token

# Build the project
npm run build
```

### Running the Server

```bash
# Build and start the server (recommended)
npm run dev

# Start the server (if already built)
npm run start

# Run directly with Node
node -r dotenv/config build/index.js
```

### Testing and Quality Assurance

```bash
# Run tests
npm test

# Run TypeScript type checking
npm run typecheck

# Run ESLint for code quality checks
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Packaging and Deployment

```bash
# Create a package for distribution
npm run package

# Publish to npm registry
npm run deploy
```

### Claude Desktop Integration

```bash
# Set up Claude Desktop configuration
npm run setup-claude

# Or run the setup script directly
bash scripts/setup-claude-config.sh
```

## Code Architecture

### Main Components

1. **MCP Server (src/index.ts)**: 
   - Entry point that initializes the MCP server
   - Registers all Smartsheet tools and connects to stdio transport
   - Controls feature flags like deletion operations

2. **API Layer (src/apis/)**:
   - `SmartsheetAPI`: Core client that handles authentication and service initialization
   - Domain-specific APIs: Sheet, Workspace, Folder, User, Search, Discussion

3. **Tool Layer (src/tools/)**:
   - Implements MCP tool definitions for each API domain
   - Handles parameter validation using Zod schemas
   - Formats API responses for AI consumption

4. **Type Definitions (src/smartsheet-types/)**:
   - TypeScript interfaces for Smartsheet resources
   - Includes Sheet, Row, Column, Cell, Workspace, Folder

### Data Flow

```
MCP Client → MCP Server → Tool Layer → API Layer → Smartsheet REST API
```

1. AI assistant invokes an MCP tool with parameters
2. Tool layer validates parameters using Zod schemas
3. API layer makes HTTP request to Smartsheet API
4. Response is processed and formatted for AI consumption
5. Result is returned to the AI assistant

## Environment Variables

- `SMARTSHEET_API_KEY`: Your Smartsheet API token (required)
- `SMARTSHEET_ENDPOINT`: API endpoint URL (default: https://api.smartsheet.com/2.0/)
- `ALLOW_DELETE_TOOLS`: Controls whether deletion operations are enabled (default: false)

## GitHub CLI Setup and Authentication

To use GitHub CLI (gh) commands, you need to authenticate first:

```bash
# Log in to GitHub CLI
gh auth login

# Follow the prompts to complete authentication
# This will open a browser window and ask for a one-time code
```

## GitHub Commands

### Creating Issues
```bash
# Basic issue creation
gh issue create --title "Issue title" --body "Issue description"

# With labels and assignees
gh issue create --title "Issue title" --body "Issue description" --label "bug,enhancement" --assignee "username"
```

### Creating Pull Requests
```bash
# Basic PR creation
gh pr create --title "PR title" --body "PR description"

# With reviewers and labels
gh pr create --title "PR title" --body "PR description" --reviewer "username" --label "enhancement"

# Using a HEREDOC for better formatting of the PR body
gh pr create --title "PR title" --body "$(cat <<'EOF'
## Summary
Summary text here

## Test plan
- Testing details
EOF
)"
```

### Updating Pull Requests
```bash
# Update title and body
gh pr edit [PR number] --title "New title" --body "New description"

# Add/remove labels
gh pr edit [PR number] --add-label "enhancement" --remove-label "bug"

# Add/remove reviewers
gh pr edit [PR number] --add-reviewer "username" --remove-reviewer "another-user"
```

### Fetching PR Comments
```bash
# View PR with comments
gh pr view [PR number] --comments

# Get comments in JSON format
gh pr view [PR number] --comments --json comments
```

### Adding Comments to PRs
```bash
# Add a comment to a PR
gh pr comment [PR number] --body "This looks good!"
```

## Git Workflow

### Creating a new branch
```bash
# Create and switch to a new branch
git checkout -b feature/branch-name
```

### Committing changes with conventional commit messages
```bash
# Stage changes
git add .

# Commit with conventional format
git commit -m "$(cat <<'EOF'
feat: short summary of changes

- Detailed bullet point 1
- Detailed bullet point 2

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Pushing and creating a PR
```bash
# Push with branch tracking
git push -u origin feature/branch-name

# Create PR using the GitHub CLI
gh pr create --title "PR Title" --body "PR description"
```

## Conventional Commits

This repository follows the conventional commits standard:

- `feat`: A new feature (minor version bump)
- `fix`: A bug fix (patch version bump)
- `docs`: Documentation changes
- `style`: Changes that don't affect code meaning
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding missing tests or correcting existing tests
- `perf`: A code change that improves performance
- `chore`: Changes to build process or auxiliary tools

Breaking changes should be indicated with a `!` after the type or using `BREAKING CHANGE:` in the commit body.

## Semantic Versioning

This project uses semantic-release to automate versioning based on commit messages:
- feat: Minor version bump (1.0.0 → 1.1.0)
- fix: Patch version bump (1.0.0 → 1.0.1)
- feat!: or BREAKING CHANGE: Major version bump (1.0.0 → 2.0.0)

## CI/CD Workflows

The repository uses GitHub Actions for continuous integration and delivery:

### PR Validation

All pull requests to the `main` branch are automatically validated with these checks:
- TypeScript type checking
- ESLint code quality checks
- Build verification
- Tests with code coverage
- PR title format validation
- PR description validation

See the following files for workflow configurations:
- `.github/workflows/pr-validation.yml`
- `.github/workflows/pr-title-validation.yml`
- `.github/workflows/pr-description-validation.yml`
- `.github/workflows/dependency-check.yml`

### Release Process

When changes are merged to `main`, a release workflow runs that:
1. Runs all validation steps
2. Uses semantic-release to determine the next version
3. Creates a GitHub release with release notes
4. Publishes the package to npm

See `.github/workflows/release.yml` for the workflow configuration and `docs/release-process.md` for details.

### Test Coverage

The project uses Jest with Istanbul for code coverage reporting. PRs include coverage metrics and reports. See `docs/code-coverage.md` for more information about coverage reports and best practices.

## CI/CD Workflows

The repository uses GitHub Actions for continuous integration and delivery:

### PR Validation

All pull requests to the `main` branch are automatically validated with these checks:
- TypeScript type checking
- ESLint code quality
- Build verification
- Tests (when implemented)

Dependency security checks run when package.json or package-lock.json files are modified.

### Release Process

When changes are merged to `main`, a release workflow runs that:
1. Runs all validation steps
2. Uses semantic-release to determine the next version
3. Creates a GitHub release with release notes
4. Publishes the package to npm

### Branch Protection

The repository is configured with branch protection rules that:
- Prevent direct pushes to `main`
- Require PR validation checks to pass before merging
- Require PR branches to be up-to-date with `main`

See [docs/branch-protection.md](docs/branch-protection.md) for setup instructions.