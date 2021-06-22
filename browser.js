"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw a.code = "MODULE_NOT_FOUND", a;
        }

        var p = n[i] = {
          exports: {}
        };
        e[i][0].call(p.exports, function (r) {
          var n = e[i][1][r];
          return o(n || r);
        }, p, p.exports, r, e, n, t);
      }

      return n[i].exports;
    }

    for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
      o(t[i]);
    }

    return o;
  }

  return r;
})()({
  1: [function (require, module, exports) {
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

    window.NbMapper = {
      mapHtml: mapHtml
    };
  }, {
    "./config": 2,
    "./gauge": 3,
    "./tagger": 7
  }],
  2: [function (require, module, exports) {
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
      languageCode: 'en',
      output: 'html',
      delimiter: '\n',
      restoreDelimiter: false,
      root: 'main',
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

    module.exports = {
      load: load
    };
  }, {}],
  3: [function (require, module, exports) {
    /**
     * @module
     * @ignore
     */
    var attrNames = {
      chars: 'data-nb-chars',
      words: 'data-nb-words'
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
        idea.setAttribute(attrNames.chars, idea.textContent.length);
      });
    }

    function countWords(document) {
      Array.prototype.map.call(document.querySelectorAll('.idea'), function (idea) {
        idea.setAttribute(attrNames.words, idea.textContent.split(/\s+/g).length);
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
      gaugeContent(document, attrNames.words, countWords);
      gaugeContent(document, attrNames.chars, countChars);
    }
    /**
     * Gauges words and characters in a publication. Relies on previous gauging of individual chunks
     * using {@link gaugeDocument}.
     *
     * @param      {Object[]}  documents  DOM documents
     * @return     {void}  Modifies DOM documents
     */


    function gaugePublication(documents) {
      return documents.map(function (document) {
        return {
          words: parseInt(document.body.getAttribute(attrNames.words), 10),
          chars: parseInt(document.body.getAttribute(attrNames.chars), 10),
          ideas: document.querySelectorAll('.idea').length
        };
      });
    }

    module.exports = {
      gaugeDocument: gaugeDocument,
      gaugePublication: gaugePublication
    };
  }, {}],
  4: [function (require, module, exports) {
    /**
     * @module
     * @ignore
     */
    var _require = require('./structures'),
        Ideas = _require.Ideas,
        ParsedObj = _require.ParsedObj;

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
      var pieces = []; //first create a flat list of strings, HTML Elements, ParsedObjs, and Separators
      //matrix text/obj v hasBreak

      node.childNodes.forEach(function (n, index) {
        if (n.nodeType === n.TEXT_NODE) {
          var texts = n.textContent.split(delimiter);
          texts.forEach(function (text, index) {
            pieces.push(text);
            if (texts.length - 1 !== index) pieces.push(new Separator());
          });
        } else if (n.nodeType === n.ELEMENT_NODE) {
          if (nodeBreaksInside(n, delimiter)) pieces.push(parse(n, delimiter));else pieces.push(n);
        }
      }); //then cluster it into ideas

      var ideas = new Ideas();
      pieces.forEach(function (piece) {
        if (piece instanceof Separator) ideas.addIdea();
        if (piece instanceof ParsedObj) ideas.addObj(piece);else ideas.appendToIdea(piece);
      });
      return new ParsedObj(node, ideas.fetch(), delimiter);
    }

    function nodeBreaksInside(node, delimiter) {
      return new RegExp(delimiter.replace('\\', '\\\\')).test(node.textContent);
    }

    module.exports = {
      parse: parse
    };
  }, {
    "./structures": 6
  }],
  5: [function (require, module, exports) {
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
     * @return     {Node}             HTML node
     */


    function produce(document, parsedObj) {
      var fragment = document.createDocumentFragment();
      var node = parsedObj.node,
          ideas = parsedObj.ideas,
          delimiter = parsedObj.delimiter;
      ideas.forEach(function (idea, index) {
        if (Array.isArray(idea)) {
          if (containsParsedObj(idea)) {
            fragment.appendChild(anchorObject(idea, document));
          } else {
            fragment.appendChild(produceIdea(idea, document));
          }
        } else if (typeof idea === 'string') {
          fragment.appendChild(document.createTextNode(idea));
        }

        if (!Object.is(ideas.length - 1, index) && typeof delimiter === 'string') {
          fragment.appendChild(document.createTextNode(delimiter));
        }
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
      return _typeof(obj) === 'object' && 'nodeType' in obj && obj.nodeType === 1 && obj.cloneNode;
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

    module.exports = {
      produce: produce
    };
  }, {
    "./structures": 6
  }],
  6: [function (require, module, exports) {
    /**
     * @module
     * @ignore
     */

    /**
     * Ideas contains an array of items in which every
     * item is an array of strings and HTML elements,
     * a whitespace-only string or a ParsedObj.
     * @constructor
     * @param   {window.Node}   node      DOM node
     * @param   {Ideas}         ideas     Ideas object
     * @param   {string}        delimiter Delimiter
     * @example
     * {
     *  arr: [
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
    function Ideas() {
      var _this = this;

      this.arr = [];

      this.addIdea = function () {
        _this.arr.push([]);
      };

      this.addObj = function (obj) {
        _this.addIdea();

        _this.appendToIdea(obj);

        _this.addIdea();
      };

      this.appendToIdea = function (piece) {
        if (_this.arr.length === 0) _this.arr.push([]);

        _this.arr[_this.arr.length - 1].push(piece);
      };

      this.fetch = function () {
        return _this.arr.map(function (idea) {
          return idea.filter(isNotEmpty);
        }).reduce(function (acc, idea) {
          separateWhitespace(idea).forEach(function (sep) {
            return acc.push(sep);
          });
          return acc;
        }, []).filter(function (idea) {
          return idea.length !== 0;
        });
      };
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
      }

      if (piece.length === 1 && typeof piece[0] === 'string' && /^\s+$/.test(piece[0])) {
        return [piece[0]];
      }

      if (piece.length === 1) {
        var _ref5 = typeof piece[0] === 'string' ? piece[0].match(/^(\s*)([\s\S]+?)(\s*)$/).slice(1) : [[], piece[0], []],
            _ref6 = _slicedToArray(_ref5, 3),
            _before = _ref6[0],
            text = _ref6[1],
            _after = _ref6[2];

        return [_before, [text], _after];
      }

      return [];
    }

    function isNotEmpty(idea) {
      if (Array.isArray(idea) && idea.length === 0) return false;
      if (typeof idea !== 'string') return true;
      if (idea === '') return false;
      return true;
    }
    /**
     * ParsedObj contains original node and an array
     * in which every item is an array of strings and HTML elements,
     * a full-whitespace string or another ParsedObj.
     * @constructor
     * @param   {window.Node}   node      DOM node
     * @param   {Ideas}         ideas     Ideas object
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
      var ideaProblems = listProblemIdeas(ideas);
      if (ideaProblems.length > 0) throw new Error("Invalid ideas at node ".concat(JSON.stringify(node), ", problems: ").concat(JSON.stringify(ideaProblems), "."));
      this.node = node;
      this.ideas = ideas;
      this.delimiter = delimiter;
    }

    function listProblemIdeas(ideas) {
      return ideas.filter(function (idea) {
        if (idea instanceof ParsedObj) return false;
        if (typeof idea === 'string' && /^\s+$/.test(idea)) return false;
        if (Array.isArray(idea) && ideaItemsAreValid(idea)) return false;
        return true;
      });
    }

    function ideaItemsAreValid(items) {
      return items.filter(function (item) {
        if (typeof item === 'string') return false;
        return false;
      }).length === 0;
    }

    module.exports = {
      Ideas: Ideas,
      ParsedObj: ParsedObj
    };
  }, {}],
  7: [function (require, module, exports) {
    /**
     * Tagger module: tagger parses, produces and numbers chunks and ideas.
     * @module
     * @ignore
     */
    var IDEA_NAME = 'idea';
    var CHUNK_NAME = 'chunk';
    var SKIP_NAME = 'nb-skip';

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
      tagChunks(document, options.root, options.selectors);
      tagIdeas(document, options.delimiter);
      numberEls(document, ".".concat(CHUNK_NAME), CHUNK_NAME);
      numberEls(document, ".".concat(IDEA_NAME), IDEA_NAME);
    }
    /**
     * Mark DOM elements to be tagged, skips nested nodes
     * and nodes with SKIP_NAME class (and their child nodes).
     *
     * @param      {Object}            document   DOM document
     * @param      {array|selectorFn}  selectors  Array of selectors or a {@link selectorFn} callback.
     * @return     {void}  Modifies DOM document
     * @private
     */


    function tagChunks(document, root, selectors) {
      var rootElement = root ? document.querySelector(root) : document;

      if (!rootElement) {
        console.error("No root element found in document titled \"".concat(document.querySelector('title').innerHTML, "\"."));
        return;
      }

      var elements = typeof selectors === 'function' ? selectors(rootElement) : rootElement.querySelectorAll(selectors);
      Array.prototype.forEach.call(elements, function (el) {
        if (!(el.closest(".".concat(SKIP_NAME)) || el.classList.contains(SKIP_NAME)) && !hasAncestorChunk(el, elements)) {
          el.classList.add(CHUNK_NAME);
        }
      });
    }

    function hasAncestorChunk(testedEl, elements) {
      return _toConsumableArray(elements).filter(function (el) {
        if (el === testedEl) return false;else if (el.contains(testedEl)) return true;else return false;
      }).length !== 0;
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
      document.querySelectorAll(".".concat(CHUNK_NAME)).forEach(function (chunk) {
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
        var nonZeroId = index + 1;
        el.setAttribute(refNumAttr, nonZeroId);

        if (name === IDEA_NAME) {
          if (el.getAttribute('id')) {
            var wrapper = document.createElement('SPAN');
            wrapper.setAttribute('id', "".concat(name).concat(nonZeroId));

            _toConsumableArray(el.childNodes).forEach(function (node) {
              wrapper.appendChild(node);
            });

            el.appendChild(wrapper);
          } else el.setAttribute('id', "".concat(name).concat(nonZeroId));
        }
      });
    }

    module.exports = {
      tagDocument: tagDocument
    };
  }, {
    "./parser": 4,
    "./producer": 5
  }]
}, {}, [1]);
