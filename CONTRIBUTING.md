# Contribution Guide

## Running Tests

This library is intended to help in both Node.js and browser runtime environments.
So there are tests for both.

### Node.js Tests

```
npm test
```

### Browser Tests

In your local CLI:

```
npm run browser-tests
```

While that is running, open [http://localhost:8030] in your browser.
Refreshing the page will rerun the tests with the latest.

## Preparing Release

- Format code: `npm run format`
- Add entry to CHANGELOG
- Bump version (e.g. `npm version --no-git-tag-version minor`)
- Dry-run publish routine: `npm publish --dry-run`
- Commit, push, tag, etc.
- Publish to npm: `npm publish`
