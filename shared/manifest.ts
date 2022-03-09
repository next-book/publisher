/**
 * Manifest shared module
 * @module
 *
 * The manifest is what enables user agents to understand the bounds of digital
 * publication and the connection between its resources. It includes metadata that
 * describes the digital publication, as a publication has an identity and nature beyond
 * its constituent resources (https://www.w3.org/TR/pub-manifest/).
 */

import { Preview } from '../src/config';
import { z } from 'zod';

export type Identifier = string;
export type Revision = string | null;
export type Order = number | null;
export type OrderLike = string;
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type Root = keyof HTMLElementTagNameMap | string;
/** i18n ISO string */
export type LanguageCode = string;

export interface Heading {
  index: number;
  level: HeadingLevel;
  name: string | null;
  id: string | null;
  children: Heading[];
}

export enum DocRole {
  Break = 'break',
  Chapter = 'chapter',
  Cover = 'cover',
  Colophon = 'colophon',
  Other = 'other',
}

export interface PublicationSum {
  all: {
    words: number;
    chars: number;
    ideas: number;
  };
  chapters: {
    words: number;
    chars: number;
    ideas: number;
  };
}

export interface DocumentMetadata {
  title: string;
  file: string;
  words: number;
  chars: number;
  ideas: number;
  role: DocRole;
  order: Order;
  prev: string | null;
  next: string | null;
  toc: Heading[];
}

export const metaDataSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  author: z.string(),
  published: z.number().optional(),
  publisher: z.string().optional(),
  keywords: z.string().array().optional(),
  edition: z.string().optional(),
});

type Metadata = z.infer<typeof metaDataSchema>;

// https://github.com/orgs/next-book/teams/nb-core/discussions/1

export default interface Manifest extends Metadata {
  identifier: Identifier;
  languageCode: LanguageCode;
  revision: Revision;
  generatedAt: {
    date: string;
    unix: number;
  };
  readingOrder: string[];
  documents: DocumentMetadata[];
  totals: PublicationSum;
  keywords?: string[];
  root: Root;
  preview: Preview;
}
