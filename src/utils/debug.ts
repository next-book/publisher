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
