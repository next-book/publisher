/**
 * @jest-environment jsdom
 */

import { markElementsToBeTagged, hasAncestorChunk, tagIdeas, numberEls } from '../../tagger';
import { TagClass as Class, classSelector } from '../../../shared/dom';

describe('hasAncestorChunk', () => {
  it('should return false if the provided NodeList is empty', () => {
    const fragment = document.createDocumentFragment();
    const p = document.createElement('p');
    expect(hasAncestorChunk(p, fragment.childNodes)).toBe(false);
  });

  it('should be false when the tested element is not in the provided list', () => {
    const fragment = document.createDocumentFragment();
    const p = document.createElement('p');
    fragment.appendChild(document.createElement('i'));
    fragment.appendChild(document.createElement('a'));
    expect(hasAncestorChunk(p, fragment.childNodes)).toBe(false);
  });

  it('should be false when the tested element is zero level deep in provided list', () => {
    const fragment = document.createDocumentFragment();
    const p = document.createElement('p');
    fragment.appendChild(p);
    fragment.appendChild(document.createElement('i'));
    fragment.appendChild(document.createElement('a'));
    expect(hasAncestorChunk(p, fragment.childNodes)).toBe(false);
  });

  it('should be false when the tested element is not in the provided list', () => {
    const fragment = document.createDocumentFragment();
    const p = document.createElement('p');
    fragment.appendChild(document.createElement('i'));
    fragment.appendChild(document.createElement('a'));
    expect(hasAncestorChunk(p, fragment.childNodes)).toBe(false);
  });

  it('should be true when the tested element is one level deep in provided list', () => {
    const fragment = document.createDocumentFragment();
    const p = document.createElement('p');
    const div = document.createElement('div');
    div.appendChild(p);
    fragment.appendChild(div);
    fragment.appendChild(document.createElement('a'));
    expect(hasAncestorChunk(p, fragment.childNodes)).toBe(true);
  });

  it('should be true when the tested element is two levels deep in provided list', () => {
    const fragment = document.createDocumentFragment();
    const p = document.createElement('p');
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    div2.appendChild(p);
    div1.appendChild(div2);
    fragment.appendChild(div1);
    fragment.appendChild(document.createElement('a'));
    expect(hasAncestorChunk(p, fragment.childNodes)).toBe(true);
  });

  it('should be false when the inclusive descendant is not the same instance', () => {
    const fragment = document.createDocumentFragment();
    const p = document.createElement('p');
    const div = document.createElement('div');
    div.appendChild(document.createElement('p'));
    fragment.appendChild(div);
    fragment.appendChild(document.createElement('a'));
    expect(hasAncestorChunk(p, fragment.childNodes)).toBe(false);
  });
});

describe('markElementsToBeTagged', () => {
  describe('invalid input', () => {
    it('should throw when selectors are empty array', () => {
      const selectors: string[] = [];
      expect(() => markElementsToBeTagged(document, 'main', selectors)).toThrowError(
        'Selectors cannot be empty array.'
      );
    });

    it('should log error when root is missing', () => {
      const title = document.createElement('title');
      title.appendChild(document.createTextNode('custom title'));
      document.head.appendChild(title);
      const selectors = ['p'];

      expect(() => markElementsToBeTagged(document, 'main', selectors)).toThrowError(
        `No root "main" element found in document titled "custom title".`
      );
    });
  });

  describe('special cases', () => {
    it('should mark nothing when selector is a sibling of root', () => {
      document.body.innerHTML = `<div></div><main></main>`;
      const selectors = ['div'];
      markElementsToBeTagged(document, 'main', selectors);
      expect(document.querySelectorAll('p.chunk').length).toBe(0);
    });

    it('should mark nothing when selector is parent of root', () => {
      document.body.innerHTML = `<div>
        <main>
        </main>
      </div>`;
      const selectors = ['div'];
      markElementsToBeTagged(document, 'main', selectors);
      expect(document.querySelectorAll('p.chunk').length).toBe(0);
    });

    it('should mark nothing when root has skip class', () => {
      document.body.innerHTML = `<main class="nb-skip">
        <p>a</p>
        <p>b</p>
        <p>c</p>
      </main>`;
      const selectors = ['p'];
      markElementsToBeTagged(document, 'main', selectors);
      expect(document.querySelectorAll('p.chunk').length).toBe(0);
    });
  });

  describe('simple cases', () => {
    it('should tag', () => {
      document.body.innerHTML = `<main>
        <p>a</p>
        <p>b</p>
        <p>c</p>
      </main>`;
      const selectors = ['p'];
      markElementsToBeTagged(document, 'main', selectors);
      expect(document.querySelectorAll('.chunk').length).toBe(3);
    });

    it('should mark only not skipped elements', () => {
      document.body.innerHTML = `<main>
        <p>a</p>
        <p class="nb-skip">b</p>
        <p>c</p>
      </main>`;
      const selectors = ['p'];
      markElementsToBeTagged(document, 'main', selectors);
      expect(document.querySelectorAll('p.chunk').length).toBe(2);
    });

    it('should mark only elements outside skipped element', () => {
      document.body.innerHTML = `<main>
        <div>a</div>
        <div class="nb-skip">
          <div>b</div>
          <div>c</div>
        </div>
        <div>d</div>
      </main>`;
      const selectors = ['div'];
      markElementsToBeTagged(document, 'main', selectors);
      expect(document.querySelectorAll('.chunk').length).toBe(2);
      expect(document.querySelectorAll('.nb-skip.chunk').length).toBe(0);
      expect(document.querySelectorAll('.nb-skip > div.chunk').length).toBe(0);
    });

    it('should mark only parents when provided anchestor', () => {
      document.body.innerHTML = `<main>
        <p>a <i>italic</i></p>
        <p>b</p>
        <p>c</p>
      </main>`;
      const selectors = ['i', 'p'];
      markElementsToBeTagged(document, 'main', selectors);
      expect(document.querySelectorAll('p.chunk').length).toBe(3);
      expect(document.querySelectorAll('i.chunk').length).toBe(0);
    });
  });
  describe('complex input', () => {
    it('should ignore skipped elements and nested list', () => {
      document.body.innerHTML = `<main>
        <h1>headline 1</h1>
        <p>a <i>italic</i></p>
        <p>b</p>
        <h2>headline 2</h2>
        <p class="nb-skip otherclass">c</p>
        <p>c</p>
        <ul>
          <li>item 1</li>
          <li>item 2</li>
          <li>item 3</li>
          <li>item 4
            <ul>
              <li>item 4.1</li>
              <li>item 4.2</li>
              <li>item 4.3</li>
            </ul>
          </li>
        </ul>
      </main>`;
      const selectors = ['p', 'li', 'h1', 'h2'];
      markElementsToBeTagged(document, 'main', selectors);
      expect(document.querySelectorAll('p.chunk').length).toBe(3);
      expect(document.querySelectorAll('i.chunk').length).toBe(0);
      expect(document.querySelectorAll('h1.chunk').length).toBe(1);
      expect(document.querySelectorAll('h2.chunk').length).toBe(1);
      expect(document.querySelectorAll('li.chunk').length).toBe(4);
      expect(document.querySelectorAll('li > ul > li.chunk').length).toBe(0);
    });
  });
});

describe('tagIdeas', () => {
  it('tags no idea', () => {
    document.body.innerHTML = `<main>
      <p>long text</p>
    </main>`;
    tagIdeas(document, '\n');
    expect(document.querySelectorAll('span.idea').length).toBe(0);
  });

  it('tags idea', () => {
    document.body.innerHTML = `<main>
      <p class="chunk">long text</p>
    </main>`;
    tagIdeas(document, '\n');
    expect(document.querySelectorAll('p.chunk > span.idea').length).toBe(1);
  });

  it('tags ideas based on newlines', () => {
    document.body.innerHTML = `<main>
      <p class="chunk">long text
      that is actually
      multiline<i>what is this
      text a multiline</i></p>
    </main>`;
    tagIdeas(document, '\n');
    expect(document.querySelectorAll('p.chunk > span.idea').length).toBe(3);
    expect(document.querySelectorAll('p.chunk > i > span.idea').length).toBe(2);
  });

  it('tags ideas based on newlines', () => {
    document.body.innerHTML = `<main><p class="chunk">long text with <i>italic</i> and <q>quote</q></p></main>`;
    tagIdeas(document, '\n');
    expect(document.querySelectorAll('p.chunk span.idea').length).toBe(1);
  });

  it('taggs ideas in chunks', () => {
    document.body.innerHTML = `<main>
      <h1 class="chunk">1</h1>
      <p class="chunk">1
      2 <i>italic</i></p>
      <p class="chunk">3</p>
      <h2 class="chunk">2</h2>
      <p class="nb-skip otherclass">c <a href="/">test link</a></p>
      <p class="chunk">4</p>
      <ul>
        <li class="chunk">1</li>
        <li class="chunk">2




        3
        4

        5

        6
        </li>
        <li class="chunk">7</li>
        <li class="chunk">8
          <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
          </ul>
        </li>
      </ul>
    </main>`;
    tagIdeas(document, '\n');
    expect(document.querySelectorAll('p.chunk > span.idea').length).toBe(4);
    expect(document.querySelectorAll('i.chunk').length).toBe(0);
    expect(document.querySelectorAll('h1.chunk > span.idea').length).toBe(1);
    expect(document.querySelectorAll('h2.chunk > span.idea').length).toBe(1);
    expect(document.querySelectorAll('li > span.idea').length).toBe(8);
    expect(document.querySelectorAll('li > ul > span.idea > li').length).toBe(3);
  });
});

describe('numberEls', () => {
  describe('chunks', () => {
    it('numbers multiple chunks', () => {
      document.body.innerHTML = `<main>
        <p class="chunk"><span class="idea">text<span></p>
        <p class="chunk"><span class="idea">text<span></p>
        <p class="chunk"><span class="idea">text<span></p>
      </main>`;
      numberEls(document, classSelector(Class.Chunk), Class.Chunk);
      const numbered = document.querySelectorAll('*[data-nb-ref-number]');

      expect(numbered[0].getAttribute('data-nb-ref-number')).toBe('1');
      expect(numbered[1].getAttribute('data-nb-ref-number')).toBe('2');
      expect(numbered[2].getAttribute('data-nb-ref-number')).toBe('3');
    });

    it('numbers multiple chunks with nested chunk', () => {
      document.body.innerHTML = `<main>
        <p class="chunk"><span class="idea">text<span>
          <p class="chunk"><span class="idea">text<span></p>
        </p>
        <p class="chunk"><span class="idea">text<span></p>
        <p class="chunk"><span class="idea">text<span></p>
      </main>`;
      numberEls(document, classSelector(Class.Chunk), Class.Chunk);
      const numbered = document.querySelectorAll('*[data-nb-ref-number]');

      expect(numbered[0].getAttribute('data-nb-ref-number')).toBe('1');
      expect(numbered[1].getAttribute('data-nb-ref-number')).toBe('2');
      expect(numbered[2].getAttribute('data-nb-ref-number')).toBe('3');
      expect(numbered[3].getAttribute('data-nb-ref-number')).toBe('4');
    });
  });

  describe('ideas', () => {
    it('adds reference numbers and ids', () => {
      document.body.innerHTML = `<main>
        <p class="chunk"><span class="idea">text<span></p>
        <p class="chunk"><span class="idea">text<span></p>
        <p class="chunk"><span class="idea">text<span></p>
      </main>`;
      numberEls(document, classSelector(Class.Idea), Class.Idea);
      const refs = document.querySelectorAll('span.idea[data-nb-ref-number]');
      const ideas = document.querySelectorAll('.chunk > span[id]');

      expect(refs[0].getAttribute('data-nb-ref-number')).toBe('1');
      expect(refs[1].getAttribute('data-nb-ref-number')).toBe('2');
      expect(refs[2].getAttribute('data-nb-ref-number')).toBe('3');
      expect(ideas[0].getAttribute('id')).toBe('idea1');
      expect(ideas[1].getAttribute('id')).toBe('idea2');
      expect(ideas[2].getAttribute('id')).toBe('idea3');
    });

    it('adds reference numbers and ids when nested chunk provided', () => {
      document.body.innerHTML = `<main>
        <p class="chunk">
          <span class="idea">text<span>
          <p class="chunk">
            <span class="idea">text<span>
          </p>
        </p>
        <p class="chunk">
          <span class="idea">text<span>
        </p>
        <p class="chunk">
          <span class="idea">text<span>
        </p>
      </main>`;
      numberEls(document, classSelector(Class.Idea), Class.Idea);
      const refs = document.querySelectorAll('span.idea[data-nb-ref-number]');
      const ideas = document.querySelectorAll('span[id]');

      expect(ideas[0].getAttribute('id')).toBe('idea1');
      expect(ideas[1].getAttribute('id')).toBe('idea2');
      expect(ideas[2].getAttribute('id')).toBe('idea3');
      expect(ideas[3].getAttribute('id')).toBe('idea4');
      expect(refs[0].getAttribute('data-nb-ref-number')).toBe('1');
      expect(refs[1].getAttribute('data-nb-ref-number')).toBe('2');
      expect(refs[2].getAttribute('data-nb-ref-number')).toBe('3');
      expect(refs[3].getAttribute('data-nb-ref-number')).toBe('4');
    });
  });
});

describe('tagDocument', () => {});
