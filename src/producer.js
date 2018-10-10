/**
 * @module
 * @ignore
 */

const { ParsedObj } = require('./structures');

/**
 * Produces ideas from a parsedObj
 *
 * @param      {Object}           document          DOM document
 * @param      {ParsedObj}        parsedObj         A parsed object
 * @return     {Node}             HTML node
 */
function produce(document, parsedObj) {
  const fragment = document.createDocumentFragment();
  const { node, ideas, delimiter } = parsedObj;

  ideas.forEach((idea, index) => {
    if (Array.isArray(idea)) {
      if (containsParsedObj(idea)) {
        fragment.appendChild(anchorObject(idea, document));
      } else {
        fragment.appendChild(produceIdea(idea, document));
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
 * Produces idea from an array of parts
 *
 * @param      {array}   idea      The idea
 * @param      {Object}  document  DOM document
 * @return     {Object}  HTML Element span
 * @private
 */
function produceIdea(idea, document) {
  const span = document.createElement('SPAN');
  span.classList.add('idea');

  idea.forEach((item) => {
    if (typeof item === 'string') {
      span.appendChild(document.createTextNode(item));
    } else if (isNode(item)) {
      span.appendChild(item);
    }
  });

  return span;
}

/**
 * Determines if an object is a DOM Node, works outside of browsers.
 *
 * @param      {Object}   obj     The object
 * @return     {boolean}  True if node, False otherwise.
 * @private
 */
function isNode(obj) {
  return typeof obj === 'object' && 'nodeType' in obj && obj.nodeType === 1 && obj.cloneNode;
}

/**
 * Determines if array contains parsed object. See {@link ParsedObj}.
 *
 * @param      {array}  idea    The idea
 * @return     {bool}   True if contains parsed object, False otherwise.
 * @private
 */
function containsParsedObj(idea) {
  return idea.reduce((acc, item) => acc || item instanceof ParsedObj, false);
}

function anchorObject(idea, document) {
  const fragment = document.createDocumentFragment();

  idea.forEach((item) => {
    if (item instanceof ParsedObj) {
      fragment.appendChild(produce(document, item));
    } else if (isNode(item)) {
      fragment.appendChild(item);
    } else {
      fragment.appendChild(document.createTextNode(item));
    }
  });

  return fragment;
}

function emptyNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }

  return node;
}


module.exports = { produce };
