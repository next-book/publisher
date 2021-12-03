/**
 * App module used in node.js env.
 * @module
 */
import { JSDOM as Jsdom } from 'jsdom';
import Progress from 'cli-progress';
import pretty from 'pretty';
import slug from 'slug';
import tagDocument from './tagger';
import i18n from './i18n';
import loadConfig, { Config } from './config';
import { gaugeDocument, gaugePublication, PublicationStats } from './gauge';
import getDocumentToc, { getToc } from './toc';
import * as chapterNav from './chapter-navigation';
import {
  DocRole,
  PublicationSum,
  DocumentMetadata,
  Manifest,
  Revision,
  Metadata as ConfigMetadata,
} from '../shared';

interface MappedPublication {
  manifest: Manifest;
  documents: (string | Jsdom)[];
}

/**
 * Maps HTML for *next-book* use.
 *
 * @param content - Array of file contents
 * @param filenames - Names of files form which content was read
 * @param options - The config options
 * @param revision - Revision identifier string
 * @returns Array of mapped documents in specified format
 */
export default function map(
  content: string[],
  filenames: string[],
  options: Config,
  revision: Revision
): MappedPublication {
  const conf = loadConfig(options);
  console.log(`\nUsing mapper config:\n${dumpArray(conf)}\n`);

  const doms = content.map(doc => new Jsdom(doc));
  const documents = doms.map(dom => dom.window.document);
  const { readingOrder } = conf;

  // map
  console.log('Mapping documents:');
  const bar = new Progress.Bar({}, Progress.Presets.shades_classic);
  bar.start(documents.length, 0);

  documents.forEach((document, index) => {
    tagDocument(document, conf);
    gaugeDocument(document);

    bar.update(index + 1);
  });

  bar.stop();

  // gauge
  const lengths = gaugePublication(documents);
  if (!readingOrder) throw new Error('Reading order not defined in config.');
  const pubMetadata = gatherMetadata(documents, filenames, readingOrder, lengths);

  if (!conf.meta) throw new Error('Metadata not defined in config.');
  const manifest = composeManifest(
    conf.meta,
    pubMetadata,
    readingOrder,
    sumPublication(pubMetadata),
    revision
  );

  //preview
  if (conf.fullTextUrl) chapterNav.addFullTextUrl(documents, conf.fullTextUrl, conf.root);

  // set language and add code to html
  i18n.changeLanguage(conf.languageCode);
  addLanguageCode(documents, conf.languageCode);

  // add nav
  addMetaNavigation(documents, pubMetadata);
  chapterNav.addChapterStartAnchor(documents, conf.root);
  chapterNav.addChapterEndAnchor(documents, conf.root);
  chapterNav.addChapterInPageNavigation(documents, conf.root);

  // add roles
  addIdentifier(documents, manifest.identifier);
  addDocRoles(documents, pubMetadata);
  addDefaultBodyClasses(documents);
  addToc(documents, getToc(pubMetadata, conf.tocBase));

  return { manifest, documents: exportDoms(doms, conf.output) };
}

function composeManifest(
  meta: ConfigMetadata,
  documents: DocumentMetadata[],
  readingOrder: string[],
  totals: PublicationSum,
  revision: Revision
): Manifest {
  const id = [meta?.author?.split(' ').pop(), meta.title, meta.published, revision]
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
    documents: orderDocuments(documents, readingOrder),
    totals,
  };
}

function orderDocuments(unordered: DocumentMetadata[], readingOrder: string[]): DocumentMetadata[] {
  return readingOrder
    .map(filename => unordered.find((doc: DocumentMetadata) => filename === doc.file))
    .filter(doc => doc !== undefined && doc !== null) as DocumentMetadata[];
}

function sumPublication(metadata: DocumentMetadata[]): PublicationSum {
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

function gatherMetadata(
  documents: Document[],
  filenames: string[],
  readingOrder: string[],
  lengths: PublicationStats
): DocumentMetadata[] {
  console.log('\nGathering metadata…');

  return documents.map((document, index) => {
    const title = document.querySelector('title')?.textContent;
    const file = filenames[index];
    const { words, chars, ideas } = lengths[index];
    const toc = getDocumentToc(document);
    const docRoleMeta = document.querySelector('meta[name="nb-role"]')?.getAttribute('content');

    const role =
      docRoleMeta && Object.values(DocRole).includes(docRoleMeta as DocRole)
        ? docRoleMeta
        : file === 'index.html'
        ? DocRole.Cover
        : file === 'colophon.html'
        ? DocRole.Colophon
        : readingOrder.includes(file)
        ? DocRole.Chapter
        : DocRole.Other;

    const pos = readingOrder.indexOf(file);
    const order = role === DocRole.Chapter || role === DocRole.Break ? pos : null;

    const prev = pos !== 0 ? readingOrder[pos - 1] : null;
    const next =
      file === 'index.html'
        ? readingOrder[0]
        : pos < readingOrder.length - 1
        ? readingOrder[pos + 1]
        : null;

    return {
      title,
      file,
      words,
      chars,
      ideas,
      role: role as DocRole,
      order,
      prev,
      next,
      toc,
    };
  });
}

function addDefaultBodyClasses(documents: Document[]) {
  documents.forEach(document => {
    document.querySelector('body')?.classList.add('nb-custom-style');
  });
}

function addToc(documents: Document[], toc: DocumentFragment) {
  documents.forEach(document => {
    document.querySelector('body')?.prepend(toc.cloneNode(true));
  });
}

function addDocRoles(documents: Document[], metadata: DocumentMetadata[]) {
  documents.forEach((document, index) => {
    const headElement = document.querySelector('head');
    if (!headElement) throw new Error('Missing <head> HTML element.');

    headElement.querySelector('meta[name="nb-role"]')?.remove();

    const role = metadata[index].role;
    const el = document.createElement('META');
    el.setAttribute('name', 'nb-role');
    el.setAttribute('content', role);
    headElement.appendChild(el);

    document.body.classList.add(`nb-role-${role}`);
  });
}

function addLanguageCode(documents: Document[], code: string): void {
  console.log('\nAdding language code…');
  if (code)
    documents.forEach(document => {
      const htmlElement = document.querySelector('html');
      if (!htmlElement) throw new Error('Missing <html> HTML element.');
      htmlElement.setAttribute('lang', code);
    });
}

function addIdentifier(documents: Document[], identifier: string) {
  documents.forEach(document => {
    const el = document.createElement('META');
    el.setAttribute('name', 'nb-identifier');
    el.setAttribute('content', identifier);
    const head = document.querySelector('head');
    if (!head) throw new Error('Missing head element.');
    head.appendChild(el);
  });
}

/**
 * Adds meta navigation links e.g. to next/prev, license, manifest, homepage
 * to the <head> of documents.
 *
 * @param documents - A list of DOM Documents to add meta navigation to
 * @param metadata - Document metadata used for meta navigation links
 * @returns Mutates documents by adding and appending navigation links
 * to `<head>` HTML element.
 */
function addMetaNavigation(documents: Document[], metadata: DocumentMetadata[]): void {
  console.log('\nAdding meta navigation…');

  type NavItem = {
    tagName: string;
    rel?: string;
    href?: string;
    id?: string;
    content?: string;
    name?: string;
    [key: string]: string | undefined;
  } | null;

  const base: NavItem[] = [
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
    const headElement = document.querySelector('head');
    if (!headElement) throw Error('HTML <head> element missing');

    const docMeta = metadata[index];
    const extra: NavItem[] = [];

    extra.push({
      tagName: 'link',
      rel: 'prev',
      href: docMeta['prev'] ? `./${docMeta['prev']}` : './index.html',
    });
    extra.push({
      tagName: 'link',
      rel: 'next',
      href: docMeta['next'] ? `./${docMeta['next']}` : './index.html',
    });
    if (docMeta['order'])
      extra.push({
        tagName: 'meta',
        name: 'nb-order',
        content: docMeta['order']?.toString(),
      });

    const self = [{ tagName: 'link', rel: 'self', href: docMeta.file }];

    base
      .concat(extra)
      .concat(self)
      .filter(meta => meta !== null)
      .forEach(meta => {
        if (!meta) return;
        const el = document.createElement(meta.tagName);
        Object.keys(meta)
          .filter(key => ['name', 'content', 'rel', 'href', 'id'].includes(key))
          .forEach(key => {
            const val = meta[key as keyof NavItem];
            if (val && typeof val === 'string') el.setAttribute(key, val);
          });
        headElement.appendChild(el);
      });
  });
}

function getColophon(metadata: DocumentMetadata[]) {
  const files = metadata.filter(item => item.role === DocRole.Colophon);
  return files.length ? files[0].file : null;
}

/**
 * Export DOM objects in a specified format
 *
 * @param doms - DOM objects
 * @param format - Output format
 * @returns Array of Jsdom Objects or HTML strings
 */
function exportDoms(doms: Jsdom[], format: 'jsdom' | 'html'): (Jsdom | string)[] {
  console.log('\nExporting HTML…');

  const routines = {
    jsdom: (dom: Jsdom) => dom,
    html: (dom: Jsdom) => pretty(dom.serialize(), { ocd: true }),
  };

  return doms.map(dom => routines[format](dom));
}

/**
 * Dumps array
 *
 * @param arr - Array to dump
 * @returns
 */
function dumpArray(arr: unknown) {
  return JSON.stringify(arr, null, 2)
    .split('\n')
    .map(line => `>${line}`)
    .join('\n');
}

export { map, addMetaNavigation };
