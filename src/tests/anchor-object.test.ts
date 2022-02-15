/**
 * @jest-environment jsdom
 */

import { anchorObject } from '../producer';
import ParsedObj from '../structures/parsedobj';

it('should return fragment when idea is empty array', () => {
  const anchor = anchorObject([], document);
  expect(anchor instanceof DocumentFragment).toBe(true);
});

it('should return fragment containing three text children when provided array of strings', () => {
  const idea = ['a', 'b', 'c'];

  const fragment = document.createDocumentFragment();
  fragment.appendChild(document.createTextNode('a'));
  fragment.appendChild(document.createTextNode('b'));
  fragment.appendChild(document.createTextNode('c'));

  expect(anchorObject(idea, document)).toStrictEqual(fragment);
});

it('should return fragment containing three text children when provided array of strings', () => {
  const link = document.createElement('a');
  link.appendChild(document.createTextNode('b'));
  const idea = ['a', link, 'c'];

  const fragment = document.createDocumentFragment();
  fragment.appendChild(document.createTextNode('a'));
  const anchor = document.createElement('a');
  anchor.appendChild(document.createTextNode('b'));
  fragment.appendChild(anchor);
  fragment.appendChild(document.createTextNode('c'));

  expect(anchorObject(idea, document)).toStrictEqual(fragment);
});

it('should return fragment containing three text children when provided array of strings', () => {
  const quote = document.createElement('q');
  const parsedQuote = new ParsedObj(
    quote,
    [['nebo NELEZ.'], ['Nebo NÁLEZ. A dusíkové akcie také klesly.'], ['Strašlivá stagnace.']],
    '\n'
  );

  const link = document.createElement('a');
  link.appendChild(document.createTextNode('b'));
  const idea = [parsedQuote, link, 'c'];

  const fragment = document.createDocumentFragment();

  // quote
  const q = document.createElement('q');
  // quote ideas ...
  const qi1 = document.createElement('span');
  qi1.classList.add('idea');
  qi1.appendChild(document.createTextNode('nebo NELEZ.'));
  q.appendChild(qi1);
  q.appendChild(document.createTextNode('\n'));

  const qi2 = document.createElement('span');
  qi2.classList.add('idea');
  qi2.appendChild(document.createTextNode('Nebo NÁLEZ. A dusíkové akcie také klesly.'));
  q.appendChild(qi2);
  q.appendChild(document.createTextNode('\n'));

  const qi3 = document.createElement('span');
  qi3.classList.add('idea');
  qi3.appendChild(document.createTextNode('Strašlivá stagnace.'));
  q.appendChild(qi3);

  fragment.appendChild(q);

  const anchor = document.createElement('a');
  anchor.appendChild(document.createTextNode('b'));
  fragment.appendChild(anchor);
  fragment.appendChild(document.createTextNode('c'));

  expect(anchorObject(idea, document)).toStrictEqual(fragment);
});
