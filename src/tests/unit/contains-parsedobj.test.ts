/**
 * @jest-environment jsdom
 */

import { Separator } from '../../parser';
import { containsParsedObj } from '../../producer';
import ParsedObj from '../../structures/parsedobj';

it('returns false when provided with empty idea piece array', () => {
  expect(containsParsedObj([])).toBe(false);
});

it('returns false when provided with idea piece array containing strings', () => {
  expect(containsParsedObj(['a', 'b'])).toBe(false);
});

it('returns true when provided with idea piece array containing ParsedObj', () => {
  expect(
    containsParsedObj([
      'a',
      document.createElement('span'),
      new ParsedObj(document.createElement('main'), [], '\n'),
      new Separator(),
      document.createElement('a'),
      'b',
      'c',
    ])
  ).toBe(true);
});

it('returns true when provided with idea piece array containing ParsedObj on first index', () => {
  expect(
    containsParsedObj([
      new ParsedObj(document.createElement('main'), [], '\n'),
      'a',
      'b',
      new Separator(),
      'd',
      'e',
      document.createTextNode('text'),
      document.createElement('span'),
      'g',
    ])
  ).toBe(true);
});

it('returns true when provided with idea piece array containing ParsedObj on last index', () => {
  expect(
    containsParsedObj([
      'a',
      'b',
      new Separator(),
      'd',
      'e',
      document.createTextNode('text'),
      'g',
      new ParsedObj(document.createElement('main'), [], '\n'),
    ])
  ).toBe(true);
});
