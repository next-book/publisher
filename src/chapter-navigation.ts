import i18n from './i18n';
import { DOMStringLike } from './utils/dom';

/**
 * Adds navigation between chapters (prev chapter link at the beggining and
 * next chapter link at the end) to a provided list of documents (chapters).
 *
 * @param chapters - Array of Documents each representing a chapter
 * @param root - DOMString for selecting content root
 */
export function addChapterInPageNavigation(chapters: Document[], root: DOMStringLike): void {
  chapters.forEach(doc => {
    const content = doc.querySelector(root);
    const self = doc.querySelector('[rel="self"]')?.getAttribute('href');
    if (!content) return;

    const beginNav = createNavFragment(doc, 'begin-nav');
    const endNav = createNavFragment(doc, 'end-nav');

    createLink(doc, 'index', '', i18n.t('navigation:title-page'), anchor => {
      appendLinkToNav(doc, beginNav, anchor.cloneNode(true));
      appendLinkToNav(doc, endNav, anchor.cloneNode(true));
    });

    createLink(doc, 'prev', 'chapter-end', `← ${i18n.t('navigation:prev-chapter')}`, anchor => {
      appendLinkToNav(doc, beginNav, anchor);
    });

    createLink(doc, 'next', 'chunk1', `${i18n.t('navigation:next-chapter')} →`, anchor => {
      appendLinkToNav(doc, endNav, anchor);
    });

    if (self !== 'index.html') content.insertBefore(beginNav, content.firstChild);
    content.appendChild(endNav);
  });
}

function createNavFragment(doc: Document, className: string): DocumentFragment {
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

function createLink(
  doc: Document,
  rel: string,
  urlFragment: string,
  text: string,
  callback: (anchor: Node) => void
) {
  const el: HTMLAnchorElement | null = doc.querySelector(`link[rel="${rel}"]`);

  if (el && el.href) {
    const a = doc.createElement('a');
    a.setAttribute('href', `${el.getAttribute('href')}#${urlFragment}`);
    a.setAttribute('rel', rel);
    a.innerHTML = text;

    callback(a);
  }
}

export function addChapterStartAnchor(documents: Document[], root: DOMStringLike): void {
  documents.forEach(doc => {
    const content = doc.querySelector(root);
    if (!content) return;

    anchor.setAttribute('id', 'chapter-start');
    const anchor = doc.createElement('a');

    doc.querySelector(root)?.insertBefore(anchor, content.firstChild);
  });
}

export function addChapterEndAnchor(documents: Document[], root: DOMStringLike): void {
  documents.forEach(doc => {
    const content = doc.querySelector(root);
    if (!content) return;

    anchor.setAttribute('id', 'chapter-end');
    const anchor = doc.createElement('a');

    content.appendChild(anchor);
  });
}

export function addFullTextUrl(documents: Document[], url: string, root: DOMStringLike): void {
  documents.forEach(doc => {
    const content = doc.querySelector(root);
    if (!content) return;

    p.setAttribute('id', 'full-text-link');
    const p = doc.createElement('p');

    const anchor = doc.createElement('a');
    anchor.setAttribute('href', url);
    anchor.innerHTML = `Toto je ukázka. Pro zobrazení plné verze knihy následujte tento odkaz.`; // todo: translate
    p.appendChild(anchor);

    if (doc.querySelector('body')?.getAttribute('class') === 'home') {
      content.insertBefore(p, content.firstChild);
    } else {
      content.appendChild(p);
    }
  });
}
