(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (process){(function (){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this)}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setErrorMap = exports.overrideErrorMap = exports.defaultErrorMap = exports.ZodError = exports.quotelessJson = exports.ZodIssueCode = void 0;
var util_1 = require("./helpers/util");
exports.ZodIssueCode = util_1.util.arrayToEnum([
    "invalid_type",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of",
]);
var quotelessJson = function (obj) {
    var json = JSON.stringify(obj, null, 2);
    return json.replace(/"([^"]+)":/g, "$1:");
};
exports.quotelessJson = quotelessJson;
var ZodError = /** @class */ (function (_super) {
    __extends(ZodError, _super);
    function ZodError(issues) {
        var _newTarget = this.constructor;
        var _this = _super.call(this) || this;
        _this.issues = [];
        _this.format = function () {
            var fieldErrors = { _errors: [] };
            var processError = function (error) {
                var e_1, _a;
                try {
                    for (var _b = __values(error.issues), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var issue = _c.value;
                        if (issue.code === "invalid_union") {
                            issue.unionErrors.map(processError);
                        }
                        else if (issue.code === "invalid_return_type") {
                            processError(issue.returnTypeError);
                        }
                        else if (issue.code === "invalid_arguments") {
                            processError(issue.argumentsError);
                        }
                        else if (issue.path.length === 0) {
                            fieldErrors._errors.push(issue.message);
                        }
                        else {
                            var curr = fieldErrors;
                            var i = 0;
                            while (i < issue.path.length) {
                                var el = issue.path[i];
                                var terminal = i === issue.path.length - 1;
                                if (!terminal) {
                                    if (typeof el === "string") {
                                        curr[el] = curr[el] || { _errors: [] };
                                    }
                                    else if (typeof el === "number") {
                                        var errorArray = [];
                                        errorArray._errors = [];
                                        curr[el] = curr[el] || errorArray;
                                    }
                                }
                                else {
                                    curr[el] = curr[el] || { _errors: [] };
                                    curr[el]._errors.push(issue.message);
                                }
                                curr = curr[el];
                                i++;
                            }
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            };
            processError(_this);
            return fieldErrors;
        };
        _this.addIssue = function (sub) {
            _this.issues = __spreadArray(__spreadArray([], __read(_this.issues), false), [sub], false);
        };
        _this.addIssues = function (subs) {
            if (subs === void 0) { subs = []; }
            _this.issues = __spreadArray(__spreadArray([], __read(_this.issues), false), __read(subs), false);
        };
        var actualProto = _newTarget.prototype;
        if (Object.setPrototypeOf) {
            // eslint-disable-next-line ban/ban
            Object.setPrototypeOf(_this, actualProto);
        }
        else {
            _this.__proto__ = actualProto;
        }
        _this.name = "ZodError";
        _this.issues = issues;
        return _this;
    }
    Object.defineProperty(ZodError.prototype, "errors", {
        get: function () {
            return this.issues;
        },
        enumerable: false,
        configurable: true
    });
    ZodError.prototype.toString = function () {
        return this.message;
    };
    Object.defineProperty(ZodError.prototype, "message", {
        get: function () {
            return JSON.stringify(this.issues, null, 2);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodError.prototype, "isEmpty", {
        get: function () {
            return this.issues.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    ZodError.prototype.flatten = function (mapper) {
        var e_2, _a;
        if (mapper === void 0) { mapper = function (issue) { return issue.message; }; }
        var fieldErrors = {};
        var formErrors = [];
        try {
            for (var _b = __values(this.issues), _c = _b.next(); !_c.done; _c = _b.next()) {
                var sub = _c.value;
                if (sub.path.length > 0) {
                    fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
                    fieldErrors[sub.path[0]].push(mapper(sub));
                }
                else {
                    formErrors.push(mapper(sub));
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return { formErrors: formErrors, fieldErrors: fieldErrors };
    };
    Object.defineProperty(ZodError.prototype, "formErrors", {
        get: function () {
            return this.flatten();
        },
        enumerable: false,
        configurable: true
    });
    ZodError.create = function (issues) {
        var error = new ZodError(issues);
        return error;
    };
    return ZodError;
}(Error));
exports.ZodError = ZodError;
var defaultErrorMap = function (issue, _ctx) {
    var message;
    switch (issue.code) {
        case exports.ZodIssueCode.invalid_type:
            if (issue.received === "undefined") {
                message = "Required";
            }
            else {
                message = "Expected ".concat(issue.expected, ", received ").concat(issue.received);
            }
            break;
        case exports.ZodIssueCode.unrecognized_keys:
            message = "Unrecognized key(s) in object: ".concat(issue.keys
                .map(function (k) { return "'".concat(k, "'"); })
                .join(", "));
            break;
        case exports.ZodIssueCode.invalid_union:
            message = "Invalid input";
            break;
        case exports.ZodIssueCode.invalid_union_discriminator:
            message = "Invalid discriminator value. Expected ".concat(issue.options
                .map(function (val) { return (typeof val === "string" ? "'".concat(val, "'") : val); })
                .join(" | "));
            break;
        case exports.ZodIssueCode.invalid_enum_value:
            message = "Invalid enum value. Expected ".concat(issue.options
                .map(function (val) { return (typeof val === "string" ? "'".concat(val, "'") : val); })
                .join(" | "));
            break;
        case exports.ZodIssueCode.invalid_arguments:
            message = "Invalid function arguments";
            break;
        case exports.ZodIssueCode.invalid_return_type:
            message = "Invalid function return type";
            break;
        case exports.ZodIssueCode.invalid_date:
            message = "Invalid date";
            break;
        case exports.ZodIssueCode.invalid_string:
            if (issue.validation !== "regex")
                message = "Invalid ".concat(issue.validation);
            else
                message = "Invalid";
            break;
        case exports.ZodIssueCode.too_small:
            if (issue.type === "array")
                message = "Array must contain ".concat(issue.inclusive ? "at least" : "more than", " ").concat(issue.minimum, " element(s)");
            else if (issue.type === "string")
                message = "String must contain ".concat(issue.inclusive ? "at least" : "over", " ").concat(issue.minimum, " character(s)");
            else if (issue.type === "number")
                message = "Number must be greater than ".concat(issue.inclusive ? "or equal to " : "").concat(issue.minimum);
            else
                message = "Invalid input";
            break;
        case exports.ZodIssueCode.too_big:
            if (issue.type === "array")
                message = "Array must contain ".concat(issue.inclusive ? "at most" : "less than", " ").concat(issue.maximum, " element(s)");
            else if (issue.type === "string")
                message = "String must contain ".concat(issue.inclusive ? "at most" : "under", " ").concat(issue.maximum, " character(s)");
            else if (issue.type === "number")
                message = "Number must be less than ".concat(issue.inclusive ? "or equal to " : "").concat(issue.maximum);
            else
                message = "Invalid input";
            break;
        case exports.ZodIssueCode.custom:
            message = "Invalid input";
            break;
        case exports.ZodIssueCode.invalid_intersection_types:
            message = "Intersection results could not be merged";
            break;
        case exports.ZodIssueCode.not_multiple_of:
            message = "Number must be a multiple of ".concat(issue.multipleOf);
            break;
        default:
            message = _ctx.defaultError;
            util_1.util.assertNever(issue);
    }
    return { message: message };
};
exports.defaultErrorMap = defaultErrorMap;
exports.overrideErrorMap = exports.defaultErrorMap;
var setErrorMap = function (map) {
    exports.overrideErrorMap = map;
};
exports.setErrorMap = setErrorMap;

},{"./helpers/util":9}],5:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./helpers/parseUtil"), exports);
__exportStar(require("./helpers/typeAliases"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./ZodError"), exports);

},{"./ZodError":4,"./helpers/parseUtil":7,"./helpers/typeAliases":8,"./types":11}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorUtil = void 0;
var errorUtil;
(function (errorUtil) {
    errorUtil.errToObj = function (message) {
        return typeof message === "string" ? { message: message } : message || {};
    };
    errorUtil.toString = function (message) {
        return typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
    };
})(errorUtil = exports.errorUtil || (exports.errorUtil = {}));

},{}],7:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAsync = exports.isValid = exports.isDirty = exports.isAborted = exports.OK = exports.DIRTY = exports.INVALID = exports.ParseStatus = exports.addIssueToContext = exports.EMPTY_PATH = exports.makeIssue = exports.getParsedType = exports.ZodParsedType = void 0;
var ZodError_1 = require("../ZodError");
var util_1 = require("./util");
exports.ZodParsedType = util_1.util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set",
]);
function cacheAndReturn(data, parsedType, cache) {
    if (cache)
        cache.set(data, parsedType);
    return parsedType;
}
var getParsedType = function (data, cache) {
    if (cache && cache.has(data))
        return cache.get(data);
    var t = typeof data;
    switch (t) {
        case "undefined":
            return cacheAndReturn(data, exports.ZodParsedType.undefined, cache);
        case "string":
            return cacheAndReturn(data, exports.ZodParsedType.string, cache);
        case "number":
            return cacheAndReturn(data, isNaN(data) ? exports.ZodParsedType.nan : exports.ZodParsedType.number, cache);
        case "boolean":
            return cacheAndReturn(data, exports.ZodParsedType.boolean, cache);
        case "function":
            return cacheAndReturn(data, exports.ZodParsedType.function, cache);
        case "bigint":
            return cacheAndReturn(data, exports.ZodParsedType.bigint, cache);
        case "object":
            if (Array.isArray(data)) {
                return cacheAndReturn(data, exports.ZodParsedType.array, cache);
            }
            if (data === null) {
                return cacheAndReturn(data, exports.ZodParsedType.null, cache);
            }
            if (data.then &&
                typeof data.then === "function" &&
                data.catch &&
                typeof data.catch === "function") {
                return cacheAndReturn(data, exports.ZodParsedType.promise, cache);
            }
            if (typeof Map !== "undefined" && data instanceof Map) {
                return cacheAndReturn(data, exports.ZodParsedType.map, cache);
            }
            if (typeof Set !== "undefined" && data instanceof Set) {
                return cacheAndReturn(data, exports.ZodParsedType.set, cache);
            }
            if (typeof Date !== "undefined" && data instanceof Date) {
                return cacheAndReturn(data, exports.ZodParsedType.date, cache);
            }
            return cacheAndReturn(data, exports.ZodParsedType.object, cache);
        default:
            return cacheAndReturn(data, exports.ZodParsedType.unknown, cache);
    }
};
exports.getParsedType = getParsedType;
var makeIssue = function (params) {
    var e_1, _a;
    var data = params.data, path = params.path, errorMaps = params.errorMaps, issueData = params.issueData;
    var fullPath = __spreadArray(__spreadArray([], __read(path), false), __read((issueData.path || [])), false);
    var fullIssue = __assign(__assign({}, issueData), { path: fullPath });
    var errorMessage = "";
    var maps = errorMaps
        .filter(function (m) { return !!m; })
        .slice()
        .reverse();
    try {
        for (var maps_1 = __values(maps), maps_1_1 = maps_1.next(); !maps_1_1.done; maps_1_1 = maps_1.next()) {
            var map = maps_1_1.value;
            errorMessage = map(fullIssue, { data: data, defaultError: errorMessage }).message;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (maps_1_1 && !maps_1_1.done && (_a = maps_1.return)) _a.call(maps_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return __assign(__assign({}, issueData), { path: fullPath, message: issueData.message || errorMessage });
};
exports.makeIssue = makeIssue;
exports.EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
    var issue = (0, exports.makeIssue)({
        issueData: issueData,
        data: ctx.data,
        path: ctx.path,
        errorMaps: [
            ctx.contextualErrorMap,
            ctx.schemaErrorMap,
            ZodError_1.overrideErrorMap,
            ZodError_1.defaultErrorMap, // then global default map
        ].filter(function (x) { return !!x; }),
    });
    ctx.issues.push(issue);
}
exports.addIssueToContext = addIssueToContext;
var ParseStatus = /** @class */ (function () {
    function ParseStatus() {
        this.value = "valid";
    }
    ParseStatus.prototype.dirty = function () {
        if (this.value === "valid")
            this.value = "dirty";
    };
    ParseStatus.prototype.abort = function () {
        if (this.value !== "aborted")
            this.value = "aborted";
    };
    ParseStatus.mergeArray = function (status, results) {
        var e_2, _a;
        var arrayValue = [];
        try {
            for (var results_1 = __values(results), results_1_1 = results_1.next(); !results_1_1.done; results_1_1 = results_1.next()) {
                var s = results_1_1.value;
                if (s.status === "aborted")
                    return exports.INVALID;
                if (s.status === "dirty")
                    status.dirty();
                arrayValue.push(s.value);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (results_1_1 && !results_1_1.done && (_a = results_1.return)) _a.call(results_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return { status: status.value, value: arrayValue };
    };
    ParseStatus.mergeObjectAsync = function (status, pairs) {
        return __awaiter(this, void 0, void 0, function () {
            var syncPairs, pairs_1, pairs_1_1, pair, _a, _b, e_3_1;
            var e_3, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        syncPairs = [];
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 7, 8, 9]);
                        pairs_1 = __values(pairs), pairs_1_1 = pairs_1.next();
                        _e.label = 2;
                    case 2:
                        if (!!pairs_1_1.done) return [3 /*break*/, 6];
                        pair = pairs_1_1.value;
                        _b = (_a = syncPairs).push;
                        _d = {};
                        return [4 /*yield*/, pair.key];
                    case 3:
                        _d.key = _e.sent();
                        return [4 /*yield*/, pair.value];
                    case 4:
                        _b.apply(_a, [(_d.value = _e.sent(),
                                _d)]);
                        _e.label = 5;
                    case 5:
                        pairs_1_1 = pairs_1.next();
                        return [3 /*break*/, 2];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_3_1 = _e.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (pairs_1_1 && !pairs_1_1.done && (_c = pairs_1.return)) _c.call(pairs_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/, ParseStatus.mergeObjectSync(status, syncPairs)];
                }
            });
        });
    };
    ParseStatus.mergeObjectSync = function (status, pairs) {
        var e_4, _a;
        var finalObject = {};
        try {
            for (var pairs_2 = __values(pairs), pairs_2_1 = pairs_2.next(); !pairs_2_1.done; pairs_2_1 = pairs_2.next()) {
                var pair = pairs_2_1.value;
                var key = pair.key, value = pair.value;
                if (key.status === "aborted")
                    return exports.INVALID;
                if (value.status === "aborted")
                    return exports.INVALID;
                if (key.status === "dirty")
                    status.dirty();
                if (value.status === "dirty")
                    status.dirty();
                if (typeof value.value !== "undefined" || pair.alwaysSet) {
                    finalObject[key.value] = value.value;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (pairs_2_1 && !pairs_2_1.done && (_a = pairs_2.return)) _a.call(pairs_2);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return { status: status.value, value: finalObject };
    };
    return ParseStatus;
}());
exports.ParseStatus = ParseStatus;
exports.INVALID = Object.freeze({
    status: "aborted",
});
var DIRTY = function (value) { return ({ status: "dirty", value: value }); };
exports.DIRTY = DIRTY;
var OK = function (value) { return ({ status: "valid", value: value }); };
exports.OK = OK;
var isAborted = function (x) {
    return x.status === "aborted";
};
exports.isAborted = isAborted;
var isDirty = function (x) {
    return x.status === "dirty";
};
exports.isDirty = isDirty;
var isValid = function (x) {
    return x.status === "valid";
};
exports.isValid = isValid;
var isAsync = function (x) {
    return typeof Promise !== undefined && x instanceof Promise;
};
exports.isAsync = isAsync;

},{"../ZodError":4,"./util":9}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],9:[function(require,module,exports){
"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.util = void 0;
var util;
(function (util) {
    function assertNever(_x) {
        throw new Error();
    }
    util.assertNever = assertNever;
    util.arrayToEnum = function (items) {
        var e_1, _a;
        var obj = {};
        try {
            for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                var item = items_1_1.value;
                obj[item] = item;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return obj;
    };
    util.getValidEnumValues = function (obj) {
        var e_2, _a;
        var validKeys = util.objectKeys(obj).filter(function (k) { return typeof obj[obj[k]] !== "number"; });
        var filtered = {};
        try {
            for (var validKeys_1 = __values(validKeys), validKeys_1_1 = validKeys_1.next(); !validKeys_1_1.done; validKeys_1_1 = validKeys_1.next()) {
                var k = validKeys_1_1.value;
                filtered[k] = obj[k];
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (validKeys_1_1 && !validKeys_1_1.done && (_a = validKeys_1.return)) _a.call(validKeys_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return util.objectValues(filtered);
    };
    util.objectValues = function (obj) {
        return util.objectKeys(obj).map(function (e) {
            return obj[e];
        });
    };
    util.objectKeys = typeof Object.keys === "function" // eslint-disable-line ban/ban
        ? function (obj) { return Object.keys(obj); } // eslint-disable-line ban/ban
        : function (object) {
            var keys = [];
            for (var key in object) {
                if (Object.prototype.hasOwnProperty.call(object, key)) {
                    keys.push(key);
                }
            }
            return keys;
        };
    util.find = function (arr, checker) {
        var e_3, _a;
        try {
            for (var arr_1 = __values(arr), arr_1_1 = arr_1.next(); !arr_1_1.done; arr_1_1 = arr_1.next()) {
                var item = arr_1_1.value;
                if (checker(item))
                    return item;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (arr_1_1 && !arr_1_1.done && (_a = arr_1.return)) _a.call(arr_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return undefined;
    };
    util.isInteger = typeof Number.isInteger === "function"
        ? function (val) { return Number.isInteger(val); } // eslint-disable-line ban/ban
        : function (val) {
            return typeof val === "number" && isFinite(val) && Math.floor(val) === val;
        };
})(util = exports.util || (exports.util = {}));

},{}],10:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.z = void 0;
var mod = __importStar(require("./external"));
exports.z = mod;
__exportStar(require("./external"), exports);
exports.default = mod;

},{"./external":5}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.intersection = exports.instanceof = exports.function = exports.enum = exports.effect = exports.discriminatedUnion = exports.date = exports.boolean = exports.bigint = exports.array = exports.any = exports.ZodFirstPartyTypeKind = exports.late = exports.ZodSchema = exports.Schema = exports.custom = exports.ZodNaN = exports.ZodDefault = exports.ZodNullable = exports.ZodOptional = exports.ZodTransformer = exports.ZodEffects = exports.ZodPromise = exports.ZodNativeEnum = exports.ZodEnum = exports.ZodLiteral = exports.ZodLazy = exports.ZodFunction = exports.ZodSet = exports.ZodMap = exports.ZodRecord = exports.ZodTuple = exports.ZodIntersection = exports.ZodDiscriminatedUnion = exports.ZodUnion = exports.ZodObject = exports.objectUtil = exports.ZodArray = exports.ZodVoid = exports.ZodNever = exports.ZodUnknown = exports.ZodAny = exports.ZodNull = exports.ZodUndefined = exports.ZodDate = exports.ZodBoolean = exports.ZodBigInt = exports.ZodNumber = exports.ZodString = exports.ZodType = void 0;
exports.void = exports.unknown = exports.union = exports.undefined = exports.tuple = exports.transformer = exports.string = exports.strictObject = exports.set = exports.record = exports.promise = exports.preprocess = exports.ostring = exports.optional = exports.onumber = exports.oboolean = exports.object = exports.number = exports.nullable = exports.null = exports.never = exports.nativeEnum = exports.nan = exports.map = exports.literal = exports.lazy = void 0;
var errorUtil_1 = require("./helpers/errorUtil");
var parseUtil_1 = require("./helpers/parseUtil");
var util_1 = require("./helpers/util");
var ZodError_1 = require("./ZodError");
var handleResult = function (ctx, result) {
    if ((0, parseUtil_1.isValid)(result)) {
        return { success: true, data: result.value };
    }
    else {
        if (!ctx.issues.length) {
            throw new Error("Validation failed but no issues detected.");
        }
        var error = new ZodError_1.ZodError(ctx.issues);
        return { success: false, error: error };
    }
};
function processCreateParams(params) {
    if (!params)
        return {};
    var errorMap = params.errorMap, invalid_type_error = params.invalid_type_error, required_error = params.required_error, description = params.description;
    if (errorMap && (invalid_type_error || required_error)) {
        throw new Error("Can't use \"invalid\" or \"required\" in conjunction with custom error map.");
    }
    if (errorMap)
        return { errorMap: errorMap, description: description };
    var customMap = function (iss, ctx) {
        if (iss.code !== "invalid_type")
            return { message: ctx.defaultError };
        if (typeof ctx.data === "undefined" && required_error)
            return { message: required_error };
        if (params.invalid_type_error)
            return { message: params.invalid_type_error };
        return { message: ctx.defaultError };
    };
    return { errorMap: customMap, description: description };
}
var ZodType = /** @class */ (function () {
    function ZodType(def) {
        /** Alias of safeParseAsync */
        this.spa = this.safeParseAsync;
        this.superRefine = this._refinement;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.default = this.default.bind(this);
        this.describe = this.describe.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this.isNullable = this.isNullable.bind(this);
    }
    Object.defineProperty(ZodType.prototype, "description", {
        get: function () {
            return this._def.description;
        },
        enumerable: false,
        configurable: true
    });
    ZodType.prototype._processInputParams = function (input) {
        return {
            status: new parseUtil_1.ParseStatus(),
            ctx: __assign(__assign({}, input.parent), { data: input.data, parsedType: (0, parseUtil_1.getParsedType)(input.data, input.parent.typeCache), schemaErrorMap: this._def.errorMap, path: input.path, parent: input.parent }),
        };
    };
    ZodType.prototype._parseSync = function (input) {
        var result = this._parse(input);
        if ((0, parseUtil_1.isAsync)(result)) {
            throw new Error("Synchronous parse encountered promise.");
        }
        return result;
    };
    ZodType.prototype._parseAsync = function (input) {
        var result = this._parse(input);
        return Promise.resolve(result);
    };
    ZodType.prototype.parse = function (data, params) {
        var result = this.safeParse(data, params);
        if (result.success)
            return result.data;
        throw result.error;
    };
    ZodType.prototype.safeParse = function (data, params) {
        var _a;
        var ctx = {
            path: (params === null || params === void 0 ? void 0 : params.path) || [],
            issues: [],
            contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
            schemaErrorMap: this._def.errorMap,
            async: (_a = params === null || params === void 0 ? void 0 : params.async) !== null && _a !== void 0 ? _a : false,
            typeCache: typeof Map !== "undefined" ? new Map() : undefined,
            parent: null,
            data: data,
            parsedType: (0, parseUtil_1.getParsedType)(data),
        };
        var result = this._parseSync({ data: data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
    };
    ZodType.prototype.parseAsync = function (data, params) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.safeParseAsync(data, params)];
                    case 1:
                        result = _a.sent();
                        if (result.success)
                            return [2 /*return*/, result.data];
                        throw result.error;
                }
            });
        });
    };
    ZodType.prototype.safeParseAsync = function (data, params) {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, maybeAsyncResult, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = {
                            path: (params === null || params === void 0 ? void 0 : params.path) || [],
                            issues: [],
                            contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
                            schemaErrorMap: this._def.errorMap,
                            async: true,
                            typeCache: typeof Map !== "undefined" ? new Map() : undefined,
                            parent: null,
                            data: data,
                            parsedType: (0, parseUtil_1.getParsedType)(data),
                        };
                        maybeAsyncResult = this._parse({ data: data, path: [], parent: ctx });
                        return [4 /*yield*/, ((0, parseUtil_1.isAsync)(maybeAsyncResult)
                                ? maybeAsyncResult
                                : Promise.resolve(maybeAsyncResult))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, handleResult(ctx, result)];
                }
            });
        });
    };
    ZodType.prototype.refine = function (check, message) {
        var getIssueProperties = function (val) {
            if (typeof message === "string" || typeof message === "undefined") {
                return { message: message };
            }
            else if (typeof message === "function") {
                return message(val);
            }
            else {
                return message;
            }
        };
        return this._refinement(function (val, ctx) {
            var result = check(val);
            var setError = function () {
                return ctx.addIssue(__assign({ code: ZodError_1.ZodIssueCode.custom }, getIssueProperties(val)));
            };
            if (typeof Promise !== "undefined" && result instanceof Promise) {
                return result.then(function (data) {
                    if (!data) {
                        setError();
                        return false;
                    }
                    else {
                        return true;
                    }
                });
            }
            if (!result) {
                setError();
                return false;
            }
            else {
                return true;
            }
        });
    };
    ZodType.prototype.refinement = function (check, refinementData) {
        return this._refinement(function (val, ctx) {
            if (!check(val)) {
                ctx.addIssue(typeof refinementData === "function"
                    ? refinementData(val, ctx)
                    : refinementData);
                return false;
            }
            else {
                return true;
            }
        });
    };
    ZodType.prototype._refinement = function (refinement) {
        return new ZodEffects({
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "refinement", refinement: refinement },
        });
    };
    ZodType.prototype.optional = function () {
        return ZodOptional.create(this);
    };
    ZodType.prototype.nullable = function () {
        return ZodNullable.create(this);
    };
    ZodType.prototype.nullish = function () {
        return this.optional().nullable();
    };
    ZodType.prototype.array = function () {
        return ZodArray.create(this);
    };
    ZodType.prototype.promise = function () {
        return ZodPromise.create(this);
    };
    ZodType.prototype.or = function (option) {
        return ZodUnion.create([this, option]);
    };
    ZodType.prototype.and = function (incoming) {
        return ZodIntersection.create(this, incoming);
    };
    ZodType.prototype.transform = function (transform) {
        return new ZodEffects({
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "transform", transform: transform },
        });
    };
    ZodType.prototype.default = function (def) {
        var defaultValueFunc = typeof def === "function" ? def : function () { return def; };
        return new ZodDefault({
            innerType: this,
            defaultValue: defaultValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodDefault,
        });
    };
    ZodType.prototype.describe = function (description) {
        var This = this.constructor;
        return new This(__assign(__assign({}, this._def), { description: description }));
    };
    ZodType.prototype.isOptional = function () {
        return this.safeParse(undefined).success;
    };
    ZodType.prototype.isNullable = function () {
        return this.safeParse(null).success;
    };
    return ZodType;
}());
exports.ZodType = ZodType;
exports.Schema = ZodType;
exports.ZodSchema = ZodType;
var cuidRegex = /^c[^\s-]{8,}$/i;
var uuidRegex = /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
// from https://stackoverflow.com/a/46181/1550155
// old version: too slow, didn't support unicode
// const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
// eslint-disable-next-line
var emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
var ZodString = /** @class */ (function (_super) {
    __extends(ZodString, _super);
    function ZodString() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._regex = function (regex, validation, message) {
            return _this.refinement(function (data) { return regex.test(data); }, __assign({ validation: validation, code: ZodError_1.ZodIssueCode.invalid_string }, errorUtil_1.errorUtil.errToObj(message)));
        };
        /**
         * Deprecated.
         * Use z.string().min(1) instead.
         */
        _this.nonempty = function (message) {
            return _this.min(1, errorUtil_1.errorUtil.errToObj(message));
        };
        return _this;
    }
    ZodString.prototype._parse = function (input) {
        var e_1, _a;
        var _b = this._processInputParams(input), status = _b.status, ctx = _b.ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.string) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.string,
                received: ctx.parsedType,
            }
            //
            );
            return parseUtil_1.INVALID;
        }
        try {
            for (var _c = __values(this._def.checks), _d = _c.next(); !_d.done; _d = _c.next()) {
                var check = _d.value;
                if (check.kind === "min") {
                    if (ctx.data.length < check.value) {
                        (0, parseUtil_1.addIssueToContext)(ctx, {
                            code: ZodError_1.ZodIssueCode.too_small,
                            minimum: check.value,
                            type: "string",
                            inclusive: true,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "max") {
                    if (ctx.data.length > check.value) {
                        (0, parseUtil_1.addIssueToContext)(ctx, {
                            code: ZodError_1.ZodIssueCode.too_big,
                            maximum: check.value,
                            type: "string",
                            inclusive: true,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "email") {
                    if (!emailRegex.test(ctx.data)) {
                        (0, parseUtil_1.addIssueToContext)(ctx, {
                            validation: "email",
                            code: ZodError_1.ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "uuid") {
                    if (!uuidRegex.test(ctx.data)) {
                        (0, parseUtil_1.addIssueToContext)(ctx, {
                            validation: "uuid",
                            code: ZodError_1.ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "cuid") {
                    if (!cuidRegex.test(ctx.data)) {
                        (0, parseUtil_1.addIssueToContext)(ctx, {
                            validation: "cuid",
                            code: ZodError_1.ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "url") {
                    try {
                        new URL(ctx.data);
                    }
                    catch (_e) {
                        (0, parseUtil_1.addIssueToContext)(ctx, {
                            validation: "url",
                            code: ZodError_1.ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "regex") {
                    check.regex.lastIndex = 0;
                    var testResult = check.regex.test(ctx.data);
                    if (!testResult) {
                        (0, parseUtil_1.addIssueToContext)(ctx, {
                            validation: "regex",
                            code: ZodError_1.ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return { status: status.value, value: ctx.data };
    };
    ZodString.prototype._addCheck = function (check) {
        return new ZodString(__assign(__assign({}, this._def), { checks: __spreadArray(__spreadArray([], __read(this._def.checks), false), [check], false) }));
    };
    ZodString.prototype.email = function (message) {
        return this._addCheck(__assign({ kind: "email" }, errorUtil_1.errorUtil.errToObj(message)));
    };
    ZodString.prototype.url = function (message) {
        return this._addCheck(__assign({ kind: "url" }, errorUtil_1.errorUtil.errToObj(message)));
    };
    ZodString.prototype.uuid = function (message) {
        return this._addCheck(__assign({ kind: "uuid" }, errorUtil_1.errorUtil.errToObj(message)));
    };
    ZodString.prototype.cuid = function (message) {
        return this._addCheck(__assign({ kind: "cuid" }, errorUtil_1.errorUtil.errToObj(message)));
    };
    ZodString.prototype.regex = function (regex, message) {
        return this._addCheck(__assign({ kind: "regex", regex: regex }, errorUtil_1.errorUtil.errToObj(message)));
    };
    ZodString.prototype.min = function (minLength, message) {
        return this._addCheck(__assign({ kind: "min", value: minLength }, errorUtil_1.errorUtil.errToObj(message)));
    };
    ZodString.prototype.max = function (maxLength, message) {
        return this._addCheck(__assign({ kind: "max", value: maxLength }, errorUtil_1.errorUtil.errToObj(message)));
    };
    ZodString.prototype.length = function (len, message) {
        return this.min(len, message).max(len, message);
    };
    Object.defineProperty(ZodString.prototype, "isEmail", {
        get: function () {
            return !!this._def.checks.find(function (ch) { return ch.kind === "email"; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodString.prototype, "isURL", {
        get: function () {
            return !!this._def.checks.find(function (ch) { return ch.kind === "url"; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodString.prototype, "isUUID", {
        get: function () {
            return !!this._def.checks.find(function (ch) { return ch.kind === "uuid"; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodString.prototype, "isCUID", {
        get: function () {
            return !!this._def.checks.find(function (ch) { return ch.kind === "cuid"; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodString.prototype, "minLength", {
        get: function () {
            var min = -Infinity;
            this._def.checks.map(function (ch) {
                if (ch.kind === "min") {
                    if (min === null || ch.value > min) {
                        min = ch.value;
                    }
                }
            });
            return min;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodString.prototype, "maxLength", {
        get: function () {
            var max = null;
            this._def.checks.map(function (ch) {
                if (ch.kind === "max") {
                    if (max === null || ch.value < max) {
                        max = ch.value;
                    }
                }
            });
            return max;
        },
        enumerable: false,
        configurable: true
    });
    ZodString.create = function (params) {
        return new ZodString(__assign({ checks: [], typeName: ZodFirstPartyTypeKind.ZodString }, processCreateParams(params)));
    };
    return ZodString;
}(ZodType));
exports.ZodString = ZodString;
// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val, step) {
    var valDecCount = (val.toString().split(".")[1] || "").length;
    var stepDecCount = (step.toString().split(".")[1] || "").length;
    var decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    var valInt = parseInt(val.toFixed(decCount).replace(".", ""));
    var stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
    return (valInt % stepInt) / Math.pow(10, decCount);
}
var ZodNumber = /** @class */ (function (_super) {
    __extends(ZodNumber, _super);
    function ZodNumber() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.min = _this.gte;
        _this.max = _this.lte;
        _this.step = _this.multipleOf;
        return _this;
    }
    ZodNumber.prototype._parse = function (input) {
        var e_2, _a;
        var _b = this._processInputParams(input), status = _b.status, ctx = _b.ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.number) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.number,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        try {
            for (var _c = __values(this._def.checks), _d = _c.next(); !_d.done; _d = _c.next()) {
                var check = _d.value;
                if (check.kind === "int") {
                    if (!util_1.util.isInteger(ctx.data)) {
                        (0, parseUtil_1.addIssueToContext)(ctx, {
                            code: ZodError_1.ZodIssueCode.invalid_type,
                            expected: "integer",
                            received: "float",
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "min") {
                    var tooSmall = check.inclusive
                        ? ctx.data < check.value
                        : ctx.data <= check.value;
                    if (tooSmall) {
                        (0, parseUtil_1.addIssueToContext)(ctx, {
                            code: ZodError_1.ZodIssueCode.too_small,
                            minimum: check.value,
                            type: "number",
                            inclusive: check.inclusive,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "max") {
                    var tooBig = check.inclusive
                        ? ctx.data > check.value
                        : ctx.data >= check.value;
                    if (tooBig) {
                        (0, parseUtil_1.addIssueToContext)(ctx, {
                            code: ZodError_1.ZodIssueCode.too_big,
                            maximum: check.value,
                            type: "number",
                            inclusive: check.inclusive,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "multipleOf") {
                    if (floatSafeRemainder(ctx.data, check.value) !== 0) {
                        (0, parseUtil_1.addIssueToContext)(ctx, {
                            code: ZodError_1.ZodIssueCode.not_multiple_of,
                            multipleOf: check.value,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else {
                    util_1.util.assertNever(check);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return { status: status.value, value: ctx.data };
    };
    ZodNumber.prototype.gte = function (value, message) {
        return this.setLimit("min", value, true, errorUtil_1.errorUtil.toString(message));
    };
    ZodNumber.prototype.gt = function (value, message) {
        return this.setLimit("min", value, false, errorUtil_1.errorUtil.toString(message));
    };
    ZodNumber.prototype.lte = function (value, message) {
        return this.setLimit("max", value, true, errorUtil_1.errorUtil.toString(message));
    };
    ZodNumber.prototype.lt = function (value, message) {
        return this.setLimit("max", value, false, errorUtil_1.errorUtil.toString(message));
    };
    ZodNumber.prototype.setLimit = function (kind, value, inclusive, message) {
        return new ZodNumber(__assign(__assign({}, this._def), { checks: __spreadArray(__spreadArray([], __read(this._def.checks), false), [
                {
                    kind: kind,
                    value: value,
                    inclusive: inclusive,
                    message: errorUtil_1.errorUtil.toString(message),
                },
            ], false) }));
    };
    ZodNumber.prototype._addCheck = function (check) {
        return new ZodNumber(__assign(__assign({}, this._def), { checks: __spreadArray(__spreadArray([], __read(this._def.checks), false), [check], false) }));
    };
    ZodNumber.prototype.int = function (message) {
        return this._addCheck({
            kind: "int",
            message: errorUtil_1.errorUtil.toString(message),
        });
    };
    ZodNumber.prototype.positive = function (message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: false,
            message: errorUtil_1.errorUtil.toString(message),
        });
    };
    ZodNumber.prototype.negative = function (message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: false,
            message: errorUtil_1.errorUtil.toString(message),
        });
    };
    ZodNumber.prototype.nonpositive = function (message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: true,
            message: errorUtil_1.errorUtil.toString(message),
        });
    };
    ZodNumber.prototype.nonnegative = function (message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: true,
            message: errorUtil_1.errorUtil.toString(message),
        });
    };
    ZodNumber.prototype.multipleOf = function (value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value: value,
            message: errorUtil_1.errorUtil.toString(message),
        });
    };
    Object.defineProperty(ZodNumber.prototype, "minValue", {
        get: function () {
            var e_3, _a;
            var min = null;
            try {
                for (var _b = __values(this._def.checks), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var ch = _c.value;
                    if (ch.kind === "min") {
                        if (min === null || ch.value > min)
                            min = ch.value;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return min;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodNumber.prototype, "maxValue", {
        get: function () {
            var e_4, _a;
            var max = null;
            try {
                for (var _b = __values(this._def.checks), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var ch = _c.value;
                    if (ch.kind === "max") {
                        if (max === null || ch.value < max)
                            max = ch.value;
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return max;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodNumber.prototype, "isInt", {
        get: function () {
            return !!this._def.checks.find(function (ch) { return ch.kind === "int"; });
        },
        enumerable: false,
        configurable: true
    });
    ZodNumber.create = function (params) {
        return new ZodNumber(__assign({ checks: [], typeName: ZodFirstPartyTypeKind.ZodNumber }, processCreateParams(params)));
    };
    return ZodNumber;
}(ZodType));
exports.ZodNumber = ZodNumber;
var ZodBigInt = /** @class */ (function (_super) {
    __extends(ZodBigInt, _super);
    function ZodBigInt() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodBigInt.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.bigint) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.bigint,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(ctx.data);
    };
    ZodBigInt.create = function (params) {
        return new ZodBigInt(__assign({ typeName: ZodFirstPartyTypeKind.ZodBigInt }, processCreateParams(params)));
    };
    return ZodBigInt;
}(ZodType));
exports.ZodBigInt = ZodBigInt;
var ZodBoolean = /** @class */ (function (_super) {
    __extends(ZodBoolean, _super);
    function ZodBoolean() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodBoolean.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.boolean) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.boolean,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(ctx.data);
    };
    ZodBoolean.create = function (params) {
        return new ZodBoolean(__assign({ typeName: ZodFirstPartyTypeKind.ZodBoolean }, processCreateParams(params)));
    };
    return ZodBoolean;
}(ZodType));
exports.ZodBoolean = ZodBoolean;
var ZodDate = /** @class */ (function (_super) {
    __extends(ZodDate, _super);
    function ZodDate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodDate.prototype._parse = function (input) {
        var _a = this._processInputParams(input), status = _a.status, ctx = _a.ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.date) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.date,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        if (isNaN(ctx.data.getTime())) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_date,
            });
            return parseUtil_1.INVALID;
        }
        return {
            status: status.value,
            value: new Date(ctx.data.getTime()),
        };
    };
    ZodDate.create = function (params) {
        return new ZodDate(__assign({ typeName: ZodFirstPartyTypeKind.ZodDate }, processCreateParams(params)));
    };
    return ZodDate;
}(ZodType));
exports.ZodDate = ZodDate;
var ZodUndefined = /** @class */ (function (_super) {
    __extends(ZodUndefined, _super);
    function ZodUndefined() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodUndefined.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.undefined) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.undefined,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(ctx.data);
    };
    ZodUndefined.create = function (params) {
        return new ZodUndefined(__assign({ typeName: ZodFirstPartyTypeKind.ZodUndefined }, processCreateParams(params)));
    };
    return ZodUndefined;
}(ZodType));
exports.ZodUndefined = ZodUndefined;
var ZodNull = /** @class */ (function (_super) {
    __extends(ZodNull, _super);
    function ZodNull() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodNull.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.null) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.null,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(ctx.data);
    };
    ZodNull.create = function (params) {
        return new ZodNull(__assign({ typeName: ZodFirstPartyTypeKind.ZodNull }, processCreateParams(params)));
    };
    return ZodNull;
}(ZodType));
exports.ZodNull = ZodNull;
var ZodAny = /** @class */ (function (_super) {
    __extends(ZodAny, _super);
    function ZodAny() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // to prevent instances of other classes from extending ZodAny. this causes issues with catchall in ZodObject.
        _this._any = true;
        return _this;
    }
    ZodAny.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        return (0, parseUtil_1.OK)(ctx.data);
    };
    ZodAny.create = function (params) {
        return new ZodAny(__assign({ typeName: ZodFirstPartyTypeKind.ZodAny }, processCreateParams(params)));
    };
    return ZodAny;
}(ZodType));
exports.ZodAny = ZodAny;
var ZodUnknown = /** @class */ (function (_super) {
    __extends(ZodUnknown, _super);
    function ZodUnknown() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // required
        _this._unknown = true;
        return _this;
    }
    ZodUnknown.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        return (0, parseUtil_1.OK)(ctx.data);
    };
    ZodUnknown.create = function (params) {
        return new ZodUnknown(__assign({ typeName: ZodFirstPartyTypeKind.ZodUnknown }, processCreateParams(params)));
    };
    return ZodUnknown;
}(ZodType));
exports.ZodUnknown = ZodUnknown;
var ZodNever = /** @class */ (function (_super) {
    __extends(ZodNever, _super);
    function ZodNever() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodNever.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: parseUtil_1.ZodParsedType.never,
            received: ctx.parsedType,
        });
        return parseUtil_1.INVALID;
    };
    ZodNever.create = function (params) {
        return new ZodNever(__assign({ typeName: ZodFirstPartyTypeKind.ZodNever }, processCreateParams(params)));
    };
    return ZodNever;
}(ZodType));
exports.ZodNever = ZodNever;
var ZodVoid = /** @class */ (function (_super) {
    __extends(ZodVoid, _super);
    function ZodVoid() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodVoid.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.undefined) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.void,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(ctx.data);
    };
    ZodVoid.create = function (params) {
        return new ZodVoid(__assign({ typeName: ZodFirstPartyTypeKind.ZodVoid }, processCreateParams(params)));
    };
    return ZodVoid;
}(ZodType));
exports.ZodVoid = ZodVoid;
var ZodArray = /** @class */ (function (_super) {
    __extends(ZodArray, _super);
    function ZodArray() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodArray.prototype._parse = function (input) {
        var _a = this._processInputParams(input), status = _a.status, ctx = _a.ctx;
        var def = this._def;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.array) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.array,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        if (def.minLength !== null) {
            if (ctx.data.length < def.minLength.value) {
                (0, parseUtil_1.addIssueToContext)(ctx, {
                    code: ZodError_1.ZodIssueCode.too_small,
                    minimum: def.minLength.value,
                    type: "array",
                    inclusive: true,
                    message: def.minLength.message,
                });
                status.dirty();
            }
        }
        if (def.maxLength !== null) {
            if (ctx.data.length > def.maxLength.value) {
                (0, parseUtil_1.addIssueToContext)(ctx, {
                    code: ZodError_1.ZodIssueCode.too_big,
                    maximum: def.maxLength.value,
                    type: "array",
                    inclusive: true,
                    message: def.maxLength.message,
                });
                status.dirty();
            }
        }
        if (ctx.async) {
            return Promise.all(ctx.data.map(function (item, i) {
                return def.type._parseAsync({
                    parent: ctx,
                    path: __spreadArray(__spreadArray([], __read(ctx.path), false), [i], false),
                    data: item,
                });
            })).then(function (result) {
                return parseUtil_1.ParseStatus.mergeArray(status, result);
            });
        }
        var result = ctx.data.map(function (item, i) {
            return def.type._parseSync({
                parent: ctx,
                path: __spreadArray(__spreadArray([], __read(ctx.path), false), [i], false),
                data: item,
            });
        });
        return parseUtil_1.ParseStatus.mergeArray(status, result);
    };
    Object.defineProperty(ZodArray.prototype, "element", {
        get: function () {
            return this._def.type;
        },
        enumerable: false,
        configurable: true
    });
    ZodArray.prototype.min = function (minLength, message) {
        return new ZodArray(__assign(__assign({}, this._def), { minLength: { value: minLength, message: errorUtil_1.errorUtil.toString(message) } }));
    };
    ZodArray.prototype.max = function (maxLength, message) {
        return new ZodArray(__assign(__assign({}, this._def), { maxLength: { value: maxLength, message: errorUtil_1.errorUtil.toString(message) } }));
    };
    ZodArray.prototype.length = function (len, message) {
        return this.min(len, message).max(len, message);
    };
    ZodArray.prototype.nonempty = function (message) {
        return this.min(1, message);
    };
    ZodArray.create = function (schema, params) {
        return new ZodArray(__assign({ type: schema, minLength: null, maxLength: null, typeName: ZodFirstPartyTypeKind.ZodArray }, processCreateParams(params)));
    };
    return ZodArray;
}(ZodType));
exports.ZodArray = ZodArray;
/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodObject      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
var objectUtil;
(function (objectUtil) {
    objectUtil.mergeShapes = function (first, second) {
        return __assign(__assign({}, first), second);
    };
})(objectUtil = exports.objectUtil || (exports.objectUtil = {}));
var AugmentFactory = function (def) {
    return function (augmentation) {
        return new ZodObject(__assign(__assign({}, def), { shape: function () { return (__assign(__assign({}, def.shape()), augmentation)); } }));
    };
};
function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
        var newShape_1 = {};
        for (var key in schema.shape) {
            var fieldSchema = schema.shape[key];
            newShape_1[key] = ZodOptional.create(deepPartialify(fieldSchema));
        }
        return new ZodObject(__assign(__assign({}, schema._def), { shape: function () { return newShape_1; } }));
    }
    else if (schema instanceof ZodArray) {
        return ZodArray.create(deepPartialify(schema.element));
    }
    else if (schema instanceof ZodOptional) {
        return ZodOptional.create(deepPartialify(schema.unwrap()));
    }
    else if (schema instanceof ZodNullable) {
        return ZodNullable.create(deepPartialify(schema.unwrap()));
    }
    else if (schema instanceof ZodTuple) {
        return ZodTuple.create(schema.items.map(function (item) { return deepPartialify(item); }));
    }
    else {
        return schema;
    }
}
var ZodObject = /** @class */ (function (_super) {
    __extends(ZodObject, _super);
    function ZodObject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._cached = null;
        /**
         * @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
         * If you want to pass through unknown properties, use `.passthrough()` instead.
         */
        _this.nonstrict = _this.passthrough;
        _this.augment = AugmentFactory(_this._def);
        _this.extend = AugmentFactory(_this._def);
        return _this;
    }
    ZodObject.prototype._getCached = function () {
        if (this._cached !== null)
            return this._cached;
        var shape = this._def.shape();
        var keys = util_1.util.objectKeys(shape);
        return (this._cached = { shape: shape, keys: keys });
    };
    ZodObject.prototype._parse = function (input) {
        var e_5, _a, e_6, _b, e_7, _c;
        var _this = this;
        var _d = this._processInputParams(input), status = _d.status, ctx = _d.ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.object) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.object,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        var _e = this._getCached(), shape = _e.shape, shapeKeys = _e.keys;
        var dataKeys = util_1.util.objectKeys(ctx.data);
        var extraKeys = dataKeys.filter(function (k) { return !shapeKeys.includes(k); });
        var pairs = [];
        try {
            for (var shapeKeys_1 = __values(shapeKeys), shapeKeys_1_1 = shapeKeys_1.next(); !shapeKeys_1_1.done; shapeKeys_1_1 = shapeKeys_1.next()) {
                var key = shapeKeys_1_1.value;
                var keyValidator = shape[key];
                var value = ctx.data[key];
                pairs.push({
                    key: { status: "valid", value: key },
                    value: keyValidator._parse({
                        parent: ctx,
                        data: value,
                        path: __spreadArray(__spreadArray([], __read(ctx.path), false), [key], false),
                    }),
                    alwaysSet: key in ctx.data,
                });
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (shapeKeys_1_1 && !shapeKeys_1_1.done && (_a = shapeKeys_1.return)) _a.call(shapeKeys_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        if (this._def.catchall instanceof ZodNever) {
            var unknownKeys = this._def.unknownKeys;
            if (unknownKeys === "passthrough") {
                try {
                    for (var extraKeys_1 = __values(extraKeys), extraKeys_1_1 = extraKeys_1.next(); !extraKeys_1_1.done; extraKeys_1_1 = extraKeys_1.next()) {
                        var key = extraKeys_1_1.value;
                        pairs.push({
                            key: { status: "valid", value: key },
                            value: { status: "valid", value: ctx.data[key] },
                        });
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (extraKeys_1_1 && !extraKeys_1_1.done && (_b = extraKeys_1.return)) _b.call(extraKeys_1);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
            else if (unknownKeys === "strict") {
                if (extraKeys.length > 0) {
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.unrecognized_keys,
                        keys: extraKeys,
                    });
                    status.dirty();
                }
            }
            else if (unknownKeys === "strip") {
            }
            else {
                throw new Error("Internal ZodObject error: invalid unknownKeys value.");
            }
        }
        else {
            // run catchall validation
            var catchall = this._def.catchall;
            try {
                for (var extraKeys_2 = __values(extraKeys), extraKeys_2_1 = extraKeys_2.next(); !extraKeys_2_1.done; extraKeys_2_1 = extraKeys_2.next()) {
                    var key = extraKeys_2_1.value;
                    var value = ctx.data[key];
                    pairs.push({
                        key: { status: "valid", value: key },
                        value: catchall._parse({ parent: ctx, path: __spreadArray(__spreadArray([], __read(ctx.path), false), [key], false), data: value } //, ctx.child(key), value, getParsedType(value)
                        ),
                        alwaysSet: key in ctx.data,
                    });
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (extraKeys_2_1 && !extraKeys_2_1.done && (_c = extraKeys_2.return)) _c.call(extraKeys_2);
                }
                finally { if (e_7) throw e_7.error; }
            }
        }
        if (ctx.async) {
            return Promise.resolve()
                .then(function () { return __awaiter(_this, void 0, void 0, function () {
                var syncPairs, pairs_1, pairs_1_1, pair, key, _a, _b, e_8_1;
                var e_8, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            syncPairs = [];
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 7, 8, 9]);
                            pairs_1 = __values(pairs), pairs_1_1 = pairs_1.next();
                            _e.label = 2;
                        case 2:
                            if (!!pairs_1_1.done) return [3 /*break*/, 6];
                            pair = pairs_1_1.value;
                            return [4 /*yield*/, pair.key];
                        case 3:
                            key = _e.sent();
                            _b = (_a = syncPairs).push;
                            _d = {
                                key: key
                            };
                            return [4 /*yield*/, pair.value];
                        case 4:
                            _b.apply(_a, [(_d.value = _e.sent(),
                                    _d.alwaysSet = pair.alwaysSet,
                                    _d)]);
                            _e.label = 5;
                        case 5:
                            pairs_1_1 = pairs_1.next();
                            return [3 /*break*/, 2];
                        case 6: return [3 /*break*/, 9];
                        case 7:
                            e_8_1 = _e.sent();
                            e_8 = { error: e_8_1 };
                            return [3 /*break*/, 9];
                        case 8:
                            try {
                                if (pairs_1_1 && !pairs_1_1.done && (_c = pairs_1.return)) _c.call(pairs_1);
                            }
                            finally { if (e_8) throw e_8.error; }
                            return [7 /*endfinally*/];
                        case 9: return [2 /*return*/, syncPairs];
                    }
                });
            }); })
                .then(function (syncPairs) {
                return parseUtil_1.ParseStatus.mergeObjectSync(status, syncPairs);
            });
        }
        else {
            return parseUtil_1.ParseStatus.mergeObjectSync(status, pairs);
        }
    };
    Object.defineProperty(ZodObject.prototype, "shape", {
        get: function () {
            return this._def.shape();
        },
        enumerable: false,
        configurable: true
    });
    ZodObject.prototype.strict = function (message) {
        var _this = this;
        errorUtil_1.errorUtil.errToObj;
        return new ZodObject(__assign(__assign(__assign({}, this._def), { unknownKeys: "strict" }), (message !== undefined
            ? {
                errorMap: function (issue, ctx) {
                    var _a, _b, _c, _d;
                    var defaultError = (_c = (_b = (_a = _this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
                    if (issue.code === "unrecognized_keys")
                        return {
                            message: (_d = errorUtil_1.errorUtil.errToObj(message).message) !== null && _d !== void 0 ? _d : defaultError,
                        };
                    return {
                        message: defaultError,
                    };
                },
            }
            : {})));
    };
    ZodObject.prototype.strip = function () {
        return new ZodObject(__assign(__assign({}, this._def), { unknownKeys: "strip" }));
    };
    ZodObject.prototype.passthrough = function () {
        return new ZodObject(__assign(__assign({}, this._def), { unknownKeys: "passthrough" }));
    };
    ZodObject.prototype.setKey = function (key, schema) {
        var _a;
        return this.augment((_a = {}, _a[key] = schema, _a));
    };
    /**
     * Prior to zod@1.0.12 there was a bug in the
     * inferred type of merged objects. Please
     * upgrade if you are experiencing issues.
     */
    ZodObject.prototype.merge = function (merging) {
        var _this = this;
        // const mergedShape = objectUtil.mergeShapes(
        //   this._def.shape(),
        //   merging._def.shape()
        // );
        var merged = new ZodObject({
            unknownKeys: merging._def.unknownKeys,
            catchall: merging._def.catchall,
            shape: function () {
                return objectUtil.mergeShapes(_this._def.shape(), merging._def.shape());
            },
            typeName: ZodFirstPartyTypeKind.ZodObject,
        });
        return merged;
    };
    ZodObject.prototype.catchall = function (index) {
        return new ZodObject(__assign(__assign({}, this._def), { catchall: index }));
    };
    ZodObject.prototype.pick = function (mask) {
        var _this = this;
        var shape = {};
        util_1.util.objectKeys(mask).map(function (key) {
            shape[key] = _this.shape[key];
        });
        return new ZodObject(__assign(__assign({}, this._def), { shape: function () { return shape; } }));
    };
    ZodObject.prototype.omit = function (mask) {
        var _this = this;
        var shape = {};
        util_1.util.objectKeys(this.shape).map(function (key) {
            if (util_1.util.objectKeys(mask).indexOf(key) === -1) {
                shape[key] = _this.shape[key];
            }
        });
        return new ZodObject(__assign(__assign({}, this._def), { shape: function () { return shape; } }));
    };
    ZodObject.prototype.deepPartial = function () {
        return deepPartialify(this);
    };
    ZodObject.prototype.partial = function (mask) {
        var _this = this;
        var newShape = {};
        if (mask) {
            util_1.util.objectKeys(this.shape).map(function (key) {
                if (util_1.util.objectKeys(mask).indexOf(key) === -1) {
                    newShape[key] = _this.shape[key];
                }
                else {
                    newShape[key] = _this.shape[key].optional();
                }
            });
            return new ZodObject(__assign(__assign({}, this._def), { shape: function () { return newShape; } }));
        }
        else {
            for (var key in this.shape) {
                var fieldSchema = this.shape[key];
                newShape[key] = fieldSchema.optional();
            }
        }
        return new ZodObject(__assign(__assign({}, this._def), { shape: function () { return newShape; } }));
    };
    ZodObject.prototype.required = function () {
        var newShape = {};
        for (var key in this.shape) {
            var fieldSchema = this.shape[key];
            var newField = fieldSchema;
            while (newField instanceof ZodOptional) {
                newField = newField._def.innerType;
            }
            newShape[key] = newField;
        }
        return new ZodObject(__assign(__assign({}, this._def), { shape: function () { return newShape; } }));
    };
    ZodObject.create = function (shape, params) {
        return new ZodObject(__assign({ shape: function () { return shape; }, unknownKeys: "strip", catchall: ZodNever.create(), typeName: ZodFirstPartyTypeKind.ZodObject }, processCreateParams(params)));
    };
    ZodObject.strictCreate = function (shape, params) {
        return new ZodObject(__assign({ shape: function () { return shape; }, unknownKeys: "strict", catchall: ZodNever.create(), typeName: ZodFirstPartyTypeKind.ZodObject }, processCreateParams(params)));
    };
    ZodObject.lazycreate = function (shape, params) {
        return new ZodObject(__assign({ shape: shape, unknownKeys: "strip", catchall: ZodNever.create(), typeName: ZodFirstPartyTypeKind.ZodObject }, processCreateParams(params)));
    };
    return ZodObject;
}(ZodType));
exports.ZodObject = ZodObject;
var ZodUnion = /** @class */ (function (_super) {
    __extends(ZodUnion, _super);
    function ZodUnion() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodUnion.prototype._parse = function (input) {
        var _this = this;
        var ctx = this._processInputParams(input).ctx;
        var options = this._def.options;
        function handleResults(results) {
            var e_9, _a, e_10, _b, _c;
            try {
                // return first issue-free validation if it exists
                for (var results_1 = __values(results), results_1_1 = results_1.next(); !results_1_1.done; results_1_1 = results_1.next()) {
                    var result = results_1_1.value;
                    if (result.result.status === "valid") {
                        return result.result;
                    }
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (results_1_1 && !results_1_1.done && (_a = results_1.return)) _a.call(results_1);
                }
                finally { if (e_9) throw e_9.error; }
            }
            try {
                for (var results_2 = __values(results), results_2_1 = results_2.next(); !results_2_1.done; results_2_1 = results_2.next()) {
                    var result = results_2_1.value;
                    if (result.result.status === "dirty") {
                        // add issues from dirty option
                        (_c = ctx.issues).push.apply(_c, __spreadArray([], __read(result.ctx.issues), false));
                        return result.result;
                    }
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (results_2_1 && !results_2_1.done && (_b = results_2.return)) _b.call(results_2);
                }
                finally { if (e_10) throw e_10.error; }
            }
            // return invalid
            var unionErrors = results.map(function (result) { return new ZodError_1.ZodError(result.ctx.issues); });
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_union,
                unionErrors: unionErrors,
            });
            return parseUtil_1.INVALID;
        }
        if (ctx.async) {
            return Promise.all(options.map(function (option) { return __awaiter(_this, void 0, void 0, function () {
                var childCtx;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            childCtx = __assign(__assign({}, ctx), { issues: [], parent: null });
                            _a = {};
                            return [4 /*yield*/, option._parseAsync({
                                    data: ctx.data,
                                    path: ctx.path,
                                    parent: childCtx,
                                })];
                        case 1: return [2 /*return*/, (_a.result = _b.sent(),
                                _a.ctx = childCtx,
                                _a)];
                    }
                });
            }); })).then(handleResults);
        }
        else {
            var optionResults = options.map(function (option) {
                var childCtx = __assign(__assign({}, ctx), { issues: [], parent: null });
                return {
                    result: option._parseSync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: childCtx,
                    }),
                    ctx: childCtx,
                };
            });
            return handleResults(optionResults);
        }
    };
    Object.defineProperty(ZodUnion.prototype, "options", {
        get: function () {
            return this._def.options;
        },
        enumerable: false,
        configurable: true
    });
    ZodUnion.create = function (types, params) {
        return new ZodUnion(__assign({ options: types, typeName: ZodFirstPartyTypeKind.ZodUnion }, processCreateParams(params)));
    };
    return ZodUnion;
}(ZodType));
exports.ZodUnion = ZodUnion;
var ZodDiscriminatedUnion = /** @class */ (function (_super) {
    __extends(ZodDiscriminatedUnion, _super);
    function ZodDiscriminatedUnion() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodDiscriminatedUnion.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.object) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.object,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        var discriminator = this.discriminator;
        var discriminatorValue = ctx.data[discriminator];
        var option = this.options.get(discriminatorValue);
        if (!option) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_union_discriminator,
                options: this.validDiscriminatorValues,
                path: [discriminator],
            });
            return parseUtil_1.INVALID;
        }
        if (ctx.async) {
            return option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
        }
        else {
            return option._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
        }
    };
    Object.defineProperty(ZodDiscriminatedUnion.prototype, "discriminator", {
        get: function () {
            return this._def.discriminator;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodDiscriminatedUnion.prototype, "validDiscriminatorValues", {
        get: function () {
            return Array.from(this.options.keys());
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodDiscriminatedUnion.prototype, "options", {
        get: function () {
            return this._def.options;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
     * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
     * have a different value for each object in the union.
     * @param discriminator the name of the discriminator property
     * @param types an array of object schemas
     * @param params
     */
    ZodDiscriminatedUnion.create = function (discriminator, types, params) {
        // Get all the valid discriminator values
        var options = new Map();
        try {
            types.forEach(function (type) {
                var discriminatorValue = type.shape[discriminator].value;
                options.set(discriminatorValue, type);
            });
        }
        catch (e) {
            throw new Error("The discriminator value could not be extracted from all the provided schemas");
        }
        // Assert that all the discriminator values are unique
        if (options.size !== types.length) {
            throw new Error("Some of the discriminator values are not unique");
        }
        return new ZodDiscriminatedUnion(__assign({ typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion, discriminator: discriminator, options: options }, processCreateParams(params)));
    };
    return ZodDiscriminatedUnion;
}(ZodType));
exports.ZodDiscriminatedUnion = ZodDiscriminatedUnion;
function mergeValues(a, b) {
    var e_11, _a;
    var aType = (0, parseUtil_1.getParsedType)(a);
    var bType = (0, parseUtil_1.getParsedType)(b);
    if (a === b) {
        return { valid: true, data: a };
    }
    else if (aType === parseUtil_1.ZodParsedType.object && bType === parseUtil_1.ZodParsedType.object) {
        var bKeys_1 = util_1.util.objectKeys(b);
        var sharedKeys = util_1.util
            .objectKeys(a)
            .filter(function (key) { return bKeys_1.indexOf(key) !== -1; });
        var newObj = __assign(__assign({}, a), b);
        try {
            for (var sharedKeys_1 = __values(sharedKeys), sharedKeys_1_1 = sharedKeys_1.next(); !sharedKeys_1_1.done; sharedKeys_1_1 = sharedKeys_1.next()) {
                var key = sharedKeys_1_1.value;
                var sharedValue = mergeValues(a[key], b[key]);
                if (!sharedValue.valid) {
                    return { valid: false };
                }
                newObj[key] = sharedValue.data;
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (sharedKeys_1_1 && !sharedKeys_1_1.done && (_a = sharedKeys_1.return)) _a.call(sharedKeys_1);
            }
            finally { if (e_11) throw e_11.error; }
        }
        return { valid: true, data: newObj };
    }
    else if (aType === parseUtil_1.ZodParsedType.array && bType === parseUtil_1.ZodParsedType.array) {
        if (a.length !== b.length) {
            return { valid: false };
        }
        var newArray = [];
        for (var index = 0; index < a.length; index++) {
            var itemA = a[index];
            var itemB = b[index];
            var sharedValue = mergeValues(itemA, itemB);
            if (!sharedValue.valid) {
                return { valid: false };
            }
            newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
    }
    else if (aType === parseUtil_1.ZodParsedType.date &&
        bType === parseUtil_1.ZodParsedType.date &&
        +a === +b) {
        return { valid: true, data: a };
    }
    else {
        return { valid: false };
    }
}
var ZodIntersection = /** @class */ (function (_super) {
    __extends(ZodIntersection, _super);
    function ZodIntersection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodIntersection.prototype._parse = function (input) {
        var _a = this._processInputParams(input), status = _a.status, ctx = _a.ctx;
        var handleParsed = function (parsedLeft, parsedRight) {
            if ((0, parseUtil_1.isAborted)(parsedLeft) || (0, parseUtil_1.isAborted)(parsedRight)) {
                return parseUtil_1.INVALID;
            }
            var merged = mergeValues(parsedLeft.value, parsedRight.value);
            if (!merged.valid) {
                (0, parseUtil_1.addIssueToContext)(ctx, {
                    code: ZodError_1.ZodIssueCode.invalid_intersection_types,
                });
                return parseUtil_1.INVALID;
            }
            if ((0, parseUtil_1.isDirty)(parsedLeft) || (0, parseUtil_1.isDirty)(parsedRight)) {
                status.dirty();
            }
            return { status: status.value, value: merged.data };
        };
        if (ctx.async) {
            return Promise.all([
                this._def.left._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }),
                this._def.right._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }),
            ]).then(function (_a) {
                var _b = __read(_a, 2), left = _b[0], right = _b[1];
                return handleParsed(left, right);
            });
        }
        else {
            return handleParsed(this._def.left._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            }), this._def.right._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            }));
        }
    };
    ZodIntersection.create = function (left, right, params) {
        return new ZodIntersection(__assign({ left: left, right: right, typeName: ZodFirstPartyTypeKind.ZodIntersection }, processCreateParams(params)));
    };
    return ZodIntersection;
}(ZodType));
exports.ZodIntersection = ZodIntersection;
var ZodTuple = /** @class */ (function (_super) {
    __extends(ZodTuple, _super);
    function ZodTuple() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodTuple.prototype._parse = function (input) {
        var _this = this;
        var _a = this._processInputParams(input), status = _a.status, ctx = _a.ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.array) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.array,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.too_small,
                minimum: this._def.items.length,
                inclusive: true,
                type: "array",
            });
            return parseUtil_1.INVALID;
        }
        var rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.too_big,
                maximum: this._def.items.length,
                inclusive: true,
                type: "array",
            });
            status.dirty();
        }
        var items = ctx.data
            .map(function (item, itemIndex) {
            var schema = _this._def.items[itemIndex] || _this._def.rest;
            if (!schema)
                return null;
            return schema._parse({
                data: item,
                path: __spreadArray(__spreadArray([], __read(ctx.path), false), [itemIndex], false),
                parent: ctx,
            });
        })
            .filter(function (x) { return !!x; }); // filter nulls
        if (ctx.async) {
            return Promise.all(items).then(function (results) {
                return parseUtil_1.ParseStatus.mergeArray(status, results);
            });
        }
        else {
            return parseUtil_1.ParseStatus.mergeArray(status, items);
        }
    };
    Object.defineProperty(ZodTuple.prototype, "items", {
        get: function () {
            return this._def.items;
        },
        enumerable: false,
        configurable: true
    });
    ZodTuple.prototype.rest = function (rest) {
        return new ZodTuple(__assign(__assign({}, this._def), { rest: rest }));
    };
    ZodTuple.create = function (schemas, params) {
        return new ZodTuple(__assign({ items: schemas, typeName: ZodFirstPartyTypeKind.ZodTuple, rest: null }, processCreateParams(params)));
    };
    return ZodTuple;
}(ZodType));
exports.ZodTuple = ZodTuple;
var ZodRecord = /** @class */ (function (_super) {
    __extends(ZodRecord, _super);
    function ZodRecord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ZodRecord.prototype, "keySchema", {
        get: function () {
            return this._def.keyType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodRecord.prototype, "valueSchema", {
        get: function () {
            return this._def.valueType;
        },
        enumerable: false,
        configurable: true
    });
    ZodRecord.prototype._parse = function (input) {
        var _a = this._processInputParams(input), status = _a.status, ctx = _a.ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.object) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.object,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        var pairs = [];
        var keyType = this._def.keyType;
        var valueType = this._def.valueType;
        for (var key in ctx.data) {
            pairs.push({
                key: keyType._parse({
                    data: key,
                    path: __spreadArray(__spreadArray([], __read(ctx.path), false), [key], false),
                    parent: ctx,
                }),
                value: valueType._parse({
                    data: ctx.data[key],
                    path: __spreadArray(__spreadArray([], __read(ctx.path), false), [key], false),
                    parent: ctx,
                }),
            });
        }
        if (ctx.async) {
            return parseUtil_1.ParseStatus.mergeObjectAsync(status, pairs);
        }
        else {
            return parseUtil_1.ParseStatus.mergeObjectSync(status, pairs);
        }
    };
    Object.defineProperty(ZodRecord.prototype, "element", {
        get: function () {
            return this._def.valueType;
        },
        enumerable: false,
        configurable: true
    });
    ZodRecord.create = function (first, second, third) {
        if (second instanceof ZodType) {
            return new ZodRecord(__assign({ keyType: first, valueType: second, typeName: ZodFirstPartyTypeKind.ZodRecord }, processCreateParams(third)));
        }
        return new ZodRecord(__assign({ keyType: ZodString.create(), valueType: first, typeName: ZodFirstPartyTypeKind.ZodRecord }, processCreateParams(second)));
    };
    return ZodRecord;
}(ZodType));
exports.ZodRecord = ZodRecord;
var ZodMap = /** @class */ (function (_super) {
    __extends(ZodMap, _super);
    function ZodMap() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodMap.prototype._parse = function (input) {
        var e_12, _a;
        var _this = this;
        var _b = this._processInputParams(input), status = _b.status, ctx = _b.ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.map) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.map,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        var keyType = this._def.keyType;
        var valueType = this._def.valueType;
        var pairs = __spreadArray([], __read(ctx.data.entries()), false).map(function (_a, index) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return {
                key: keyType._parse({
                    data: key,
                    path: __spreadArray(__spreadArray([], __read(ctx.path), false), [index, "key"], false),
                    parent: ctx,
                }),
                value: valueType._parse({
                    data: value,
                    path: __spreadArray(__spreadArray([], __read(ctx.path), false), [index, "value"], false),
                    parent: ctx,
                }),
            };
        });
        if (ctx.async) {
            var finalMap_1 = new Map();
            return Promise.resolve().then(function () { return __awaiter(_this, void 0, void 0, function () {
                var pairs_3, pairs_3_1, pair, key, value, e_13_1;
                var e_13, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 6, 7, 8]);
                            pairs_3 = __values(pairs), pairs_3_1 = pairs_3.next();
                            _b.label = 1;
                        case 1:
                            if (!!pairs_3_1.done) return [3 /*break*/, 5];
                            pair = pairs_3_1.value;
                            return [4 /*yield*/, pair.key];
                        case 2:
                            key = _b.sent();
                            return [4 /*yield*/, pair.value];
                        case 3:
                            value = _b.sent();
                            if (key.status === "aborted" || value.status === "aborted") {
                                return [2 /*return*/, parseUtil_1.INVALID];
                            }
                            if (key.status === "dirty" || value.status === "dirty") {
                                status.dirty();
                            }
                            finalMap_1.set(key.value, value.value);
                            _b.label = 4;
                        case 4:
                            pairs_3_1 = pairs_3.next();
                            return [3 /*break*/, 1];
                        case 5: return [3 /*break*/, 8];
                        case 6:
                            e_13_1 = _b.sent();
                            e_13 = { error: e_13_1 };
                            return [3 /*break*/, 8];
                        case 7:
                            try {
                                if (pairs_3_1 && !pairs_3_1.done && (_a = pairs_3.return)) _a.call(pairs_3);
                            }
                            finally { if (e_13) throw e_13.error; }
                            return [7 /*endfinally*/];
                        case 8: return [2 /*return*/, { status: status.value, value: finalMap_1 }];
                    }
                });
            }); });
        }
        else {
            var finalMap = new Map();
            try {
                for (var pairs_2 = __values(pairs), pairs_2_1 = pairs_2.next(); !pairs_2_1.done; pairs_2_1 = pairs_2.next()) {
                    var pair = pairs_2_1.value;
                    var key = pair.key;
                    var value = pair.value;
                    if (key.status === "aborted" || value.status === "aborted") {
                        return parseUtil_1.INVALID;
                    }
                    if (key.status === "dirty" || value.status === "dirty") {
                        status.dirty();
                    }
                    finalMap.set(key.value, value.value);
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (pairs_2_1 && !pairs_2_1.done && (_a = pairs_2.return)) _a.call(pairs_2);
                }
                finally { if (e_12) throw e_12.error; }
            }
            return { status: status.value, value: finalMap };
        }
    };
    ZodMap.create = function (keyType, valueType, params) {
        return new ZodMap(__assign({ valueType: valueType, keyType: keyType, typeName: ZodFirstPartyTypeKind.ZodMap }, processCreateParams(params)));
    };
    return ZodMap;
}(ZodType));
exports.ZodMap = ZodMap;
var ZodSet = /** @class */ (function (_super) {
    __extends(ZodSet, _super);
    function ZodSet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodSet.prototype._parse = function (input) {
        var _a = this._processInputParams(input), status = _a.status, ctx = _a.ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.set) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.set,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        var def = this._def;
        if (def.minSize !== null) {
            if (ctx.data.size < def.minSize.value) {
                (0, parseUtil_1.addIssueToContext)(ctx, {
                    code: ZodError_1.ZodIssueCode.too_small,
                    minimum: def.minSize.value,
                    type: "set",
                    inclusive: true,
                    message: def.minSize.message,
                });
                status.dirty();
            }
        }
        if (def.maxSize !== null) {
            if (ctx.data.size > def.maxSize.value) {
                (0, parseUtil_1.addIssueToContext)(ctx, {
                    code: ZodError_1.ZodIssueCode.too_big,
                    maximum: def.maxSize.value,
                    type: "set",
                    inclusive: true,
                    message: def.maxSize.message,
                });
                status.dirty();
            }
        }
        var valueType = this._def.valueType;
        function finalizeSet(elements) {
            var e_14, _a;
            var parsedSet = new Set();
            try {
                for (var elements_1 = __values(elements), elements_1_1 = elements_1.next(); !elements_1_1.done; elements_1_1 = elements_1.next()) {
                    var element = elements_1_1.value;
                    if (element.status === "aborted")
                        return parseUtil_1.INVALID;
                    if (element.status === "dirty")
                        status.dirty();
                    parsedSet.add(element.value);
                }
            }
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (elements_1_1 && !elements_1_1.done && (_a = elements_1.return)) _a.call(elements_1);
                }
                finally { if (e_14) throw e_14.error; }
            }
            return { status: status.value, value: parsedSet };
        }
        var elements = __spreadArray([], __read(ctx.data.values()), false).map(function (item, i) {
            return valueType._parse({ data: item, path: __spreadArray(__spreadArray([], __read(ctx.path), false), [i], false), parent: ctx });
        });
        if (ctx.async) {
            return Promise.all(elements).then(function (elements) { return finalizeSet(elements); });
        }
        else {
            return finalizeSet(elements);
        }
    };
    ZodSet.prototype.min = function (minSize, message) {
        return new ZodSet(__assign(__assign({}, this._def), { minSize: { value: minSize, message: errorUtil_1.errorUtil.toString(message) } }));
    };
    ZodSet.prototype.max = function (maxSize, message) {
        return new ZodSet(__assign(__assign({}, this._def), { maxSize: { value: maxSize, message: errorUtil_1.errorUtil.toString(message) } }));
    };
    ZodSet.prototype.size = function (size, message) {
        return this.min(size, message).max(size, message);
    };
    ZodSet.prototype.nonempty = function (message) {
        return this.min(1, message);
    };
    ZodSet.create = function (valueType, params) {
        return new ZodSet(__assign({ valueType: valueType, minSize: null, maxSize: null, typeName: ZodFirstPartyTypeKind.ZodSet }, processCreateParams(params)));
    };
    return ZodSet;
}(ZodType));
exports.ZodSet = ZodSet;
var ZodFunction = /** @class */ (function (_super) {
    __extends(ZodFunction, _super);
    function ZodFunction() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.validate = _this.implement;
        return _this;
    }
    ZodFunction.prototype._parse = function (input) {
        var _this = this;
        var ctx = this._processInputParams(input).ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.function) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.function,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        function makeArgsIssue(args, error) {
            return (0, parseUtil_1.makeIssue)({
                data: args,
                path: ctx.path,
                errorMaps: [
                    ctx.contextualErrorMap,
                    ctx.schemaErrorMap,
                    ZodError_1.overrideErrorMap,
                    ZodError_1.defaultErrorMap,
                ].filter(function (x) { return !!x; }),
                issueData: {
                    code: ZodError_1.ZodIssueCode.invalid_arguments,
                    argumentsError: error,
                },
            });
        }
        function makeReturnsIssue(returns, error) {
            return (0, parseUtil_1.makeIssue)({
                data: returns,
                path: ctx.path,
                errorMaps: [
                    ctx.contextualErrorMap,
                    ctx.schemaErrorMap,
                    ZodError_1.overrideErrorMap,
                    ZodError_1.defaultErrorMap,
                ].filter(function (x) { return !!x; }),
                issueData: {
                    code: ZodError_1.ZodIssueCode.invalid_return_type,
                    returnTypeError: error,
                },
            });
        }
        var params = { errorMap: ctx.contextualErrorMap };
        var fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
            return (0, parseUtil_1.OK)(function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return __awaiter(_this, void 0, void 0, function () {
                    var error, parsedArgs, result, parsedReturns;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                error = new ZodError_1.ZodError([]);
                                return [4 /*yield*/, this._def.args
                                        .parseAsync(args, params)
                                        .catch(function (e) {
                                        error.addIssue(makeArgsIssue(args, e));
                                        throw error;
                                    })];
                            case 1:
                                parsedArgs = _a.sent();
                                return [4 /*yield*/, fn.apply(void 0, __spreadArray([], __read(parsedArgs), false))];
                            case 2:
                                result = _a.sent();
                                return [4 /*yield*/, this._def.returns._def.type
                                        .parseAsync(result, params)
                                        .catch(function (e) {
                                        error.addIssue(makeReturnsIssue(result, e));
                                        throw error;
                                    })];
                            case 3:
                                parsedReturns = _a.sent();
                                return [2 /*return*/, parsedReturns];
                        }
                    });
                });
            });
        }
        else {
            return (0, parseUtil_1.OK)(function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var parsedArgs = _this._def.args.safeParse(args, params);
                if (!parsedArgs.success) {
                    throw new ZodError_1.ZodError([makeArgsIssue(args, parsedArgs.error)]);
                }
                var result = fn.apply(void 0, __spreadArray([], __read(parsedArgs.data), false));
                var parsedReturns = _this._def.returns.safeParse(result, params);
                if (!parsedReturns.success) {
                    throw new ZodError_1.ZodError([makeReturnsIssue(result, parsedReturns.error)]);
                }
                return parsedReturns.data;
            });
        }
    };
    ZodFunction.prototype.parameters = function () {
        return this._def.args;
    };
    ZodFunction.prototype.returnType = function () {
        return this._def.returns;
    };
    ZodFunction.prototype.args = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        return new ZodFunction(__assign(__assign({}, this._def), { args: ZodTuple.create(items).rest(ZodUnknown.create()) }));
    };
    ZodFunction.prototype.returns = function (returnType) {
        return new ZodFunction(__assign(__assign({}, this._def), { returns: returnType }));
    };
    ZodFunction.prototype.implement = function (func) {
        var validatedFunc = this.parse(func);
        return validatedFunc;
    };
    ZodFunction.prototype.strictImplement = function (func) {
        var validatedFunc = this.parse(func);
        return validatedFunc;
    };
    ZodFunction.create = function (args, returns, params) {
        return new ZodFunction(__assign({ args: (args
                ? args.rest(ZodUnknown.create())
                : ZodTuple.create([]).rest(ZodUnknown.create())), returns: returns || ZodUnknown.create(), typeName: ZodFirstPartyTypeKind.ZodFunction }, processCreateParams(params)));
    };
    return ZodFunction;
}(ZodType));
exports.ZodFunction = ZodFunction;
var ZodLazy = /** @class */ (function (_super) {
    __extends(ZodLazy, _super);
    function ZodLazy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ZodLazy.prototype, "schema", {
        get: function () {
            return this._def.getter();
        },
        enumerable: false,
        configurable: true
    });
    ZodLazy.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        var lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
    };
    ZodLazy.create = function (getter, params) {
        return new ZodLazy(__assign({ getter: getter, typeName: ZodFirstPartyTypeKind.ZodLazy }, processCreateParams(params)));
    };
    return ZodLazy;
}(ZodType));
exports.ZodLazy = ZodLazy;
var ZodLiteral = /** @class */ (function (_super) {
    __extends(ZodLiteral, _super);
    function ZodLiteral() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodLiteral.prototype._parse = function (input) {
        var _a = this._processInputParams(input), status = _a.status, ctx = _a.ctx;
        if (ctx.data !== this._def.value) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: (0, parseUtil_1.getParsedType)(this._def.value),
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        return { status: status.value, value: ctx.data };
    };
    Object.defineProperty(ZodLiteral.prototype, "value", {
        get: function () {
            return this._def.value;
        },
        enumerable: false,
        configurable: true
    });
    ZodLiteral.create = function (value, params) {
        return new ZodLiteral(__assign({ value: value, typeName: ZodFirstPartyTypeKind.ZodLiteral }, processCreateParams(params)));
    };
    return ZodLiteral;
}(ZodType));
exports.ZodLiteral = ZodLiteral;
function createZodEnum(values) {
    return new ZodEnum({
        values: values,
        typeName: ZodFirstPartyTypeKind.ZodEnum,
    });
}
var ZodEnum = /** @class */ (function (_super) {
    __extends(ZodEnum, _super);
    function ZodEnum() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodEnum.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        if (this._def.values.indexOf(ctx.data) === -1) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_enum_value,
                options: this._def.values,
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(ctx.data);
    };
    Object.defineProperty(ZodEnum.prototype, "options", {
        get: function () {
            return this._def.values;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodEnum.prototype, "enum", {
        get: function () {
            var e_15, _a;
            var enumValues = {};
            try {
                for (var _b = __values(this._def.values), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var val = _c.value;
                    enumValues[val] = val;
                }
            }
            catch (e_15_1) { e_15 = { error: e_15_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_15) throw e_15.error; }
            }
            return enumValues;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodEnum.prototype, "Values", {
        get: function () {
            var e_16, _a;
            var enumValues = {};
            try {
                for (var _b = __values(this._def.values), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var val = _c.value;
                    enumValues[val] = val;
                }
            }
            catch (e_16_1) { e_16 = { error: e_16_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_16) throw e_16.error; }
            }
            return enumValues;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodEnum.prototype, "Enum", {
        get: function () {
            var e_17, _a;
            var enumValues = {};
            try {
                for (var _b = __values(this._def.values), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var val = _c.value;
                    enumValues[val] = val;
                }
            }
            catch (e_17_1) { e_17 = { error: e_17_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_17) throw e_17.error; }
            }
            return enumValues;
        },
        enumerable: false,
        configurable: true
    });
    ZodEnum.create = createZodEnum;
    return ZodEnum;
}(ZodType));
exports.ZodEnum = ZodEnum;
var ZodNativeEnum = /** @class */ (function (_super) {
    __extends(ZodNativeEnum, _super);
    function ZodNativeEnum() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodNativeEnum.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        var nativeEnumValues = util_1.util.getValidEnumValues(this._def.values);
        if (nativeEnumValues.indexOf(ctx.data) === -1) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_enum_value,
                options: util_1.util.objectValues(nativeEnumValues),
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(ctx.data);
    };
    Object.defineProperty(ZodNativeEnum.prototype, "enum", {
        get: function () {
            return this._def.values;
        },
        enumerable: false,
        configurable: true
    });
    ZodNativeEnum.create = function (values, params) {
        return new ZodNativeEnum(__assign({ values: values, typeName: ZodFirstPartyTypeKind.ZodNativeEnum }, processCreateParams(params)));
    };
    return ZodNativeEnum;
}(ZodType));
exports.ZodNativeEnum = ZodNativeEnum;
var ZodPromise = /** @class */ (function (_super) {
    __extends(ZodPromise, _super);
    function ZodPromise() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodPromise.prototype._parse = function (input) {
        var _this = this;
        var ctx = this._processInputParams(input).ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.promise && ctx.async === false) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.promise,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        var promisified = ctx.parsedType === parseUtil_1.ZodParsedType.promise
            ? ctx.data
            : Promise.resolve(ctx.data);
        return (0, parseUtil_1.OK)(promisified.then(function (data) {
            return _this._def.type.parseAsync(data, {
                path: ctx.path,
                errorMap: ctx.contextualErrorMap,
            });
        }));
    };
    ZodPromise.create = function (schema, params) {
        return new ZodPromise(__assign({ type: schema, typeName: ZodFirstPartyTypeKind.ZodPromise }, processCreateParams(params)));
    };
    return ZodPromise;
}(ZodType));
exports.ZodPromise = ZodPromise;
var ZodEffects = /** @class */ (function (_super) {
    __extends(ZodEffects, _super);
    function ZodEffects() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodEffects.prototype.innerType = function () {
        return this._def.schema;
    };
    ZodEffects.prototype._parse = function (input) {
        var _this = this;
        var _a = this._processInputParams(input), status = _a.status, ctx = _a.ctx;
        var effect = this._def.effect || null;
        if (effect.type === "preprocess") {
            var processed = effect.transform(ctx.data);
            if (ctx.async) {
                return Promise.resolve(processed).then(function (processed) {
                    return _this._def.schema._parseAsync({
                        data: processed,
                        path: ctx.path,
                        parent: ctx,
                    });
                });
            }
            else {
                return this._def.schema._parseSync({
                    data: processed,
                    path: ctx.path,
                    parent: ctx,
                });
            }
        }
        if (effect.type === "refinement") {
            var checkCtx_1 = {
                addIssue: function (arg) {
                    (0, parseUtil_1.addIssueToContext)(ctx, arg);
                    if (arg.fatal) {
                        status.abort();
                    }
                    else {
                        status.dirty();
                    }
                },
                get path() {
                    return ctx.path;
                },
            };
            checkCtx_1.addIssue = checkCtx_1.addIssue.bind(checkCtx_1);
            var executeRefinement_1 = function (acc
            // effect: RefinementEffect<any>
            ) {
                var result = effect.refinement(acc, checkCtx_1);
                if (ctx.async) {
                    return Promise.resolve(result);
                }
                if (result instanceof Promise) {
                    throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
                }
                return acc;
            };
            if (ctx.async === false) {
                var inner = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (inner.status === "aborted")
                    return parseUtil_1.INVALID;
                if (inner.status === "dirty")
                    status.dirty();
                // return value is ignored
                executeRefinement_1(inner.value);
                return { status: status.value, value: inner.value };
            }
            else {
                return this._def.schema
                    ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
                    .then(function (inner) {
                    if (inner.status === "aborted")
                        return parseUtil_1.INVALID;
                    if (inner.status === "dirty")
                        status.dirty();
                    return executeRefinement_1(inner.value).then(function () {
                        return { status: status.value, value: inner.value };
                    });
                });
            }
        }
        if (effect.type === "transform") {
            if (ctx.async === false) {
                var base = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                // if (base.status === "aborted") return INVALID;
                // if (base.status === "dirty") {
                //   return { status: "dirty", value: base.value };
                // }
                if (!(0, parseUtil_1.isValid)(base))
                    return base;
                var result = effect.transform(base.value);
                if (result instanceof Promise) {
                    throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
                }
                return (0, parseUtil_1.OK)(result);
            }
            else {
                return this._def.schema
                    ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
                    .then(function (base) {
                    if (!(0, parseUtil_1.isValid)(base))
                        return base;
                    // if (base.status === "aborted") return INVALID;
                    // if (base.status === "dirty") {
                    //   return { status: "dirty", value: base.value };
                    // }
                    return Promise.resolve(effect.transform(base.value)).then(parseUtil_1.OK);
                });
            }
        }
        util_1.util.assertNever(effect);
    };
    ZodEffects.create = function (schema, effect, params) {
        return new ZodEffects(__assign({ schema: schema, typeName: ZodFirstPartyTypeKind.ZodEffects, effect: effect }, processCreateParams(params)));
    };
    ZodEffects.createWithPreprocess = function (preprocess, schema, params) {
        return new ZodEffects(__assign({ schema: schema, effect: { type: "preprocess", transform: preprocess }, typeName: ZodFirstPartyTypeKind.ZodEffects }, processCreateParams(params)));
    };
    return ZodEffects;
}(ZodType));
exports.ZodEffects = ZodEffects;
exports.ZodTransformer = ZodEffects;
var ZodOptional = /** @class */ (function (_super) {
    __extends(ZodOptional, _super);
    function ZodOptional() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodOptional.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        if (ctx.parsedType === parseUtil_1.ZodParsedType.undefined) {
            return (0, parseUtil_1.OK)(undefined);
        }
        return this._def.innerType._parse({
            data: ctx.data,
            path: ctx.path,
            parent: ctx,
        });
    };
    ZodOptional.prototype.unwrap = function () {
        return this._def.innerType;
    };
    ZodOptional.create = function (type, params) {
        return new ZodOptional(__assign({ innerType: type, typeName: ZodFirstPartyTypeKind.ZodOptional }, processCreateParams(params)));
    };
    return ZodOptional;
}(ZodType));
exports.ZodOptional = ZodOptional;
var ZodNullable = /** @class */ (function (_super) {
    __extends(ZodNullable, _super);
    function ZodNullable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodNullable.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        if (ctx.parsedType === parseUtil_1.ZodParsedType.null) {
            return (0, parseUtil_1.OK)(null);
        }
        return this._def.innerType._parse({
            data: ctx.data,
            path: ctx.path,
            parent: ctx,
        });
    };
    ZodNullable.prototype.unwrap = function () {
        return this._def.innerType;
    };
    ZodNullable.create = function (type, params) {
        return new ZodNullable(__assign({ innerType: type, typeName: ZodFirstPartyTypeKind.ZodNullable }, processCreateParams(params)));
    };
    return ZodNullable;
}(ZodType));
exports.ZodNullable = ZodNullable;
var ZodDefault = /** @class */ (function (_super) {
    __extends(ZodDefault, _super);
    function ZodDefault() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodDefault.prototype._parse = function (input) {
        var ctx = this._processInputParams(input).ctx;
        var data = ctx.data;
        if (ctx.parsedType === parseUtil_1.ZodParsedType.undefined) {
            data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
            data: data,
            path: ctx.path,
            parent: ctx,
        });
    };
    ZodDefault.prototype.removeDefault = function () {
        return this._def.innerType;
    };
    ZodDefault.create = function (type, params) {
        return new ZodOptional(__assign({ innerType: type, typeName: ZodFirstPartyTypeKind.ZodOptional }, processCreateParams(params)));
    };
    return ZodDefault;
}(ZodType));
exports.ZodDefault = ZodDefault;
var ZodNaN = /** @class */ (function (_super) {
    __extends(ZodNaN, _super);
    function ZodNaN() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodNaN.prototype._parse = function (input) {
        var _a = this._processInputParams(input), status = _a.status, ctx = _a.ctx;
        if (ctx.parsedType !== parseUtil_1.ZodParsedType.nan) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: parseUtil_1.ZodParsedType.nan,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        return { status: status.value, value: ctx.data };
    };
    ZodNaN.create = function (params) {
        return new ZodNaN(__assign({ typeName: ZodFirstPartyTypeKind.ZodNaN }, processCreateParams(params)));
    };
    return ZodNaN;
}(ZodType));
exports.ZodNaN = ZodNaN;
var custom = function (check, params) {
    if (check)
        return ZodAny.create().refine(check, params);
    return ZodAny.create();
};
exports.custom = custom;
exports.late = {
    object: ZodObject.lazycreate,
};
var ZodFirstPartyTypeKind;
(function (ZodFirstPartyTypeKind) {
    ZodFirstPartyTypeKind["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind["ZodNaN"] = "ZodNaN";
    ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
    ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
})(ZodFirstPartyTypeKind = exports.ZodFirstPartyTypeKind || (exports.ZodFirstPartyTypeKind = {}));
var instanceOfType = function (cls, params) {
    if (params === void 0) { params = {
        message: "Input not instance of ".concat(cls.name),
    }; }
    return (0, exports.custom)(function (data) { return data instanceof cls; }, params);
};
exports.instanceof = instanceOfType;
var stringType = ZodString.create;
exports.string = stringType;
var numberType = ZodNumber.create;
exports.number = numberType;
var nanType = ZodNaN.create;
exports.nan = nanType;
var bigIntType = ZodBigInt.create;
exports.bigint = bigIntType;
var booleanType = ZodBoolean.create;
exports.boolean = booleanType;
var dateType = ZodDate.create;
exports.date = dateType;
var undefinedType = ZodUndefined.create;
exports.undefined = undefinedType;
var nullType = ZodNull.create;
exports.null = nullType;
var anyType = ZodAny.create;
exports.any = anyType;
var unknownType = ZodUnknown.create;
exports.unknown = unknownType;
var neverType = ZodNever.create;
exports.never = neverType;
var voidType = ZodVoid.create;
exports.void = voidType;
var arrayType = ZodArray.create;
exports.array = arrayType;
var objectType = ZodObject.create;
exports.object = objectType;
var strictObjectType = ZodObject.strictCreate;
exports.strictObject = strictObjectType;
var unionType = ZodUnion.create;
exports.union = unionType;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
exports.discriminatedUnion = discriminatedUnionType;
var intersectionType = ZodIntersection.create;
exports.intersection = intersectionType;
var tupleType = ZodTuple.create;
exports.tuple = tupleType;
var recordType = ZodRecord.create;
exports.record = recordType;
var mapType = ZodMap.create;
exports.map = mapType;
var setType = ZodSet.create;
exports.set = setType;
var functionType = ZodFunction.create;
exports.function = functionType;
var lazyType = ZodLazy.create;
exports.lazy = lazyType;
var literalType = ZodLiteral.create;
exports.literal = literalType;
var enumType = ZodEnum.create;
exports.enum = enumType;
var nativeEnumType = ZodNativeEnum.create;
exports.nativeEnum = nativeEnumType;
var promiseType = ZodPromise.create;
exports.promise = promiseType;
var effectsType = ZodEffects.create;
exports.effect = effectsType;
exports.transformer = effectsType;
var optionalType = ZodOptional.create;
exports.optional = optionalType;
var nullableType = ZodNullable.create;
exports.nullable = nullableType;
var preprocessType = ZodEffects.createWithPreprocess;
exports.preprocess = preprocessType;
var ostring = function () { return stringType().optional(); };
exports.ostring = ostring;
var onumber = function () { return numberType().optional(); };
exports.onumber = onumber;
var oboolean = function () { return booleanType().optional(); };
exports.oboolean = oboolean;

},{"./ZodError":4,"./helpers/errorUtil":6,"./helpers/parseUtil":7,"./helpers/util":9}],12:[function(require,module,exports){
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
    TocClass["Excluded"] = "excluded";
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

},{}],13:[function(require,module,exports){
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
const config_1 = require("./config");
/**
 * Maps document contents — to be used in browser env.
 * @remarks
 * Modifies the document
 *
 * @param options - Config options overrides
 */
function mapHtml(options) {
    tagger_1.default(document, config_1.parseConfig(options));
    gauge_1.gaugeDocument(document);
}
window.NbMapper = { mapHtml };

},{"./config":14,"./gauge":15,"./tagger":21}],14:[function(require,module,exports){
"use strict";
/**
 * Config module
 *
 * @module
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConfig = exports.configSchema = exports.metaDataSchema = exports.previewSchema = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const defaultChapterSlice = 3;
const previewTrueSchema = zod_1.z.object({
    isPreview: zod_1.z.literal(true),
    /**
     * Chapter files to be excluded
     */
    chaptersSlice: zod_1.z.number().optional().default(defaultChapterSlice),
    /**
     * Chapter files to be excluded
     */
    removeChapters: zod_1.z.string().array(),
    /**
     * URL used in nav and site links
     */
    fullTextUrl: zod_1.z.string().url(),
});
const previewFalseSchema = zod_1.z.object({
    isPreview: zod_1.z.literal(false),
});
exports.previewSchema = zod_1.z.discriminatedUnion('isPreview', [
    previewTrueSchema,
    previewFalseSchema,
]);
const tocBaseItemSchema = zod_1.z.lazy(() => zod_1.z.object({
    isSection: zod_1.z.boolean().optional(),
    title: zod_1.z.string().optional(),
    link: zod_1.z.string().optional(),
    children: tocBaseSchema.optional(),
    listType: zod_1.z.enum(['plain', 'numbered', 'bulleted']).optional(),
}));
const tocBaseSchema = zod_1.z.array(tocBaseItemSchema);
exports.metaDataSchema = zod_1.z.object({
    title: zod_1.z.string(),
    subtitle: zod_1.z.string().optional(),
    author: zod_1.z.string(),
    published: zod_1.z.number().optional(),
    publisher: zod_1.z.string().optional(),
    keywords: zod_1.z.string().array().optional(),
    edition: zod_1.z.string().optional(),
});
exports.configSchema = zod_1.z.object({
    /**
     * i18n ISO string
     */
    languageCode: zod_1.z.string().default('en'),
    /**
     * Output format specifier
     */
    output: zod_1.z.enum(['jsdom', 'html']).default('html'),
    /**
     * Parser delimiter
     */
    delimiter: zod_1.z.string().default('\n'),
    /**
     * Root element, within which book content is recognized and
     * processed by publisher.
     */
    root: zod_1.z.string().default('main'),
    /**
     * Selectors for DOM elements to be recognized
     */
    selectors: zod_1.z
        .string()
        .array()
        .default(['p', 'li', 'dd', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'dl']),
    /**
     * Book metadata
     */
    meta: exports.metaDataSchema.optional().default({
        title: 'No title',
        author: 'No author',
    }),
    /**
     * ReadingOrder as list of `.html` files
     */
    readingOrder: zod_1.z.string().array().default([]),
    /**
     * TOC structure without in-document headings
     */
    tocBase: tocBaseSchema.default([]),
    /**
     * Static files folders to be published as a list of folder names.
     * Folders will be copied from source to output as they are
     */
    static: zod_1.z.string().array().default([]),
    preview: exports.previewSchema.optional().default({
        isPreview: false,
    }),
});
const parseConfig = (options) => {
    const loaded = exports.configSchema.safeParse(options);
    if (!loaded.success) {
        const errors = {};
        loaded.error.errors.forEach(issue => {
            const field = issue.path.join(' > ');
            if (!errors[field])
                errors[field] = [];
            errors[field].push(issue.message);
        });
        console.error(`\nThe following config fields are not allowed:`);
        for (const [field, messages] of Object.entries(errors)) {
            console.error('\n' + field);
            messages.forEach(message => console.error(' - ' + message));
        }
        console.error('\n');
        throw new Error('Invalid config options.');
    }
    return loaded.data;
};
exports.parseConfig = parseConfig;
/**
 * Loads book config options from file
 *
 * The config is being created in following stages:
 * 1. First, the custom book options in the shape of {@link PartialConfigWithDeprecated} are loaded.
 * 2. Deprecated options are transformed to their new form and the config gets shape of {@link PartialConfig}.
 * 3. Config is acquired by parsing and applying defaults on {@link PartialConfig} with {@link Preview} options.
 * 4. Since config is guaranteed to have preview settings decided, the preview logic is applied on the config.
 *
 * @param srcDir - directory where book config is located
 * @param fullTextUrl - link to the full book in case of preview feature active
 * @returns a config object that is guaranteed to be valid against its predefined schema.
 */
function loadConfig(srcDir, fullTextUrl) {
    const configPath = path_1.default.join(srcDir, '/book.json');
    if (!fs_1.default.existsSync(configPath))
        throw new Error(`Custom book config in "${configPath}" not found.`);
    const partialConfigDepr = JSON.parse(fs_1.default.readFileSync(configPath, 'utf8'));
    // rename depricated `chapters` property
    if (partialConfigDepr?.chapters && !partialConfigDepr.readingOrder) {
        partialConfigDepr.readingOrder = [...partialConfigDepr.chapters];
        delete partialConfigDepr.chapters;
    }
    // gets no longer depricated features structure
    const partialConfig = partialConfigDepr;
    let preview = {
        isPreview: false,
    };
    if (fullTextUrl) {
        // override preview config defaults with custom options
        preview = exports.previewSchema.parse({
            isPreview: true,
            fullTextUrl: fullTextUrl,
            removeChapters: [],
        });
    }
    // the config gets no longer partial
    const config = exports.parseConfig({ ...partialConfig, preview: { ...preview } });
    // apply preview options
    if (config.preview.isPreview) {
        console.log('Preparing preview version of the book.');
        config.preview.removeChapters = config.readingOrder.slice(config.preview.chaptersSlice);
        config.readingOrder = config.readingOrder.slice(0, config.preview.chaptersSlice);
    }
    return config;
}
exports.default = loadConfig;

},{"fs":1,"path":2,"zod":10}],15:[function(require,module,exports){
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

},{"../shared/dom":12}],16:[function(require,module,exports){
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
    if (!node)
        throw new Error('Expected node undefined.');
    if (typeof delimiter == 'undefined')
        throw new Error('Expected delimiter undefined.');
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
        // is it anchor or not
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

},{"./structures":19}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anchorObject = exports.containsParsedObj = exports.produceHTMLSpanIdea = void 0;
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
    if (!document)
        throw new Error('Expected document undefined.');
    if (!parsedObj)
        throw new Error('Expected parsedObj undefined.');
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
 * @remarks Provided idea should be guaranteed to NOT contain ParsedObj by its caller.
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
exports.produceHTMLSpanIdea = produceHTMLSpanIdea;
/**
 * Determines if array contains parsed object. See {@link ParsedObj}.
 *
 * @param idea - The idea
 * @returns True if contains parsed object, False otherwise.
 */
function containsParsedObj(idea) {
    return idea.reduce((acc, item) => acc || item instanceof structures_1.ParsedObj, false);
}
exports.containsParsedObj = containsParsedObj;
/**
 * Returns document containing the appropriate children for idea.
 * @remarks Provided idea should be guaranteed to contain ParsedObj by its caller.
 * @param idea IdeaPiece
 * @param document
 * @returns
 */
function anchorObject(idea, document) {
    const fragment = document.createDocumentFragment();
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
exports.anchorObject = anchorObject;
function emptyNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
    return node;
}

},{"../shared/dom":12,"./structures":19,"./utils/dom":22}],18:[function(require,module,exports){
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

},{"../utils/dom":22,"../utils/regexp":23}],19:[function(require,module,exports){
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

},{"./ideas":18,"./parsedobj":20}],20:[function(require,module,exports){
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

},{"../utils/regexp":23}],21:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberEls = exports.tagIdeas = exports.hasAncestorChunk = exports.markElementsToBeTagged = void 0;
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
    if (Array.isArray(selectors) && selectors.length == 0)
        throw new Error('Selectors cannot be empty array.');
    const rootElement = root ? document.querySelector(root) : document;
    if (!rootElement)
        throw new Error(`No root "${root}" element found in document titled "${document?.querySelector('title')?.innerHTML}".`);
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
exports.markElementsToBeTagged = markElementsToBeTagged;
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
exports.hasAncestorChunk = hasAncestorChunk;
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
exports.tagIdeas = tagIdeas;
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
exports.numberEls = numberEls;

},{"../shared/dom":12,"./parser":16,"./producer":17}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{}]},{},[13]);
