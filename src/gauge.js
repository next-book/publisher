/**
 * @module
 * @ignore
 */


const attrNames = {
  charCount: 'data-nb-chars',
  wordCount: 'data-nb-words',
  publicationCharCount: 'data-nb-publication-chars',
  publicationWordCount: 'data-nb-publication-words',
  charOffset: 'data-nb-chars-offset',
  wordOffset: 'data-nb-words-offset',
  sectionNumber: 'data-nb-section-number',
};

const sumAttr = attr => ideas => Array.prototype.reduce
  .call(ideas, (acc, idea) => acc + parseInt(idea.getAttribute(attr), 10), 0);

const setSumAttr = attr => (el) => {
  el.setAttribute(attr, sumAttr(attr)(el.querySelectorAll('.idea')));
};

function countChars(document) {
  Array.prototype.map.call(document.querySelectorAll('.idea'), (idea) => {
    idea.setAttribute(attrNames.charCount, idea.textContent.length);
  });
}

function countWords(document) {
  Array.prototype.map.call(document.querySelectorAll('.idea'), (idea) => {
    idea.setAttribute(attrNames.wordCount, idea.textContent.split(/\s+/g).length);
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
  gaugeContent(document, attrNames.wordCount, countWords);
  gaugeContent(document, attrNames.charCount, countChars);
}


function gaugeTotals(attr, pubAttr, offsetAttr) {
  return (documents) => {
    const counts = documents.map(document => parseInt(document.body.getAttribute(attr), 10));
    const total = counts.reduce((a, b) => a + b, 0);

    documents.reduce((runningTotal, document, index) => {
      document.body.setAttribute(pubAttr, total);
      document.body.setAttribute(offsetAttr, runningTotal);
      return runningTotal + counts[index];
    }, 0);
  };
}

/**
 * Gauges words and characters in a publication. Relies on previous gauging of individual chunks
 * using {@link gaugeDocument}.
 *
 * @param      {Object[]}  documents  DOM documents
 * @return     {void}  Modifies DOM documents
 */
function gaugePublication(documents) {
  gaugeTotals(attrNames.wordCount, attrNames.publicationWordCount, attrNames.wordOffset)(documents);
  gaugeTotals(attrNames.charCount, attrNames.publicationCharCount, attrNames.charOffset)(documents);
  documents.forEach((document, index) =>
    document.body.setAttribute(attrNames.sectionNumber, index + 1));
}


function appendMeta(document, name) {
  const value = document.body.getAttribute(attrNames[name]);

  if (value !== null && value !== '') {
    const el = document.createElement('meta');
    el.setAttribute('name', name);
    el.setAttribute('content', parseInt(value, 10));
    document.querySelector('head').appendChild(el);
  }
}

/**
 * Sets the gauge metatags inferred from `document.body.dataset`. Relies on attributes created using
 * {@link gaugeDocument} and optionally using {@link gaugePublication}.
 *
 * @param      {document}  document  DOM document
 * @return     {void}  Modifies DOM document
 */
function setGaugeMetatags(document) {
  Object.keys(attrNames).map(attrName => appendMeta(document, attrName));
}

module.exports = { gaugeDocument, gaugePublication, setGaugeMetatags };
