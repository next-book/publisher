type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingAttributes {
  index: number;
  level: HeadingLevel;
  name: string | null;
  id: string | null;
  children: HeadingAttributes[],
}

/**
 * Generates a table of contents tree from headings in a Document.
 * 
 * @param doc - Document
 * @returns A tree-like structure representing table of contents.  
 */
export default function getToc(doc: Document): HeadingAttributes[] {
  const headings = <HTMLHeadingElement[]>[...doc.querySelectorAll(
      'h1.chunk, h2.chunk, h3.chunk, h4.chunk, h5.chunk, h6.chunk'
    )];
  return headings
    .map(fetchHeadingAttributes)
    .map(nestChildren)
    .filter(header => header.level === 1);
}

function fetchHeadingAttributes(header: HTMLHeadingElement, index: number): HeadingAttributes {
  return {
    index,
    /**
     * In getToc, we query only heading elements, hence we can assert
     * the HeadingLevel type.  
     */ 
    level: parseInt(header.tagName.charAt(1), 10) as HeadingLevel,
    name: header.textContent ? header.textContent.trim() : null,
    id: header.getAttribute('id'),
    children: [],
  };
}

function nestChildren(header: HeadingAttributes, _index: number, list: HeadingAttributes[]): HeadingAttributes {
  header.children = getChildren(list, header);
  return header;
}

function getChildren(list: HeadingAttributes[], currentRoot: HeadingAttributes): HeadingAttributes[] {
  let returnedToLevel = false;

  return list
    .filter(header => {
      if (returnedToLevel || isTheNextHeaderOnSameLevel(header, currentRoot)) {
        returnedToLevel = true;
        return false;
      }

      return true;
    })
    .filter(header => isOneLevelLower(header, currentRoot));
}

function isOneLevelLower(header: HeadingAttributes, currentRoot: HeadingAttributes): boolean {
  return header.level === currentRoot.level + 1 && header.index > currentRoot.index;
}

function isTheNextHeaderOnSameLevel(header: HeadingAttributes, currentRoot: HeadingAttributes): boolean {
  return header.index > currentRoot.index && currentRoot.level === header.level;
}
