/**
 * @jest-environment jsdom
 */

import { parseConfig, PartialConfig } from '../../config';

it('should throw with validation messages', () => {
  const consoleSpy = jest.spyOn(console, 'error');
  const options = {
    output: 'random',
    root: 1,
    tocBase: '',
  };
  expect(() => parseConfig(options as unknown as PartialConfig)).toThrowError(
    'Invalid config options.'
  );
  expect(consoleSpy).toHaveBeenCalledWith(`\nThe following config fields are not allowed:`);
  expect(consoleSpy).toHaveBeenCalledWith(`\noutput`);
  expect(consoleSpy).toHaveBeenCalledWith(` - Invalid enum value. Expected 'jsdom' | 'html'`);
  expect(consoleSpy).toHaveBeenCalledWith(`\nroot`);
  expect(consoleSpy).toHaveBeenCalledWith(` - Expected string, received number`);
  expect(consoleSpy).toHaveBeenCalledWith(`\ntocBase`);
  expect(consoleSpy).toHaveBeenCalledWith(` - Expected array, received string`);
  expect(consoleSpy).toHaveBeenCalledWith(`\n`);
});

it('should return defaults when provided empty options', () => {
  expect(parseConfig({} as unknown as PartialConfig)).toStrictEqual({
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
      author: 'No author',
    },
    preview: {
      isPreview: false,
    },
  });
});
