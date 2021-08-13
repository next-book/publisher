import { JSDOM as Jsdom } from 'jsdom';
import Progress from 'cli-progress';
import pretty from 'pretty';
import slug from 'slug';
import tagDocument from './tagger';
import i18n from './i18n';
import loadConfig from './config';
import { gaugeDocument, gaugePublication } from './gauge';
import getToc from './toc';
import * as chapterNav from './chapter-navigation';

/**
 * Maps HTML for *next-book* use.
 *
 * @param      {string[]|JSDOM[]}  content   Array of *jsdom* objects or strings
 * @param      {array}             filenames Names of files from which content was read
 * @param      {config~Options}    options   The options
 * @param      {string}            revision  Revision identifier string
 * @return     {array}             Array of mapped documents in specified format
 * @public
 */
function map(content, filenames, options, revision) {
  const conf = loadConfig(options); // ts: done
  console.log(`\nUsing mapper config:\n${dumpArray(conf)}\n`);

  const doms = content.map(doc => getJsdomObj(doc));
  const documents = doms.map(dom => dom.window.document);
  const { chapters } = conf;

  // map
  console.log('Mapping documents:');
  const bar = new Progress.Bar({}, Progress.Presets.shades_classic);
  bar.start(documents.length, 0);

  documents.forEach((document, index) => {
    tagDocument(document, conf); // ts: in progress
    gaugeDocument(document); // ts: todo

    bar.update(index + 1);
  });

  bar.stop();

  // gauge
  const lengths = gaugePublication(documents);
  const docMetadata = gatherMetadata(documents, filenames, chapters, lengths);
  const manifest = composeManifest(conf.meta, docMetadata, sumPublication(docMetadata), revision);

  //preview
  if (conf.fullTextUrl) chapterNav.addFullTextUrl(documents, conf.fullTextUrl, conf.root);

  // set language and add code to html
  i18n.changeLanguage(conf.languageCode);
  addLanguageCode(documents, conf.languageCode);

  // add nav
  addMetaNavigation(documents, docMetadata);
  chapterNav.addChapterStartAnchor(documents, conf.root);
  chapterNav.addChapterEndAnchor(documents, conf.root);
  chapterNav.addChapterInPageNavigation(documents, conf.root);

  // add roles
  addIdentifier(documents, manifest.identifier);
  addDocRoles(documents, docMetadata);
  addDefaultBodyClasses(documents);

  return { manifest, documents: exportDoms(doms, conf.output) };
}

function composeManifest(meta, documents, totals, revision) {
  const id = [meta.author.split(' ').pop(), meta.title, meta.published, revision]
    .filter(str => str)
    .join(' ');

  const time = new Date();

  return {
    ...meta,
    identifier: slug(id, { lower: true }),
    revision,
    generatedAt: {
      date: String(time),
      unix: time.getTime(),
    },
    documents,
    totals,
  };
}

const DocRole = {
  Chapter: 'chapter',
  Cover: 'cover',
  Break: 'break',
  Colophon: 'colophon',
  Other: 'other',
};

function sumPublication(metadata) {
  return metadata.reduce(
    (acc, doc) => ({
      all: {
        words: acc.all.words + doc.words,
        chars: acc.all.chars + doc.chars,
        ideas: acc.all.ideas + doc.ideas,
      },
      chapters: {
        words: doc.role === DocRole.Chapter ? acc.chapters.words + doc.words : acc.chapters.words,
        chars: doc.role === DocRole.Chapter ? acc.chapters.chars + doc.chars : acc.chapters.chars,
        ideas: doc.role === DocRole.Chapter ? acc.chapters.ideas + doc.ideas : acc.chapters.ideas,
      },
    }),
    {
      all: { words: 0, chars: 0, ideas: 0 },
      chapters: { words: 0, chars: 0, ideas: 0 },
    }
  );
}

function gatherMetadata(documents, filenames, chapters, lengths) {
  console.log('\nGathering metadata…');

  return documents.map((document, index) => {
    const title = document.querySelector('title').textContent;
    const file = filenames[index];
    const { words, chars, ideas } = lengths[index];
    const toc = getToc(document);

    const metaRole = document.querySelector('meta[name="nb-role"]');

    const role =
      metaRole && Object.values(DocRole).includes(metaRole.getAttribute('content'))
        ? metaRole.getAttribute('content')
        : chapters.includes(file)
        ? DocRole.Chapter
        : file === 'index.html'
        ? DocRole.Cover
        : file === 'colophon.html'
        ? DocRole.Colophon
        : DocRole.Other;
    const pos = chapters.indexOf(file);
    const order = role === DocRole.Chapter || role === DocRole.Break ? pos : null;

    const prev = pos !== 0 ? chapters[pos - 1] : null;
    const next =
      file === 'index.html' ? chapters[0] : pos < chapters.length - 1 ? chapters[pos + 1] : null;

    return {
      title,
      file,
      words,
      chars,
      ideas,
      role,
      order,
      prev,
      next,
      toc,
    };
  });
}

function addDefaultBodyClasses(documents) {
  documents.forEach((document, index) => {
    document.querySelector('body').classList.add('nb-custom-style');
  });
}

function addDocRoles(documents, metadata) {
  documents.forEach((document, index) => {
    const role = metadata[index].role;

    const el = document.createElement('META');
    el.setAttribute('name', 'nb-role');
    el.setAttribute('content', role);
    document.querySelector('head').appendChild(el);

    document.body.classList.add(`nb-role-${role}`);
  });
}

function addLanguageCode(documents, code) {
  console.log('\nAdding language code…');

  if (code)
    documents.forEach(document => {
      document.querySelector('html').setAttribute('lang', code);
    });
}

function addIdentifier(documents, identifier) {
  documents.forEach(document => {
    const el = document.createElement('META');
    el.setAttribute('name', 'nb-identifier');
    el.setAttribute('content', identifier);
    document.querySelector('head').appendChild(el);
  });
}

function addMetaNavigation(documents, metadata) {
  console.log('\nAdding meta navigation…');

  const base = [
    { tagName: 'link', rel: 'index', href: './index.html' },
    { tagName: 'link', rel: 'license', href: './license.html' },
    {
      tagName: 'link',
      rel: 'publication',
      href: './manifest.json',
      id: 'manifest',
    },
  ];

  const colophon = getColophon(metadata);
  if (colophon !== null) {
    base.push({ tagName: 'link', rel: 'colophon', href: colophon });
  }

  documents.forEach((document, index) => {
    const extra = Object.keys(metadata[index])
      .filter(name => metadata[index][name] !== null && metadata[index][name] !== undefined)
      .map(name => {
        const value = metadata[index][name];
        return ['prev', 'next'].includes(name)
          ? { tagName: 'link', rel: name, href: `./${value}` }
          : name === 'order'
          ? { tagName: 'meta', name: `nb-${name}`, content: value }
          : null;
      });

    const self = [{ tagName: 'link', rel: 'self', href: metadata[index].file }];

    base
      .concat(extra)
      .concat(self)
      .filter(meta => meta !== null)
      .forEach(meta => {
        const el = document.createElement(meta.tagName);
        Object.keys(meta)
          .filter(key => ['name', 'content', 'rel', 'href', 'id'].includes(key))
          .forEach(key => {
            el.setAttribute(key, meta[key]);
          });
        document.querySelector('head').appendChild(el);
      });
  });
}

function getColophon(metadata) {
  const files = metadata.filter(item => item.role === DocRole.Colophon);
  return files.length ? files[0].file : null;
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
  if (typeof doc === 'string') return new Jsdom(doc);

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
  return JSON.stringify(arr, null, 2)
    .split('\n')
    .map(line => `>${line}`)
    .join('\n');
}

export { map, addMetaNavigation };
