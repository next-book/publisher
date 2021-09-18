import { Delimiter } from '../config';
import { Idea, IdeaPiece } from './ideas';
import { onlyWhitespace } from '../utils/regexp';

/**
 * ParsedObj represents Node (respectively the DOM Element) and its subtree.
 *
 * @remarks
 * ParsedObj contains original node and an array of ideas.
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
export default class ParsedObj {
  /** Original Node */
  node: Node;
  ideas: Idea[];
  delimiter: Delimiter;

  /**
   * @param node - Original Node
   * @param ideas - Every item is an array of strings and HTML elements,
   * a full-whitespace string or another ParsedObj.
   * @param delimiter - Delimiter
   */
  constructor(node: Node, ideas: Idea[], delimiter: Delimiter) {
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
  private listProblemParsedObjIdeas(ideas: Idea[]) {
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
  private ideaItemsAreValid(items: IdeaPiece[]) {
    // This function seems like tautology from the types perspective.
    return (
      items.filter(item => {
        if (typeof item === 'string') return false;
        return false;
      }).length === 0
    );
  }
}
