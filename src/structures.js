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
  this.node = node;
  this.ideas = ideas;
  this.delimiter = delimiter;
}

module.exports = { ParsedObj };
