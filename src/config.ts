/**
 * Config module
 * @module
 */

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
export type SelectorFn = (root: Document|Element) => void;

export type Selectors = Array<keyof HTMLElementTagNameMap|string> | SelectorFn;

export type Delimiter = string /* | RegExp | TokenizerFn */;

export interface Metadata {
  title?: string;
  subtitle?: string;
  author?: string;
  published?: number;
  keywords?: string[];
}

export interface Config {
  /**
   * i18n ISO string
   */
  languageCode: string;
  
  /**
   * Output format specifier
   */
  output: 'jsdom'|'html';

  /**
   * D
   */
  delimiter: Delimiter;

  /**
   * Root element, within which book content is recognized and
   * processed by publisher. 
   */
  root: keyof HTMLElementTagNameMap | string;

  /** 
   * Selectors for DOM elements to be recognized
   */
  selectors: Selectors;

  /** 
   * Book metadata
   */
  meta?: Metadata;
  
  /**
   * Chapters as list of `.html` files
   */
  chapters?: string[];
  
  /**
   * Static files folders to be published as a list of folder names.
   * Folders will be copied from source to output as they are
   */
  static?: string[];
  
  /**
   * URL used in nav and site links
   */
  fullTextUrl?: string;
}

const defaults: Config = {
  languageCode: 'en',
  output: 'html',
  delimiter: '\n',
  root: 'main',
  selectors: ['p', 'li', 'dd', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'dl'],
  meta: {
    title: 'No title',
    subtitle: 'No subtitle',
    author: 'No author'
  }
};

type ConfigOverrides = Partial<Config>

const loadConfig = (options: ConfigOverrides): Config => {
  return Object.assign({}, defaults, options)
}

export default loadConfig;