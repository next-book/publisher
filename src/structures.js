/**
 * @module
 * @ignore
 */

/**
 * Ideas contains an array of items in which every
 * item is an array of strings and HTML elements,
 * a whitespace-only string or a ParsedObj.
 * @constructor
 * @param   {window.Node}   node      DOM node
 * @param   {Ideas}         ideas     Ideas object
 * @param   {string}        delimiter Delimiter
 * @example
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
 */
function Ideas() {
  this.arr = [];

  this.addIdea = () => {
    this.arr.push([]);
  };

  this.addObj = obj => {
    this.addIdea();
    this.appendToIdea(obj);
    this.addIdea();
  };

  this.appendToIdea = piece => {
    if (this.arr.length === 0) this.arr.push([]);
    this.arr[this.arr.length - 1].push(piece);
  };

  this.fetch = () => {
    return this.arr
      .map(idea => idea.filter(isNotEmpty))
      .reduce((acc, idea) => {
        separateWhitespace(idea).forEach(sep => acc.push(sep));
        return acc;
      }, [])
      .filter(idea => idea.length !== 0);
  };
}

function separateWhitespace(piece) {
  if (piece.length > 1) {
    const [before, firstItem] =
      typeof piece[0] === 'string' ? piece[0].match(/^(\s*)([\s\S]+)$/).slice(1) : [[], piece[0]];
    const [lastItem, after] =
      typeof piece[piece.length - 1] === 'string'
        ? piece[piece.length - 1].match(/^([\s\S]+?)(\s*)$/).slice(1)
        : [piece[piece.length - 1], []];
    const mid = piece.slice(1, piece.length - 1);
    return [before, [firstItem, ...mid, lastItem], after];
  }

  if (piece.length === 1 && typeof piece[0] === 'string' && /^\s+$/.test(piece[0])) {
    return [piece[0]];
  }

  if (piece.length === 1) {
    const [before, text, after] =
      typeof piece[0] === 'string'
        ? piece[0].match(/^(\s*)([\s\S]+?)(\s*)$/).slice(1)
        : [[], piece[0], []];
    return [before, [text], after];
  }

  return [];
}

function isNotEmpty(idea) {
  if (Array.isArray(idea) && idea.length === 0) return false;
  if (typeof idea !== 'string') return true;
  if (idea === '') return false;
  return true;
}

/**
 * ParsedObj contains original node and an array
 * in which every item is an array of strings and HTML elements,
 * a full-whitespace string or another ParsedObj.
 * @constructor
 * @param   {window.Node}   node      DOM node
 * @param   {Ideas}         ideas     Ideas object
 * @param   {string}        delimiter Delimiter
 * @example
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
 */
function ParsedObj(node, ideas, delimiter) {
  const ideaProblems = listProblemIdeas(ideas);

  if (ideaProblems.length > 0)
    throw new Error(
      `Invalid ideas at node ${JSON.stringify(node)}, problems: ${JSON.stringify(ideaProblems)}.`
    );

  this.node = node;
  this.ideas = ideas;
  this.delimiter = delimiter;
}

function listProblemIdeas(ideas) {
  return ideas.filter(idea => {
    if (idea instanceof ParsedObj) return false;
    if (typeof idea === 'string' && /^\s+$/.test(idea)) return false;
    if (Array.isArray(idea) && ideaItemsAreValid(idea)) return false;
    return true;
  });
}

function ideaItemsAreValid(items) {
  return (
    items.filter(item => {
      if (typeof item === 'string') return false;
      return false;
    }).length === 0
  );
}

module.exports = { Ideas, ParsedObj };
