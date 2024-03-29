import { t } from './i18n';
import { DOMStringLike } from './utils/dom';
import { Id, Rel, PageClass, URLFragment, NavClass, ChapterId } from '../shared/dom';

/**
 * Adds navigation between chapters (prev chapter link at the beggining and
 * next chapter link at the end) to a provided list of documents (chapters).
 *
 * @param doc - Document representing a chapter
 * @param root - DOMString for selecting content root
 */
export function addChapterInPageNavigation(doc: Document, root: DOMStringLike): void {
  const content = doc.querySelector(root);
  if (!content) throw new Error(`The document does not contain expected root "${root}".`);
  const self = doc.querySelector<HTMLLinkElement>('link[rel="self"]')?.getAttribute('href');
  if (!self) throw new Error(`The document does not contain expected self reference.`);

  const beginNav = createNavFragment(doc, NavClass.Begin);
  const endNav = createNavFragment(doc, NavClass.End);

  createLink(doc, Rel.Index, '', t('navigation:title-page'), anchor => {
    appendLinkToNav(doc, beginNav, anchor.cloneNode(true));
    appendLinkToNav(doc, endNav, anchor.cloneNode(true));
  });

  createLink(doc, Rel.Prev, ChapterId.End, `← ${t('navigation:prev-chapter')}`, anchor => {
    appendLinkToNav(doc, beginNav, anchor);
  });

  createLink(doc, Rel.Next, 'chunk1', `${t('navigation:next-chapter')} →`, anchor => {
    appendLinkToNav(doc, endNav, anchor);
  });

  if (self !== 'index.html') content.insertBefore(beginNav, content.firstChild);
  content.appendChild(endNav);
}

function createNavFragment(doc: Document, className: NavClass): DocumentFragment {
  const nav = doc.createElement('nav');
  nav.classList.add(className);

  const fragment = doc.createDocumentFragment();
  fragment.appendChild(nav);

  return fragment;
}

function appendLinkToNav(doc: Document, navFragment: DocumentFragment, link: Node) {
  const nav = navFragment.firstChild;
  if (!nav) return;
  const navFirstChild = <HTMLElement | null>nav.firstChild;
  const li = doc.createElement('li');
  li.appendChild(link);

  if (navFirstChild && navFirstChild.tagName === 'UL') {
    navFirstChild.appendChild(li);
  } else {
    const ul = doc.createElement('ul');
    ul.appendChild(li);
    nav.appendChild(ul);
  }
}

export function createLink(
  doc: Document,
  rel: Rel,
  urlFragment: URLFragment,
  text: string,
  callback: (anchor: Node) => void
) {
  const el = doc.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) throw new Error(`The document does not contain expected link relation "${rel}".`);
  if (!el.href) throw new Error(`The link relation "${rel}" does not contain href.`);

  const a = doc.createElement('a');
  a.setAttribute('href', `${el.getAttribute('href')}#${urlFragment}`);
  a.setAttribute('rel', rel);
  a.innerHTML = text;

  callback(a);
}

export function addChapterStartAnchor(doc: Document, root: DOMStringLike): void {
  const content = doc.querySelector(root);
  if (!content) throw new Error(`The document does not contain expected root "${root}".`);

  const anchor = doc.createElement('a');
  anchor.setAttribute('id', ChapterId.Start);

  doc.querySelector(root)?.insertBefore(anchor, content.firstChild);
}

export function addChapterEndAnchor(doc: Document, root: DOMStringLike): void {
  const content = doc.querySelector(root);
  if (!content) throw new Error(`The document does not contain expected root "${root}".`);
  const anchor = doc.createElement('a');
  anchor.setAttribute('id', ChapterId.End);

  content.appendChild(anchor);
}

export function addFullTextUrl(doc: Document, url: string, root: DOMStringLike): void {
  const content = doc.querySelector(root);
  if (!content) throw new Error(`The document does not contain expected root "${root}".`);

  const p = doc.createElement('p');
  p.setAttribute('id', Id.FullTextLink);

  const anchor = doc.createElement('a');
  anchor.setAttribute('href', url);
  anchor.innerHTML = `Toto je ukázka. Pro zobrazení plné verze knihy následujte tento odkaz.`; // todo: translate
  p.appendChild(anchor);

  if (doc.querySelector('body')?.getAttribute('class') === PageClass.Home) {
    content.insertBefore(p, content.firstChild);
  } else {
    content.appendChild(p);
  }
}
