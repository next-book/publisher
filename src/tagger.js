/**
 * Tagger module: tagger parses, produces and numbers chunks and ideas.
 * @module
 * @ignore
 */

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

  numberEls(document, '.chunk', 'chunk');
  numberEls(document, '.idea', 'idea');
}

/**
 * Mark DOM elements to be tagged, skips nodes
 * with class nb-skip (and their child nodes).
 *
 * @param      {Object}            document   DOM document
 * @param      {array|selectorFn}  selectors  Array of selectors or a {@link selectorFn} callback.
 * @return     {void}  Modifies DOM document
 * @private
 */
function tagChunks(document, root, selectors) {
  const rootElement = root ? document.querySelector(root) : document;

  const elements =
    typeof selectors === 'function'
      ? selectors(rootElement)
      : rootElement.querySelectorAll(selectors);

  Array.prototype.forEach.call(elements, el => {
    if (!(el.closest('.nb-skip') || el.classList.contains('nb-skip'))) {
      el.classList.add('chunk');
    }
  });
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
  document.querySelectorAll('.chunk').forEach(chunk => {
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
    el.setAttribute(refNumAttr, index + 1);
    if (!el.getAttribute('id')) el.setAttribute('id', `${name}${index + 1}`);
  });
}

module.exports = { tagDocument };
