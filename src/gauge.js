/**
 * @module
 * @ignore
 */


const attrNames = {
  chars: 'data-nb-chars',
  words: 'data-nb-words',
  publicationChars: 'data-nb-publication-chars',
  publicationWords: 'data-nb-publication-words',
  charOffset: 'data-nb-chars-offset',
  wordOffset: 'data-nb-words-offset',
  id: 'data-nb-document-id',
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
  gaugeTotals(attrNames.words, attrNames.publicationWords, attrNames.wordOffset)(documents);
  gaugeTotals(attrNames.chars, attrNames.publicationChars, attrNames.charOffset)(documents);
  documents.forEach((document, index) =>
    document.body.setAttribute(attrNames.id, index + 1));
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


/**
 * Retrieves values from `document.body.dataset`. Relies on attributes created using
 * {@link gaugeDocument} and optionally using {@link gaugePublication}.
 *
 * @param      {document}  document  DOM document
 * @return     {Object}  Array of name/value pairs
 */
function getData(document) {
  const data = {};

  Object.keys(attrNames).forEach((attrName) => {
    const raw = document.body.getAttribute(attrNames[attrName]);
    const value = raw == parseInt(raw, 10) // eslint-disable-line eqeqeq
      ? parseInt(raw, 10)
      : raw == parseFloat(raw) // eslint-disable-line eqeqeq
        ? parseFloat(raw)
        : raw;
    data[attrName] = value;
  });

  return data;
}


module.exports = {
  gaugeDocument,
  gaugePublication,
  setGaugeMetatags,
  getData,
};
