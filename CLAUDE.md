# CLAUDE.md

This file contains configuration and instructions for Claude to help with this repository.

## Repository Overview
This repository contains a Smartsheet Model Context Protocol (MCP) server that provides tools for interacting with the Smartsheet API.

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

Add common development commands here that should be run regularly.

## Code Conventions

### Error Handling

This repository follows a consistent error handling pattern:

1. Use the `formatError` helper function from `src/utils/logger.ts` for consistent error formatting
   ```typescript
   import { formatError } from "../utils/logger.js";
   
   try {
     // Code that might throw
   } catch (error) {
     // Log with full error details
     logger.error("Error description", formatError(error));
     
     // Return user-facing error with just the message
     return {
       content: [
         {
           type: "text",
           text: `Error message: ${formatError(error).message}`
         }
       ],
       isError: true
     };
   }
   ```

2. Error logging should include:
   - A descriptive message of what failed
   - The structured error object from `formatError()`
   - Additional context specific to the operation (IDs, parameters, etc.)

3. Never expose full stack traces to the end user, only in logs
4. Always use `try/catch` blocks for API calls and external integrations
5. Prefer typed error handling (`catch (error)` instead of `catch (error: any)`)

### RegExp Usage

- Use `RegExp.exec()` instead of `String.match()` for regular expression operations:
  ```typescript
  // Preferred approach
  const regex = /pattern/;
  const match = regex.exec(inputString);
  
  // Avoid this approach
  const match = inputString.match(/pattern/);
  ```