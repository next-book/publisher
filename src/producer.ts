import { ParsedObj, IdeasItem, IdeasItemPiece } from './structures';
import { isNode } from './utils/dom';
/**
 * Produces ideas from a parsedObj
 * 
 * @param document - DOM Document
 * @param parsedObj - A parsed object
 * @returns HTML node
 */
export default function produce(document: Document, parsedObj: ParsedObj): Node {
  const fragment = document.createDocumentFragment();
  /**
   * node - original node
   * ideas - array of arrays of strings, HTML elements, whitespace etc
   * delimiter - delimiter string
   */
  const { node, ideas, delimiter } = parsedObj;

  ideas.forEach((idea: IdeasItem, index: number) => {
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
 * @param idea - The idea 
 * @param document - DOM document
 * @returns HTML Element span
 */
function produceHTMLSpanIdea(idea: IdeasItemPiece[], document: Document):HTMLElement {
  const span = document.createElement('SPAN');
  span.classList.add('idea');

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
function containsParsedObj(idea: IdeasItemPiece[]) {
  return idea.reduce((acc, item) => acc || item instanceof ParsedObj, false);
}

function anchorObject(idea: IdeasItem, document: Document) {
  const fragment = document.createDocumentFragment();
  if (!Array.isArray(idea)) throw new Error("Idea is not an array.");
  
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
