import fallback from '@next-book/interface/src/js/translation/en.json';
import { resources } from '../i18n';
import {
  matcherHint,
  printExpected,
  printReceived,
  stringify,
  printDiffOrStringify,
  MatcherHintOptions,
} from 'jest-matcher-utils';

/**
 * Fails when key is missing in i18n resources when compared against the fallback dictionary.
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

function hasExpectedStructure(received: any, expected: any): boolean {
  return Object.keys(expected).every(key => {
    const v = expected[key];

    if (typeof v === 'object' && v !== null) {
      return hasExpectedStructure(received[key], v);
    }

    return received.hasOwnProperty(key) && v !== '';
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

function toContainKeysOfDictionary(this: jest.MatcherContext, received: any, expected: any) {
  const matcherName = 'toContainKeysOfDictionary';
  const pass = hasExpectedStructure(received, expected);

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
          'Expected (missing keys)',
          'Received',
          isExpand(this.expand)
        );

  return { message, pass };
}

// add custom matcher according to https://jestjs.io/docs/expect#expectextendmatchers
expect.extend({ toContainKeysOfDictionary });

// declare the matcher to be part of module
declare global {
  namespace jest {
    interface Matchers<R> {
      toContainKeysOfDictionary<E extends {} | any[]>(expected: E): R;
    }
  }
}

describe('translations', () => {
  const cases = getDictionaries(resources);
  test.each(cases)(
    'given %p dictionary, contain the keys of fallback dictionary',
    (language, dict) => {
      expect(dict).toContainKeysOfDictionary(fallback);
    }
  );
});
