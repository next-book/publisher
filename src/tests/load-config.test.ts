/**
 * @jest-environment jsdom
 */

import loadConfig, { PartialConfig } from '../config';

it('should be equal to defaults', () => {
  expect(loadConfig({} as unknown as PartialConfig)).toStrictEqual({
    languageCode: 'en',
    output: 'html',
    delimiter: '\n',
    root: 'main',
    selectors: ['p', 'li', 'dd', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'dl'],
    static: [],
    readingOrder: [],
    tocBase: [],
    meta: {
      title: 'No title',
      subtitle: 'No subtitle',
      author: 'No author',
    },
    preview: {
      isPreview: false,
    },
  });
});

it('should exit with error', () => {
  const consoleSpy = jest.spyOn(console, 'error');
  const options = {
    output: 'random',
  };
  expect(() => loadConfig(options as unknown as PartialConfig)).toThrowError(
    'Invalid config options.'
  );
  expect(consoleSpy).toHaveBeenCalledWith(`output: Invalid enum value. Expected 'jsdom' | 'html'`);
});
