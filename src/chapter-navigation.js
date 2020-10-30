const i18n = require('./i18n');

function addChapterInPageNavigation(documents, root) {
  documents.forEach(doc => {
    if (!doc.querySelector(root)) return;

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

    const content = doc.querySelector(root);
    content.insertBefore(beginNav, content.firstChild);
    content.appendChild(endNav);
  });
}

function createNavFragment(doc, className) {
  const nav = doc.createElement('NAV');
  nav.classList.add(className);

  const fragment = doc.createDocumentFragment();
  fragment.appendChild(nav);

  return fragment;
}

function appendLinkToNav(doc, navFragment, link) {
  const nav = navFragment.firstChild;

  const li = doc.createElement('LI');
  li.appendChild(link);

  if (nav.firstChild && nav.firstChild.tagName === 'UL') {
    nav.firstChild.appendChild(li);
  } else {
    const ul = doc.createElement('UL');
    ul.appendChild(li);

    nav.appendChild(ul);
  }
}

function createLink(doc, rel, urlFragment, text, callback) {
  const el = doc.querySelector(`link[rel="${rel}"]`);

  if (el && el.href) {
    const a = doc.createElement('A');
    a.setAttribute('href', `${el.getAttribute('href')}#${urlFragment}`);
    a.setAttribute('rel', rel);
    a.innerHTML = text;

    callback(a);
  }
}

function addChapterStartAnchor(documents, root) {
  documents.forEach(doc => {
    console.log(root);
    if (!doc.querySelector(root)) return;

    const anchor = doc.createElement('A');
    anchor.setAttribute('id', 'chapter-start');

    doc.querySelector(root).insertBefore(anchor, doc.querySelector(root).firstChild);
  });
}

function addChapterEndAnchor(documents, root) {
  documents.forEach(doc => {
    if (!doc.querySelector(root)) return;

    const anchor = doc.createElement('A');
    anchor.setAttribute('id', 'chapter-end');

    doc.querySelector(root).appendChild(anchor);
  });
}

function addFullTextUrl(documents, url, root) {
  documents.forEach(doc => {
    if (!doc.querySelector(root)) return;

    const p = doc.createElement('P');
    p.setAttribute('id', 'full-text-link');

    const anchor = doc.createElement('A');
    anchor.setAttribute('href', url);
    anchor.innerHTML = `Toto je ukázka. Pro zobrazení plné verze knihy následujte tento odkaz.`;
    p.appendChild(anchor);

    if (doc.querySelector('body').getAttribute('class') === 'home') {
      const content = doc.querySelector(root);
      content.insertBefore(p, content.firstChild);
    } else {
      doc.querySelector(root).appendChild(p);
    }
  });
}

module.exports = {
  addChapterInPageNavigation,
  addChapterStartAnchor,
  addChapterEndAnchor,
  addFullTextUrl,
};
