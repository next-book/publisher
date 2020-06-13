/**
 * @module
 * @ignore
 */

const { Ideas, ParsedObj } = require('./structures');

function Separator() {}

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
  const pieces = [];

  //first create a flat list of strings, HTML Elements, ParsedObjs, and Separators
  //matrix text/obj v hasBreak
  node.childNodes.forEach((n, index) => {
    if (n.nodeType === n.TEXT_NODE) {
      const texts = n.textContent.split(delimiter);
      texts.forEach((text, index) => {
        pieces.push(text);
        if (texts.length - 1 !== index) pieces.push(new Separator());
      });
    } else if (n.nodeType === n.ELEMENT_NODE) {
      if (nodeBreaksInside(n, delimiter)) pieces.push(parse(n, delimiter));
      else pieces.push(n);
    }
  });

  //then cluster it into ideas
  const ideas = new Ideas();

  pieces.forEach(piece => {
    if (piece instanceof Separator) ideas.addIdea();
    if (piece instanceof ParsedObj) ideas.addObj(piece);
    else ideas.appendToIdea(piece);
  });

  return new ParsedObj(node, ideas.fetch(), delimiter);
}

function nodeBreaksInside(node, delimiter) {
  return new RegExp(delimiter.replace('\\', '\\\\')).test(node.textContent);
}

module.exports = { parse };
