/**
 * App module used in node.js env.
 * @module
 * @ignore
 */

const Jsdom = require('jsdom').JSDOM;
const tagger = require('./tagger');
const gauge = require('./gauge');
const config = require('./config');

/**
 * Maps HTML for *next-book* use.
 *
 * @param      {string|JSDOM|string[]|JSDOM[]}  data     *jsdom* object, string containing HTML or
 *                                                       array of those.
 * @param      {config~Options}                 options  The options
 * @return     {array}                          Array of mapped documents in specified format
 * @public
 */
function map(data, options) {
  const conf = config.load(options);
  const doms = (Array.isArray(data) ? data : [data]).map(doc => getJsdomObj(doc));
  const documents = doms.map(dom => dom.window.document);

  // map
  documents.forEach((document, index) => {
    console.log(`Mapping document #${index}`);
    tagger.tagDocument(document, conf);
    gauge.gaugeDocument(document);
  });

  // gauge
  if (documents.length > 1) gauge.gaugePublication(documents);
  documents.forEach(document => gauge.setGaugeMetatags(document));

  // export
  return (doms.length > 1) ? exportDoms(doms, conf.output) : exportDoms(doms, conf.output)[0];
}

/**
 * Converts HTML string into jsdom object if needed.
 *
 * @param      {(string|JSDOM)}  doc     The document
 * @return     {JSDOM}           Returns a new jsdom object.
 * @private
 */
function getJsdomObj(doc) {
  if (Object.prototype.isPrototypeOf.call(doc, Jsdom)) return doc.cloneNode(true);
  else if (typeof doc === 'string') return new Jsdom(doc);

  throw new Error('Input document format not recognized!');
}

/**
 * Export DOM objects in a specified format
 *
 * @param      {JSDOM[]}           doms    DOM objects
 * @param      {('jsdom'|'html')}  format  Output format
 * @return     {array}             Array of JSDOM objects or HTML strings
 * @private
 */
function exportDoms(doms, format) {
  const routines = {
    jsdom: dom => dom,
    html: dom => dom.serialize(),
  };

  return doms.map(dom => routines[format](dom));
}


module.exports = { map };
