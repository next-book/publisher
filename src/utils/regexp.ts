/**
 * Annotated RegExp’s to be used in a convenient way.
 * @module  
 */

/**
 * Capture whitespace at the beggining of a string (group 1) and the rest of a string (group 2).
 * 
 * @internal 
 * 
 * @example One space string:
 * 
 * input: ` `
 * group 1: empty
 * group 2: ` `
 * 
 * @example One char string:
 * 
 * input: `a`
 * group 1: empty
 * group 2: `a`
 * 
 * @example Multiple whitespaces string:
 * 
 * input: `   `
 * group 1: `  `
 * group 2: ` `
 * 
 * @example Multiple whitespaces at the beggining of a sentence:
 * 
 * input: `     lorem ipsum`
 * group 1: `     `
 * group 2: `lorem ipsum`
 */
export const leftWhitespace = /^(\s*)([\s\S]+)$/;

/**
* Capture string content (group 1) and the whitespace at the end of a string (group 2).
* 
* @internal 
* 
* @example One space string:
* 
* input: ` `
* group 1: ` `
* group 2: empty
* 
* @example One char string:
* 
* input: `a`
* group 1: `a`
* group 2: empty
* 
* @example Multiple whitespaces string:
* 
* input: `   `
* group 1: ` `
* group 2: `  `
* 
* @example Whitespaces at the end of a sentence:
* 
* input: `lorem     `
* group 1: `lorem`
* group 2: `     `
* 
*/
export const rightWhitespace = /^([\s\S]+?)(\s*)$/;

/**
* Matches only whitespace string.  
* @internal
*/
export const onlyWhitespace = /^\s+$/;

/**
* Matches whitespace at the begginng (group 1) and end (group 3), and the content in between (group 2).  
* @internal
*
* @example No space around sentence:
* 
* input: `a`
* group 1: empty
* group 2: `a`
* group 3: empty
*
* @example Whitespaces around sentence:
* 
* input: ` a `
* group 1: ` `
* group 2: `a`
* group 3: ` `
* 
* @example One space:
* 
* input: ` `
* group 1: empty
* group 2: `a`
* group 3: empty
* 
* @example Multiple spaces:
* 
* input: `   `
* group 1: `  `
* group 2: ` `
* group 3: empty
* 
* @example Only space at the end of a sentence:
* 
* input: `a `
* group 1: empty
* group 2: `a`
* group 3: ` `
* 
*/
export const leftAndRightWhitespace = /^(\s*)([\s\S]+?)(\s*)$/;