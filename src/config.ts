/**
 * A callback used to split chunk contents into ideas.
 */
export type TokenizerFn = (node: Node, text: string) => string[];

/**
 * A callback that marks elements as chunks of ideas. Those are then used for
 * idea mapping.
 */
export type SelectorFn = (root: Element | Document) => NodeListOf<Element>;

export type Delimiter = string | RegExp | TokenizerFn;

export interface Config {
  /** i18n ISO string */
  languageCode: string;
  output: 'jsdom'|'html';
  delimiter: Delimiter;
  root: keyof HTMLElementTagNameMap | string;
  selectors: Array<keyof HTMLElementTagNameMap> | SelectorFn;
  /** Book metadata, which may be later used e.g. for generating SEO
   * material */
  meta?: {
    title?: string;
    subtitle?: string;
    author?: string;
    published?: number;
    keywords?: string[];
  }
  /** Chapters as list of `.html` files. */
  chapters?: string[];
  /** Static files folders to be published as a list of folder names. Folders will be copied from source to output as they are. */
  static?: string[];
}

const defaults: Config = {
  languageCode: 'en',
  output: 'html',
  delimiter: '\n',
  root: 'main',
  selectors: ['p', 'li', 'dd', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'dl']
};

type ConfigOverrides = Partial<Config>

const loadConfig = (options: ConfigOverrides): Config => {
  return Object.assign({}, defaults, options)
}

export default loadConfig;