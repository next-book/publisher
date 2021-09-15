/**
 * Determines if an object is a DOM Node, works outside of browsers.
 * @see 
 * {@link https://stackoverflow.com/questions/384286/how-do-you-check-if-a-javascript-object-is-a-dom-object| How do you check if a JavaScript Object is a DOM Object?}
 * @param obj - The object
 * @returns True if node, False otherwise
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function isNode(obj: Node | Object): obj is Node {
  return typeof <Node>obj === 'object' && 'nodeType' in obj && obj.nodeType === 1;
}

export { isNode };