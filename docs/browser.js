"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }return s;
  }return e;
})()({ 1: [function (require, module, exports) {
    /**
     * Browser module is entry point for browser, bundled and transpiled into dist directory.
     * @module
     * @ignore
     */

    /* eslint-env browser */
    var tagger = require('./tagger');
    var gauge = require('./gauge');
    var config = require('./config');

    /**
     * Maps document contents — to be used in browser env.
     *
     * @param      {Options}  options  The options
     * @return     {void}  Modifies document
     */
    function mapHtml(options) {
      tagger.tagDocument(document, config.load(options));
      gauge.gaugeDocument(document);
      gauge.setGaugeMetatags(document);
    }

    window.NbMapper = { mapHtml: mapHtml };
  }, { "./config": 2, "./gauge": 3, "./tagger": 7 }], 2: [function (require, module, exports) {
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
    var defaults = {
      output: 'html',
      delimiter: '\n',
      restoreDelimiter: false,
      selectors: ['p', 'li', 'dd', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'dl']
    };

    /**
     * Merges defaults with provided overrides.
     *
     * @param      {Object}  options  Config overrides
     * @return     {Object}  Complete configuration
     */
    var load = function load(options) {
      return Object.assign({}, defaults, options);
    };

    module.exports = { load: load };
  }, {}], 3: [function (require, module, exports) {
    /**
     * @module
     * @ignore
     */

    var attrNames = {
      charCount: 'data-nb-chars',
      wordCount: 'data-nb-words',
      publicationCharCount: 'data-nb-publication-chars',
      publicationWordCount: 'data-nb-publication-words',
      charOffset: 'data-nb-chars-offset',
      wordOffset: 'data-nb-words-offset',
      sectionNumber: 'data-nb-section-number'
    };

    var sumAttr = function sumAttr(attr) {
      return function (ideas) {
        return Array.prototype.reduce.call(ideas, function (acc, idea) {
          return acc + parseInt(idea.getAttribute(attr), 10);
        }, 0);
      };
    };

    var setSumAttr = function setSumAttr(attr) {
      return function (el) {
        el.setAttribute(attr, sumAttr(attr)(el.querySelectorAll('.idea')));
      };
    };

    function countChars(document) {
      Array.prototype.map.call(document.querySelectorAll('.idea'), function (idea) {
        idea.setAttribute(attrNames.charCount, idea.textContent.length);
      });
    }

    function countWords(document) {
      Array.prototype.map.call(document.querySelectorAll('.idea'), function (idea) {
        idea.setAttribute(attrNames.wordCount, idea.textContent.split(/\s+/g).length);
      });
    }

    function gaugeContent(document, attr, gaugeFn) {
      gaugeFn(document);
      setSumAttr(attr)(document.body);
      Array.prototype.forEach.call(document.querySelectorAll('.chunk'), setSumAttr(attr));
    }

    /**
     * Gauges words and characters in a document.
     *
     * @param      {Object}  document  DOM document
     * @return     {void}  Modifies DOM document
     */
    function gaugeDocument(document) {
      gaugeContent(document, attrNames.wordCount, countWords);
      gaugeContent(document, attrNames.charCount, countChars);
    }

    function gaugeTotals(attr, pubAttr, offsetAttr) {
      return function (documents) {
        var counts = documents.map(function (document) {
          return parseInt(document.body.getAttribute(attr), 10);
        });
        var total = counts.reduce(function (a, b) {
          return a + b;
        }, 0);

        documents.reduce(function (runningTotal, document, index) {
          document.body.setAttribute(pubAttr, total);
          document.body.setAttribute(offsetAttr, runningTotal);
          return runningTotal + counts[index];
        }, 0);
      };
    }

    /**
     * Gauges words and characters in a publication. Relies on previous gauging of individual chunks
     * using {@link gaugeDocument}.
     *
     * @param      {Object[]}  documents  DOM documents
     * @return     {void}  Modifies DOM documents
     */
    function gaugePublication(documents) {
      gaugeTotals(attrNames.wordCount, attrNames.publicationWordCount, attrNames.wordOffset)(documents);
      gaugeTotals(attrNames.charCount, attrNames.publicationCharCount, attrNames.charOffset)(documents);
      documents.forEach(function (document, index) {
        return document.body.setAttribute(attrNames.sectionNumber, index + 1);
      });
    }

    function appendMeta(document, name) {
      var value = document.body.getAttribute(attrNames[name]);

      if (value !== null && value !== '') {
        var el = document.createElement('meta');
        el.setAttribute('name', name);
        el.setAttribute('content', parseInt(value, 10));
        document.querySelector('head').appendChild(el);
      }
    }

    /**
     * Sets the gauge metatags inferred from `document.body.dataset`. Relies on attributes created using
     * {@link gaugeDocument} and optionally using {@link gaugePublication}.
     *
     * @param      {document}  document  DOM document
     * @return     {void}  Modifies DOM document
     */
    function setGaugeMetatags(document) {
      Object.keys(attrNames).map(function (attrName) {
        return appendMeta(document, attrName);
      });
    }

    module.exports = { gaugeDocument: gaugeDocument, gaugePublication: gaugePublication, setGaugeMetatags: setGaugeMetatags };
  }, {}], 4: [function (require, module, exports) {
    /**
     * @module
     * @ignore
     */

    var _require = require('./structures'),
        ParsedObj = _require.ParsedObj;

    var lastNodeWasFinal = null;

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
      var pieces = [];

      node.childNodes.forEach(function (childNode) {
        if (childNode.nodeType === childNode.TEXT_NODE) {
          if (typeof delimiter === 'function') delimiter(node, pieces);else parseTextNode(childNode, pieces, delimiter);
        } else if (childNode.nodeType === childNode.ELEMENT_NODE) {
          if (lastNodeWasFinal === true) {
            pieces.push([parse(childNode, delimiter)]);
            lastNodeWasFinal = false;
          } else {
            lastValue(pieces).push(childNode);
          }
        }
      });

      return new ParsedObj(node, filterPieces(pieces));
    }

    function parseTextNode(node, pieces, delimiter) {
      node.textContent.split(delimiter).forEach(function (text) {
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
      return new RegExp(delimiter.replace('\\', '\\\\') + "\\s*$").test(string);
    }

    function lastValue(arr) {
      if (arr.length === 0) {
        arr.push([]);
      }
      return arr[arr.length - 1];
    }

    function separateWhitespace(piece) {
      if (piece.length > 1) {
        var _ref = typeof piece[0] === 'string' ? piece[0].match(/^(\s*)([\s\S]+)$/).slice(1) : [[], piece[0]],
            _ref2 = _slicedToArray(_ref, 2),
            before = _ref2[0],
            firstItem = _ref2[1];

        var _ref3 = typeof piece[piece.length - 1] === 'string' ? piece[piece.length - 1].match(/^([\s\S]+?)(\s*)$/).slice(1) : [piece[piece.length - 1], []],
            _ref4 = _slicedToArray(_ref3, 2),
            lastItem = _ref4[0],
            after = _ref4[1];

        var mid = piece.slice(1, piece.length - 1);
        return [before, [firstItem].concat(_toConsumableArray(mid), [lastItem]), after];
      } else if (piece.length === 1 && typeof piece[0] === 'string' && /^\s+$/.test(piece[0])) {
        return [piece[0]];
      } else if (piece.length === 1) {
        var _ref5 = typeof piece[0] === 'string' ? piece[0].match(/^(\s*)([\s\S]+?)(\s*)$/).slice(1) : [[], piece[0], []],
            _ref6 = _slicedToArray(_ref5, 3),
            _before = _ref6[0],
            text = _ref6[1],
            _after = _ref6[2];

        return [_before, [text], _after];
      }

      return [];
    }

    function filterPieces(pieces) {
      return pieces.map(function (piece) {
        return piece.filter(isEmpty);
      }).reduce(function (acc, piece) {
        separateWhitespace(piece).forEach(function (sep) {
          return acc.push(sep);
        });
        return acc;
      }, []).filter(function (piece) {
        return piece.length !== 0;
      });
    }

    function isEmpty(string) {
      if (typeof string !== 'string') return true;
      if (string === '') return false;
      return true;
    }

    module.exports = { parse: parse };
  }, { "./structures": 6 }], 5: [function (require, module, exports) {
    /**
     * @module
     * @ignore
     */

    var _require2 = require('./structures'),
        ParsedObj = _require2.ParsedObj;

    /**
     * Produces ideas from a parsedObj
     *
     * @param      {Object}           document          DOM document
     * @param      {ParsedObj}        parsedObj         A parsed object
     * @param      {(string|RegExp)}  delimiter     The idea delimiter
     * @param      {(bool|string)}    restoreDelimiter  Restore delimiter (string required if delimiter
     *                                                  is a RegExp).
     * @return     {Node}             HTML node
     */


    function produce(document, parsedObj, delimiter, restoreDelimiter) {
      var fragment = document.createDocumentFragment();
      var node = parsedObj.node,
          ideas = parsedObj.ideas;


      ideas.forEach(function (idea) {
        if (Array.isArray(idea)) {
          if (containsParsedObj(idea)) {
            fragment.appendChild(anchorObject(idea, document));
          } else {
            fragment.appendChild(produceIdea(idea, document));
          }
        } else if (typeof idea === 'string') {
          fragment.appendChild(document.createTextNode(idea));
        }

        if (restoreDelimiter) fragment.appendChild(document.createTextNode(delimiter));
      });

      var chunk = emptyNode(node.cloneNode());
      chunk.appendChild(fragment);
      return chunk;
    }

    /**
     * Produces idea from an array of parts
     *
     * @param      {array}   idea      The idea
     * @param      {Object}  document  DOM document
     * @return     {Object}  HTML Element span
     * @private
     */
    function produceIdea(idea, document) {
      var span = document.createElement('SPAN');
      span.classList.add('idea');

      idea.forEach(function (item) {
        if (typeof item === 'string') {
          span.appendChild(document.createTextNode(item));
        } else if (isNode(item)) {
          span.appendChild(item);
        }
      });

      return span;
    }

    /**
     * Determines if an object is a DOM Node, works outside of browsers.
     *
     * @param      {Object}   obj     The object
     * @return     {boolean}  True if node, False otherwise.
     * @private
     */
    function isNode(obj) {
      return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === 'object' && 'nodeType' in obj && obj.nodeType === 1 && obj.cloneNode;
    }

    /**
     * Determines if array contains parsed object. See {@link ParsedObj}.
     *
     * @param      {array}  idea    The idea
     * @return     {bool}   True if contains parsed object, False otherwise.
     * @private
     */
    function containsParsedObj(idea) {
      return idea.reduce(function (acc, item) {
        return acc || item instanceof ParsedObj;
      }, false);
    }

    function anchorObject(idea, document) {
      var fragment = document.createDocumentFragment();

      idea.forEach(function (item) {
        if (item instanceof ParsedObj) {
          fragment.appendChild(produce(document, item));
        } else if (isNode(item)) {
          fragment.appendChild(item);
        } else {
          fragment.appendChild(document.createTextNode(item));
        }
      });

      return fragment;
    }

    function emptyNode(node) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }

      return node;
    }

    module.exports = { produce: produce };
  }, { "./structures": 6 }], 6: [function (require, module, exports) {
    /**
     * @module
     * @ignore
     */

    /**
     * ParsedObj contains original node and an array
     * in which every item is an array of strings and HTML elements,
     * a full-whitespace string or another ParsedObj.
     * @constructor
     * @param   {window.Node}   node    DOM node
     * @param   {array}         ideas   Array of ideas
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
    function ParsedObj(node, ideas) {
      this.node = node;
      this.ideas = ideas;
    }

    module.exports = { ParsedObj: ParsedObj };
  }, {}], 7: [function (require, module, exports) {
    /**
     * Tagger module: tagger parses, produces and numbers chunks and ideas.
     * @module
     * @ignore
     */

    var _require3 = require('./producer'),
        produce = _require3.produce;

    var _require4 = require('./parser'),
        parse = _require4.parse;

    var refNumAttr = 'data-nb-ref-number';

    /**
     * Recognizes and tags chunks and ideas in a document
     *
     * @param      {Object}   document  DOM document
     * @param      {Options}  options   Config
     * @return     {void}  Modifies DOM document
     */
    function tagDocument(document, options) {
      tagChunks(document, options.selectors);
      tagIdeas(document, options.delimiter);

      numberEls(document, '.chunk', 'chunk');
      numberEls(document, '.idea', 'idea');
    }

    /**
     * Mark DOM elements to be tagged.
     *
     * @param      {Object}            document   DOM document
     * @param      {array|selectorFn}  selectors  Array of selectors or a {@link selectorFn} callback.
     * @return     {void}  Modifies DOM document
     * @private
     */
    function tagChunks(document, selectors) {
      var elements = typeof selectors === 'function' ? selectors(document) : document.querySelectorAll(selectors);

      Array.prototype.forEach.call(elements, function (el) {
        return el.classList.add('chunk');
      });
    }

    /**
     * Callback that marks elements as chunks of ideas. Those are then used for idea mapping.
     * @callback   selectorFn
     * @param      {Object}  document  DOM document
     * @return     {void}    Modifies DOM document
     */

    /**
     * Map ideas in specific DOM context.
     *
     * @param      {Object}                       document   DOM document
     * @param      {(string|RegExp|tokenizerFn)}  delimiter  Delimiter string, RegExp or a {@link
     *                                                       tokenizerFn} callback.
     * @return     {void}  Modifies DOM document
     * @private
     */
    function tagIdeas(document, delimiter) {
      document.querySelectorAll('.chunk').forEach(function (chunk) {
        var tagged = produce(document, parse(chunk, delimiter));
        chunk.parentNode.replaceChild(tagged, chunk);
      });
    }

    /**
     * Callback used to split chunk contents into ideas.
     * @callback   tokenizerFn
     * @param      {Object}    node    DOM node
     * @param      {string}    text    Text content.
     * @return     {string[]}  Text split into 1-n parts (string, Node or ParsedObj) used for idea
     *                         construction.
     */

    /**
     * Numbers selected elements (<1…n>), adding a data attribute and an numbered id attribute
     * (<name>#).
     *
     * @param      {Object}  document  DOM document
     * @param      {string}  selector  Selector
     * @param      {string}  name      Name used in creating id attributes (<name>#)
     * @return     {void}  Modifies DOM document
     * @private
     */
    function numberEls(document, selector, name) {
      Array.prototype.forEach.call(document.querySelectorAll(selector), function (el, index) {
        el.setAttribute(refNumAttr, index + 1);
        el.setAttribute('id', "" + name + (index + 1));
      });
    }

    module.exports = { tagDocument: tagDocument };
  }, { "./parser": 4, "./producer": 5 }] }, {}, [1]);
