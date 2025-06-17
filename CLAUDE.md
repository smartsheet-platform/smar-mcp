# CLAUDE.md

This file contains configuration and instructions for Claude to help with this repository.

## Repository Overview
This repository contains a Smartsheet Model Context Protocol (MCP) server that provides tools for interacting with the Smartsheet API.

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

## Development Commands

Add common development commands here that should be run regularly.

## Code Conventions

Add code conventions specific to this repository here.