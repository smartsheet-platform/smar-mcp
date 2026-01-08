# Semantic Release v25 and @semantic-release/npm v13 Upgrade

## Summary

This document describes the verification and updates made to ensure compatibility with semantic-release v25 and @semantic-release/npm v13.

## Breaking Changes

### semantic-release v25

The major breaking changes in semantic-release v25 are:

1. **Node.js Version Requirements**:
   - Minimum Node.js version: `^22.14.0 || >=24.10.0`
   - Dropped support for Node.js v20, v21, and v23

2. **Plugin Updates**:
   - Updated to stable versions of built-in plugins
   - @semantic-release/npm upgraded to v13 (which uses npm v11 for publishing)
   - @semantic-release/commit-analyzer upgraded to latest stable
   - @semantic-release/release-notes-generator upgraded to latest stable
   - @semantic-release/github upgraded to latest stable

3. **Dependencies**:
   - hosted-git-info updated to v9
   - yargs updated to v18

### @semantic-release/npm v13

The major changes in @semantic-release/npm v13 are:

1. **Trusted Publishing Support**:
   - Added support for OIDC token-based authentication
   - Improved auth verification with dry-run publish checks
   - Better error messaging for authentication failures

2. **npm Version**:
   - Uses npm v11 for publishing operations

3. **Node.js Requirements**:
   - Same as semantic-release v25: `^22.14.0 || >=24.10.0`

## Configuration Verification

### package.json Updates

**Updated engine requirements** to match semantic-release v25 and @semantic-release/npm v13:

```json
"engines": {
  "node": "^22.14.0 || >=24.10.0",
  "npm": ">=10.0.0"
}
```

**Previous values** (incompatible):
```json
"engines": {
  "node": ">=16.0.0",
  "npm": ">=7.0.0"
}
```

### .releaserc.json Configuration

The existing configuration is **fully compatible** with semantic-release v25:

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", {
      "changelogFile": "CHANGELOG.md"
    }],
    "@semantic-release/npm",
    "@semantic-release/github",
    ["@semantic-release/git", {
      "assets": ["package.json", "CHANGELOG.md"],
      "message": "chore(release): ${nextRelease.version} [skip ci]"
    }]
  ]
}
```

**Key points**:
- Plugin order is correct (changelog before npm, npm before git)
- All plugins are at compatible versions
- Configuration options are still valid in v25

### GitHub Actions Workflow

The `.github/workflows/release.yml` workflow is **already configured correctly**:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: 22
    cache: 'npm'
```

Node.js 22 will use the latest available version in that major release (typically 22.x where x >= 14), which meets the minimum requirement of `^22.14.0`.

**Note**: The workflow uses `actions/setup-node@v3`. While functional, consider updating to `@v4` in a future update for better security and maintenance.

## Impact Assessment

### What Changed
1. ✅ Updated `package.json` engines field to require Node.js 22.14+ or 24.10+
2. ✅ Updated npm requirement to >=10.0.0
3. ✅ Verified .releaserc.json configuration is compatible
4. ✅ Confirmed GitHub Actions workflow uses Node.js 22

### What Didn't Need Changes
- ✅ .releaserc.json configuration (fully compatible)
- ✅ GitHub Actions workflow (already using Node.js 22)
- ✅ Plugin configurations (all compatible)
- ✅ Conventional commit setup (unchanged)

## Testing Recommendations

Before merging, verify:

1. **Local Development**: Developers should use Node.js 22.14+ or 24.10+
2. **CI/CD**: GitHub Actions workflow uses compatible Node.js version (already set to 22)
3. **Release Process**: Test with a dry-run on a feature branch:
   ```bash
   npx semantic-release --dry-run
   ```

## References

- [semantic-release v25.0.0 Release Notes](https://github.com/semantic-release/semantic-release/releases/tag/v25.0.0)
- [@semantic-release/npm v13 Releases](https://github.com/semantic-release/npm/releases)
- [semantic-release Documentation](https://semantic-release.gitbook.io/semantic-release/)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)

## Migration Checklist

- [x] Reviewed semantic-release v23, v24, v25 changelogs
- [x] Reviewed @semantic-release/npm v13 changelog
- [x] Updated package.json engines field
- [x] Verified .releaserc.json configuration compatibility
- [x] Confirmed GitHub Actions workflow uses compatible Node.js version
- [x] Documented breaking changes and impacts
- [ ] (Optional) Test semantic-release with dry-run before production use
