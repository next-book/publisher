import { DocRole, Identifier, LanguageCode, OrderLike } from './manifest';

/**
 * Renamed literals help with finding functions that operate with same values
 */

/** The IdeaId is a string in the format of idea1, idea2, idea3 ... */
type IdeaId = string;

type LinkUrl = string;

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
  Excluded = 'excluded',
  Section = 'section',
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
  Idea = 'idea',
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
type HTMLCustomLinkElement = Omit<HTMLLinkElement, 'rel' | 'href'>;
type HTMLCustomHtmlElement = Omit<HTMLHtmlElement, 'lang'>;

export enum StateClass {
  Ready = 'nb-ready',
}

export enum FootnotesClass {
  Wrapper = 'footnotes',
}

export enum CropClass {
  Wrapper = 'nb-cropped',
  Visible = 'visible',
}

export enum PaginationClass {
  Forward = 'step-forward',
  Back = 'step-back',
}

export enum ComponentClass {
  Annotations = 'nb-annotations',
  Navigation = 'nb-navigation',
  Position = 'nb-position',
  Manifest = 'nb-manifest',
  Peeks = 'nb-peeks',
  Trace = 'nb-trace',
  Offline = 'nb-offline',
  Controls = 'nb-controls',
  Config = 'nb-config',
  Onboarding = 'nb-onboarding',
  Research = 'nb-research',
}

export enum MetaName {
  Order = 'nb-order',
  DocRole = 'nb-role',
  Identifier = 'nb-identifier',
}

export enum ResearchMetaName {
  Text = 'nb-research',
  Orgs = 'nb-research-orgs',
  GA = 'nb-research-ga',
}

export enum LinkRel {
  Index = 'index',
  Self = 'self',
  Prev = 'prev',
  Publication = 'publication',
  Next = 'next',
  Colophon = 'colophon',
  License = 'license',
}

/**
 * Meta elements
 */
export interface MetaOrderElement extends HTMLCustomMetaElement {
  name: MetaName.Order;
  content: OrderLike;
  getAttribute(qualifiedName: 'content'): OrderLike | null;
}

export interface MetaDocRoleElement extends HTMLCustomMetaElement {
  name: MetaName.DocRole;
  content: DocRole;
  getAttribute(qualifiedName: 'content'): DocRole | null;
}

export interface MetaIdentifierElement extends HTMLCustomMetaElement {
  name: MetaName.Identifier;
  content: Identifier;
  getAttribute(qualifiedName: 'content'): Identifier | null;
}

export interface ResearchMetaElement extends HTMLCustomMetaElement {
  name: ResearchMetaName;
  content: string;
  getAttribute(qualifiedName: 'content'): string | null;
}

export interface LinkElement extends HTMLCustomLinkElement {
  rel: LinkRel;
  href: LinkUrl;
  getAttribute(qualifiedName: 'href'): LinkUrl | null;
}

export interface LangElement extends HTMLCustomHtmlElement {
  lang: LanguageCode;
  getAttribute(qualifiedName: 'lang'): LanguageCode | null;
}

export interface BodyElement extends HTMLBodyElement {
  [GaugeAttr.Chars]: string;
  [GaugeAttr.Words]: string;
  getAttribute(qualifiedName: GaugeAttr): string | null;
}

export interface CustomDocTocElement extends HTMLDivElement {
  role: Role.DocToc;
}

export const getIdeaId = (n: number): IdeaId => TagClass.Idea + n.toString();

export interface IdeaElement extends HTMLSpanElement {
  className: TagClass.Idea | `${TagClass.Idea} highlited`;
  id: IdeaId;
  [TagAttr.RefNum]: string;
  [GaugeAttr.Chars]: string;
  [GaugeAttr.Words]: string;
}
