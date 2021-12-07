export type Revision = string | null;

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

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
  title: string | null | undefined;
  file: string;
  words: number;
  chars: number;
  ideas: number;
  role: DocRole;
  order: number | null;
  prev: string | null;
  next: string | null;
  toc: Heading[];
}

export interface Metadata {
  title?: string;
  subtitle?: string;
  author?: string;
  published?: number;
  keywords?: string[];
}

export default interface Manifest extends Metadata {
  identifier: string;
  revision: Revision;
  generatedAt: {
    date: string;
    unix: number;
  };
  documents: DocumentMetadata[];
  totals: PublicationSum;
  keywords?: string[];
}
