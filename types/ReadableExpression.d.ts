/**
 * opaque type
 */
type Node<T> = T;
type RootNode<T> = {
  prefix?: string;
  suffix?: string;
  node: any;
  flags?: string;
};
/**
 * @template T
 * @typedef {T} Node opaque type
 * @typedef {{prefix?: string, suffix?: string, node: Node, flags?: string }} RootNode
 */
/**
 * @class ReadableExpression
 * @namespace ReadableExpression
 */
interface ReadableExpression {
  /**
   * @description Control start-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  assertStartOfLine(enable?: boolean): ReadableExpression;
  /**
   * @description Control end-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  assertEndOfLine(enable?: boolean): ReadableExpression;
  /**
   * @description Look for the value passed
   * @param {(string|RegExp|number|ReadableExpression)} value value to find
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  then(value: string | RegExp | number | ReadableExpression): ReadableExpression;
  /**
   * @description Add an optional branch for matching
   * @param {(string|RegExp|number|ReadableExpression)} value value to find
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  maybe(value: string | RegExp | number | ReadableExpression): ReadableExpression;
  /**
   * @description Add alternative expressions
   * @param {(string|RegExp|number|ReadableExpression)} value value to find
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  or(value: string | RegExp | number | ReadableExpression): ReadableExpression;
  /**
   * @description Any character any number of times
   * @param {boolean} [lazy] match least number of characters
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  anything(lazy?: boolean): ReadableExpression;
  /**
   * @description Anything but these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @param {boolean} [lazy] match least number of characters
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  anythingBut(
    value: string | number | string[] | number[],
    lazy?: boolean
  ): ReadableExpression;
  /**
   * @description Any character(s) at least once
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  something(): ReadableExpression;
  /**
   * @description Any character at least one time except for these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  somethingBut(value: string | number | string[] | number[]): ReadableExpression;
  /**
   * @description Match any of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  anyOf(value: string | number | string[] | number[]): ReadableExpression;
  /**
   * @description Match some of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  someOf(value: string | number | string[] | number[]): ReadableExpression;
  /**
   * @description Match one chartacter of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  oneOf(value: string | number | string[] | number[]): ReadableExpression;
  /**
   * @description Shorthand for anyOf(value)
   * @param {string|number} value value to find
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  any(value: string | number): ReadableExpression;
  /**
   * @description Ensure that the parameter does not follow (negative lookahead)
   * @param {string|number|RegExp|ReadableExpression} value
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  assertNotFollowedBy(
    value: string | number | RegExp | ReadableExpression
  ): ReadableExpression;
  notFollowedBy(
    value: string | number | RegExp | ReadableExpression
  ): ReadableExpression;
  /**
   * @description Ensure that the parameter does follow (positive lookahead)
   * @param {string|number|RegExp|ReadableExpression} value
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  assertFollowedBy(
    value: string | number | RegExp | ReadableExpression
  ): ReadableExpression;
  followedBy(
    value: string | number | RegExp | ReadableExpression
  ): ReadableExpression;
  /**
   * @description Match any character in these ranges
   * @example ReadableExpression.empty.charOfRanges(["a","z"], ["0", "9"]) // [a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression#
   */
  charOfRanges(...characterRanges: [string, string][]): ReadableExpression;
  /**
   * @description Match any character that is not in these ranges
   * @example ReadableExpression.empty.charNotOfRanges(["a","z"], ["0", "9"]) // [^a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression#
   */
  charNotOfRanges(...characterRanges: [string, string][]): ReadableExpression;
  /**
   * @description Match a Line break
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  lineBreak(): ReadableExpression;
  /**
   * @description A shorthand for lineBreak() for html-minded users
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  br(): ReadableExpression;
  /**
   * @description Match a tab character
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  tab(): ReadableExpression;
  /**
   * @description Match any alphanumeric sequence
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  word(): ReadableExpression;
  /**
   * @description Match a single digit
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  digit(): ReadableExpression;
  /**
   * @description Match a single whitespace
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  whitespace(): ReadableExpression;
  /**
   * @description Add a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  addFlag(flag?: string): ReadableExpression;
  /**
   * @description Remove a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  removeFlag(flag: string): ReadableExpression;
  /**
   * @description Adds an "i" regex flag - default flags are: "gi"
   * @param {boolean=true} enable
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  withAnyCase(enable?: boolean): ReadableExpression;
  /**
   * @description Removes a "g" regex flag - default flags are: "gi"
   * @param {boolean=true} enable `true` means no "g" flag
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  stopAtFirst(enable?: boolean): ReadableExpression;
  /**
   * @description Removes any set "m" regex flag - default flags are: "gi"
   * @param {boolean=true} enable `true` means "m" flag will be removed
   * @returns {ReadableExpression} new ReadableExpression
   * @memberOf ReadableExpression#
   */
  searchOneLine(enable?: boolean): ReadableExpression;
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
  repeat(min: number, max: number): ReadableExpression;
  /**
   * @description match the expression exactly <n> times
   * @example ```js
   * Sx("abc").whitespace().repeatExactly(5).compile().toString() === /(?:abc\w){5}/gm.toString()
   * ```
   * @param {number} n must be > 0
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression#
   */
  repeatExactly(n: number): ReadableExpression;
  /**
   * @description the expression should match at least once
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression#
   */
  oneOrMore(): ReadableExpression;
  /**
   * @description the expression should match zero or more times
   * @param {boolean} [lazy] enable lazy (non greedy) matching
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression#
   */
  zeroOrMore(lazy?: boolean): ReadableExpression;
  /**
   *
   * @param {string} [name] optionally name your capturing group
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression#
   */
  capture(name?: string): ReadableExpression;
  group(name?: string): ReadableExpression;
  /**
   * @description compile the ReadExpession to a RegExp
   * @returns {RegExp}
   * @memberOf ReadableExpression#
   */
  compile(): RegExp;
}
type ReadablePrimitive = ReadableExpression;

interface ReadableExpressionConstructor {
  new (value: string | number | RegExp | ReadableExpression): ReadableExpression;
  /**
   *
   * @param {string|number|RegExp|ReadableExpression} [value]
   * @returns {ReadableExpression}
   */
  (value: string | number | RegExp | ReadableExpression): ReadableExpression;
  prototype: ReadableExpression;

  /**
   * @description creates ReadExps from a variety of source formats
   * @param {String|Number|RegExp|ReadableExpression} x
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression
   */
  of(x: string | number | RegExp | ReadableExpression): ReadableExpression;
  /**
   * @description disjunction (one must match) between the argument expressions
   * @param {...(String|Number|RegExp|ReadableExpression)} xs
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression
   */
  or(...xs: (string | number | RegExp | ReadableExpression)[]): ReadableExpression;
  /**
   * @description conjunction (all must match) of the argument expressions
   * @param {...(String|Number|RegExp|ReadableExpression)} xs
   * @returns {ReadableExpression}
   * @memberOf ReadableExpression
   */
  seq(...xs: (string | number | RegExp | ReadableExpression)[]): ReadableExpression;
  /**
   * @description a ReadExp that matches a whitespace
   * @type {ReadablePrimitive}
   * @memberOf ReadableExpression
   */
  whitespace: ReadablePrimitive;
  /**
   * @description an empty ReadExp
   * @type {ReadablePrimitive}
   * @memberOf ReadableExpression
   */
  empty: ReadablePrimitive;
  /**
   * @description match one digit
   * @type {ReadablePrimitive}
   * @memberOf ReadableExpression
   */
  digit: ReadablePrimitive;
  /**
   * @description match a tab-character
   * @type {ReadablePrimitive}
   * @memberOf ReadableExpression
   */
  tab: ReadablePrimitive;
  /**
   * @description matches a whole word
   * @type {ReadablePrimitive}
   * @memberOf ReadableExpression
   */
  word: ReadablePrimitive;
  /**
   * @description match any kind of line break or new-lines
   * @type {ReadablePrimitive}
   * @memberOf ReadableExpression
   */
  linebreak: ReadablePrimitive;
  any: ReadablePrimitive;
}
declare var ReadExp: ReadableExpressionConstructor;

export default ReadExp;
