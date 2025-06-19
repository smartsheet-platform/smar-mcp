# CLAUDE.md

This file contains configuration and instructions for Claude to help with this repository.

## Repository Overview
This repository contains a Smartsheet Model Context Protocol (MCP) server that provides tools for interacting with the Smartsheet API. It enables AI assistants to access and manipulate Smartsheet data through a standardized interface.

### Key Features
- MCP-compliant server implementation
- Structured logging with client notifications
- Rate limiting and security best practices
- Support for sheets, folders, workspaces, and search operations
- Support for discussion threads and update requests

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

## Repository Structure
```
.github/
  ├── ISSUE_TEMPLATE/
  │   ├── bug_report.md      # Template for bug reports
  │   ├── feature_request.md # Template for feature requests
  │   └── config.yml         # Issue template configuration
  └── PULL_REQUEST_TEMPLATE/
      └── default.md         # Default PR template
```

## Conventional Commits

This repository follows the conventional commits standard:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that don't affect code meaning
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding/modifying tests
- `chore`: Changes to build process or auxiliary tools

## Development Commands

```bash
# Build the project
npm run build

# Run the server
npm run start

# Build and run in one command
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run typecheck
```

## Code Conventions

- Use ESM modules (import/export) instead of CommonJS (require)
- TypeScript for all new code
- Prefer async/await over Promises with then/catch
- Follow conventional commits format for all commits
- Include JSDoc comments for public APIs
- Add unit tests for new features
- Maintain 100% code coverage if possible
- Follow RFC 5424 for logging levels
- Implement proper error handling