/**
 * Browser module is entry point for browser, bundled and transpiled into dist directory.
 * @module
 * @ignore
 */

/* eslint-env browser */
const tagger = require('./tagger');
const gauge = require('./gauge');
const config = require('./config');

/**
 * Maps document contents — to be used in browser env.
 *
 * @param      {Options}  options  The options
 * @return     {void}  Modifies document
 */
function mapHtml(options) {
  tagger.tagDocument(document, config.load(options));
  gauge.gaugeDocument(document);
  gauge.setGaugeMetatags(document);
}

window.NbMapper = { mapHtml };
