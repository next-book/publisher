/**
 * App module used in node.js env.
 * @module
 * @ignore
 */

const Jsdom = require('jsdom').JSDOM;
const tagger = require('./tagger');
const gauge = require('./gauge');
const config = require('./config');
const Progress = require('cli-progress');
const pretty = require('pretty');

/**
 * Maps HTML for *next-book* use.
 *
 * @param      {string[]|JSDOM[]}  content   Array of *jsdom* objects or strings
 * @param      {array}             filenames Names of files from which content was read
 * @param      {config~Options}    options   The options
 * @return     {array}             Array of mapped documents in specified format
 * @public
 */
function map(content, filenames, options) {
  const conf = config.load(options);
  console.log(`\nUsing mapper config:\n${dumpArray(conf)}\n`);

  const doms = content.map(doc => getJsdomObj(doc));
  const documents = doms.map(dom => dom.window.document);

  // map
  console.log('Mapping documents:');
  const bar = new Progress.Bar({}, Progress.Presets.shades_classic);
  bar.start(documents.length, 0);

  documents.forEach((document, index) => {
    tagger.tagDocument(document, conf);
    gauge.gaugeDocument(document);
    bar.update(index + 1);
  });

  bar.stop();

  // gauge
  if (documents.length > 1) gauge.gaugePublication(documents);
  documents.forEach(document => gauge.setGaugeMetatags(document));

  const metadata = Object.assign(
    {},
    conf.meta,
    { chapters: documents.map(document => gauge.getData(document)) },
  );

  // add nav
  addMetaNavigation(documents, filenames);

  return { metadata, documents: exportDoms(doms, conf.output) };
}

function addMetaNavigation(documents, filenames) {
  console.log('\nAdding meta navigation…');

  documents.forEach((document, index) => {
    const links = [
      { rel: 'index', href: './index.html' },
      { rel: 'prev', href: `./${filenames[index - 1]}` },
      { rel: 'next', href: `./${filenames[index + 1]}` },
      { rel: 'license', href: './license.html' },
      { rel: 'import', href: './spine.json', id: 'spine' },
    ];

    links.filter(link => link.href).forEach((link) => {
      const el = document.createElement('link');
      el.setAttribute('rel', link.rel);
      el.setAttribute('href', link.href);
      if (link.id) el.setAttribute('id', link.id);
      document.querySelector('head').appendChild(el);
    });
  });
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
  console.log('\nExporting HTML…');

  const routines = {
    jsdom: dom => dom,
    html: dom => pretty(dom.serialize(), { ocd: true }),
  };

  return doms.map(dom => routines[format](dom));
}


function dumpArray(arr) {
  return JSON.stringify(arr, null, 2).split('\n').map(line => '> ' + line).join('\n');
}

module.exports = { map, addMetaNavigation };
