/**
 * @module
 * @ignore
 */

/**
 * ParsedObj contains original node and an array
 * in which every item is an array of strings and HTML elements,
 * a full-whitespace string or another ParsedObj.
 * @constructor
 * @param   {window.Node}   node      DOM node
 * @param   {array}         ideas     Array of ideas
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

module.exports = { ParsedObj };
