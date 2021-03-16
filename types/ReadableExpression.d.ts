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
 * @class RegExpstructor
 * @namespace RegExpstructor
 */
interface RegExpstructor {
  /**
   * @description Control start-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  assertStartOfLine(enable?: boolean): RegExpstructor;
  /**
   * @description Control end-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  assertEndOfLine(enable?: boolean): RegExpstructor;
  /**
   * @description Look for the value passed
   * @param {(string|RegExp|number|RegExpstructor)} value value to find
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  then(
    value: string | RegExp | number | RegExpstructor
  ): RegExpstructor;
  /**
   * @description Add an optional branch for matching
   * @param {(string|RegExp|number|RegExpstructor)} value value to find
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  maybe(
    value: string | RegExp | number | RegExpstructor
  ): RegExpstructor;
  /**
   * @description Add alternative expressions
   * @param {(string|RegExp|number|RegExpstructor)} value value to find
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  or(value: string | RegExp | number | RegExpstructor): RegExpstructor;
  /**
   * @description Any character any number of times
   * @param {boolean} [lazy] match least number of characters
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  anything(lazy?: boolean): RegExpstructor;
  /**
   * @description Anything but these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @param {boolean} [lazy] match least number of characters
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  anythingBut(
    value: string | number | string[] | number[],
    lazy?: boolean
  ): RegExpstructor;
  /**
   * @description Any character(s) at least once
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  something(): RegExpstructor;
  /**
   * @description Any character at least one time except for these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  somethingBut(
    value: string | number | string[] | number[]
  ): RegExpstructor;
  /**
   * @description Match any of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  anyOf(value: string | number | string[] | number[]): RegExpstructor;
  /**
   * @description Match some of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  someOf(value: string | number | string[] | number[]): RegExpstructor;
  /**
   * @description Match one chartacter of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  oneOf(value: string | number | string[] | number[]): RegExpstructor;
  /**
   * @description Shorthand for anyOf(value)
   * @param {string|number} value value to find
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  any(value: string | number): RegExpstructor;
  /**
   * @description Ensure that the parameter does not follow (negative lookahead)
   * @param {string|number|RegExp|RegExpstructor} value
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  assertNotFollowedBy(
    value: string | number | RegExp | RegExpstructor
  ): RegExpstructor;
  notFollowedBy(
    value: string | number | RegExp | RegExpstructor
  ): RegExpstructor;
  /**
   * @description Ensure that the parameter does follow (positive lookahead)
   * @param {string|number|RegExp|RegExpstructor} value
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  assertFollowedBy(
    value: string | number | RegExp | RegExpstructor
  ): RegExpstructor;
  followedBy(
    value: string | number | RegExp | RegExpstructor
  ): RegExpstructor;
  /**
   * @description Match any character in these ranges
   * @example RegExpstructor.empty.charOfRanges(["a","z"], ["0", "9"]) // [a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor#
   */
  charOfRanges(...characterRanges: [string, string][]): RegExpstructor;
  /**
   * @description Match any character that is not in these ranges
   * @example RegExpstructor.empty.charNotOfRanges(["a","z"], ["0", "9"]) // [^a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor#
   */
  charNotOfRanges(...characterRanges: [string, string][]): RegExpstructor;
  /**
   * @description Match a Line break
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  lineBreak(): RegExpstructor;
  /**
   * @description A shorthand for lineBreak() for html-minded users
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  br(): RegExpstructor;
  /**
   * @description Match a tab character
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  tab(): RegExpstructor;
  /**
   * @description Match any alphanumeric sequence
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  word(): RegExpstructor;
  /**
   * @description Match a single digit
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  digit(): RegExpstructor;
  /**
   * @description Match a single whitespace
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  whitespace(): RegExpstructor;
  /**
   * @description Add a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  addFlag(flag?: string): RegExpstructor;
  /**
   * @description Remove a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  removeFlag(flag: string): RegExpstructor;
  /**
   * @description Adds an "i" regex flag - default flags are: "gi"
   * @param {boolean=true} enable
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  withAnyCase(enable?: boolean): RegExpstructor;
  /**
   * @description Removes a "g" regex flag - default flags are: "gi"
   * @param {boolean=true} enable `true` means no "g" flag
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  stopAtFirst(enable?: boolean): RegExpstructor;
  global(enable?: boolean): RegExpstructor;
  toggleFlag(flag: string): RegExpstructor;
  /**
   * @description Removes any set "m" regex flag - default flags are: "gi"
   * @param {boolean=true} enable `true` means "m" flag will be removed
   * @returns {RegExpstructor} new RegExpstructor
   * @memberOf RegExpstructor#
   */
  searchOneLine(enable?: boolean): RegExpstructor;
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
  repeat(min: number, max: number): RegExpstructor;
  /**
   * @description match the expression exactly <n> times
   * @example ```js
   * Sx("abc").whitespace().repeatExactly(5).compile().toString() === /(?:abc\w){5}/gm.toString()
   * ```
   * @param {number} n must be > 0
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor#
   */
  repeatExactly(n: number): RegExpstructor;
  /**
   * @description the expression should match at least once
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor#
   */
  oneOrMore(): RegExpstructor;
  /**
   * @description the expression should match zero or more times
   * @param {boolean} [lazy] enable lazy (non greedy) matching
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor#
   */
  zeroOrMore(lazy?: boolean): RegExpstructor;
  /**
   *
   * @param {string} [name] optionally name your capturing group
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor#
   */
  capture(name?: string): RegExpstructor;
  group(name?: string): RegExpstructor;
  /**
   * @description compile the ReStructoression to a RegExp
   * @returns {RegExp}
   * @memberOf RegExpstructor#
   */
  compile(): RegExp;
}
type ReadablePrimitive = RegExpstructor;

interface RegExpstructorConstructor {
  new (
    value: string | number | RegExp | RegExpstructor
  ): RegExpstructor;
  /**
   *
   * @param {string|number|RegExp|RegExpstructor} [value]
   * @returns {RegExpstructor}
   */
  (value: string | number | RegExp | RegExpstructor): RegExpstructor;
  prototype: RegExpstructor;

  /**
   * @description creates ReStructors from a variety of source formats
   * @param {String|Number|RegExp|RegExpstructor} x
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor
   */
  of(x: string | number | RegExp | RegExpstructor): RegExpstructor;
  /**
   * @description disjunction (one must match) between the argument expressions
   * @param {...(String|Number|RegExp|RegExpstructor)} xs
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor
   */
  or(
    ...xs: (string | number | RegExp | RegExpstructor)[]
  ): RegExpstructor;
  /**
   * @description conjunction (all must match) of the argument expressions
   * @param {...(String|Number|RegExp|RegExpstructor)} xs
   * @returns {RegExpstructor}
   * @memberOf RegExpstructor
   */
  seq(
    ...xs: (string | number | RegExp | RegExpstructor)[]
  ): RegExpstructor;
  /**
   * @description a ReStructor that matches a whitespace
   * @type {ReadablePrimitive}
   * @memberOf RegExpstructor
   */
  whitespace: ReadablePrimitive;
  /**
   * @description an empty ReStructor
   * @type {ReadablePrimitive}
   * @memberOf RegExpstructor
   */
  empty: ReadablePrimitive;
  /**
   * @description match one digit
   * @type {ReadablePrimitive}
   * @memberOf RegExpstructor
   */
  digit: ReadablePrimitive;
  /**
   * @description match a tab-character
   * @type {ReadablePrimitive}
   * @memberOf RegExpstructor
   */
  tab: ReadablePrimitive;
  /**
   * @description matches a whole word
   * @type {ReadablePrimitive}
   * @memberOf RegExpstructor
   */
  word: ReadablePrimitive;
  /**
   * @description match any kind of line break or new-lines
   * @type {ReadablePrimitive}
   * @memberOf RegExpstructor
   */
  linebreak: ReadablePrimitive;
  any: ReadablePrimitive;
}
declare var ReStructor: RegExpstructorConstructor;

export default ReStructor;
