/**
 * Config module
 *
 * The config is being created in following stages in {@link prepConfig}:
 * 1. First in {@link prepConfig}, the custom book options in the shape of {@link PartialConfigWithDeprecated} are loaded.
 * 2. Deprecated options are transformed to their new form and the config gets shape of {@link PartialConfig}.
 * 3. Config is acquired by parsing and applying defaults on {@link PartialConfig} with {@link Preview} options.
 * 4. Since config is guaranteed to have preview settings decided, the preview logic is applied on the config.
 * @module
 */

import { metaDataSchema } from '../shared/manifest';
import { TocBaseItem } from './toc';
import { z } from 'zod';

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

const defaultChapterSlice = 3;
const previewTrueSchema = z.object({
  isPreview: z.literal(true),

  /**
   * Chapter files to be excluded
   */
  chaptersSlice: z.number().optional().default(defaultChapterSlice),

  /**
   * Chapter files to be excluded
   */
  removeChapters: z.string().array(),

  /**
   * URL used in nav and site links
   */
  fullTextUrl: z.string().url(),
});

export type PreviewTrue = z.infer<typeof previewTrueSchema>;

const previewFalseSchema = z.object({
  isPreview: z.literal(false),
});

export const previewSchema = z.discriminatedUnion('isPreview', [
  previewTrueSchema,
  previewFalseSchema,
]);

export type Preview = z.infer<typeof previewSchema>;

const tocBaseItemSchema: z.ZodType<TocBaseItem> = z.lazy(() =>
  z.object({
    isSection: z.boolean().optional(),
    title: z.string().optional(),
    link: z.string().optional(),
    children: tocBaseSchema.optional(),
    listType: z.enum(['plain', 'numbered', 'bulleted']).optional(),
  })
);

const tocBaseSchema = z.array(tocBaseItemSchema);

export const configSchema = z.object({
  /**
   * i18n ISO string
   */
  languageCode: z.string().default('en'),

  /**
   * Output format specifier
   */
  output: z.enum(['jsdom', 'html']).default('html'),

  /**
   * Parser delimiter
   */
  delimiter: z.string().default('\n'),

  /**
   * Root element, within which book content is recognized and
   * processed by publisher.
   */
  root: z.string().default('main'),

  /**
   * Selectors for DOM elements to be recognized
   */
  selectors: z
    .string()
    .array()
    .default(['p', 'li', 'dd', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'dl']),

  /**
   * Book metadata
   */
  meta: metaDataSchema.optional().default({
    title: 'No title',
    subtitle: 'No subtitle',
    author: 'No author',
  }),

  /**
   * ReadingOrder as list of `.html` files
   */
  readingOrder: z.string().array().default([]),

  /**
   * TOC structure without in-document headings
   */
  tocBase: tocBaseSchema.default([]),

  /**
   * Static files folders to be published as a list of folder names.
   * Folders will be copied from source to output as they are
   */
  static: z.string().array().default([]),

  preview: previewSchema.optional().default({
    isPreview: false,
  }),
});

export type Config = z.infer<typeof configSchema>;

export interface ConfigWithDeprecated extends Config {
  /**
   * Chapters reading order as list of `.html` files.
   *
   * @remarks When provided, gets renamed to readingOrder.
   * @deprecated Use the new readingOrder property instead.
   */
  chapters?: string[];
}

/**
 * @example Custom book config loaded from file may contain
 * selected (partial) config properties
 */
export type PartialConfigWithDeprecated = Partial<ConfigWithDeprecated>;

/**
 * @example Custom book config loaded from file may contain
 * selected (partial) config properties
 */
export type PartialConfig = Partial<Config>;

const loadConfig = (options: PartialConfig): Config => {
  const loaded = configSchema.safeParse(options);
  if (!loaded.success) {
    const errors = loaded.error.flatten().fieldErrors;
    console.error(`The following config fields were invalid:`);
    for (const [key, value] of Object.entries(errors)) {
      console.error(`${key}: ${value}`);
    }
    throw new Error('Invalid config options.');
  }
  return loaded.data;
};

export default loadConfig;
