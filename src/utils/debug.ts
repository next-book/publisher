/**
 * Dumps stringified array
 *
 * @param arr - Array to dump
 * @returns string array dump
 */
export function dumpArray(arr: unknown) {
  return JSON.stringify(arr, null, 2)
    .split('\n')
    .map(line => `>${line}`)
    .join('\n');
}

/**
 * Returns string tree representation of Node and its children, useful for logging
 *
 * @param node root Node
 * @param index order number of child
 * @param level depth of recursion used for tree indentation
 * @returns
 */
export function dumpNode(node: Node, index = 0, level = 0) {
  if (!node) {
    return;
  }
  let result = '';
  result += '  '.repeat(level) + index + '. ';
  if (node.nodeType == Node.ELEMENT_NODE) {
    result += `element: ${node.nodeName}`;
  }
  if (node.nodeType == Node.TEXT_NODE) {
    result += `textNode: \'${node.textContent?.replace('\n', '\\n')}\'`;
  }
  result += '\n';
  node.childNodes.forEach((ch, i) => (result += dumpNode(ch, i, level + 1)));
  return result;
}
