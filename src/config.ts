/**
 * Config module
 * @module
 *
 * The config is being created in following stages:
 * 1. First in {@link prepConfig}, the custom book options in the shape of {@link PartialConfig} are loaded.
 * 2. Preview feature settings in shape of {@link Preview} are being created by appling loaded custom
 *    options onto {@link previewDefaults}.
 *    The preview feature settings are added to the loaded config, together making the
 *    shape of {@link PartialConfigWithPreview}.
 * 3. Since config is guaranteed to have preview settings, it is then used to override {@link configDefaults}.
 */
import { Metadata, LanguageCode, Root } from '../shared/manifest';
import { TocBase } from './toc';

/**
 * A callback used to split chunk contents into ideas.
 */
export type TokenizerFn = (node: Node, text: string) => string;

/**
 * A callback that marks elements as chunks of ideas. Those are then used for
 * idea mapping.
 *
 * @param root - DOM Document or Element
 * @returns Modifies DOM Document
 */
export type SelectorFn = (root: Document | Element) => void;

export type Selectors = Array<keyof HTMLElementTagNameMap | string> | SelectorFn;

export type Delimiter = string /* | RegExp | TokenizerFn */;

export type PreviewTrue = {
  isPreview: true;

  /**
   * URL used in nav and site links
   */
  fullTextUrl: string;
};

type PreviewFalse = { isPreview: false };

export type Preview = {
  /**
   * Chapter files to be excluded
   */
  chaptersSlice: number;

  /**
   * Chapter files to be excluded
   */
  removeChapters: string[];

  /**
   * URL may be set oven when isPreview is false
   */
  fullTextUrl?: string;
} & (PreviewTrue | PreviewFalse);

export const previewDefaults: Preview = {
  isPreview: false,
  chaptersSlice: 3,
  removeChapters: [],
};

/**
 * Publisher config
 */
export interface Config {
  /**
   * i18n ISO string
   */
  languageCode: LanguageCode;

  /**
   * Output format specifier
   */
  output: 'jsdom' | 'html';

  /**
   * D
   */
  delimiter: Delimiter;

  /**
   * Root element, within which book content is recognized and
   * processed by publisher.
   */
  root: Root;

  /**
   * Selectors for DOM elements to be recognized
   */
  selectors: Selectors;

  /**
   * Book metadata
   */
  meta: Metadata;

  /**
   * ReadingOrder as list of `.html` files
   */
  readingOrder: string[];

  /**
   * Chapters reading order as list of `.html` files.
   *
   * @remarks When provided, gets renamed to readingOrder.
   * @deprecated Use the new readingOrder property instead.
   */
  chapters?: string[];

  /**
   * TOC structure without in-document headings
   */
  tocBase: TocBase;

  /**
   * Static files folders to be published as a list of folder names.
   * Folders will be copied from source to output as they are
   */
  static: string[];

  preview: Preview;
}

const configDefaults: Config = {
  languageCode: 'en',
  output: 'html',
  delimiter: '\n',
  root: 'main',
  selectors: ['p', 'li', 'dd', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'dl'],
  static: [],
  readingOrder: [],
  tocBase: [],
  meta: {
    title: 'No title',
    subtitle: 'No subtitle',
    author: 'No author',
  },
  preview: { ...previewDefaults },
};

/**
 * @example Custom book config loaded from file may contain
 * selected (partial) config properties
 */
export type PartialConfig = Partial<Config>;

const loadConfig = (overrides: PartialConfig): Config => {
  return Object.assign({}, configDefaults, overrides);
};

export default loadConfig;
