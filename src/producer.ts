/**
 * Producer: takes {@link ParsedObj} and updates the HTML of document with
 * the enhancement for next-book specific use-case.
 * @module
 */
import { ParsedObj, Idea, IdeaPiece } from './structures';
import { isNode } from './utils/dom';
import { TagClass } from '../shared/dom';

/**
 * Produces ideas from a parsedObj
 *
 * @param document - DOM Document
 * @param parsedObj - A parsed object
 * @returns HTML node
 */
export default function produce(document: Document, parsedObj: ParsedObj): Node {
  if (!document) throw new Error('Expected document undefined.');
  if (!parsedObj) throw new Error('Expected parsedObj undefined.');
  const fragment = document.createDocumentFragment();
  const { node, ideas, delimiter } = parsedObj;

  ideas.forEach((idea: Idea, index: number) => {
    if (Array.isArray(idea)) {
      if (containsParsedObj(idea)) {
        fragment.appendChild(anchorObject(idea, document));
      } else {
        fragment.appendChild(produceHTMLSpanIdea(idea, document));
      }
    } else if (typeof idea === 'string') {
      fragment.appendChild(document.createTextNode(idea));
    }

    if (!Object.is(ideas.length - 1, index) && typeof delimiter === 'string') {
      fragment.appendChild(document.createTextNode(delimiter));
    }
  });

  const chunk = emptyNode(node.cloneNode());
  chunk.appendChild(fragment);
  return chunk;
}

/**
 * Produces HTML span idea from an array of parts.
 *
 * @remarks Provided idea should be guaranteed to NOT contain ParsedObj by its caller.
 * @param idea - The idea
 * @param document - DOM document
 * @returns HTML Element span
 */
export function produceHTMLSpanIdea(idea: IdeaPiece[], document: Document): HTMLElement {
  const span = document.createElement('span');
  span.classList.add(TagClass.Idea);

  idea.forEach(item => {
    if (typeof item === 'string') {
      span.appendChild(document.createTextNode(item));
    } else if (isNode(item as Node)) {
      span.appendChild(item as Node);
    }
  });

  return span;
}

/**
 * Determines if array contains parsed object. See {@link ParsedObj}.
 *
 * @param idea - The idea
 * @returns True if contains parsed object, False otherwise.
 */
export function containsParsedObj(idea: IdeaPiece[]): boolean {
  return idea.reduce<boolean>((acc, item) => acc || item instanceof ParsedObj, false);
}

/**
 * Returns document containing the appropriate children for idea.
 * @remarks Provided idea should be guaranteed to contain ParsedObj by its caller.
 * @param idea IdeaPiece
 * @param document
 * @returns
 */
export function anchorObject(idea: IdeaPiece[], document: Document) {
  const fragment = document.createDocumentFragment();

  idea.forEach(item => {
    if (item instanceof ParsedObj) {
      fragment.appendChild(produce(document, item));
    } else if (isNode(item as Node)) {
      fragment.appendChild(item as Node);
    } else {
      fragment.appendChild(document.createTextNode(item as string));
    }
  });
  return fragment;
}

function emptyNode(node: Node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }

  return node;
}
