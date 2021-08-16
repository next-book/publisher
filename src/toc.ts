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
    .filter(heading => heading.level === 1);
}

function fetchHeadingAttributes(heading: HTMLHeadingElement, index: number): HeadingAttributes {
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

function nestChildren(heading: HeadingAttributes, _index: number, list: HeadingAttributes[]): HeadingAttributes {
  heading.children = getChildren(list, heading);
  return heading;
}

function getChildren(list: HeadingAttributes[], currentRoot: HeadingAttributes): HeadingAttributes[] {
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

function isOneLevelLower(heading: HeadingAttributes, currentRoot: HeadingAttributes): boolean {
  return heading.level === currentRoot.level + 1 && heading.index > currentRoot.index;
}

function isTheNextHeadingOnSameLevel(heading: HeadingAttributes, currentRoot: HeadingAttributes): boolean {
  return heading.index > currentRoot.index && currentRoot.level === heading.level;
}
