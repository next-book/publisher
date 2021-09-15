import { Config, Delimiter, Selectors } from './config';
import produce from './producer';
import parse from './parser';
import { DOMStringLike } from './utils/dom';

const IDEA_NAME = 'idea';
const CHUNK_NAME = 'chunk';
const SKIP_NAME = 'nb-skip';
const refNumAttr = 'data-nb-ref-number';

/**
 * Recognizes and tags chunks and ideas in a document
 *
 * @param document - DOM document
 * @param options - config options
 * @returns mutates DOM document
with marked chunks by {@link markElementsToBeTagged}. */
export default function tagDocument(document: Document, options: Config): void {
  markElementsToBeTagged(document, options.root, options.selectors);
  tagIdeas(document, options.delimiter);
  
  numberEls(document, `.${CHUNK_NAME}`, CHUNK_NAME);
  numberEls(document, `.${IDEA_NAME}`, IDEA_NAME);
}

/**
 * Mark DOM Elements to be tagged
 * 
 * @remarks
 * Skips nested nodes and nodes with SKIP_NAME class (and their child * nodes).
 * 
 * @param document - DOM document
 * @param root - Root element
 * @param selectors - Array of selectors or a {@link SelectorFn}
 * @returns Modifies DOM document
 */
function markElementsToBeTagged(document: Document, root: string, selectors: Selectors): void {
  const rootElement = root ? document.querySelector(root) : document;
  if (!rootElement) {
    console.error(
      `No root "${root}" element found in document titled "${document?.querySelector('title')?.innerHTML}".`
    );
    return;
  }

  const elements =
    typeof selectors === 'function'
      ? selectors(rootElement)
      : rootElement.querySelectorAll(selectors.join(', ')); // beware: there was no join in the code before typescript
  if (elements)
    elements.forEach(el => {
      if (
        !(el.closest(`.${SKIP_NAME}`) || el.classList.contains(SKIP_NAME)) &&
        !hasAncestorChunk(el, elements)
      ) {
        el.classList.add(CHUNK_NAME);
      }
    });
}

/**
 * Determines whether the tested element has an inclusive descendant in the list of elements.
 * 
 * @param testedEl - Element to be tested
 * @param elements - List of elements 
 * @returns Returns the boolean value of the assertion
 */
function hasAncestorChunk(testedEl: Element, elements: NodeListOf<Element>): boolean {
  return (
    [...elements].filter(el => {
      if (el === testedEl) return false;
      else if (el.contains(testedEl)) return true;
      else return false;
    }).length !== 0
  );
}

/**
 * Map ideas in specific DOM context.
 * 
 * @param document - DOM document with marked chunks by {@link markElementsToBeTagged}.
 * @param delimiter - Delimiter of ideas.
 * @returns Modifies the Document
 */
function tagIdeas(document: Document, delimiter: Delimiter): void {
  document.querySelectorAll(`.${CHUNK_NAME}`).forEach(chunk => {
    const tagged = produce(document, parse(chunk, delimiter));
    chunk.parentNode?.replaceChild(tagged, chunk);
  });
}

/**
 * Numbers selected elements (\<1…n\>), adding a data attribute and an numbered
 * id attribute (\<name\>#).
 * 
 * @param document - DOM document
 * @param selector - DOMString
 * @param name - Name used in creating id attributes (<name>#)
 * @returns Modifies DOM document
 */
function numberEls(document: Document, selector: DOMStringLike, name: string):void {
  Array.prototype.forEach.call(document.querySelectorAll(selector), (el, index) => {
    const nonZeroId = index + 1;
    el.setAttribute(refNumAttr, nonZeroId);

    if (name === IDEA_NAME) {
      if (el.getAttribute('id')) {
        const wrapper = document.createElement('SPAN');
        wrapper.setAttribute('id', `${name}${nonZeroId}`);

        [...el.childNodes].forEach(node => {
          wrapper.appendChild(node);
        });

        el.appendChild(wrapper);
      } else el.setAttribute('id', `${name}${nonZeroId}`);
    }
  });
}
