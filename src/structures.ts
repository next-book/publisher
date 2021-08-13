import { Delimiter } from './config';
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
   * 
   * @param piece - 
   * @returns 
   */
  private separateWhitespace(piece: any):any {
    if (piece.length > 1) {
      const [before, firstItem] =
        typeof piece[0] === 'string' ? piece[0].match(/^(\s*)([\s\S]+)$/)!.slice(1) : [[], piece[0]];
      const [lastItem, after] =
        typeof piece[piece.length - 1] === 'string'
          ? piece[piece.length - 1].match(/^([\s\S]+?)(\s*)$/).slice(1)
          : [piece[piece.length - 1], []];
      const mid = piece.slice(1, piece.length - 1);
      return [before, [firstItem, ...mid, lastItem], after];
    }
    
    // single string
    if (piece.length === 1 && typeof piece[0] === 'string' && /^\s+$/.test(piece[0])) {
      return [piece[0]];
    }
  
    if (piece.length === 1) {
      const [before, text, after] =
        typeof piece[0] === 'string'
          ? piece[0].match(/^(\s*)([\s\S]+?)(\s*)$/)!.slice(1)
          : [[], piece[0], []];
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
      if (typeof idea === 'string' && /^\s+$/.test(idea)) return false;
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


