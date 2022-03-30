# Test types

- production: These tests assume the package is build and run package bin "publish-nb" in various contexts as if used in production.
- unit: These tests should be very fast and test specific utility. Some of those tests require jsdom environment and introduce side-effects partially handled by [jest.setup.ts](../../jest.setup.ts).
