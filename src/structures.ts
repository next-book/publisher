import { Delimiter } from './config';

// What counts as whitespace - varies by spec: https://gist.github.com/dd8/8a8149c2ec7093dcf8caae6b9645ac0b
type WhiteSpaceCharacter = '\0x09' | '\0x0a' | '\0x0b' | '\0x0c' | '\0x0d' |' \0x20';
type IdeasItemPiece = ParsedObj|string|Element;
type IdeasItem =  WhiteSpaceCharacter | '' | IdeasItemPiece[];

/**
 * Ideas contains an array of items in which every
 * item is an array of strings and HTML elements,
 * a whitespace-only string or a ParsedObj.
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
export class Ideas {
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
  appendToIdea(piece: ParsedObj):void {
    if (this.arr.length === 0) this.arr.push([]);
    const lastItem = this.arr[this.arr.length - 1];
    if (Array.isArray(lastItem)) {
      lastItem.push(piece);
    }
  }

  /**
   * Returns filtered and whitespace-separated ideas.
   *  
   * @returns 
   */
  fetch():any {    
    // todo: the function does not work with typeof idea === 'string'.
    return this.arr
      .map(idea => (idea as []).filter(this.isNotEmpty))
      .reduce((acc: any, idea) => {
        this.separateWhitespace(idea).forEach((sep: any) => acc.push(sep));
        return acc;
      }, [])
      .filter((idea: any) => idea.length !== 0);
  }

  /**
   * Checks if idea isn’t empty array or empty string.
   * 
   * @param idea - 
   * @returns
   * False if idea is empty array or empty string, otherwise true
   */
  private isNotEmpty(idea: IdeasItem):boolean {
    if (Array.isArray(idea) && idea.length === 0) return false;
    if (typeof idea === 'string' && idea === '') return false;
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
}

/**
 * ParsedObj contains original node and an array of ideas
 * 
 * @remarks
 * Every item is an array of strings and HTML elements,
 * a full-whitespace string or another ParsedObj.
 * 
 * @example Example ParsedObj contents
 * ```ts
 * {
 *  node: <p class="chunk">,
 *  ideas: [
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
export class ParsedObj {
  node: Node;
  ideas: IdeasItem[];
  delimiter: Delimiter;

  /**
   * Constructor todo
   * @param node - Original Node
   * @param ideas - Every item is an array of strings and HTML elements, 
   * a full-whitespace string or another ParsedObj.
   * @param delimiter - Delimiter
   */
  constructor(node: Node, ideas: IdeasItem[], delimiter: Delimiter) {
    const ideaProblems = this.listProblemParsedObjIdeas(ideas);
  
    if (ideaProblems.length > 0)
      throw new Error(
        `Invalid ideas at node ${JSON.stringify(node)}, problems: ${JSON.stringify(ideaProblems)}.`
      );
    this.node = node;
    this.ideas = ideas;
    this.delimiter = delimiter;
  }

  /**
   * Returns array filtered ideas, leaving only ideas that are not valid.
   *  
   * @param ideas - 
   * @returns 
   */
  private listProblemParsedObjIdeas(ideas: IdeasItem[]) {
    // todo: parse, don’t validate could be applied 
    return ideas.filter(idea => {
      if (idea instanceof ParsedObj) return false;
      if (typeof idea === 'string' && onlyWhitespace.test(idea)) return false;
      if (Array.isArray(idea) && this.ideaItemsAreValid(idea)) return false;
      return true;
    });
  }

  /**
   * Determine whether array only
   *  
   * @param items - Array of strings and Elements
   * @returns Boolean
   */
  private ideaItemsAreValid(items: (ParsedObj|string|Element)[]) {
    // This function seems like tautology from the types perspective.
    return (
      items.filter(item => {
        if (typeof item === 'string') return false;
        return false;
      }).length === 0
    );
  }
}


/**
 * Capture whitespace at the beggining of a string (group 1) and the rest of a string (group 2).
 * 
 * @internal 
 * 
 * @example One space string:
 * 
 * input: ` `
 * group 1: empty
 * group 2: ` `
 * 
 * @example One char string:
 * 
 * input: `a`
 * group 1: empty
 * group 2: `a`
 * 
 * @example Multiple whitespaces string:
 * 
 * input: `   `
 * group 1: `  `
 * group 2: ` `
 * 
 * @example Multiple whitespaces at the beggining of a sentence:
 * 
 * input: `     lorem ipsum`
 * group 1: `     `
 * group 2: `lorem ipsum`
 */
 const leftWhitespace = /^(\s*)([\s\S]+)$/;

/**
* Capture string content (group 1) and the whitespace at the end of a string (group 2).
* 
* @internal 
* 
* @example One space string:
* 
* input: ` `
* group 1: ` `
* group 2: empty
* 
* @example One char string:
* 
* input: `a`
* group 1: `a`
* group 2: empty
* 
* @example Multiple whitespaces string:
* 
* input: `   `
* group 1: ` `
* group 2: `  `
* 
* @example Whitespaces at the end of a sentence:
* 
* input: `lorem     `
* group 1: `lorem`
* group 2: `     `
* 
*/
const rightWhitespace = /^([\s\S]+?)(\s*)$/;

/**
* Matches only whitespace string.  
* @internal
*/
const onlyWhitespace = /^\s+$/;

/**
* Matches whitespace at the begginng (group 1) and end (group 3), and the content in between (group 2).  
* @internal
*
* @example No space around sentence:
* 
* input: `a`
* group 1: empty
* group 2: `a`
* group 3: empty
*
* @example Whitespaces around sentence:
* 
* input: ` a `
* group 1: ` `
* group 2: `a`
* group 3: ` `
* 
* @example One space:
* 
* input: ` `
* group 1: empty
* group 2: `a`
* group 3: empty
* 
* @example Multiple spaces:
* 
* input: `   `
* group 1: `  `
* group 2: ` `
* group 3: empty
* 
* @example Only space at the end of a sentence:
* 
* input: `a `
* group 1: empty
* group 2: `a`
* group 3: ` `
* 
*/
const leftAndRightWhitespace = /^(\s*)([\s\S]+?)(\s*)$/;