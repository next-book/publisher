"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

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
    "use strict";

    var __importDefault = this && this.__importDefault || function (mod) {
      return mod && mod.__esModule ? mod : {
        "default": mod
      };
    };

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    /**
     * Browser: is entry point for browser, bundled and transpiled into dist * directory.
     * @module
     */

    /* eslint-env browser */

    var tagger_1 = __importDefault(require("./tagger"));

    var gauge_1 = require("./gauge");

    var config_1 = __importDefault(require("./config"));
    /**
     * Maps document contents — to be used in browser env.
     * @remarks
     * Modifies the document
     *
     * @param options - Config options overrides
     */


    function mapHtml(options) {
      tagger_1.default(document, config_1.default(options));
      gauge_1.gaugeDocument(document);
    }

    window.NbMapper = {
      mapHtml: mapHtml
    };
  }, {
    "./config": 2,
    "./gauge": 3,
    "./tagger": 9
  }],
  2: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var defaults = {
      languageCode: 'en',
      output: 'html',
      delimiter: '\n',
      root: 'main',
      selectors: ['p', 'li', 'dd', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'dl'],
      meta: {
        title: 'No title',
        subtitle: 'No subtitle',
        author: 'No author'
      }
    };

    var loadConfig = function loadConfig(options) {
      return Object.assign({}, defaults, options);
    };

    exports.default = loadConfig;
  }, {}],
  3: [function (require, module, exports) {
    "use strict";
    /**
     * @module
     */

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.gaugePublication = exports.gaugeDocument = void 0;
    /**
     * Names of attributes used to store gauge data.
     */

    var attrNames = {
      /** Number of characters */
      chars: 'data-nb-chars',

      /** Number of words */
      words: 'data-nb-words'
    };
    /**
     * Sum of values stored in attribute of provided elements.
     *
     * @param attr - The attribute name
     * @returns Sum of values stored in attribute
     */

    var sumAttr = function sumAttr(attr) {
      return function (ideas) {
        return Array.from(ideas).reduce(function (acc, idea) {
          var iattr = idea.getAttribute(attr);
          if (!iattr) return acc;
          return acc + parseInt(iattr, 10);
        }, 0);
      };
    };
    /**
     * Sets sum of values stored in atribute to a same-called attribute
     * of provided element.
     *
     * @param attr - The attribute name
     * @returns Mutates DOM. Sets the sum in the provided attribute of the element.
     */


    var setSumAttr = function setSumAttr(attr) {
      return function (el) {
        el.setAttribute(attr, sumAttr(attr)(el.querySelectorAll('.idea')).toString());
      };
    };
    /**
     * Counts number of characters of each `.idea` element and stores the value
     * idea’s attribute.
     *
     * @param document - DOM Document
     * @returns Mutates DOM. Sets number of characters in the idea’s attribute.
     */


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
     * @param document - DOM Document
     * @returns Modifies DOM document
     */


    function gaugeDocument(document) {
      gaugeContent(document, attrNames.words, countWords);
      gaugeContent(document, attrNames.chars, countChars);
    }

    exports.gaugeDocument = gaugeDocument;
    /**
     * Gauges words and characters in a publication. Relies on previous gauging of
     * individual chunks using {@link gaugeDocument}.
     *
     * @param documents - DOM Documents
     * @returns Array of objects representing each document statistics.
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

    exports.gaugePublication = gaugePublication;
  }, {}],
  4: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Separator = void 0;
    /**
     * Parser: parses a DOM Node (resp HTML Element) to be later used in producer
     * to update HTML for next-book specific use cases.
     * @module
     */

    var structures_1 = require("./structures");

    var Separator = function Separator() {
      (0, _classCallCheck2.default)(this, Separator);
    };

    exports.Separator = Separator;
    /**
     * Returns ParsedObj which contains original node and an array of arrays in
     * which every array represents one idea or ParsedObj. Ideas are delimited with
     * a delimiter that is searched for in text nodes.
     *
     * @param node - DOM Node or HTML Element
     * @param delimiter - The delimiter
     * @returns An instance of {@link ParsedObj}
     */

    function parse(node, delimiter) {
      var pieces = []; // first create a flat list of strings, HTML Elements, ParsedObjs, and Separators

      node.childNodes.forEach(function (child) {
        if (child.nodeType === child.TEXT_NODE) {
          var texts = [];

          if (child.textContent) {
            texts = child.textContent.split(delimiter);
          }

          texts.forEach(function (text, index) {
            pieces.push(text); // if last, push separator

            if (texts.length - 1 !== index) pieces.push(new Separator());
          });
        } else if (child.nodeType === child.ELEMENT_NODE) {
          if (child.textContent && nodeBreaksInside(child.textContent, delimiter)) pieces.push(parse(child, delimiter));else pieces.push(child);
        }
      }); // cluster pieces into ideas based on

      var ideas = new structures_1.Ideas();
      pieces.forEach(function (piece) {
        if (piece instanceof Separator) ideas.addIdea();else if (piece instanceof structures_1.ParsedObj) ideas.addObj(piece);else ideas.appendToIdea(piece);
      });
      return new structures_1.ParsedObj(node, ideas.fetch(), delimiter);
    }

    exports.default = parse;

    function nodeBreaksInside(text, delimiter) {
      return new RegExp(delimiter.replace('\\', '\\\\')).test(text);
    }
  }, {
    "./structures": 7
  }],
  5: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    /**
     * Producer: takes {@link ParsedObj} and updates the HTML of document with
     * the enhancement for next-book specific use-case.
     * @module
     */

    var structures_1 = require("./structures");

    var dom_1 = require("./utils/dom");
    /**
     * Produces ideas from a parsedObj
     *
     * @param document - DOM Document
     * @param parsedObj - A parsed object
     * @returns HTML node
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
            fragment.appendChild(produceHTMLSpanIdea(idea, document));
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

    exports.default = produce;
    /**
     * Produces HTML span idea from an array of parts.
     *
     * @param idea - The idea
     * @param document - DOM document
     * @returns HTML Element span
     */

    function produceHTMLSpanIdea(idea, document) {
      var span = document.createElement('SPAN');
      span.classList.add('idea');
      idea.forEach(function (item) {
        if (typeof item === 'string') {
          span.appendChild(document.createTextNode(item));
        } else if (dom_1.isNode(item)) {
          span.appendChild(item);
        }
      });
      return span;
    }
    /**
     * Determines if array contains parsed object. See {@link ParsedObj}.
     *
     * @param idea - The idea
     * @returns True if contains parsed object, False otherwise.
     */


    function containsParsedObj(idea) {
      return idea.reduce(function (acc, item) {
        return acc || item instanceof structures_1.ParsedObj;
      }, false);
    }

    function anchorObject(idea, document) {
      var fragment = document.createDocumentFragment();
      if (!Array.isArray(idea)) throw new Error('Idea is not an array.');
      idea.forEach(function (item) {
        if (item instanceof structures_1.ParsedObj) {
          fragment.appendChild(produce(document, item));
        } else if (dom_1.isNode(item)) {
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
  }, {
    "./structures": 7,
    "./utils/dom": 10
  }],
  6: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var regexp_1 = require("../utils/regexp");

    var dom_1 = require("../utils/dom");
    /**
     * Ideas contains an array of items in which every
     * item is an array of strings and HTML elements,
     * a whitespace-only string or a {@link ParsedObj}.
     *
     * @example Contents of Ideas internal array
     * ```ts
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
     * ```
     */


    var Ideas = /*#__PURE__*/function () {
      function Ideas() {
        (0, _classCallCheck2.default)(this, Ideas);
        this.arr = [];
      }
      /**
       * Adds an empty array into Ideas array.
       *
       * @remarks
       * Mutates the internal state of the object
       */


      (0, _createClass2.default)(Ideas, [{
        key: "addIdea",
        value: function addIdea() {
          this.arr.push([]);
        }
        /**
         * Adds Object into the Ideas array.
         *
         * @remarks
         * Mutates the internal state of the object
         *
         * @param obj - Parsed Object
         */

      }, {
        key: "addObj",
        value: function addObj(obj) {
          // not sure why theres not just this.arr.push([obj]);
          this.addIdea();
          this.appendToIdea(obj);
          this.addIdea();
        }
        /**
         * Appends ParsedObj to Idea
         *
         * @remarks
         * Mutates the internal state.
         *
         * @param piece -
         */

      }, {
        key: "appendToIdea",
        value: function appendToIdea(piece) {
          if (this.arr.length === 0) this.arr.push([]);
          var lastItem = this.arr[this.arr.length - 1];

          if (Array.isArray(lastItem)) {
            lastItem.push(piece);
          }
        }
        /**
         * Checks if idea piece isn’t empty array or empty string.
         *
         * @param piece - IdeasItemPiece
         * @returns False if piece is empty array or empty string, otherwise true
         */

      }, {
        key: "isNotEmpty",
        value: function isNotEmpty(piece) {
          if (Array.isArray(piece) && piece.length === 0) return false;
          if (typeof piece !== 'string') return true;
          if (piece === '') return false;
          return true;
        }
        /**
         * Splits whitespace from IdeasItemPieces’s strings into separate strings.
         *
         * @param piece - IdeasItem
         * @returns Array of pieces, in which non-whitespace strings do not contain opening or trailing whitespace.
         */

      }, {
        key: "separateWhitespace",
        value: function separateWhitespace(piece) {
          if (dom_1.isNode(piece)) {
            return [];
          }

          if (piece.length > 1) {
            // splits left whitespace from the content
            var before, firstItem;

            if (typeof piece[0] !== 'string') {
              var _ref = [[], piece[0]];
              before = _ref[0];
              firstItem = _ref[1];
            } else {
              var leftMatch = piece[0].match(regexp_1.leftWhitespace);

              var _ref2 = leftMatch ? leftMatch.slice(1) : [[], piece[0]];

              var _ref3 = (0, _slicedToArray2.default)(_ref2, 2);

              before = _ref3[0];
              firstItem = _ref3[1];
            } // splits right whitespace from the content


            var lastPiece = piece[piece.length - 1];
            var lastItem, after;

            if (typeof lastPiece !== 'string') {
              lastItem = lastPiece;
              after = [];
            } else {
              var rightMatch = lastPiece.match(regexp_1.rightWhitespace);

              var _ref4 = rightMatch ? rightMatch.slice(1) : [lastPiece, []];

              var _ref5 = (0, _slicedToArray2.default)(_ref4, 2);

              lastItem = _ref5[0];
              after = _ref5[1];
            } // use middle pieces as they are


            var mid = piece.slice(1, piece.length - 1);
            return [before, [firstItem].concat((0, _toConsumableArray2.default)(mid), [lastItem]), after];
          }

          if (piece.length === 1) {
            if (typeof piece[0] === 'string' && regexp_1.onlyWhitespace.test(piece[0])) return [piece[0]];

            var _before, text, _after;

            if (typeof piece[0] !== 'string') {
              var _ref6 = [[], piece[0], []];
              _before = _ref6[0];
              text = _ref6[1];
              _after = _ref6[2];
            } else {
              var leftAndRightMatch = piece[0].match(regexp_1.leftAndRightWhitespace);

              var _ref7 = leftAndRightMatch ? leftAndRightMatch.slice(1) : [[], piece[0], []];

              var _ref8 = (0, _slicedToArray2.default)(_ref7, 3);

              _before = _ref8[0];
              text = _ref8[1];
              _after = _ref8[2];
            }

            return [_before, [text], _after];
          }

          return [];
        }
        /**
         * Returns filtered (non-empty) and whitespace-separated ideas.
         *
         * @remarks
         * This function is used to produce array that is assigned
         * to {@link ParsedObj} ideas public param.
         *
         * @returns
         */

      }, {
        key: "fetch",
        value: function fetch() {
          var _this = this;

          return this.arr.map(function (idea) {
            if (Array.isArray(idea)) return idea.filter(function (piece) {
              return _this.isNotEmpty(piece);
            });
            return idea;
          }).reduce(function (acc, idea) {
            // typeof idea === 'string' is changed to empty array
            var pieces = _this.separateWhitespace(idea);

            pieces.forEach(function (sep) {
              return acc.push(sep);
            });
            return acc;
          }, []).filter(function (idea) {
            return Array.isArray(idea) && idea.length !== 0;
          });
        }
      }]);
      return Ideas;
    }();

    exports.default = Ideas;
  }, {
    "../utils/dom": 10,
    "../utils/regexp": 11
  }],
  7: [function (require, module, exports) {
    "use strict";
    /**
     * Structures used for parsing input and producing html for publication.
     * @module
     */

    var __importDefault = this && this.__importDefault || function (mod) {
      return mod && mod.__esModule ? mod : {
        "default": mod
      };
    };

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ParsedObj = exports.Ideas = void 0;

    var ideas_1 = __importDefault(require("./ideas"));

    exports.Ideas = ideas_1.default;

    var parsedobj_1 = __importDefault(require("./parsedobj"));

    exports.ParsedObj = parsedobj_1.default;
  }, {
    "./ideas": 6,
    "./parsedobj": 8
  }],
  8: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var regexp_1 = require("../utils/regexp");
    /**
     * ParsedObj represents Node (respectively the DOM Element) and its subtree.
     *
     * @remarks
     * ParsedObj contains original node and an array of ideas.
     * Every item is an array of strings and HTML elements,
     * a full-whitespace string or another ParsedObj.
     *
     * @example Example ParsedObj contents
     * ```ts
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
     * ```
     */


    var ParsedObj = /*#__PURE__*/function () {
      /**
       * @param node - Original Node
       * @param ideas - Every item is an array of strings and HTML elements,
       * a full-whitespace string or another ParsedObj.
       * @param delimiter - Delimiter
       */
      function ParsedObj(node, ideas, delimiter) {
        (0, _classCallCheck2.default)(this, ParsedObj);
        var ideaProblems = this.listProblemParsedObjIdeas(ideas);
        if (ideaProblems.length > 0) throw new Error("Invalid ideas at node ".concat(JSON.stringify(node), ", problems: ").concat(JSON.stringify(ideaProblems), "."));
        this.node = node;
        this.ideas = ideas;
        this.delimiter = delimiter;
      }
      /**
       * Returns array filtered ideas, leaving only ideas that are not valid.
       *
       * @param ideas -
       * @returns
       */


      (0, _createClass2.default)(ParsedObj, [{
        key: "listProblemParsedObjIdeas",
        value: function listProblemParsedObjIdeas(ideas) {
          var _this2 = this;

          return ideas.filter(function (idea) {
            if (idea instanceof ParsedObj) return false;
            if (typeof idea === 'string' && regexp_1.onlyWhitespace.test(idea)) return false;
            if (Array.isArray(idea) && _this2.ideaItemsAreValid(idea)) return false;
            return true;
          });
        }
        /**
         * Determine whether array only
         *
         * @param items - Array of strings and Elements
         * @returns Boolean
         */

      }, {
        key: "ideaItemsAreValid",
        value: function ideaItemsAreValid(items) {
          // This function seems like tautology from the types perspective.
          return items.filter(function (item) {
            if (typeof item === 'string') return false;
            return false;
          }).length === 0;
        }
      }]);
      return ParsedObj;
    }();

    exports.default = ParsedObj;
  }, {
    "../utils/regexp": 11
  }],
  9: [function (require, module, exports) {
    "use strict";

    var __importDefault = this && this.__importDefault || function (mod) {
      return mod && mod.__esModule ? mod : {
        "default": mod
      };
    };

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var producer_1 = __importDefault(require("./producer"));

    var parser_1 = __importDefault(require("./parser"));

    var IDEA_NAME = 'idea';
    var CHUNK_NAME = 'chunk';
    var SKIP_NAME = 'nb-skip';
    var refNumAttr = 'data-nb-ref-number';
    /**
     * Recognizes and tags chunks and ideas in a document
     *
     * @param document - DOM document
     * @param options - config options
     * @returns mutates DOM document
    with marked chunks by {@link markElementsToBeTagged}. */

    function tagDocument(document, options) {
      markElementsToBeTagged(document, options.root, options.selectors);
      tagIdeas(document, options.delimiter);
      numberEls(document, ".".concat(CHUNK_NAME), CHUNK_NAME);
      numberEls(document, ".".concat(IDEA_NAME), IDEA_NAME);
    }

    exports.default = tagDocument;
    /**
     * Mark DOM Elements to be tagged
     *
     * @remarks
     * Skips nested nodes and nodes with SKIP_NAME class (and their child * nodes).
     *
     * @param document - DOM document
     * @param root - Root element
     * @param selectors - Array of selectors or a {@link SelectorFn}
     * @returns Modifies DOM document
     */

    function markElementsToBeTagged(document, root, selectors) {
      var rootElement = root ? document.querySelector(root) : document;

      if (!rootElement) {
        var _document$querySelect;

        console.error("No root \"".concat(root, "\" element found in document titled \"").concat(document === null || document === void 0 ? void 0 : (_document$querySelect = document.querySelector('title')) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.innerHTML, "\"."));
        return;
      }

      var elements = typeof selectors === 'function' ? selectors(rootElement) : rootElement.querySelectorAll(selectors.join(', ')); // beware: there was no join in the code before typescript

      if (elements) elements.forEach(function (el) {
        if (!(el.closest(".".concat(SKIP_NAME)) || el.classList.contains(SKIP_NAME)) && !hasAncestorChunk(el, elements)) {
          el.classList.add(CHUNK_NAME);
        }
      });
    }
    /**
     * Determines whether the tested element has an inclusive descendant in the list of elements.
     *
     * @param testedEl - Element to be tested
     * @param elements - List of elements
     * @returns Returns the boolean value of the assertion
     */


    function hasAncestorChunk(testedEl, elements) {
      return (0, _toConsumableArray2.default)(elements).filter(function (el) {
        if (el === testedEl) return false;else if (el.contains(testedEl)) return true;else return false;
      }).length !== 0;
    }
    /**
     * Map ideas in specific DOM context.
     *
     * @param document - DOM document with marked chunks by {@link markElementsToBeTagged}.
     * @param delimiter - Delimiter of ideas.
     * @returns Modifies the Document
     */


    function tagIdeas(document, delimiter) {
      document.querySelectorAll(".".concat(CHUNK_NAME)).forEach(function (chunk) {
        var _chunk$parentNode;

        var tagged = producer_1.default(document, parser_1.default(chunk, delimiter));
        (_chunk$parentNode = chunk.parentNode) === null || _chunk$parentNode === void 0 ? void 0 : _chunk$parentNode.replaceChild(tagged, chunk);
      });
    }
    /**
     * Numbers selected elements (\<1…n\>), adding a data attribute and an numbered
     * id attribute (\<name\>#).
     *
     * @param document - DOM document
     * @param selector - DOMString
     * @param name - Name used in creating id attributes (<name>#)
     * @returns Modifies DOM document
     */


    function numberEls(document, selector, name) {
      Array.prototype.forEach.call(document.querySelectorAll(selector), function (el, index) {
        var nonZeroId = index + 1;
        el.setAttribute(refNumAttr, nonZeroId);

        if (name === IDEA_NAME) {
          if (el.getAttribute('id')) {
            var wrapper = document.createElement('SPAN');
            wrapper.setAttribute('id', "".concat(name).concat(nonZeroId));
            (0, _toConsumableArray2.default)(el.childNodes).forEach(function (node) {
              wrapper.appendChild(node);
            });
            el.appendChild(wrapper);
          } else el.setAttribute('id', "".concat(name).concat(nonZeroId));
        }
      });
    }
  }, {
    "./parser": 4,
    "./producer": 5
  }],
  10: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isNode = void 0;
    /**
     * Determines if an object is a DOM Node, works outside of browsers.
     * @see
     * {@link https://stackoverflow.com/questions/384286/how-do-you-check-if-a-javascript-object-is-a-dom-object| How do you check if a JavaScript Object is a DOM Object?}
     * @param obj - The object
     * @returns True if node, False otherwise
     */
    // eslint-disable-next-line @typescript-eslint/ban-types

    function isNode(obj) {
      return (0, _typeof2.default)(obj) === 'object' && 'nodeType' in obj && obj.nodeType === 1;
    }

    exports.isNode = isNode;
  }, {}],
  11: [function (require, module, exports) {
    "use strict";
    /**
     * Annotated RegExp’s to be used in a convenient way.
     * @module
     */

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.leftAndRightWhitespace = exports.onlyWhitespace = exports.rightWhitespace = exports.leftWhitespace = void 0;
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

    exports.leftWhitespace = /^(\s*)([\s\S]+)$/;
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

    exports.rightWhitespace = /^([\s\S]+?)(\s*)$/;
    /**
     * Matches only whitespace string.
     * @internal
     */

    exports.onlyWhitespace = /^\s+$/;
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

    exports.leftAndRightWhitespace = /^(\s*)([\s\S]+?)(\s*)$/;
  }, {}]
}, {}, [1]);
