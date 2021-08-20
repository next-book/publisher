import ParsedObj from './parsedobj';
import { Separator } from '../parser';
import { onlyWhitespace, leftWhitespace, rightWhitespace, leftAndRightWhitespace } from '../utils/regexp';

// What counts as whitespace varies by spec: https://gist.github.com/dd8/8a8149c2ec7093dcf8caae6b9645ac0b
type WhiteSpaceCharacter = '\0x09' | '\0x0a' | '\0x0b' | '\0x0c' | '\0x0d' |' \0x20';
export type IdeasItemPiece = ParsedObj | string | Node | Separator;
// todo: Should WhiteSpaceCharacter and empty string be part of IdeasItem?
export type IdeasItem = WhiteSpaceCharacter | IdeasItemPiece[];

// todo: write better annotation:
// - how exactly is Ideas class different from ideas produced?
// - why do we use same terminilogy?
// - for what is Ideas and ParsedObj exactly?


/**
 * todo: proper annotation
 * 
 * @remarks
 * Ideas contains an array of items in which every
 * item is an array of strings and HTML elements,
 * a whitespace-only string or a {@link ParsedObj}.
 * 
 * @example Contents of Ideas internal array
 * ```ts
 * {
 *  arr: [
 *    ["Integer nec odio."],
 *    " ",
 *    ["Praesent ", <strong>, ", nibh elementum imperdiet."],
 *    " ",
 *    ["Sed cursus ante dapibus diam."],
 *    " ",
 *    [ParsedObj],
 *    " ",
 *    …
 *  ]
 * }
 * ```
 */
 export default class Ideas {
  private arr: IdeasItem[];

  constructor() {
    this.arr = [];
  }

  /**
   * Adds an empty array into Ideas array.
   * 
   * @remarks
   * Mutates the internal state of the object
   */
  addIdea():void {
    this.arr.push([]);
  }

  /**
   * Adds Object into the Ideas array.
   *
   * @remarks
   * Mutates the internal state of the object
   * 
   * @param obj - Parsed Object todo
   */
  addObj(obj: ParsedObj):void {
    // not sure why theres not just this.arr.push([obj]);
    this.addIdea();
    this.appendToIdea(obj);
    this.addIdea();
  }

  /**
   * Appends ParsedObj to Idea
   * 
   * @remarks
   * Mutates the internal state.
   * 
   * @param piece - 
   */
  appendToIdea(piece: IdeasItemPiece):void {
    if (this.arr.length === 0) this.arr.push([]);
    const lastItem = this.arr[this.arr.length - 1];
    if (Array.isArray(lastItem)) {
      lastItem.push(piece);
    }
  }


  /**
   * Checks if idea piece isn’t empty array or empty string.
   * 
   * @param piece - IdeasItemPiece
   * @returns False if piece is empty array or empty string, otherwise true
   */
   private isNotEmpty(piece: IdeasItemPiece):boolean {
    if (Array.isArray(piece) && piece.length === 0) return false;
    if (typeof piece === 'string') return false;
    return true;
  }

  /**
   * Splits whitespace from IdeasItemPieces’s strings into separate strings.
   * 
   * @param piece - IdeasItem
   * @returns Array of pieces, in which non-whitespace strings do not contain opening or trailing whitespace.
   */
  private separateWhitespace(piece: IdeasItem):IdeasItemPiece[] {
    if (piece.length > 1) {
      // splits left whitespace from the content  
      let before, firstItem;
      if (typeof piece[0] !== 'string') {
        [before, firstItem] = [[], piece[0]];
      } else {
        const leftMatch = piece[0].match(leftWhitespace);
        [before, firstItem] = leftMatch ? leftMatch.slice(1) : [[], piece[0]];
      }
      
      // splits right whitespace from the content
      const lastPiece = piece[piece.length - 1];
      let lastItem, after;
      if (typeof lastPiece !== 'string') {
        [lastItem, after] = [lastPiece, []];
      } else {
        const rightMatch = lastPiece.match(rightWhitespace);
        [lastItem, after] = rightMatch ? rightMatch.slice(1) : [lastPiece, []];
      }

      // use middle pieces as they are
      const mid = piece.slice(1, piece.length - 1);

      return [before, [firstItem, ...mid, lastItem], after];
    }
  
    if (piece.length === 1) {
      if (typeof piece[0] === 'string' && onlyWhitespace.test(piece[0]))
        return [piece[0]];
      
      let before, text, after;
      if (typeof piece[0] !== 'string') {
        [before, text, after] = [[], piece[0], []];
      } else {
        const leftAndRightMatch = piece[0].match(leftAndRightWhitespace);
        [before, text, after] = leftAndRightMatch
            ? leftAndRightMatch.slice(1)
            : [[], piece[0], []];
      }
      return [before, [text], after];
    }
  
    return [];
  }

  /**
   * todo: Returns filtered (non-empty) and whitespace-separated ideas.
   *  
   * @returns 
   */
  fetch():IdeasItem[] {    
    // todo: the function does not work with typeof idea === 'string'.
    // what happens with non array ideas?
    return this.arr
      .map(idea => {
        if (Array.isArray(idea))
          return idea.filter(piece => this.isNotEmpty(piece))
        return idea
      })
      .reduce<IdeasItem[]>((acc, idea) => {
        // typeof idea === 'string' is changed to empty array
        const pieces = this.separateWhitespace(idea);
        pieces.forEach(sep => acc.push(sep as IdeasItem));
        return acc;
      }, [])
      .filter((idea) => Array.isArray(idea) && idea.length !== 0);
  }
}

