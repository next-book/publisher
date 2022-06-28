/**
 * Manifest shared module
 * @module
 *
 * The manifest is what enables user agents to understand the bounds of digital
 * publication and the connection between its resources. It includes metadata that
 * describes the digital publication, as a publication has an identity and nature beyond
 * its constituent resources (https://www.w3.org/TR/pub-manifest/).
 */

import { previewSchema } from '../src/config';
import { z } from 'zod';

export type Identifier = string;

const revisionSchema = z.string().min(1).max(7);
export type Revision = z.infer<typeof revisionSchema>;
const orderSchema = z.number().nullable();
export type Order = z.infer<typeof orderSchema>;

export type OrderLike = string;
export type HeadingLevel = number;
const rootSchema = z.string();
export type Root = z.infer<typeof rootSchema>;
/** i18n ISO string */
export type LanguageCode = string;

export interface Heading {
  index: number;
  level: HeadingLevel;
  name: string | null;
  id: string | null;
  children: Heading[];
}

const Heading: z.ZodType<Heading> = z.lazy(() =>
  z.object({
    index: z.number(),
    level: z.number().int().min(1).max(6),
    name: z.string().nullable(),
    id: z.string().nullable(),
    children: z.array(Heading),
  })
);

export enum DocRole {
  Break = 'break',
  Chapter = 'chapter',
  Cover = 'cover',
  About = 'about',
  Other = 'other',
}

const publicationSumSchema = z.object({
  all: z.object({
    words: z.number(),
    chars: z.number(),
    ideas: z.number(),
  }),
  chapters: z.object({
    words: z.number(),
    chars: z.number(),
    ideas: z.number(),
  }),
});

export type PublicationSum = z.infer<typeof publicationSumSchema>;

const documentMetadataSchema = z.object({
  title: z.string(),
  file: z.string(),
  words: z.number(),
  chars: z.number(),
  ideas: z.number(),
  role: z.nativeEnum(DocRole),
  order: orderSchema,
  prev: z.string().nullable(),
  next: z.string().nullable(),
  toc: Heading.array(),
});

export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;

// https://github.com/orgs/next-book/teams/nb-core/discussions/1

export const manifestSchema = z.object({
  title: z.string(),
  author: z.string(),
  identifier: z.string(),
  languageCode: z.string(),
  revision: revisionSchema,
  generatedAt: z.object({
    date: z.string(),
    unix: z.number(),
  }),
  readingOrder: z.string().array(),
  documents: documentMetadataSchema.array(),
  totals: publicationSumSchema,
  subtitle: z.string().optional(),
  published: z.number().optional(),
  keywords: z.string().array().optional(),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  root: rootSchema,
  preview: previewSchema,
});

type Manifest = z.infer<typeof manifestSchema>;

export default Manifest;
