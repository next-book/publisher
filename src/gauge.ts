
/**
 * Names of attributes used to store gauge data.
 */
const attrNames = {
  /** Number of characters */
  chars: 'data-nb-chars',
  /** Number of words */
  words: 'data-nb-words',
};

/**
 * Sum of values stored in attribute of provided elements.
 *  
 * @param attr - The attribute name
 * @returns Sum of values stored in attribute
 */
const sumAttr = (attr: string) => (ideas: NodeListOf<Element>):number =>
(ideas as unknown as HTMLElement[]).reduce((acc: number, idea: Element) => acc + parseInt(idea.getAttribute(attr) as string, 10), 0);

/**
 * Sets sum of values stored in atribute to a same-called attribute 
 * of provided element.
 * 
 * @param attr - The attribute name
 * @returns Mutates DOM. Sets the sum in the provided attribute of the element.
 */
const setSumAttr = (attr: string) => (el: HTMLElement):void => {
  el.setAttribute(attr, sumAttr(attr)(el.querySelectorAll('.idea')).toString());
}

/**
 * Counts number of characters of each `.idea` element and stores the value
 * idea’s attribute.
 *  
 * @param document - DOM Document
 * @returns Mutates DOM. Sets number of characters in the idea’s attribute.
 */
function countChars(document: Document):void {
  Array.prototype.map.call(document.querySelectorAll('.idea'), idea => {
    idea.setAttribute(attrNames.chars, idea.textContent.length);
  });
}

function countWords(document: Document):void {
  Array.prototype.map.call(document.querySelectorAll('.idea'), idea => {
    idea.setAttribute(attrNames.words, idea.textContent.split(/\s+/g).length);
  });
}

function gaugeContent(
    document: Document,
    attr: string,
    gaugeFn: (doc: Document) => void
  ):void {
    gaugeFn(document);
    setSumAttr(attr)(document.body);
    Array.prototype.forEach.call(
      document.querySelectorAll('.chunk'),
      setSumAttr(attr)
    );
}

/**
 * Gauges words and characters in a document.
 * 
 * @param document - DOM Document
 * @returns Modifies DOM document
 */
export function gaugeDocument(document: Document): void {
  gaugeContent(document, attrNames.words, countWords);
  gaugeContent(document, attrNames.chars, countChars);
}

type DocumentStats = {
  words: number;
  chars: number;
  ideas: number
}

type PublicationStats = DocumentStats[];

/**
 * Gauges words and characters in a publication. Relies on previous gauging of
 * individual chunks using {@link gaugeDocument}.
 * 
 * @param documents - DOM Documents
 * @returns Array of objects representing each document statistics.
 */
export function gaugePublication(documents: Document[]): PublicationStats {
  return documents.map(document => ({
    words: parseInt(document.body.getAttribute(attrNames.words) as string, 10),
    chars: parseInt(document.body.getAttribute(attrNames.chars) as string, 10),
    ideas: document.querySelectorAll('.idea').length,
  }));
}
