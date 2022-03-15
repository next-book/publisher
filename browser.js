(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdeaId = exports.LinkRel = exports.ResearchMetaName = exports.MetaName = exports.ComponentClass = exports.PaginationClass = exports.CropClass = exports.FootnotesClass = exports.StateClass = exports.GaugeAttr = exports.TagAttr = exports.classSelector = exports.Role = exports.Rel = exports.ChapterId = exports.Id = exports.DocRoleClass = exports.NavClass = exports.TocClass = exports.TagClass = exports.StyleClass = exports.PageClass = void 0;
var PageClass;
(function (PageClass) {
    PageClass["Home"] = "home";
})(PageClass = exports.PageClass || (exports.PageClass = {}));
var StyleClass;
(function (StyleClass) {
    StyleClass["Custom"] = "nb-custom-style";
})(StyleClass = exports.StyleClass || (exports.StyleClass = {}));
var TagClass;
(function (TagClass) {
    TagClass["Chunk"] = "chunk";
    TagClass["Idea"] = "idea";
    /** For skipping elements and their children from tagging */
    TagClass["Skip"] = "nb-skip";
})(TagClass = exports.TagClass || (exports.TagClass = {}));
var TocClass;
(function (TocClass) {
    TocClass["Headings"] = "headings-toc";
    TocClass["PlainList"] = "plain";
})(TocClass = exports.TocClass || (exports.TocClass = {}));
var NavClass;
(function (NavClass) {
    NavClass["Begin"] = "begin-nav";
    NavClass["End"] = "end-nav";
})(NavClass = exports.NavClass || (exports.NavClass = {}));
exports.DocRoleClass = {
    break: 'nb-role-break',
    chapter: 'nb-role-chapter',
    cover: 'nb-role-cover',
    colophon: 'nb-role-colophon',
    other: 'nb-role-other',
};
var Id;
(function (Id) {
    Id["FullTextLink"] = "full-text-link";
    Id["Manifest"] = "manifest";
    Id["Idea"] = "idea";
})(Id = exports.Id || (exports.Id = {}));
var ChapterId;
(function (ChapterId) {
    ChapterId["Start"] = "chapter-start";
    ChapterId["End"] = "chapter-end";
})(ChapterId = exports.ChapterId || (exports.ChapterId = {}));
var Rel;
(function (Rel) {
    Rel["Index"] = "index";
    Rel["License"] = "license";
    Rel["Publication"] = "publication";
    Rel["Prev"] = "prev";
    Rel["Next"] = "next";
    Rel["Self"] = "self";
})(Rel = exports.Rel || (exports.Rel = {}));
var Role;
(function (Role) {
    Role["DocToc"] = "doc-toc";
})(Role = exports.Role || (exports.Role = {}));
const classSelector = (classname) => '.' + classname;
exports.classSelector = classSelector;
var TagAttr;
(function (TagAttr) {
    /** Element ref number provided by tagger */
    TagAttr["RefNum"] = "data-nb-ref-number";
})(TagAttr = exports.TagAttr || (exports.TagAttr = {}));
var GaugeAttr;
(function (GaugeAttr) {
    /** Number of characters provided by gauge */
    GaugeAttr["Chars"] = "data-nb-chars";
    /** Number of words provided by gauge */
    GaugeAttr["Words"] = "data-nb-words";
})(GaugeAttr = exports.GaugeAttr || (exports.GaugeAttr = {}));
var StateClass;
(function (StateClass) {
    StateClass["Ready"] = "nb-ready";
})(StateClass = exports.StateClass || (exports.StateClass = {}));
var FootnotesClass;
(function (FootnotesClass) {
    FootnotesClass["Wrapper"] = "footnotes";
})(FootnotesClass = exports.FootnotesClass || (exports.FootnotesClass = {}));
var CropClass;
(function (CropClass) {
    CropClass["Wrapper"] = "nb-cropped";
    CropClass["Visible"] = "visible";
})(CropClass = exports.CropClass || (exports.CropClass = {}));
var PaginationClass;
(function (PaginationClass) {
    PaginationClass["Forward"] = "step-forward";
    PaginationClass["Back"] = "step-back";
})(PaginationClass = exports.PaginationClass || (exports.PaginationClass = {}));
var ComponentClass;
(function (ComponentClass) {
    ComponentClass["Annotations"] = "nb-annotations";
    ComponentClass["Navigation"] = "nb-navigation";
    ComponentClass["Position"] = "nb-position";
    ComponentClass["Manifest"] = "nb-manifest";
    ComponentClass["Peeks"] = "nb-peeks";
    ComponentClass["Trace"] = "nb-trace";
    ComponentClass["Offline"] = "nb-offline";
    ComponentClass["Controls"] = "nb-controls";
    ComponentClass["Config"] = "nb-config";
    ComponentClass["Onboarding"] = "nb-onboarding";
    ComponentClass["Research"] = "nb-research";
})(ComponentClass = exports.ComponentClass || (exports.ComponentClass = {}));
var MetaName;
(function (MetaName) {
    MetaName["Order"] = "nb-order";
    MetaName["DocRole"] = "nb-role";
    MetaName["Identifier"] = "nb-identifier";
})(MetaName = exports.MetaName || (exports.MetaName = {}));
var ResearchMetaName;
(function (ResearchMetaName) {
    ResearchMetaName["Text"] = "nb-research";
    ResearchMetaName["Orgs"] = "nb-research-orgs";
    ResearchMetaName["GA"] = "nb-research-ga";
})(ResearchMetaName = exports.ResearchMetaName || (exports.ResearchMetaName = {}));
var LinkRel;
(function (LinkRel) {
    LinkRel["Index"] = "index";
    LinkRel["Self"] = "self";
    LinkRel["Prev"] = "prev";
    LinkRel["Publication"] = "publication";
    LinkRel["Next"] = "next";
    LinkRel["Colophon"] = "colophon";
    LinkRel["License"] = "license";
})(LinkRel = exports.LinkRel || (exports.LinkRel = {}));
const getIdeaId = (n) => TagClass.Idea + n.toString();
exports.getIdeaId = getIdeaId;

},{}],2:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Browser: is entry point for browser, bundled and transpiled into dist * directory.
 * @module
 */
/* eslint-env browser */
const tagger_1 = __importDefault(require("./tagger"));
const gauge_1 = require("./gauge");
const config_1 = __importDefault(require("./config"));
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
window.NbMapper = { mapHtml };

},{"./config":3,"./gauge":4,"./tagger":10}],3:[function(require,module,exports){
"use strict";
/**
 * Config module
 *
 * The config is being created in following stages:
 * 1. First in {@link prepConfig}, the custom book options in the shape of {@link PartialConfig} are loaded.
 * 2. Preview feature settings in shape of {@link Preview} are being created by appling loaded custom
 *    options onto {@link previewDefaults}.
 *    The preview feature settings are added to the loaded config, together making the
 *    shape of {@link PartialConfigWithPreview}.
 * 3. Since config is guaranteed to have preview settings, it is then used to override {@link configDefaults}.
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewDefaults = void 0;
exports.previewDefaults = {
    isPreview: false,
    chaptersSlice: 3,
    removeChapters: [],
};
const configDefaults = {
    languageCode: 'en',
    output: 'html',
    delimiter: '\n',
    root: 'main',
    selectors: ['p', 'li', 'dd', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'dl'],
    static: [],
    readingOrder: [],
    tocBase: [],
    meta: {
        title: 'No title',
        subtitle: 'No subtitle',
        author: 'No author',
    },
    preview: { ...exports.previewDefaults },
};
const loadConfig = (overrides) => {
    return Object.assign({}, configDefaults, overrides);
};
exports.default = loadConfig;

},{}],4:[function(require,module,exports){
"use strict";
/**
 * @module Gauge
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.gaugePublication = exports.gaugeDocument = void 0;
const dom_1 = require("../shared/dom");
/**
 * Sum of values stored in attribute of provided elements.
 *
 * @param attr - The attribute name
 * @returns Sum of values stored in attribute
 */
const sumAttr = (attr) => (ideas) => Array.from(ideas).reduce((acc, idea) => {
    const iattr = idea.getAttribute(attr);
    if (!iattr)
        return acc;
    return acc + parseInt(iattr, 10);
}, 0);
/**
 * Sets sum of values stored in atribute to a same-called attribute
 * of provided element.
 *
 * @param attr - The attribute name
 * @returns Mutates DOM. Sets the sum in the provided attribute of the element.
 */
const setSumAttr = (attr) => (el) => {
    el.setAttribute(attr, sumAttr(attr)(el.querySelectorAll(dom_1.classSelector(dom_1.TagClass.Idea))).toString());
};
/**
 * Counts number of characters of each `.idea` element and stores the value
 * idea’s attribute.
 *
 * @param document - DOM Document
 * @returns Mutates DOM. Sets number of characters in the idea’s attribute.
 */
function countChars(document) {
    Array.prototype.map.call(document.querySelectorAll(dom_1.classSelector(dom_1.TagClass.Idea)), idea => {
        idea.setAttribute(dom_1.GaugeAttr.Chars, idea.textContent.length);
    });
}
function countWords(document) {
    Array.prototype.map.call(document.querySelectorAll(dom_1.classSelector(dom_1.TagClass.Idea)), idea => {
        idea.setAttribute(dom_1.GaugeAttr.Words, idea.textContent.split(/\s+/g).length);
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
    gaugeContent(document, dom_1.GaugeAttr.Words, countWords);
    gaugeContent(document, dom_1.GaugeAttr.Chars, countChars);
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
    return documents.map(document => ({
        words: parseInt(document.body.getAttribute(dom_1.GaugeAttr.Words), 10),
        chars: parseInt(document.body.getAttribute(dom_1.GaugeAttr.Chars), 10),
        ideas: document.querySelectorAll(dom_1.classSelector(dom_1.TagClass.Idea)).length,
    }));
}
exports.gaugePublication = gaugePublication;

},{"../shared/dom":1}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Separator = void 0;
/**
 * Parser: parses a DOM Node (resp HTML Element) to be later used in producer
 * to update HTML for next-book specific use cases.
 * @module
 */
const structures_1 = require("./structures");
class Separator {
}
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
    const pieces = [];
    // first create a flat list of strings, HTML Elements, ParsedObjs, and Separators
    node.childNodes.forEach(child => {
        if (child.nodeType === child.TEXT_NODE) {
            let texts = [];
            if (child.textContent) {
                texts = child.textContent.split(delimiter);
            }
            texts.forEach((text, index) => {
                pieces.push(text);
                // if last, push separator
                if (texts.length - 1 !== index)
                    pieces.push(new Separator());
            });
        }
        else if (child.nodeType === child.ELEMENT_NODE) {
            if (child.textContent && nodeBreaksInside(child.textContent, delimiter))
                pieces.push(parse(child, delimiter));
            else
                pieces.push(child);
        }
    });
    // cluster pieces into ideas based on
    const ideas = new structures_1.Ideas();
    pieces.forEach(piece => {
        if (piece instanceof Separator)
            ideas.addIdea();
        else if (piece instanceof structures_1.ParsedObj)
            ideas.addObj(piece);
        else
            ideas.appendToIdea(piece);
    });
    return new structures_1.ParsedObj(node, ideas.fetch(), delimiter);
}
exports.default = parse;
function nodeBreaksInside(text, delimiter) {
    return new RegExp(delimiter.replace('\\', '\\\\')).test(text);
}

},{"./structures":8}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Producer: takes {@link ParsedObj} and updates the HTML of document with
 * the enhancement for next-book specific use-case.
 * @module
 */
const structures_1 = require("./structures");
const dom_1 = require("./utils/dom");
const dom_2 = require("../shared/dom");
/**
 * Produces ideas from a parsedObj
 *
 * @param document - DOM Document
 * @param parsedObj - A parsed object
 * @returns HTML node
 */
function produce(document, parsedObj) {
    const fragment = document.createDocumentFragment();
    const { node, ideas, delimiter } = parsedObj;
    ideas.forEach((idea, index) => {
        if (Array.isArray(idea)) {
            if (containsParsedObj(idea)) {
                fragment.appendChild(anchorObject(idea, document));
            }
            else {
                fragment.appendChild(produceHTMLSpanIdea(idea, document));
            }
        }
        else if (typeof idea === 'string') {
            fragment.appendChild(document.createTextNode(idea));
        }
        if (!Object.is(ideas.length - 1, index) && typeof delimiter === 'string') {
            fragment.appendChild(document.createTextNode(delimiter));
        }
    });
    const chunk = emptyNode(node.cloneNode());
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
    const span = document.createElement('span');
    span.classList.add(dom_2.TagClass.Idea);
    idea.forEach(item => {
        if (typeof item === 'string') {
            span.appendChild(document.createTextNode(item));
        }
        else if (dom_1.isNode(item)) {
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
    return idea.reduce((acc, item) => acc || item instanceof structures_1.ParsedObj, false);
}
function anchorObject(idea, document) {
    const fragment = document.createDocumentFragment();
    if (!Array.isArray(idea))
        throw new Error('Idea is not an array.');
    idea.forEach(item => {
        if (item instanceof structures_1.ParsedObj) {
            fragment.appendChild(produce(document, item));
        }
        else if (dom_1.isNode(item)) {
            fragment.appendChild(item);
        }
        else {
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

},{"../shared/dom":1,"./structures":8,"./utils/dom":11}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_1 = require("../utils/regexp");
const dom_1 = require("../utils/dom");
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
class Ideas {
    constructor() {
        this.arr = [];
    }
    /**
     * Adds an empty array into Ideas array.
     *
     * @remarks
     * Mutates the internal state of the object
     */
    addIdea() {
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
    addObj(obj) {
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
    appendToIdea(piece) {
        if (this.arr.length === 0)
            this.arr.push([]);
        const lastItem = this.arr[this.arr.length - 1];
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
    isNotEmpty(piece) {
        if (Array.isArray(piece) && piece.length === 0)
            return false;
        if (typeof piece !== 'string')
            return true;
        if (piece === '')
            return false;
        return true;
    }
    /**
     * Splits whitespace from IdeasItemPieces’s strings into separate strings.
     *
     * @param piece - IdeasItem
     * @returns Array of pieces, in which non-whitespace strings do not contain opening or trailing whitespace.
     */
    separateWhitespace(piece) {
        if (dom_1.isNode(piece)) {
            return [];
        }
        if (piece.length > 1) {
            // splits left whitespace from the content
            let before, firstItem;
            if (typeof piece[0] !== 'string') {
                [before, firstItem] = [[], piece[0]];
            }
            else {
                const leftMatch = piece[0].match(regexp_1.leftWhitespace);
                [before, firstItem] = leftMatch ? leftMatch.slice(1) : [[], piece[0]];
            }
            // splits right whitespace from the content
            const lastPiece = piece[piece.length - 1];
            let lastItem, after;
            if (typeof lastPiece !== 'string') {
                [lastItem, after] = [lastPiece, []];
            }
            else {
                const rightMatch = lastPiece.match(regexp_1.rightWhitespace);
                [lastItem, after] = rightMatch ? rightMatch.slice(1) : [lastPiece, []];
            }
            // use middle pieces as they are
            const mid = piece.slice(1, piece.length - 1);
            return [before, [firstItem, ...mid, lastItem], after];
        }
        if (piece.length === 1) {
            if (typeof piece[0] === 'string' && regexp_1.onlyWhitespace.test(piece[0]))
                return [piece[0]];
            let before, text, after;
            if (typeof piece[0] !== 'string') {
                [before, text, after] = [[], piece[0], []];
            }
            else {
                const leftAndRightMatch = piece[0].match(regexp_1.leftAndRightWhitespace);
                [before, text, after] = leftAndRightMatch ? leftAndRightMatch.slice(1) : [[], piece[0], []];
            }
            return [before, [text], after];
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
    fetch() {
        return this.arr
            .map(idea => {
            if (Array.isArray(idea))
                return idea.filter(piece => this.isNotEmpty(piece));
            return idea;
        })
            .reduce((acc, idea) => {
            // typeof idea === 'string' is changed to empty array
            const pieces = this.separateWhitespace(idea);
            pieces.forEach(sep => acc.push(sep));
            return acc;
        }, [])
            .filter(idea => Array.isArray(idea) && idea.length !== 0);
    }
}
exports.default = Ideas;

},{"../utils/dom":11,"../utils/regexp":12}],8:[function(require,module,exports){
"use strict";
/**
 * Structures used for parsing input and producing html for publication.
 * @module
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedObj = exports.Ideas = void 0;
const ideas_1 = __importDefault(require("./ideas"));
exports.Ideas = ideas_1.default;
const parsedobj_1 = __importDefault(require("./parsedobj"));
exports.ParsedObj = parsedobj_1.default;

},{"./ideas":7,"./parsedobj":9}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_1 = require("../utils/regexp");
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
class ParsedObj {
    /**
     * @param node - Original Node
     * @param ideas - Every item is an array of strings and HTML elements,
     * a full-whitespace string or another ParsedObj.
     * @param delimiter - Delimiter
     */
    constructor(node, ideas, delimiter) {
        const ideaProblems = this.listProblemParsedObjIdeas(ideas);
        if (ideaProblems.length > 0)
            throw new Error(`Invalid ideas at node ${JSON.stringify(node)}, problems: ${JSON.stringify(ideaProblems)}.`);
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
    listProblemParsedObjIdeas(ideas) {
        return ideas.filter(idea => {
            if (idea instanceof ParsedObj)
                return false;
            if (typeof idea === 'string' && regexp_1.onlyWhitespace.test(idea))
                return false;
            if (Array.isArray(idea) && this.ideaItemsAreValid(idea))
                return false;
            return true;
        });
    }
    /**
     * Determine whether array only
     *
     * @param items - Array of strings and Elements
     * @returns Boolean
     */
    ideaItemsAreValid(items) {
        // This function seems like tautology from the types perspective.
        return (items.filter(item => {
            if (typeof item === 'string')
                return false;
            return false;
        }).length === 0);
    }
}
exports.default = ParsedObj;

},{"../utils/regexp":12}],10:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const producer_1 = __importDefault(require("./producer"));
const parser_1 = __importDefault(require("./parser"));
const dom_1 = require("../shared/dom");
/**
 * Recognizes and tags chunks and ideas in a document
 *
 * @param document - DOM document
 * @param options - config options
 * @returns mutates DOM document with marked chunks
 * by {@link markElementsToBeTagged}. */
function tagDocument(document, options) {
    markElementsToBeTagged(document, options.root, options.selectors);
    tagIdeas(document, options.delimiter);
    numberEls(document, dom_1.classSelector(dom_1.TagClass.Chunk), dom_1.TagClass.Chunk);
    numberEls(document, dom_1.classSelector(dom_1.TagClass.Idea), dom_1.Id.Idea);
}
exports.default = tagDocument;
/**
 * Mark DOM Elements to be tagged
 *
 * @remarks
 * Skips nested nodes and nodes with {@link TagClass.Skip} enum string (and their child * nodes).
 *
 * @param document - DOM document
 * @param root - Root element
 * @param selectors - Array of selectors or a {@link SelectorFn}
 * @returns Modifies DOM document
 */
function markElementsToBeTagged(document, root, selectors) {
    const rootElement = root ? document.querySelector(root) : document;
    if (!rootElement) {
        console.error(`No root "${root}" element found in document titled "${document?.querySelector('title')?.innerHTML}".`);
        return;
    }
    const elements = typeof selectors === 'function'
        ? selectors(rootElement)
        : rootElement.querySelectorAll(selectors.join(', '));
    if (elements)
        elements.forEach(el => {
            if (!(el.closest(`.${dom_1.TagClass.Skip}`) || el.classList.contains(dom_1.TagClass.Skip)) &&
                !hasAncestorChunk(el, elements)) {
                el.classList.add(dom_1.TagClass.Chunk);
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
    return ([...elements].filter(el => {
        if (el === testedEl)
            return false;
        else if (el.contains(testedEl))
            return true;
        else
            return false;
    }).length !== 0);
}
/**
 * Map ideas in specific DOM context.
 *
 * @param document - DOM document with marked chunks by {@link markElementsToBeTagged}.
 * @param delimiter - Delimiter of ideas.
 * @returns Modifies the Document
 */
function tagIdeas(document, delimiter) {
    document.querySelectorAll(`.${dom_1.TagClass.Chunk}`).forEach(chunk => {
        const tagged = producer_1.default(document, parser_1.default(chunk, delimiter));
        chunk.parentNode?.replaceChild(tagged, chunk);
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
    Array.prototype.forEach.call(document.querySelectorAll(selector), (el, index) => {
        const nonZeroId = index + 1;
        el.setAttribute(dom_1.TagAttr.RefNum, nonZeroId);
        if (name === dom_1.Id.Idea) {
            if (el.getAttribute('id')) {
                const wrapper = document.createElement('SPAN');
                wrapper.setAttribute('id', `${name}${nonZeroId}`);
                [...el.childNodes].forEach(node => {
                    wrapper.appendChild(node);
                });
                el.appendChild(wrapper);
            }
            else
                el.setAttribute('id', `${name}${nonZeroId}`);
        }
    });
}

},{"../shared/dom":1,"./parser":5,"./producer":6}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    return typeof obj === 'object' && 'nodeType' in obj && obj.nodeType === 1;
}
exports.isNode = isNode;

},{}],12:[function(require,module,exports){
"use strict";
/**
 * Annotated RegExp’s to be used in a convenient way.
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
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

},{}]},{},[2]);
