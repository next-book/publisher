/**
 * @jest-environment jsdom
 */

import loadConfig, { PartialConfig } from '../config';

it('should throw with validation messages', () => {
  const consoleSpy = jest.spyOn(console, 'error');
  const options = {
    output: 'random',
    root: 1,
    tocBase: '',
  };
  expect(() => loadConfig(options as unknown as PartialConfig)).toThrowError(
    'Invalid config options.'
  );
  expect(consoleSpy).toHaveBeenCalledWith(`The following config fields were invalid:`);
  expect(consoleSpy).toHaveBeenCalledWith(`output: Invalid enum value. Expected 'jsdom' | 'html'`);
  expect(consoleSpy).toHaveBeenCalledWith(`root: Expected string, received number`);
  expect(consoleSpy).toHaveBeenCalledWith(`output: Invalid enum value. Expected 'jsdom' | 'html'`);
});

it('should return defaults when provided empty options', () => {
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
