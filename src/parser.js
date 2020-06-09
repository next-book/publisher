/**
 * @module
 * @ignore
 */

const { Ideas, ParsedObj } = require('./structures');

let lastNodeWasFinal = null;

/**
 * Returns ParsedObj which contains original node and an array of arrays in which every array
 * represents one idea or ParsedObj. Ideas are delimited with a delimiter that is searched for in
 * text nodes.
 *
 * @param      {Node}                       node       DOM node
 * @param      {string|RegExp|tokenizerFn}  delimiter  The delimiter
 * @public
 * @return     {ParsedObj}                  An instance of {@link ParsedObj}
 */
function parse(node, delimiter) {
  const ideas = new Ideas();

  node.childNodes.forEach(childNode => {
    if (childNode.nodeType === childNode.TEXT_NODE) {
      if (typeof delimiter === 'function') delimiter(node, ideas);
      else parseTextNode(childNode, ideas, delimiter);
    } else if (childNode.nodeType === childNode.ELEMENT_NODE) {
      if (lastNodeWasFinal === true) ideas.append([parse(childNode, delimiter)]);
      else ideas.appendToTheLast(childNode);
    } else {
      if (childNode.nodeType !== childNode.COMMENT_NODE) throw new Error('Unexpected nodeType!');
    }
  });

  lastNodeWasFinal = true;

  return new ParsedObj(node, ideas.fetch(), delimiter);
}

function parseTextNode(node, ideas, delimiter) {
  node.textContent.split(delimiter).forEach(text => {
    if (lastNodeWasFinal !== true) ideas.appendToTheLast(text);
    else ideas.append([text]);
  });

  lastNodeWasFinal = isDelimiterAtEnd(node.textContent, delimiter);
}

function isDelimiterAtEnd(string, delimiter) {
  return new RegExp(`${delimiter.replace('\\', '\\\\')}\\s*$`).test(string);
}

module.exports = { parse };
