function addChapterInPageNavigation(documents) {
  documents.forEach(doc => {
    const beginNav = createNavFragment(doc, 'begin-nav');
    const endNav = createNavFragment(doc, 'end-nav');

    createLink(doc, 'index', '', 'Home', anchor => {
      appendLinkToNav(doc, beginNav, anchor.cloneNode(true));
      appendLinkToNav(doc, endNav, anchor.cloneNode(true));
    });

    createLink(doc, 'prev', 'chapter-end', '←', anchor => {
      appendLinkToNav(doc, beginNav, anchor);
    });

    createLink(doc, 'next', 'chunk1', '→', anchor => {
      appendLinkToNav(doc, endNav, anchor);
    });

    const content = doc.querySelector('.content');
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

function addChapterEndAnchor(documents) {
  documents.forEach(doc => {
    const anchor = doc.createElement('A');
    anchor.setAttribute('id', 'chapter-end');

    doc.querySelector('.content').appendChild(anchor);
  });
}

function addFullTextUrl(documents, url) {
  documents.forEach(doc => {
    const p = doc.createElement('P');
    p.setAttribute('id', 'full-text-link');

    const anchor = doc.createElement('A');
    anchor.setAttribute('href', url);
    anchor.innerHTML = `Toto je ukázka. Pro zobrazení plné verze knihy následujte tento odkaz.`;
    p.appendChild(anchor);

    if (doc.querySelector('body').getAttribute('class') === 'home') {
      const content = doc.querySelector('.content');
      content.insertBefore(p, content.firstChild);
    } else {
      doc.querySelector('.content').appendChild(p);
    }
  });
}

module.exports = {
  addChapterInPageNavigation,
  addChapterEndAnchor,
  addFullTextUrl,
};
