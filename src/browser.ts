/**
 * Browser module is entry point for browser, bundled and transpiled into dist * directory.
 */
/* eslint-env browser */
import tagDocument from './tagger';
import { gaugeDocument } from './gauge';
import loadConfig, { Config } from './config';

declare global {
  interface Window {
    NbMapper: {
      mapHtml: (options: Config) => void
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
function mapHtml(options: Config):void {
  tagDocument(document, loadConfig(options));
  gaugeDocument(document);
}

window.NbMapper = { mapHtml };
