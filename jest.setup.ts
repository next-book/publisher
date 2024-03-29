/**
 * Beware!
 * The jsdom state between tests is being preserved so we need to clean it.
 * The cleanup is based on what we know about the state and how it is modified in the tests
 * but it contains side-effects and it may be not complete for new tests!
 *
 * Other ways to cleanup the state (we didnt follow) include:
 * - creating tests in separate files initiates new jsdom
 *   - slower to run
 *   - breaks the collocation of tests for similar units into separate files
 * - manually importing jsdom and creating new instance for each test
 *   - slower to run
 *   - we can consider this for more complex tests
 *
 * For more info see https://github.com/facebook/jest/issues/1224.
 */

beforeEach(() => {
  // partially reset test state
  if (typeof document !== 'undefined')
    document.documentElement.innerHTML = '<head></head><body></body>';

  // hide console.error messages in test dump according to:
  // https://dev.to/martinemmert/hide-red-console-error-log-wall-while-testing-errors-with-jest-2bfn
  jest.spyOn(console, 'error');
  // @ts-ignore jest.spyOn adds this functionallity
  console.error.mockImplementation(() => null);
});

afterEach(() => {
  // @ts-ignore jest.spyOn adds this functionallity
  console.error.mockRestore();
});
