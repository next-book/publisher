/**
 * Parser: parses a DOM Node (resp HTML Element) to be later used in producer
 * to update HTML for next-book specific use cases.
 * @module
 */
import { ParsedObj, Ideas, IdeaPiece } from './structures';
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
export default function parse(node: Node, delimiter: Delimiter): ParsedObj {
  if (!node) throw new Error('Expected node undefined.');
  if (typeof delimiter == 'undefined') throw new Error('Expected delimiter undefined.');
  const pieces: IdeaPiece[] = [];
  // first create a flat list of strings, HTML Elements, ParsedObjs, and Separators
  node.childNodes.forEach(child => {
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
      else pieces.push(child);
    }
  });

  // cluster pieces into ideas based on
  const ideas = new Ideas();

  pieces.forEach(piece => {
    if (piece instanceof Separator) ideas.addIdea();
    // is it anchor or not
    else if (piece instanceof ParsedObj) ideas.addObj(piece);
    else ideas.appendToIdea(piece);
  });

  return new ParsedObj(node, ideas.fetch(), delimiter);
}

function nodeBreaksInside(text: string, delimiter: string) {
  return new RegExp(delimiter.replace('\\', '\\\\')).test(text);
}
