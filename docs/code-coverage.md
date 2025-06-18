# Code Coverage Guide

This document explains how code coverage is tracked and reported in this project, along with best practices for maintaining and improving coverage.

## Overview

Code coverage measures how much of your source code is executed when running tests. It helps identify areas that are not adequately tested, reducing the risk of undetected bugs and regressions.

This project uses Jest with Istanbul for code coverage analysis, which tracks:

- **Statement coverage**: Percentage of statements executed
- **Branch coverage**: Percentage of branches (if/else, switch cases) executed
- **Function coverage**: Percentage of functions called
- **Line coverage**: Percentage of code lines executed

## Running Coverage Reports

### Local Coverage

To run tests with coverage locally:

```bash
# Run tests with coverage
npm run test:coverage

# Display coverage report in the terminal
npm run coverage:summary

# Generate and view detailed HTML coverage report in browser
npm run coverage
```

The coverage report will be generated in the `coverage/` directory, with a detailed HTML report in `coverage/lcov-report/index.html`.

### CI Coverage

Code coverage is automatically calculated during the PR validation workflow:

1. Tests run with coverage enabled
2. Coverage metrics are displayed in the PR summary
3. Coverage reports are uploaded as workflow artifacts
4. PR comments display coverage status

## Coverage Thresholds

The project has minimum coverage thresholds configured in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    statements: 50,
    branches: 40,
    functions: 50,
    lines: 50
  }
}
```

These thresholds ensure that test coverage doesn't drop below acceptable levels. The CI build will fail if coverage falls below these thresholds.

## Interpreting Coverage Reports

### Coverage Summary

The summary provides a quick overview of coverage metrics:

```
----------|---------|----------|---------|---------|
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
All files |   72.38 |    63.12 |   68.75 |   71.96 |
----------|---------|----------|---------|---------|
```

### Detailed HTML Report

The HTML report provides a detailed breakdown with color-coded line coverage:
- **Green**: Covered lines
- **Red**: Uncovered lines
- **Yellow**: Partially covered branches

## Improving Coverage

To improve code coverage:

1. **Focus on uncovered areas**: Use the HTML report to identify uncovered code
2. **Write targeted tests**: Create tests specifically for uncovered functions and branches
3. **Use test-driven development**: Write tests before implementing features
4. **Test edge cases**: Ensure conditional logic is fully tested
5. **Mock dependencies**: Use Jest mocks to isolate code and increase testability

## Best Practices

1. **Don't chase 100% coverage**: Focus on critical paths and complex logic
2. **Quality over quantity**: Meaningful tests are better than tests written just for coverage
3. **Keep tests maintainable**: Well-structured tests are easier to update when code changes
4. **Test behavior, not implementation**: Tests should verify what code does, not how it does it
5. **Include integration tests**: Unit tests alone may miss issues in component interactions

## Coverage Badge

The project maintains a coverage badge that displays the current coverage percentage:

```markdown
![Code Coverage](https://github.com/smartsheet-platform/smar-mcp/workflows/.github/badges/coverage.svg)
```

This badge is automatically updated when changes are merged to the main branch.

## Additional Resources

- [Jest Coverage Documentation](https://jestjs.io/docs/configuration#collectcoveragefrom-array)
- [Istanbul Coverage Documentation](https://github.com/istanbuljs/nyc)
- [Test-Driven Development Guide](https://www.agilealliance.org/glossary/tdd)