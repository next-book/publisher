/**
 * @jest-environment jsdom
 */
import {
  addChapterStartAnchor,
  addChapterEndAnchor,
  addFullTextUrl,
  addChapterInPageNavigation,
  createLink,
} from '../../chapter-navigation';
import { Rel } from '../../../shared/dom';

describe('addChapterInPageNavigation', () => {
  it('should throw when root is missing', () => {
    expect(() => addChapterInPageNavigation(document, 'main')).toThrowError(
      `The document does not contain expected root "main".`
    );
  });
  it('should throw when self reference is missing', () => {
    document.body.innerHTML = `
        <main>
          <span>content HTML</span>
        </main>
      `;
    expect(() => addChapterInPageNavigation(document, 'main')).toThrowError(
      `The document does not contain expected self reference.`
    );
  });
  it('should add navigation on non-index page', () => {
    document.head.innerHTML = `
        <link rel="self" href="some-chapter.html">
        <link rel="index" href="index.html">
        <link rel="prev" href="prev.html">
        <link rel="next" href="next.html">
      `;
    document.body.innerHTML = `
        <main>
          <span>content HTML</span>
        </main>
      `;
    addChapterInPageNavigation(document, 'main');
    expect(document.querySelector('main nav:first-child')?.outerHTML).toBe(
      `<nav class="begin-nav">` +
        '<ul>' +
        `<li><a href="index.html#" rel="index">Title</a></li>` +
        `<li><a href="prev.html#chapter-end" rel="prev">← Previous chapter</a></li>` +
        '</ul>' +
        '</nav>'
    );
    expect(document.querySelector('main nav:last-child')?.outerHTML).toBe(
      `<nav class="end-nav">` +
        '<ul>' +
        `<li><a href="index.html#" rel="index">Title</a></li>` +
        `<li><a href="next.html#chunk1" rel="next">Next chapter →</a></li>` +
        '</ul>' +
        '</nav>'
    );
  });
  it('should add chapter navigation on index page', () => {
    document.head.innerHTML = `
        <link rel="self" href="index.html">
        <link rel="index" href="index.html">
        <link rel="prev" href="index.html">
        <link rel="next" href="next.html">
      `;
    document.body.innerHTML = `
        <main>
          <span>content HTML</span>
        </main>
      `;
    addChapterInPageNavigation(document, 'main');
    expect(document.querySelector('main nav:last-child')?.outerHTML).toBe(
      `<nav class="end-nav">` +
        '<ul>' +
        `<li><a href="index.html#" rel="index">Title</a></li>` +
        `<li><a href="next.html#chunk1" rel="next">Next chapter →</a></li>` +
        '</ul>' +
        '</nav>'
    );
  });
});

describe('createLink', () => {
  it('should throw when link relation is missing', () => {
    expect(() => createLink(document, Rel.Index, '', 'link text', () => {})).toThrowError(
      'The document does not contain expected link relation "index".'
    );
  });
  it('should throw error when link hypertext reference attribute is missing', () => {
    document.head.innerHTML = `<link rel="index">`;
    expect(() => createLink(document, Rel.Index, '', 'link text', () => {})).toThrowError(
      'The link relation "index" does not contain href.'
    );
  });
});

describe('addChapterStartAnchor', () => {
  it('should throw when root is missing', () => {
    expect(() => addChapterStartAnchor(document, 'main')).toThrowError(
      `The document does not contain expected root "main".`
    );
  });
  it('should prepend anchor into the root', () => {
    document.body.innerHTML = `
        <main>
          <span>content HTML</span>
        </main>
        `;
    addChapterStartAnchor(document, 'main');
    expect(document.querySelector('main *:first-child')?.outerHTML).toBe(
      '<a id="chapter-start"></a>'
    );
  });
});

describe('addChapterEndAnchor', () => {
  it('should throw when root is missing', () => {
    expect(() => addChapterEndAnchor(document, 'main')).toThrowError(
      `The document does not contain expected root "main".`
    );
  });
  it('should append anchor into the root', () => {
    document.body.innerHTML = `
        <main>
          <span>content HTML</span>
        </main>
        `;
    addChapterEndAnchor(document, 'main');
    expect(document.querySelector('main *:last-child')?.outerHTML).toBe('<a id="chapter-end"></a>');
  });
});

describe('addFullTextUrl', () => {
  it('should throw when root is missing', () => {
    expect(() => addFullTextUrl(document, 'CUSTOM-URL', 'main')).toThrowError(
      `The document does not contain expected root "main".`
    );
  });
  it('should add full text link on home page', () => {
    document.body.className = 'home';
    document.body.innerHTML = `
        <main>
          <span>content HTML</span>
        </main>
        `;
    addFullTextUrl(document, 'CUSTOM-URL', 'main');
    expect(document.querySelector('main > p:first-child')?.outerHTML).toBe(
      `<p id="full-text-link"><a href="CUSTOM-URL">Toto je ukázka. Pro zobrazení plné verze knihy následujte tento odkaz.</a></p>`
    );
  });
  it('should add full text link on non-home page', () => {
    document.body.className = ``;
    document.body.innerHTML = `
        <main>
          <span>content HTML</span>
        </main>
        `;
    addFullTextUrl(document, 'CUSTOM-URL', 'main');
    expect(document.querySelector('main > p:last-child')?.outerHTML).toBe(
      `<p id="full-text-link"><a href="CUSTOM-URL">Toto je ukázka. Pro zobrazení plné verze knihy následujte tento odkaz.</a></p>`
    );
  });
});
