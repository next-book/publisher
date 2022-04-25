/**
 * Browser: is entry point for browser, bundled and transpiled into dist * directory.
 * @module
 */
/* eslint-env browser */
import tagDocument from './tagger';
import { gaugeDocument } from './gauge';
import { parseConfig, Config } from './config';

declare global {
  interface Window {
    NbMapper: {
      mapHtml: (options: Config) => void;
    };
  }
}

/**
 * Maps document contents — to be used in browser env.
 * @remarks
 * Modifies the document
 *
 * @param options - Config options overrides
 */
function mapHtml(options: Config): void {
  tagDocument(document, parseConfig(options));
  gaugeDocument(document);
}

window.NbMapper = { mapHtml };
