import ParsedObj from './parsedobj';
import { Separator } from '../parser';
import {
  onlyWhitespace,
  leftWhitespace,
  rightWhitespace,
  leftAndRightWhitespace,
} from '../utils/regexp';
import { isNode } from '../utils/dom';

export type IdeaPiece = ParsedObj | string | Node | Separator;
export type Idea = IdeaPiece[];

/**
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
  private arr: Idea[];

  constructor() {
    this.arr = [];
  }

  /**
   * Adds an empty array into Ideas array.
   *
   * @remarks
   * Mutates the internal state of the object
   */
  addIdea(): void {
    this.arr.push([]);
  }

  /**
   * Adds Object into the Ideas array.
   *
   * @remarks
   * Mutates the internal state of the object
   *
   * @param obj - Parsed Object
   */
  addObj(obj: ParsedObj): void {
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
  appendToIdea(piece: IdeaPiece): void {
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
  private isNotEmpty(piece: IdeaPiece): boolean {
    if (Array.isArray(piece) && piece.length === 0) return false;
    if (typeof piece !== 'string') return true;
    if (piece === '') return false;
    return true;
  }

  /**
   * Splits whitespace from IdeasItemPieces’s strings into separate strings.
   *
   * @param piece - IdeasItem
   * @returns Array of pieces, in which non-whitespace strings do not contain opening or trailing whitespace.
   */
  private separateWhitespace(piece: Idea): IdeaPiece[] {
    if (isNode(piece)) {
      return [];
    }
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
      if (typeof piece[0] === 'string' && onlyWhitespace.test(piece[0])) return [piece[0]];

      let before, text, after;
      if (typeof piece[0] !== 'string') {
        [before, text, after] = [[], piece[0], []];
      } else {
        const leftAndRightMatch = piece[0].match(leftAndRightWhitespace);
        [before, text, after] = leftAndRightMatch ? leftAndRightMatch.slice(1) : [[], piece[0], []];
      }
      return [before, [text], after];
    }

    return [];
  }

  /**
   * Returns filtered (non-empty) and whitespace-separated ideas.
   *
   * @remarks
   * This function is used to produce array that is assigned
   * to {@link ParsedObj} ideas public param.
   *
   * @returns
   */
  fetch(): Idea[] {
    return this.arr
      .map(idea => {
        if (Array.isArray(idea)) return idea.filter(piece => this.isNotEmpty(piece));
        return idea;
      })
      .reduce<Idea[]>((acc, idea) => {
        // typeof idea === 'string' is changed to empty array
        const pieces = this.separateWhitespace(idea);
        pieces.forEach(sep => acc.push(sep as Idea));
        return acc;
      }, [])
      .filter(idea => Array.isArray(idea) && idea.length !== 0);
  }
}
