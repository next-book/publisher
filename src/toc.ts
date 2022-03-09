/**
 * Toc: generates a table of contents by searching for headers in documents
 * @module
 */
import { JSDOM as Jsdom } from 'jsdom';
import { DocumentMetadata, Heading, HeadingLevel } from '../shared/manifest';
import { TagClass, TocClass, Role } from '../shared/dom';

export type TocBase = TocBaseItem[];

type ListType = 'plain' | 'numbered' | 'bulleted';

export type TocBaseItem = {
  isSection?: boolean;
  title?: string;
  link?: string;
  children?: TocBase;
  listType?: ListType;
};

/**
 * Generates a table of contents tree from headings in a Document.
 *
 * @param doc - Document
 * @returns A tree-like structure representing table of contents.
 */
export default function getDocumentToc(doc: Document): Heading[] {
  const headings = <HTMLHeadingElement[]>[
    ...doc.querySelectorAll(
      [...Array(6)].map((v, i) => 'h' + (i + 1) + '.' + TagClass.Chunk + ' ').toString()
    ),
  ];
  return headings
    .map(fetchHeading)
    .map(nestChildren)
    .filter(heading => heading.level === 1);
}

function fetchHeading(heading: HTMLHeadingElement, index: number): Heading {
  return {
    index,
    /**
     * In getToc, we query only heading elements, hence we can assert
     * the HeadingLevel type.
     */

    level: parseInt(heading.tagName.charAt(1), 10) as HeadingLevel,
    name: heading.textContent ? heading.textContent.trim() : null,
    id: heading.getAttribute('id'),
    children: [],
  };
}

function nestChildren(heading: Heading, _index: number, list: Heading[]): Heading {
  heading.children = getChildren(list, heading);
  return heading;
}

function getChildren(list: Heading[], currentRoot: Heading): Heading[] {
  let returnedToLevel = false;

  return list
    .filter(heading => {
      if (returnedToLevel || isTheNextHeadingOnSameLevel(heading, currentRoot)) {
        returnedToLevel = true;
        return false;
      }

      return true;
    })
    .filter(heading => isOneLevelLower(heading, currentRoot));
}

function isOneLevelLower(heading: Heading, currentRoot: Heading): boolean {
  return heading.level === currentRoot.level + 1 && heading.index > currentRoot.index;
}

function isTheNextHeadingOnSameLevel(heading: Heading, currentRoot: Heading): boolean {
  return heading.index > currentRoot.index && currentRoot.level === heading.level;
}

/**
 * Generates a table of contents for the whole book. If there’s no tocBase,
 * uses the metadata based on readingOrder filelist.
 *
 * @param meta - Metadata collected from all documents, including document TOCs
 * @param tocBase - Basic TOC structure (without document TOCs)
 * @returns Document fragment to be included on top of every document
 */

export function getToc(meta: DocumentMetadata[], tocBase?: TocBase): DocumentFragment {
  const root = Jsdom.fragment('<nav role="' + Role.DocToc + '"></nav>');
  const nav = root.querySelector('nav');

  if (tocBase)
    tocBase.map(item => renderTocItem(item, meta, true)).forEach(el => el && nav?.appendChild(el));
  else {
    const ul = Jsdom.fragment('<ul></ul>');
    const items = meta.map(renderTocItemFromMeta);
    items.forEach(el => el && ul.appendChild(el));
    nav?.appendChild(ul);
  }

  return root;
}

function renderTocItemFromMeta(meta: DocumentMetadata): DocumentFragment {
  const root = Jsdom.fragment('<li><a href=""></a></li>');
  const link = root.querySelector('a') as HTMLAnchorElement;

  link.setAttribute('href', meta.file);
  link.innerHTML = meta.title || '—';

  return root;
}

function renderTocItem(
  item: TocBaseItem,
  meta: DocumentMetadata[],
  topLevel = false
): DocumentFragment {
  const childrenWrapper = renderChildren(item, meta);
  if (item.isSection) return childrenWrapper;

  const root = Jsdom.fragment('<li><a href=""></a></li>');
  const li = root.querySelector('li') as HTMLElement;
  const link = root.querySelector('a') as HTMLAnchorElement;

  if (item.link && item.title) {
    link.setAttribute('href', item.link);
    link.innerHTML = item.title;
  }

  const docMeta = meta.find(doc => doc.file === item.link);
  if (docMeta?.toc[0]?.children?.length && docMeta?.toc[0]?.children?.length > 0) {
    li.appendChild(renderDocumentToc(docMeta.toc[0].children, docMeta.file));
  }

  if (item.children && item.children.length) {
    li.appendChild(childrenWrapper);
  }

  if (topLevel) {
    const topLevelWrapper = Jsdom.fragment('<ul></ul>');
    const ul = topLevelWrapper.querySelector('ul') as HTMLElement;
    ul.appendChild(root);

    return topLevelWrapper;
  }

  return root;
}

function renderChildren(item: TocBaseItem, meta: DocumentMetadata[]): DocumentFragment {
  const { children, isSection, listType } = item;

  const childrenWrapper =
    isSection === true || listType === 'plain'
      ? Jsdom.fragment('<ul class="' + TocClass.PlainList + '"></ul>')
      : listType === 'numbered'
      ? Jsdom.fragment('<ol></ol>')
      : Jsdom.fragment('<ul></ul>');

  if (children && children.length) {
    const childrenWrapperEl = childrenWrapper.querySelector('ol, ul') as HTMLElement;

    children
      .map(item => renderTocItem(item, meta))
      .forEach(el => el && childrenWrapperEl.appendChild(el));
  }

  return childrenWrapper;
}

function renderDocumentToc(headings: Heading[], file: string): DocumentFragment {
  const root = Jsdom.fragment('<ol class="' + TocClass.Headings + '"></ol>');
  const ol = root.querySelector('ol') as HTMLElement;

  headings.map(h => {
    const frag = Jsdom.fragment('<li><a href=""></a></li>');
    const li = frag.querySelector('li') as HTMLElement;
    const link = frag.querySelector('a') as HTMLElement;

    link.setAttribute('href', `${file}#${h.id}`);
    link.innerHTML = h.name || '—';

    if (h.children && h.children.length) {
      li.appendChild(renderDocumentToc(h.children, file));
    }

    ol.appendChild(frag);
  });

  return root;
}
