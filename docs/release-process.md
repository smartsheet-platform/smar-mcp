# Release Process Guide

This document explains the automated release process using semantic-release and provides best practices for creating high-quality releases.

## Overview

The Smartsheet MCP project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate version management and package publishing. The release process:

1. Analyzes commits since the last release
2. Determines the next version number based on commit types
3. Generates release notes from commit messages and PR descriptions
4. Updates the CHANGELOG.md file
5. Creates a new version tag
6. Publishes the package to npm
7. Creates a GitHub release

## PR Requirements

To ensure that releases have high-quality information, all PRs must:

1. Have titles that follow the [Conventional Commits](https://www.conventionalcommits.org/) format
2. Include a well-written "Release Notes" section in the PR description
3. Pass all CI checks before merging

### PR Title Format

PR titles must follow the conventional commits format:

```
<type>: <description>
```

Where `type` is one of:
- **feat**: A new feature (triggers a minor version bump)
- **fix**: A bug fix (triggers a patch version bump)
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning
- **refactor**: Code changes that neither fix bugs nor add features
- **perf**: A code change that improves performance 
- **test**: Adding or correcting tests
- **build**: Changes to the build system
- **ci**: Changes to CI configuration
- **chore**: Other changes that don't modify src or test files

For breaking changes, add a `!` after the type:

```
feat!: remove deprecated API
```

### Release Notes Best Practices

The "Release Notes" section in your PR description will be used to generate the changelog. Follow these guidelines:

1. **Use present tense verbs**: Start with verbs like "Adds", "Fixes", "Updates", etc.
2. **Focus on user impact**: Describe what the change means for users, not how it was implemented
3. **Be concise**: Keep to 1-2 sentences per item
4. **Use plain language**: Avoid technical jargon when possible

Example of good release notes:
```
- Adds dark mode support to the MCP server interface
- Fixes connection issues when using proxy configurations
- Improves response formatting for cell history queries
```

## CI/CD Pipeline

The CI/CD pipeline consists of:

### PR Validation

When a PR is opened or updated:
- PR title format is validated
- PR description and Release Notes section are checked
- Code is built, linted, and tested
- Tests run with code coverage analysis

### Release Process

When code is merged to the main branch:
- All validation steps are run
- If successful, semantic-release determines the next version
- Release notes are generated from PR descriptions
- Package is published to npm
- GitHub release is created
- CHANGELOG.md is updated

## Troubleshooting

If the release process fails, check:

1. PR titles follow the conventional commits format
2. All CI checks pass
3. The PR contains proper release notes
4. NPM and GitHub tokens are correctly configured

## Manual Release (if needed)

In rare cases where manual intervention is required:

```bash
# Install dependencies
npm ci

# Run build and tests
npm run build
npm test

# Run semantic-release manually
GITHUB_TOKEN=xxx NPM_TOKEN=yyy npx semantic-release
```

## Additional Resources

- [Semantic Release Documentation](https://github.com/semantic-release/semantic-release)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)