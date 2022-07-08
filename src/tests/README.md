# Test types and side effects notice

- production: These tests run package bin "publish-nb" in various contexts as if used in production. Thus they require the package to be build and its binary linked.
- unit: These tests should be very fast and test specific utility. Some of those tests require jsdom environment and introduce side-effects partially handled by [jest.setup.ts](../../jest.setup.ts).
