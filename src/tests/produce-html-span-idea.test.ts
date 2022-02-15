/**
 * @jest-environment jsdom
 */

import { Separator } from '../parser';
import { produceHTMLSpanIdea } from '../producer';
import { IdeaPiece } from '../structures';

it('should return span idea with no children when provided empty array', () => {
  const ideaPieces: IdeaPiece[] = [];

  const expected = document.createElement('span');
  expected.classList.add('idea');

  expect(produceHTMLSpanIdea(ideaPieces, document)).toStrictEqual(expected);
});

it('should return span idea with no children when provided array whose only item is Separator', () => {
  const ideaPieces: IdeaPiece[] = [new Separator()];

  const expected = document.createElement('span');
  expected.classList.add('idea');

  expect(produceHTMLSpanIdea(ideaPieces, document)).toStrictEqual(expected);
});

it('should return span idea when provided simple string children', () => {
  const ideaPieces = ['a', 'b', 'c'];

  const expected = document.createElement('span');
  expected.classList.add('idea');
  expected.appendChild(document.createTextNode('a'));
  expected.appendChild(document.createTextNode('b'));
  expected.appendChild(document.createTextNode('c'));

  expect(produceHTMLSpanIdea(ideaPieces, document)).toStrictEqual(expected);
});

it('should return span idea containing text node children, when provided strings and Separator', () => {
  const ideaPieces = ['a', 'b', new Separator(), 'c'];

  const expected = document.createElement('span');
  expected.classList.add('idea');
  expected.appendChild(document.createTextNode('a'));
  expected.appendChild(document.createTextNode('b'));
  expected.appendChild(document.createTextNode('c'));

  expect(produceHTMLSpanIdea(ideaPieces, document)).toStrictEqual(expected);
});

it('should return span idea containing anchor when provided list containing anchor', () => {
  const link = document.createElement('a');
  link.appendChild(document.createTextNode('b'));
  const ideaPieces = ['a', link, 'c'];

  const expected = document.createElement('span');
  expected.classList.add('idea');
  expected.appendChild(document.createTextNode('a'));
  const anchor = document.createElement('a');
  anchor.appendChild(document.createTextNode('b'));
  expected.appendChild(anchor);
  expected.appendChild(document.createTextNode('c'));

  expect(produceHTMLSpanIdea(ideaPieces, document)).toStrictEqual(expected);
});

it('should return span idea and ignore separator', () => {
  const link = document.createElement('a');
  link.appendChild(document.createTextNode('b'));
  const idea = ['a', link, new Separator(), 'c'];

  const expected = document.createElement('span');
  expected.classList.add('idea');
  expected.appendChild(document.createTextNode('a'));
  const anchor = document.createElement('a');
  anchor.appendChild(document.createTextNode('b'));
  expected.appendChild(anchor);
  expected.appendChild(document.createTextNode('c'));

  expect(produceHTMLSpanIdea(idea, document)).toStrictEqual(expected);
});
