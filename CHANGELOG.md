# [1.5.0](https://github.com/smartsheet-platform/smar-mcp/compare/v1.4.0...v1.5.0) (2025-06-18)


### Features

* add logger utility and replace console logging with structured logging ([562a5a0](https://github.com/smartsheet-platform/smar-mcp/commit/562a5a033ce9a5fc83129b28a71ac8b369eb597e))
* implement logging methods with level-based debug output ([078b979](https://github.com/smartsheet-platform/smar-mcp/commit/078b979653b571faf36a216b421ae0ade7c1767a))
* implement Winston logger with configurable log levels and formatting ([c4d92cb](https://github.com/smartsheet-platform/smar-mcp/commit/c4d92cb37f330dc85e4f83f71d7c6c6000c28f1f))

# [1.4.0](https://github.com/smartsheet-platform/smar-mcp/compare/v1.3.0...v1.4.0) (2025-06-09)


### Bug Fixes

* update User-Agent header to use correct app name in Smartsheet API requests ([b35d2d4](https://github.com/smartsheet-platform/smar-mcp/commit/b35d2d4fedb9c020e710e58a43a68da915b96c53))


### Features

* update User-Agent header to include package version in API requests ([edcc26f](https://github.com/smartsheet-platform/smar-mcp/commit/edcc26f9d0c81f48709d86ae00f22ddffba509ee))

# [1.3.0](https://github.com/smartsheet-platform/smar-mcp/compare/v1.2.0...v1.3.0) (2025-06-09)


### Bug Fixes

* change error log to info level for sheet copy result ([41e4961](https://github.com/smartsheet-platform/smar-mcp/commit/41e49616e64180cedfaa536ca4b6f001ffc216c6))
* correct API endpoint path from /search/sheet to /search/sheets ([2ff5898](https://github.com/smartsheet-platform/smar-mcp/commit/2ff5898e50f1ea3d2cd06485b8fb52ddbc7d861d))
* push package.lock ([f12d5ba](https://github.com/smartsheet-platform/smar-mcp/commit/f12d5bacd6622921692b1c5e89f8931885abd6a1))
* update publish script to build before publishing ([5aec64d](https://github.com/smartsheet-platform/smar-mcp/commit/5aec64d5fb4b7273d41e62907a693e7e514a726a))


### Features

* add discussion management tools and API endpoints for sheets and rows ([728e4a5](https://github.com/smartsheet-platform/smar-mcp/commit/728e4a5d3cd0ede6a8f8bfe05b1b61d1866e2469))
* add dotenv configuration and .roo directory to gitignore ([aba689d](https://github.com/smartsheet-platform/smar-mcp/commit/aba689de432cdfd5a2964b1b239b6498a598c363))
* add get_sheet_by_url tool and support for directIdToken sheet retrieval ([6e3b2a3](https://github.com/smartsheet-platform/smar-mcp/commit/6e3b2a33e28465e32b9dcb0c6c9a01dd01f7d97d))
* add list users API endpoint and tool command ([25e8dc5](https://github.com/smartsheet-platform/smar-mcp/commit/25e8dc512b2f4ff1453de210914ec90f2c31ac58))
* add search endpoints for folders, workspaces, reports and dashboards ([79b71fc](https://github.com/smartsheet-platform/smar-mcp/commit/79b71fc59ea0c3b7724aaee55ed748798bd34fd7))
* add searchSheet API endpoint and tool for searching within specific sheets ([bccd85f](https://github.com/smartsheet-platform/smar-mcp/commit/bccd85f1d713328097a3b647d3890d5ceb0ab8d5))
* add sheet search by URL and row retrieval endpoints with pagination support ([2308f21](https://github.com/smartsheet-platform/smar-mcp/commit/2308f215253994cec293138f9ff300330a7b0e50))
* add what_am_i_assigned_to tool for finding user's assigned tasks in a sheet ([086d794](https://github.com/smartsheet-platform/smar-mcp/commit/086d7943d93770c6be69fcd1429611cc31e2a86f))
* configs semantic release to publish to npm ([9d0a998](https://github.com/smartsheet-platform/smar-mcp/commit/9d0a998e6dbb4ede2f6343ec0b05a3361375b475))
* implement platform-specific log rotation with winston-daily-rotate-file ([895da94](https://github.com/smartsheet-platform/smar-mcp/commit/895da9428b619fca92c9bd2ccd435d459c8c1488))
* replace console logging with structured winston logger ([cad6cff](https://github.com/smartsheet-platform/smar-mcp/commit/cad6cff07c12e2c1f5b6dcf8a911ffb00e1249ed))

# [1.2.0](https://github.com/smar-imran-khawaja/smar-mcp/compare/v1.1.1...v1.2.0) (2025-04-25)


### Bug Fixes

* dont convert to string ([7fd4c29](https://github.com/smar-imran-khawaja/smar-mcp/commit/7fd4c29b1abffcf88c89768785f26d423eb0f2e9))
* fix the bad code suggestion ([27d64cd](https://github.com/smar-imran-khawaja/smar-mcp/commit/27d64cd699ee4005dda62e60191272f59114cd1c))


### Features

* adds the ability to send update requests and discussions ([d6a1834](https://github.com/smar-imran-khawaja/smar-mcp/commit/d6a1834ef733bc2948c12d74ab00a8db3ba76da5))

## [1.1.1](https://github.com/smar-imran-khawaja/smar-mcp/compare/v1.1.0...v1.1.1) (2025-04-20)


### Bug Fixes

* use User-Agent header ([32043b6](https://github.com/smar-imran-khawaja/smar-mcp/commit/32043b601d59c44e034cc5fef06ccf06efde55a1))

# [1.1.0](https://github.com/smar-imran-khawaja/smar-mcp/compare/v1.0.1...v1.1.0) (2025-04-20)


### Bug Fixes

* better log level ([01e9ada](https://github.com/smar-imran-khawaja/smar-mcp/commit/01e9adaa006d68f35e25b37b790c916f5f2f9ba3))


### Features

* adds ability to enable delete tools. disabled by default ([7a8ef75](https://github.com/smar-imran-khawaja/smar-mcp/commit/7a8ef75e0af26fc57232470872ac21ab1973b080))

## [1.0.1](https://github.com/smar-imran-khawaja/smar-mcp/compare/v1.0.0...v1.0.1) (2025-04-19)


### Bug Fixes

* remove asset ref ([3d40bbd](https://github.com/smar-imran-khawaja/smar-mcp/commit/3d40bbd3d10ff8c4daa9404f99c5979d4dffc6cb))

# 1.0.0 (2025-04-19)


### Bug Fixes

* add more logging for commit formatting ([65981b4](https://github.com/smar-imran-khawaja/smar-mcp/commit/65981b4522f331554adda03c38bcd13b75f9e621))
* adds releaserc for explicity plugin definition ([ffe7110](https://github.com/smar-imran-khawaja/smar-mcp/commit/ffe7110d45913cab965f3b066425aa0b71356217))
* temporarily disable tests in ci ([3365cb1](https://github.com/smar-imran-khawaja/smar-mcp/commit/3365cb12f7ba9df95417cbbe8c70c627cabb0c82))
* use node 22, run on pull requests ([059b0ba](https://github.com/smar-imran-khawaja/smar-mcp/commit/059b0bae9edd87198024b89ae90f3639096b5463))
* use smaller message ([909f3bd](https://github.com/smar-imran-khawaja/smar-mcp/commit/909f3bd97803911a8b31ab0716f8512b9f569586))


### Features

*  add semantic release ([5f81c89](https://github.com/smar-imran-khawaja/smar-mcp/commit/5f81c89472d6ca09f48e6aa187b95e295cbc3887))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
