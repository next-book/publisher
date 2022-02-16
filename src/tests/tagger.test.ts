/**
 * @jest-environment jsdom
 */

import { markElementsToBeTagged } from '../tagger';

describe('tagDocument', () => {});

describe('markElementsToBeTagged', () => {
  describe('invalid input', () => {
    it('should throw when selectors are empty array', () => {
      const selectors: string[] = [];

      expect(() => markElementsToBeTagged(document, 'main', selectors)).toThrowError(
        'Selectors cannot be empty array.'
      );
    });

    it('should log error when root is missing', () => {
      const consoleSpy = jest.spyOn(console, 'error');

      const title = document.createElement('title');
      title.appendChild(document.createTextNode('custom title'));
      document.head.appendChild(title);
      const selectors = ['p'];
      markElementsToBeTagged(document, 'main', selectors);

      expect(consoleSpy).toHaveBeenCalledWith(
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
