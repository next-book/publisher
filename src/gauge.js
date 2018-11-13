/**
 * @module
 * @ignore
 */

const attrNames = {
  chars: 'data-nb-chars',
  words: 'data-nb-words',
};

const sumAttr = attr => ideas => Array.prototype.reduce
  .call(ideas, (acc, idea) => acc + parseInt(idea.getAttribute(attr), 10), 0);

const setSumAttr = attr => (el) => {
  el.setAttribute(attr, sumAttr(attr)(el.querySelectorAll('.idea')));
};

function countChars(document) {
  Array.prototype.map.call(document.querySelectorAll('.idea'), (idea) => {
    idea.setAttribute(attrNames.chars, idea.textContent.length);
  });
}

function countWords(document) {
  Array.prototype.map.call(document.querySelectorAll('.idea'), (idea) => {
    idea.setAttribute(attrNames.words, idea.textContent.split(/\s+/g).length);
  });
}

function gaugeContent(document, attr, gaugeFn) {
  gaugeFn(document);
  setSumAttr(attr)(document.body);
  Array.prototype.forEach.call(document.querySelectorAll('.chunk'), setSumAttr(attr));
}

/**
 * Gauges words and characters in a document.
 *
 * @param      {Object}  document  DOM document
 * @return     {void}  Modifies DOM document
 */
function gaugeDocument(document) {
  gaugeContent(document, attrNames.words, countWords);
  gaugeContent(document, attrNames.chars, countChars);
}

/**
 * Gauges words and characters in a publication. Relies on previous gauging of individual chunks
 * using {@link gaugeDocument}.
 *
 * @param      {Object[]}  documents  DOM documents
 * @return     {void}  Modifies DOM documents
 */
function gaugePublication(documents) {
  return documents.map(document => ({
    words: parseInt(document.body.getAttribute(attrNames.words), 10),
    chars: parseInt(document.body.getAttribute(attrNames.chars), 10),
  }));
}

module.exports = {
  gaugeDocument,
  gaugePublication,
};
