/**
 * Tagger module: tagger parses, produces and numbers chunks and ideas.
 * @module
 * @ignore
 */

const IDEA_NAME = 'idea';
const CHUNK_NAME = 'chunk';
const SKIP_NAME = 'nb-skip';

const { produce } = require('./producer');
const { parse } = require('./parser');

const refNumAttr = 'data-nb-ref-number';

/**
 * Recognizes and tags chunks and ideas in a document
 *
 * @param      {Object}   document  DOM document
 * @param      {Options}  options   Config
 * @return     {void}  Modifies DOM document
 */
function tagDocument(document, options) {
  tagChunks(document, options.root, options.selectors);
  tagIdeas(document, options.delimiter);

  numberEls(document, `.${CHUNK_NAME}`, CHUNK_NAME);
  numberEls(document, `.${IDEA_NAME}`, IDEA_NAME);
}

/**
 * Mark DOM elements to be tagged, skips nested nodes
 * and nodes with SKIP_NAME class (and their child nodes).
 *
 * @param      {Object}            document   DOM document
 * @param      {array|selectorFn}  selectors  Array of selectors or a {@link selectorFn} callback.
 * @return     {void}  Modifies DOM document
 * @private
 */
function tagChunks(document, root, selectors) {
  const rootElement = root ? document.querySelector(root) : document;
  if (!rootElement) {
    console.error(
      `No root element found in document titled "${document.querySelector('title').innerHTML}".`
    );
    return;
  }

  const elements =
    typeof selectors === 'function'
      ? selectors(rootElement)
      : rootElement.querySelectorAll(selectors);

  Array.prototype.forEach.call(elements, el => {
    if (
      !(el.closest(`.${SKIP_NAME}`) || el.classList.contains(SKIP_NAME)) &&
      !hasAncestorChunk(el, elements)
    ) {
      el.classList.add(CHUNK_NAME);
    }
  });
}

function hasAncestorChunk(testedEl, elements) {
  return (
    [...elements].filter(el => {
      if (el === testedEl) return false;
      else if (el.contains(testedEl)) return true;
      else return false;
    }).length !== 0
  );
}

/**
 * Callback that marks elements as chunks of ideas. Those are then used for idea mapping.
 * @callback   selectorFn
 * @param      {Object}  document  DOM document
 * @return     {void}    Modifies DOM document
 */

/**
 * Map ideas in specific DOM context.
 *
 * @param      {Object}                       document   DOM document
 * @param      {(string|RegExp|tokenizerFn)}  delimiter  Delimiter string, RegExp or a {@link
 *                                                       tokenizerFn} callback.
 * @return     {void}  Modifies DOM document
 * @private
 */
function tagIdeas(document, delimiter) {
  document.querySelectorAll(`.${CHUNK_NAME}`).forEach(chunk => {
    const tagged = produce(document, parse(chunk, delimiter));
    chunk.parentNode.replaceChild(tagged, chunk);
  });
}

/**
 * Callback used to split chunk contents into ideas.
 * @callback   tokenizerFn
 * @param      {Object}    node    DOM node
 * @param      {string}    text    Text content.
 * @return     {string[]}  Text split into 1-n parts (string, Node or ParsedObj) used for idea
 *                         construction.
 */

/**
 * Numbers selected elements (<1…n>), adding a data attribute and an numbered id attribute
 * (<name>#).
 *
 * @param      {Object}  document  DOM document
 * @param      {string}  selector  Selector
 * @param      {string}  name      Name used in creating id attributes (<name>#)
 * @return     {void}  Modifies DOM document
 * @private
 */
function numberEls(document, selector, name) {
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

module.exports = { tagDocument };
