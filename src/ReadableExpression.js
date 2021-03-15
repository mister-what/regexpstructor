import {
  createRoot,
  then_,
  or_,
  maybe,
  anyOf,
  anything,
  anythingBut,
  something,
  somethingBut,
  someOf,
  ranges,
  zeroOrMore,
  getNode,
  repeatExact,
  repeat,
  setNode,
  setPrefix,
  setSuffix,
  addFlags,
  removeFlags,
  alt,
  seq,
  whitespace,
  linebreak,
  digit,
  empty,
  tab,
  word,
  followedBy,
  notFollowedBy,
  oneOrMore,
  oneOf,
  group,
} from "./RegexAst.bs";
import { stringify } from "./StringifyAst.bs";
import ow from "ow";
import { pipe } from "fast-fp.macro";

const flatten = (...args) => args.flatten(Infinity);

const validate = (validator) => (arg) => (validator(arg), arg);

const rangesValidator = ow.create(
  "ranges",
  ow.array.validate((arr) => ({
    validator: arr.length % 2 === 0,
    message: (label) =>
      `Argument ${label} expected to have even number of elements, got ${arr.length}`,
  }))
);

const validateRanges = validate(rangesValidator);

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
const makeRanges = pipe(flatten, validateRanges, _makeRanges);

/**
 * @template T
 * @typedef {T} Node opaque type
 * @typedef {{prefix?: string, suffix?: string, node: Node, flags?: string }} RootNode
 */
/**
 * @class ReadableExpression
 * @namespace ReadableExpression
 */
class ReadableExpression {
  #rootNode;
  /**
   * @description Creates an instance of ReadableExpression.
   * @constructor
   * @memberOf ReadableExpression
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
        flags,
        source,
        node,
        sanitize,
      });
    }
  }

  static #getRootNode = (x) => {
    if (!(x instanceof this))
      throw new Error(`${x} is not an instance of ReadableExpression`);
    function _getNode() {
      // noinspection JSPotentiallyInvalidUsageOfClassThis
      return this.#rootNode;
    }
    return _getNode.call(x);
  };

  /**
   * @description creates a ReadExp from a rootNode type
   * @param {RootNode} node
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression
   */
  static from(node) {
    return new this(node);
  }

  /**
   * @description creates ReadExps from a variety of source formats
   * @param {String|Number|RegExp|ReadableExpression} x
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression
   */
  static of(x) {
    if (x instanceof ReadableExpression) return x;
    const params = this.#preSanitize(x);
    return new this(params);
  }

  /**
   * @description disjunction (one must match) between the argument expressions
   * @param {...(String|Number|RegExp|ReadableExpression)} xs
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression
   */
  static or(...xs) {
    const verbals = xs.map((x) => {
      if (x instanceof ReadableExpression) return x;
      return ReadableExpression.of(x);
    });

    const nodes = verbals.map((x) => this.#getRootNode(x).node);
    return this.from({ node: alt(nodes) });
  }

  /**
   * @description conjunction (all must match) of the argument expressions
   * @param {...(String|Number|RegExp|ReadableExpression)} xs
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression
   */
  static seq(...xs) {
    const verbals = xs.map((x) => ReadableExpression.of(x));
    const nodes = verbals.map((x) => this.#getRootNode(x).node);
    return this.from({ node: seq(nodes) });
  }

  /**
   * @description Alias for a class of primitive ReadableExpressions (usually used as building blocks for more complex ReadExps)
   * @typedef {ReadableExpression} ReadablePrimitive
   */
  /**
   * @description a ReadExp that matches a whitespace
   * @type {ReadablePrimitive}
   * @memberOf ReadableExpression
   */
  static whitespace = new ReadableExpression({ node: whitespace });
  /**
   * @description an empty ReadExp
   * @type {ReadablePrimitive}
   * @memberOf ReadableExpression
   */
  static empty = new ReadableExpression({ node: empty });
  /**
   * @description match one digit
   * @type {ReadablePrimitive}
   * @memberOf ReadableExpression
   */
  static digit = new ReadableExpression({ node: digit });
  /**
   * @description match a tab-character
   * @type {ReadablePrimitive}
   * @memberOf ReadableExpression
   */
  static tab = new ReadableExpression({ node: tab });
  /**
   * @description matches a whole word
   * @type {ReadablePrimitive}
   * @memberOf ReadableExpression
   */
  static word = new ReadableExpression({ node: word });
  /**
   * @description match any kind of line break or new-lines
   * @type {ReadablePrimitive}
   * @memberOf ReadableExpression
   */
  static linebreak = new ReadableExpression({ node: linebreak });
  static any = new ReadableExpression({ node: something(empty) });

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
    const newInstance = new ReadableExpression(null, false);
    newInstance.#rootNode = setPrefix(this.#rootNode, prefix);
    return newInstance;
  };
  #setSuffix = (suffix) => {
    const newInstance = new ReadableExpression(null, false);
    newInstance.#rootNode = setSuffix(this.#rootNode, suffix);
    return newInstance;
  };

  // Rules //

  /**
   * @description Control start-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  assertStartOfLine(enable = true) {
    return this.#setPrefix(enable ? "^" : "");
  }

  /**
   * @description Control end-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  assertEndOfLine(enable = true) {
    return this.#setSuffix(enable ? "$" : "");
  }

  /**
   * @description Look for the value passed
   * @param {(string|RegExp|number|ReadableExpression)} value value to find
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  then(value) {
    return ReadableExpression.from(
      setNode(
        setSuffix(this.#rootNode, ""),
        then_(
          getNode(this.#rootNode),
          ReadableExpression.of(value).#rootNode.node
        )
      )
    );
  }

  /**
   * @description Add an optional branch for matching
   * @param {(string|RegExp|number|ReadableExpression)} value value to find
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  maybe(value) {
    return ReadableExpression.from(
      setNode(
        setSuffix(this.#rootNode, ""),
        maybe(
          getNode(this.#rootNode),
          ReadableExpression.of(value).#rootNode.node
        )
      )
    );
  }

  /**
   * @description Add alternative expressions
   * @param {(string|RegExp|number|ReadableExpression)} value value to find
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  or(value) {
    return ReadableExpression.from(
      setNode(
        this.#rootNode,
        or_(
          getNode(this.#rootNode),
          ReadableExpression.of(value).#rootNode.node
        )
      )
    );
  }

  /**
   * @description Any character any number of times
   * @param {boolean} [lazy] match least number of characters
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  anything(lazy = false) {
    return ReadableExpression.from(
      setNode(this.#rootNode, anything(getNode(this.#rootNode), lazy))
    );
  }

  /**
   * @description Anything but these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @param {boolean} [lazy] match least number of characters
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  anythingBut(value, lazy = false) {
    return ReadableExpression.from(
      setNode(
        this.#rootNode,
        anythingBut(getNode(this.#rootNode), [value].flat().join(""), lazy)
      )
    );
  }

  /**
   * @description Any character(s) at least once
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  something() {
    return ReadableExpression.from(
      setNode(this.#rootNode, something(getNode(this.#rootNode)))
    );
  }

  /**
   * @description Any character at least one time except for these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  somethingBut(value) {
    return ReadableExpression.from(
      setNode(
        this.#rootNode,
        somethingBut(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }

  /**
   * @description Match any of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  anyOf(value) {
    return ReadableExpression.from(
      setNode(
        this.#rootNode,
        anyOf(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }
  /**
   * @description Match some of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  someOf(value) {
    return ReadableExpression.from(
      setNode(
        this.#rootNode,
        someOf(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }

  /**
   * @description Match one chartacter of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  oneOf(value) {
    return ReadableExpression.from(
      setNode(
        this.#rootNode,
        oneOf(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }

  /**
   * @description Shorthand for anyOf(value)
   * @param {string|number} value value to find
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  any(value) {
    return this.anyOf(value);
  }

  /**
   * @description Ensure that the parameter does not follow (negative lookahead)
   * @param {string|number|RegExp|ReadableExpression} value
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  assertNotFollowedBy(value) {
    return ReadableExpression.from(
      setNode(
        this.#rootNode,
        notFollowedBy(
          getNode(this.#rootNode),
          ReadableExpression.of(value).#rootNode.node
        )
      )
    );
  }
  /**
   * @description Ensure that the parameter does follow (positive lookahead)
   * @param {string|number|RegExp|ReadableExpression} value
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  assertFollowedBy(value) {
    return ReadableExpression.from(
      setNode(
        this.#rootNode,
        followedBy(
          getNode(this.#rootNode),
          ReadableExpression.of(value).#rootNode.node
        )
      )
    );
  }

  /**
   * @description Match any character in these ranges
   * @example ReadableExpression.empty.charOfRanges(["a","z"], ["0", "9"]) // [a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression#
   */
  charOfRanges(...characterRanges) {
    return ReadableExpression.from(
      setNode(
        this.#rootNode,
        ranges(getNode(this.#rootNode), makeRanges(characterRanges), false)
      )
    );
  }
  /**
   * @description Match any character that is not in these ranges
   * @example ReadableExpression.empty.charNotOfRanges(["a","z"], ["0", "9"]) // [^a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression#
   */
  charNotOfRanges(...characterRanges) {
    return ReadableExpression.from(
      setNode(
        this.#rootNode,
        ranges(getNode(this.#rootNode), makeRanges(characterRanges), true)
      )
    );
  }

  // Special characters //

  /**
   * @description Match a Line break
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  lineBreak() {
    return this.then(ReadableExpression.linebreak);
  }

  /**
   * @description A shorthand for lineBreak() for html-minded users
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  br() {
    return this.lineBreak();
  }

  /**
   * @description Match a tab character
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  tab() {
    return this.then(ReadableExpression.tab);
  }

  /**
   * @description Match any alphanumeric sequence
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  word() {
    return this.then(ReadableExpression.word);
  }

  /**
   * @description Match a single digit
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  digit() {
    return this.then(ReadableExpression.digit);
  }

  /**
   * @description Match a single whitespace
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  whitespace() {
    return this.then(ReadableExpression.whitespace);
  }

  // Modifiers //
  /**
   * @description Add a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  addFlag(flag = "") {
    return ReadableExpression.from(addFlags(this.#rootNode, flag));
  }
  /**
   * @description Remove a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  removeFlag(flag) {
    return ReadableExpression.from(removeFlags(this.#rootNode, flag));
  }

  /**
   * @description Adds an "i" regex flag - default flags are: "gm"
   * @param {boolean=true} enable
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  withAnyCase(enable = true) {
    return enable ? this.addFlag("i") : this.removeFlag("i");
  }
  /**
   * @description Removes a "g" regex flag - default flags are: "gm"
   * @param {boolean=true} enable `true` means no "g" flag
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  stopAtFirst(enable = true) {
    return enable ? this.addFlag("g") : this.removeFlag("g");
  }
  /**
   * @description Removes any set "m" regex flag - default flags are: "gm"
   * @param {boolean=true} enable `true` means "m" flag will be removed
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
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
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression#
   */
  repeat(min, max) {
    return ReadableExpression.from(
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
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression#
   */
  repeatExactly(n) {
    return ReadableExpression.from(
      setNode(
        this.#rootNode,
        repeatExact(getNode(this.#rootNode), n != null ? n | 0 : void 0)
      )
    );
  }

  /**
   * @description the expression should match at least once
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression#
   */
  oneOrMore() {
    return ReadableExpression.from(
      setNode(this.#rootNode, oneOrMore(getNode(this.#rootNode)))
    );
  }

  /**
   * @description the expression should match zero or more times
   * @param {boolean} [lazy] enable lazy (non greedy) matching
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression#
   */
  zeroOrMore(lazy) {
    return ReadableExpression.from(
      setNode(this.#rootNode, zeroOrMore(getNode(this.#rootNode)), lazy)
    );
  }

  // Capture groups //
  /**
   *
   * @param {string} [name] optionally name your capturing group
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression#
   */
  capture(name) {
    return ReadableExpression.from(
      setNode(
        this.#rootNode,
        group(getNode(this.#rootNode), name?.toString?.() ?? void 0)
      )
    );
  }

  // Miscellaneous //
  /**
   * @description compile the ReadExp to a RegExp
   * @returns {RegExp}
   * @memberOf ReadableExpression#
   */
  compile() {
    const { source, flags } = stringify(this.#rootNode);
    return new RegExp(source, flags);
  }
}

ReadableExpression.prototype.group = ReadableExpression.prototype.capture;
ReadableExpression.prototype.followedBy =
  ReadableExpression.prototype.assertFollowedBy;
ReadableExpression.prototype.notFollowedBy =
  ReadableExpression.prototype.assertNotFollowedBy;

const makeValueDescriptor = (value) => ({
  value,
  writeable: false,
  enumerable: true,
  configurable: true,
});

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
  "Argument type is not supported. Returning empty ReadExp."
);
/**
 *
 * @param {string|number|RegExp|ReadableExpression} [value]
 * @returns {ReadableExpression}
 */
export default function ReadExp(value) {
  const valueType = typeof value;
  if (
    value != null &&
    (valueType === "string" ||
      valueType === "number" ||
      value instanceof RegExp ||
      value instanceof ReadableExpression)
  ) {
    return ReadableExpression.of(value);
  }
  if (value != null && process.env.NODE_ENV !== "production") {
    warnArgType();
  }
  return ReadableExpression.empty;
}

ReadExp.or = ReadableExpression.or.bind(ReadableExpression);
ReadExp.seq = ReadableExpression.seq.bind(ReadableExpression);
ReadExp.of = ReadableExpression.of.bind(ReadableExpression);
ReadExp.digit = ReadableExpression.digit;
ReadExp.word = ReadableExpression.word;
ReadExp.empty = ReadableExpression.empty;
ReadExp.linebreak = ReadableExpression.linebreak;
ReadExp.tab = ReadableExpression.tab;
ReadExp.whitespace = ReadableExpression.whitespace;
ReadExp.any = ReadableExpression.any;
