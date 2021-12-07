import { DocRole, OrderLike, Identifier } from './manifest';

export enum PageClass {
  Home = 'home',
}

export enum StyleClass {
  Custom = 'nb-custom-style',
}

export enum TagClass {
  Chunk = 'chunk',
  Idea = 'idea',
  /** For skipping elements and their children from tagging */
  Skip = 'nb-skip',
}

export enum TocClass {
  Headings = 'headings-toc',
  PlainList = 'plain',
}

export enum NavClass {
  Begin = 'begin-nav',
  End = 'end-nav',
}

type DocRoleClass = {
  [key in DocRole]: string;
};

export const DocRoleClass: DocRoleClass = {
  break: 'nb-role-break',
  chapter: 'nb-role-chapter',
  cover: 'nb-role-cover',
  colophon: 'nb-role-colophon',
  other: 'nb-role-other',
};

export enum Id {
  FullTextLink = 'full-text-link',
  Manifest = 'manifest',
}

export enum ChapterId {
  Start = 'chapter-start',
  End = 'chapter-end',
}

export enum Rel {
  Index = 'index',
  License = 'license',
  Publication = 'publication',
  Prev = 'prev',
  Next = 'next',
  Self = 'self',
}

export enum Role {
  DocToc = 'doc-toc',
}

export const classSelector = (classname: string) => '.' + classname;

export type URLFragment = ChapterId.End | 'chunk1' | '';

export enum TagAttr {
  /** Element ref number provided by tagger */
  RefNum = 'data-nb-ref-number',
}

export enum GaugeAttr {
  /** Number of characters provided by gauge */
  Chars = 'data-nb-chars',
  /** Number of words provided by gauge */
  Words = 'data-nb-words',
}

type HTMLCustomMetaElement = Omit<HTMLMetaElement, 'name' | 'content'>;

export interface MetaOrderElement extends HTMLCustomMetaElement {
  name: 'nb-order';
  /** The OrderLike is a string that contains number to be parsed */
  content: OrderLike;
  getAttribute(qualifiedName: 'content'): OrderLike;
}

export interface MetaDocRoleElement extends HTMLCustomMetaElement {
  name: 'nb-role';
  content: DocRole;
  getAttribute(qualifiedName: 'content'): DocRole;
}

export interface MetaIdentifierElement extends HTMLCustomMetaElement {
  name: 'nb-identifier';
  content: Identifier;
  getAttribute(qualifiedName: 'content'): Identifier;
}
