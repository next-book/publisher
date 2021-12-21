import fallback from '@next-book/interface/src/js/translation/en.json';
import { resources } from './i18n';
import {
  matcherHint,
  printExpected,
  printReceived,
  stringify,
  printDiffOrStringify,
  MatcherHintOptions,
} from 'jest-matcher-utils';

/**
 * Fails when wrong key is found in all i18n resources in test against the fallback dictionary.
 */

interface Dictionary {
  [key: string]: Dictionary | string;
}

interface resources {
  [language: string]: Dictionary;
}
type DictionaryTableItem = (Dictionary | string)[];
type DictionariesTable = DictionaryTableItem[];
function getDictionaries(resources: resources): DictionariesTable {
  const table: DictionariesTable = [];
  for (let language in resources) {
    if (language !== 'en') {
      table.push([language, resources[language]]);
    }
  }
  return table;
}

function hasEqualStructure(received: any, expected: any): boolean {
  return Object.keys(received).every(key => {
    const v = received[key];

    if (typeof v === 'object' && v !== null) {
      return hasEqualStructure(v, expected[key]);
    }

    return expected.hasOwnProperty(key) && v !== '';
  });
}

function cloneDictionaryWithType(dict: Dictionary | string): Dictionary {
  const clone: Dictionary = {};
  if (typeof dict !== 'string') {
    for (let key in dict) {
      if (typeof dict[key] === 'object' && dict[key] != null)
        clone[key] = cloneDictionaryWithType(dict[key]);
      else
        clone[key] =
          typeof dict[key] === 'string' && dict[key] === '' ? 'empty string' : typeof dict[key];
    }
  }
  return clone;
}

function toMatchDictionary(this: jest.MatcherContext, received: any, expected: any) {
  const matcherName = 'toMatchDictionary';
  const pass = hasEqualStructure(received, expected);

  const isExpand = (expand?: boolean): boolean => expand !== false;
  const isNot = this.isNot;
  const options: MatcherHintOptions = {
    isNot,
    promise: this.promise,
  };
  const expectedClone = cloneDictionaryWithType(expected);
  const receivedClone = cloneDictionaryWithType(received);
  const message = pass
    ? () =>
        matcherHint(matcherName, undefined, undefined, options) +
        '\n\n' +
        `Expected: not ${printExpected(expectedClone)}` +
        (stringify(expectedClone) !== stringify(receivedClone)
          ? `\nReceived:     ${printReceived(receivedClone)}`
          : '')
    : () =>
        matcherHint(matcherName, undefined, undefined, options) +
        '\n\n' +
        printDiffOrStringify(
          expectedClone,
          receivedClone,
          'Expected',
          'Received',
          isExpand(this.expand)
        );

  return { message, pass };
}

// add custom matcher according to https://jestjs.io/docs/expect#expectextendmatchers
expect.extend({ toMatchDictionary });

// declare the matcher to be part of module
declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchDictionary<E extends {} | any[]>(expected: E): R;
    }
  }
}

describe('translations', () => {
  const cases = getDictionaries(resources);
  test.each(cases)('given %p dictionary, match the fallback dictionary', (language, dict) => {
    expect(dict).toMatchDictionary(fallback);
  });
});
