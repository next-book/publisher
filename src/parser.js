/**
 * @module
 * @ignore
 */

const { ParsedObj } = require('./structures');

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
  const pieces = [];

  node.childNodes.forEach(childNode => {
    if (childNode.nodeType === childNode.TEXT_NODE) {
      if (typeof delimiter === 'function') delimiter(node, pieces);
      else parseTextNode(childNode, pieces, delimiter);
    } else if (childNode.nodeType === childNode.ELEMENT_NODE) {
      if (lastNodeWasFinal === true) {
        pieces.push([parse(childNode, delimiter)]);
        lastNodeWasFinal = false;
      } else {
        lastValue(pieces).push(childNode);
      }
    }
  });

  return new ParsedObj(node, filterPieces(pieces), delimiter);
}

function parseTextNode(node, pieces, delimiter) {
  node.textContent.split(delimiter).forEach(text => {
    if (lastNodeWasFinal !== true) {
      lastValue(pieces).push(text);
      lastNodeWasFinal = true;
    } else {
      pieces.push([text]);
    }
  });

  lastNodeWasFinal = isDelimiterAtEnd(node.textContent, delimiter);
}

function isDelimiterAtEnd(string, delimiter) {
  return new RegExp(`${delimiter.replace('\\', '\\\\')}\\s*$`).test(string);
}

function lastValue(arr) {
  if (arr.length === 0) {
    arr.push([]);
  }
  return arr[arr.length - 1];
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
  } else if (piece.length === 1 && typeof piece[0] === 'string' && /^\s+$/.test(piece[0])) {
    return [piece[0]];
  } else if (piece.length === 1) {
    const [before, text, after] =
      typeof piece[0] === 'string'
        ? piece[0].match(/^(\s*)([\s\S]+?)(\s*)$/).slice(1)
        : [[], piece[0], []];
    return [before, [text], after];
  }

  return [];
}

function filterPieces(pieces) {
  return pieces
    .map(piece => piece.filter(isEmpty))
    .reduce((acc, piece) => {
      separateWhitespace(piece).forEach(sep => acc.push(sep));
      return acc;
    }, [])
    .filter(piece => piece.length !== 0);
}

function isEmpty(string) {
  if (typeof string !== 'string') return true;
  if (string === '') return false;
  return true;
}

module.exports = { parse };
