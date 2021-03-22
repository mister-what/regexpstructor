import { pipe } from "fast-fp.macro";

import {
  addFlags,
  alt,
  anyOf,
  anything,
  anythingBut,
  createRoot,
  digit,
  empty,
  flags_to_opt_string,
  followedBy,
  getNode,
  group,
  hasFlag,
  linebreak,
  maybe,
  notFollowedBy,
  oneOf,
  oneOrMore,
  or_,
  ranges,
  removeFlags,
  repeat,
  repeatExact,
  seq,
  setNode,
  setPrefix,
  setSuffix,
  someOf,
  something,
  somethingBut,
  tab,
  then_,
  whitespace,
  word,
  zeroOrMore,
} from "./RegexAst.bs";
import { stringify } from "./StringifyAst.bs";

const flatten = (...args) => args.flat(Infinity);

const _makeRanges = (flatRanges) => {
  const rangePairs = new Array(flatRanges.length / 2);
  for (let i = 0, j = 0; i < flatRanges.length; i += 2, j += 1) {
    rangePairs[j] = [
      flatRanges[i]?.toString?.(),
      flatRanges[i + 1]?.toString?.(),
    ];
  }
  return rangePairs;
};

const makeRanges = pipe(
  flatten,
  (flatRanges) =>
    flatRanges.length % 2 === 0 ? flatRanges : flatRanges.slice(0, -1),
  _makeRanges
);

const EXISTING_INSTANCES_KEY = "$7a3afcebc18ce55fe6f8445324d27b6e$";

const existingClasses =
  RegExp.prototype[Symbol.for(EXISTING_INSTANCES_KEY)] || [];

Object.defineProperty(RegExp.prototype, Symbol.for(EXISTING_INSTANCES_KEY), {
  enumerable: false,
  configurable: true,
  writable: false,
  value: existingClasses,
});

const isInstanceOfExisting = (obj) =>
  existingClasses.find((Class) => obj instanceof Class);

const isInstance = (obj) => {
  if (obj == null) return false;
  return obj instanceof RegExpstructor || isInstanceOfExisting(obj);
};

/**
 * @template T
 * @typedef {T} Node opaque type
 * @typedef {{prefix?: string, suffix?: string, node: Node, flags?: string }} RootNode
 */
/**
 * @class RegExpstructor
 * @namespace RegExpstructor
 */
class RegExpstructor {
  #rootNode;
  /**
   * @description Creates an instance of RegExpstructor.
   * @constructor
   * @memberOf RegExpstructor
   *
   * @param {{
   *   source?:string,
   *   node?: Node<never>,
   *   flags?:string,
   *   prefix?: string,
   *   suffix?: string,
   *   sanitize?: boolean
   * }} [arg]
   * @param {boolean} [init]
   */
  constructor(arg, init = true) {
    if (init) {
      const { source, node, flags, prefix, suffix, sanitize } = arg ?? {};
      this.#rootNode = createRoot({
        prefix,
        suffix,
        flags: flags_to_opt_string(flags),
        source,
        node,
        sanitize,
      });
    }
  }

  static #getRootNode = (x) => {
    if (!isInstance(x))
      throw new Error(`${x} is not an instance of RegExpstructor`);
    function _getNode() {
      // noinspection JSPotentiallyInvalidUsageOfClassThis
      return this.#rootNode;
    }
    return _getNode.call(x);
  };

  /**
   * @description creates a ReStructor from a rootNode type
   * @param {RootNode} node
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor
   */
  static from(node) {
    return new this(node);
  }

  /**
   * @description creates ReStructors from a variety of source formats
   * @param {String|Number|RegExp|RegExpstructor} x
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor
   */
  static of(x) {
    if (x instanceof this) {
      return x;
    }
    if (isInstance(x)) {
      return new this(this.#preSanitize(x.compile()));
    }
    const params = this.#preSanitize(x);
    return new this(params);
  }

  /**
   * @description disjunction (one must match) between the argument expressions
   * @param {...(String|Number|RegExp|RegExpstructor)} xs
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor
   */
  static or(...xs) {
    const verbals = xs.map((x) => {
      if (isInstance(x)) return x;
      return RegExpstructor.of(x);
    });

    const nodes = verbals.map((x) => this.#getRootNode(x).node);
    return this.from({ node: alt(nodes) });
  }

  /**
   * @description conjunction (all must match) of the argument expressions
   * @param {...(String|Number|RegExp|RegExpstructor)} xs
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor
   */
  static seq(...xs) {
    const verbals = xs.map((x) => RegExpstructor.of(x));
    const nodes = verbals.map((x) => this.#getRootNode(x).node);
    return this.from({ node: seq(nodes) });
  }

  /**
   * @description Alias for a class of primitive RegExpstructors (usually used as building blocks for more complex ReStructors)
   * @typedef {RegExpstructor} ReadablePrimitive
   */
  /**
   * @description a ReStructor that matches a whitespace
   * @type {ReadablePrimitive}
   * @memberOf RegExpstructor
   */
  static whitespace = new RegExpstructor({ node: whitespace });
  /**
   * @description an empty ReStructor
   * @type {ReadablePrimitive}
   * @memberOf RegExpstructor
   */
  static empty = new RegExpstructor({ node: empty });
  /**
   * @description match one digit
   * @type {ReadablePrimitive}
   * @memberOf RegExpstructor
   */
  static digit = new RegExpstructor({ node: digit });
  /**
   * @description match a tab-character
   * @type {ReadablePrimitive}
   * @memberOf RegExpstructor
   */
  static tab = new RegExpstructor({ node: tab });
  /**
   * @description matches a whole word
   * @type {ReadablePrimitive}
   * @memberOf RegExpstructor
   */
  static word = new RegExpstructor({ node: word });
  /**
   * @description match any kind of line break or new-lines
   * @type {ReadablePrimitive}
   * @memberOf RegExpstructor
   */
  static linebreak = new RegExpstructor({ node: linebreak });
  static any = new RegExpstructor({ node: something(empty) });

  // Utility //

  static #preSanitize = (value) => {
    if (value instanceof RegExp) {
      const source = value.source === "(?:)" ? "" : value.source;
      const prefix = source.startsWith("^") ? "^" : "";
      const suffix = source.endsWith("$") ? "$" : "";
      return {
        source: source.replace(/^\^/, "").replace(/\$$/, ""),
        flags: value.flags,
        sanitize: false,
        prefix,
        suffix,
      };
    }

    if (typeof value === "number") {
      return { source: value.toString(), sanitize: false };
    }

    if (typeof value !== "string") {
      return { source: "", sanitize: false };
    }

    return {
      source: value,
      sanitize: true,
    };
  };

  #setPrefix = (prefix) => {
    const newInstance = new RegExpstructor(null, false);
    newInstance.#rootNode = setPrefix(this.#rootNode, prefix);
    return newInstance;
  };
  #setSuffix = (suffix) => {
    const newInstance = new RegExpstructor(null, false);
    newInstance.#rootNode = setSuffix(this.#rootNode, suffix);
    return newInstance;
  };

  // Rules //

  /**
   * @description Control start-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  assertStartOfLine(enable = true) {
    return this.#setPrefix(enable ? "^" : "");
  }

  /**
   * @description Control end-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  assertEndOfLine(enable = true) {
    return this.#setSuffix(enable ? "$" : "");
  }

  /**
   * @description Look for the value passed
   * @param {(string|RegExp|number|RegExpstructor)} value value to find
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  then(value) {
    return RegExpstructor.from(
      setNode(
        setSuffix(this.#rootNode, ""),
        then_(getNode(this.#rootNode), RegExpstructor.of(value).#rootNode.node)
      )
    );
  }

  /**
   * @description Add an optional branch for matching
   * @param {(string|RegExp|number|RegExpstructor)} value value to find
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  maybe(value) {
    return RegExpstructor.from(
      setNode(
        setSuffix(this.#rootNode, ""),
        maybe(getNode(this.#rootNode), RegExpstructor.of(value).#rootNode.node)
      )
    );
  }

  /**
   * @description Add alternative expressions
   * @param {(string|RegExp|number|RegExpstructor)} value value to find
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  or(value) {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        or_(getNode(this.#rootNode), RegExpstructor.of(value).#rootNode.node)
      )
    );
  }

  /**
   * @description Any character any number of times
   * @param {boolean} [lazy] match least number of characters
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  anything(lazy = false) {
    return RegExpstructor.from(
      setNode(this.#rootNode, anything(getNode(this.#rootNode), lazy))
    );
  }

  /**
   * @description Anything but these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @param {boolean} [lazy] match least number of characters
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  anythingBut(value, lazy = false) {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        anythingBut(getNode(this.#rootNode), [value].flat().join(""), lazy)
      )
    );
  }

  /**
   * @description Any character(s) at least once
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  something() {
    return RegExpstructor.from(
      setNode(this.#rootNode, something(getNode(this.#rootNode)))
    );
  }

  /**
   * @description Any character at least one time except for these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  somethingBut(value) {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        somethingBut(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }

  /**
   * @description Match any of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  anyOf(value) {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        anyOf(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }
  /**
   * @description Match some of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  someOf(value) {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        someOf(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }

  /**
   * @description Match one chartacter of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  oneOf(value) {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        oneOf(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }

  /**
   * @description Shorthand for anyOf(value)
   * @param {string|number} value value to find
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  any(value) {
    return this.anyOf(value);
  }

  /**
   * @description Ensure that the parameter does not follow (negative lookahead)
   * @param {string|number|RegExp|RegExpstructor} value
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  assertNotFollowedBy(value) {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        notFollowedBy(
          getNode(this.#rootNode),
          RegExpstructor.of(value).#rootNode.node
        )
      )
    );
  }
  /**
   * @description Ensure that the parameter does follow (positive lookahead)
   * @param {string|number|RegExp|RegExpstructor} value
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  assertFollowedBy(value) {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        followedBy(
          getNode(this.#rootNode),
          RegExpstructor.of(value).#rootNode.node
        )
      )
    );
  }

  /**
   * @description Match any character in these ranges
   * @example RegExpstructor.empty.charOfRanges(["a","z"], ["0", "9"]) // [a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor#
   */
  charOfRanges(...characterRanges) {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        ranges(getNode(this.#rootNode), makeRanges(characterRanges), false)
      )
    );
  }
  /**
   * @description Match any character that is not in these ranges
   * @example RegExpstructor.empty.charNotOfRanges(["a","z"], ["0", "9"]) // [^a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor#
   */
  charNotOfRanges(...characterRanges) {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        ranges(getNode(this.#rootNode), makeRanges(characterRanges), true)
      )
    );
  }

  // Special characters //

  /**
   * @description Match a Line break
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  lineBreak() {
    return this.then(RegExpstructor.linebreak);
  }

  /**
   * @description A shorthand for lineBreak() for html-minded users
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  br() {
    return this.lineBreak();
  }

  /**
   * @description Match a tab character
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  tab() {
    return this.then(RegExpstructor.tab);
  }

  /**
   * @description Match any alphanumeric sequence
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  word() {
    return this.then(RegExpstructor.word);
  }

  /**
   * @description Match a single digit
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  digit() {
    return this.then(RegExpstructor.digit);
  }

  /**
   * @description Match a single whitespace
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  whitespace() {
    return this.then(RegExpstructor.whitespace);
  }

  // Modifiers //
  /**
   * @description Add a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  addFlag(flag = "") {
    return RegExpstructor.from(addFlags(this.#rootNode, flag));
  }
  /**
   * @description Remove a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  removeFlag(flag) {
    return RegExpstructor.from(removeFlags(this.#rootNode, flag));
  }

  /**
   *
   * @param {string} flag
   * @returns {boolean}
   */
  hasFlag(flag) {
    return hasFlag(this.#rootNode, flag);
  }

  /**
   * @description Adds an "i" regex flag - default flags are: "gm"
   * @param {boolean=true} enable
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  withAnyCase(enable = true) {
    return enable ? this.addFlag("i") : this.removeFlag("i");
  }
  /**
   * @description Removes a "g" regex flag - default flags are: "gm"
   * @param {boolean=true} enable `true` means no "g" flag
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  stopAtFirst(enable = true) {
    return !enable ? this.addFlag("g") : this.removeFlag("g");
  }
  /**
   *
   * @param {boolean=true} enable
   * @returns {RegExpstructor}
   */
  global(enable = true) {
    return enable ? this.addFlag("g") : this.removeFlag("g");
  }
  /**
   *
   * @param {string} flag
   * @returns {RegExpstructor}
   */
  toggleFlag(flag) {
    return !this.hasFlag(flag) ? this.addFlag(flag) : this.removeFlag(flag);
  }

  /**
   * @description Removes any set "m" regex flag - default flags are: "gm"
   * @param {boolean=true} enable `true` means "m" flag will be removed
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  searchOneLine(enable = true) {
    return enable ? this.removeFlag("m") : this.addFlag("m");
  }

  // Loops //
  /**
   * @description match the expression <min> to <max> times
   * @example ```js
   * Sx("abc").whitespace().repeat(2, 4).compile().toString() === /(?:abc\w){2,4}/gm.toString()
   * ```
   * @param {number} min
   * @param {number} max
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor#
   */
  repeat(min, max) {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        repeat(
          getNode(this.#rootNode),
          min != null ? min | 0 : void 0,
          max != null ? max | 0 : void 0
        )
      )
    );
  }
  /**
   * @description match the expression exactly <n> times
   * @example ```js
   * Sx("abc").whitespace().repeatExactly(5).compile().toString() === /(?:abc\w){5}/gm.toString()
   * ```
   * @param {number} n must be > 0
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor#
   */
  repeatExactly(n) {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        repeatExact(getNode(this.#rootNode), n != null ? n | 0 : void 0)
      )
    );
  }

  /**
   * @description the expression should match at least once
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor#
   */
  oneOrMore() {
    return RegExpstructor.from(
      setNode(this.#rootNode, oneOrMore(getNode(this.#rootNode)))
    );
  }

  /**
   * @description the expression should match zero or more times
   * @param {boolean} [lazy] enable lazy (non greedy) matching
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor#
   */
  zeroOrMore(lazy) {
    return RegExpstructor.from(
      setNode(this.#rootNode, zeroOrMore(getNode(this.#rootNode)), lazy)
    );
  }

  // Capture groups //
  /**
   *
   * @param {string} [name] optionally name your capturing group
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor#
   */
  capture(name) {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        group(getNode(this.#rootNode), name?.toString?.() ?? void 0)
      )
    );
  }

  // Miscellaneous //
  /**
   * @description compile the ReStructor to a RegExp
   * @returns {RegExp}
   * @memberOf RegExpstructor#
   */
  compile() {
    const { source, flags } = stringify(this.#rootNode);
    return new RegExp(source, flags);
  }
}

existingClasses.push(RegExpstructor);

RegExpstructor.prototype.group = RegExpstructor.prototype.capture;
RegExpstructor.prototype.followedBy = RegExpstructor.prototype.assertFollowedBy;
RegExpstructor.prototype.notFollowedBy =
  RegExpstructor.prototype.assertNotFollowedBy;

class Warning extends Error {
  constructor(msg) {
    super(msg);
    this.name = "Warning";
  }
}
const writeWarning = (text, logType = "error") => {
  return warn;
  function warn() {
    if (!warn.warned) {
      warn.warned = true;
      (typeof console[logType] === "function"
        ? console[logType]
        : console.error)(new Warning(text));
    }
  }
};

const warnArgType = writeWarning(
  "Argument type is not supported. Returning empty ReStructor."
);
/**
 *
 * @param {string|number|RegExp|RegExpstructor} [value]
 * @returns {RegExpstructor}
 */
export default function ReStructor(value) {
  const valueType = typeof value;
  if (
    value != null &&
    (valueType === "string" ||
      valueType === "number" ||
      value instanceof RegExp ||
      isInstance(value))
  ) {
    return RegExpstructor.of(value);
  }
  if (value != null && process.env.NODE_ENV !== "production") {
    warnArgType();
  }
  return RegExpstructor.empty;
}

ReStructor.or = RegExpstructor.or.bind(RegExpstructor);
ReStructor.seq = RegExpstructor.seq.bind(RegExpstructor);
ReStructor.of = RegExpstructor.of.bind(RegExpstructor);
ReStructor.digit = RegExpstructor.digit;
ReStructor.word = RegExpstructor.word;
ReStructor.empty = RegExpstructor.empty;
ReStructor.linebreak = RegExpstructor.linebreak;
ReStructor.tab = RegExpstructor.tab;
ReStructor.whitespace = RegExpstructor.whitespace;
ReStructor.any = RegExpstructor.any;
