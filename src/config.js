/**
 * Config module
 * @module
 * @ignore
 */

/**
 * Set of config options. See default values in {@link defaults}.
 * @typedef    {Object}                       Options
 * @property   {('jsdom'|'html')}             output            Output format (jsdom object or
 *                                                              HTML strings).
 * @property   {(string|RegExp|tokenizerFn)}  delimiter         Delimiter used to split chunks into
 *                                                              ideas or a callback used to split
 *                                                              chunks into ideas.
 * @property   {(bool)}                       restoreDelimiter  Determines whether to append
 *                                                              delimiter after each idea when
 *                                                              assembling. Cannot be used when
 *                                                              delimiter is a RegExp.
 * @property   {array|selectorFn}             selectors         Array of selectors of mappable
 *                                                              chunks of a document or a callback
 *                                                              that marks chunks.
 */

/**
 * Default mapper config.
 * @private
 */
const defaults = {
  languageCode: 'en',
  output: 'html',
  delimiter: '\n',
  restoreDelimiter: false,
  root: '.content',
  selectors: ['p', 'li', 'dd', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'dl'],
};

/**
 * Merges defaults with provided overrides.
 *
 * @param      {Object}  options  Config overrides
 * @return     {Object}  Complete configuration
 */
const load = options => Object.assign({}, defaults, options);

module.exports = { load };
