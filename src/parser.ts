/**
 * Parser: parses a DOM Node (resp HTML Element) to be later used in producer
 * to update HTML for next-book specific use cases.
 * @module
 */
import {ParsedObj, Ideas} from './structures';
import { Delimiter } from './config';

export class Separator {}

/**
 * Returns ParsedObj which contains original node and an array of arrays in 
 * which every array represents one idea or ParsedObj. Ideas are delimited with 
 * a delimiter that is searched for in text nodes.
 * 
 * @param node - DOM Node or HTML Element
 * @param delimiter - The delimiter 
 * @returns An instance of {@link ParsedObj}
 */
export default function parse(node: Node|HTMLElement, delimiter: Delimiter): ParsedObj {
  const pieces: (Node | string | Separator)[] = [];
  // first create a flat list of strings, HTML Elements, ParsedObjs, and Separators
  node.childNodes.forEach((child) => {
    if (child.nodeType === child.TEXT_NODE) {
      let texts: string[] = [];
      if (child.textContent) {
        texts = child.textContent.split(delimiter);
      }
      texts.forEach((text, index) => {
        pieces.push(text);
        // if last, push separator
        if (texts.length - 1 !== index) pieces.push(new Separator());
      });
    } else if (child.nodeType === child.ELEMENT_NODE) {
      if (child.textContent && nodeBreaksInside(child.textContent, delimiter))
        pieces.push(parse(child, delimiter));
      else
        pieces.push(child);
    }
  });

  // cluster pieces into ideas based on
  const ideas = new Ideas();

  pieces.forEach(piece => {
    const isSeparator = piece instanceof Separator;
    const isParsedObj = piece instanceof ParsedObj;
    
    // if (DEBUG) {
    //   let message = isSeparator ? 'separator' : ''; 
    //   message = isParsedObj ? 'parsedObj' : ''; 
    //   message = (!isParsedObj && !isSeparator) ? 'Node|string' : ''; 
    //   console.log(piece, message);
    // }
   
    if (isSeparator) ideas.addIdea(); // appends empty array
    if (isParsedObj) ideas.addObj(<ParsedObj>piece); // appends parsedObj 
    else ideas.appendToIdea(piece); // appends Node|string
  });

  return new ParsedObj(node, ideas.fetch(), delimiter);
}

function nodeBreaksInside(text: string, delimiter: string) {
  return new RegExp(delimiter.replace('\\', '\\\\')).test(text);
}
