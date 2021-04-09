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

interface Node<T> {}
interface RootNode<T> {
  prefix?: string;
  suffix?: string;
  node: Node<T>;
  flags?: string;
}

const flatten = <Args extends any[]>(...args: Args) => args.flat(Infinity);

const _makeRanges = (flatRanges: string[]): [string, string][] => {
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
  (flatRanges: string[]) =>
    flatRanges.length % 2 === 0 ? flatRanges : flatRanges.slice(0, -1),
  _makeRanges
);

const EXISTING_INSTANCES_KEY = "$7a3afcebc18ce55fe6f8445324d27b6e$";

const existingClasses: typeof RegExpstructor[] =
  // @ts-ignore
  RegExp.prototype[Symbol.for(EXISTING_INSTANCES_KEY)] || [];

Object.defineProperty(RegExp.prototype, Symbol.for(EXISTING_INSTANCES_KEY), {
  enumerable: false,
  configurable: true,
  writable: false,
  value: existingClasses,
});

const isInstanceOfExisting = (obj: unknown) =>
  existingClasses.find((Class) => obj instanceof Class) != null;

const isInstance = (obj: unknown): obj is RegExpstructor => {
  if (obj == null) return false;
  return obj instanceof RegExpstructor || isInstanceOfExisting(obj);
};

interface ConstructorArg {
  source?: string;
  node?: Node<never>;
  flags?: string;
  prefix?: string;
  suffix?: string;
  sanitize?: boolean;
}

type ReadablePrimitive = RegExpstructor;

class RegExpstructor {
  #rootNode!: RootNode<never>;
  group!: (name: string) => RegExpstructor;
  followedBy!: (
    value: string | number | RegExp | RegExpstructor
  ) => RegExpstructor;
  notFollowedBy!: (
    value: string | number | RegExp | RegExpstructor
  ) => RegExpstructor;

  constructor(arg?: ConstructorArg, init: boolean = true) {
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

  private static _getRootNode = (x: unknown): RootNode<never> => {
    if (!isInstance(x))
      throw new Error(`${x} is not an instance of RegExpstructor`);
    function _getNode(this: RegExpstructor): RootNode<never> {
      return this.#rootNode;
    }
    return _getNode.call(x);
  };

  /**
   * @description creates a ReStructor from a rootNode type
   * @param node
   */
  static from(node: RootNode<never>): RegExpstructor {
    return new this(node);
  }

  /**
   * @description creates ReStructors from a variety of source formats
   * @param x
   */
  static of(x: string | number | RegExp | RegExpstructor): RegExpstructor {
    if (x instanceof this) {
      return x;
    }
    if (isInstance(x)) {
      return new this(this._preSanitize(x.compile()));
    }
    const params = this._preSanitize(x);
    return new this(params);
  }

  /**
   * @description disjunction (one must match) between the argument expressions
   * @param xs
   */
  static or(
    ...xs: (string | number | RegExp | RegExpstructor)[]
  ): RegExpstructor {
    const verbals = xs.map((x) => {
      if (isInstance(x)) return x;
      return RegExpstructor.of(x);
    });

    const nodes = verbals.map((x) => this._getRootNode(x).node);
    return this.from({ node: alt(nodes) });
  }

  /**
   * @description conjunction (all must match) of the argument expressions
   * @param xs
   */
  static seq(
    ...xs: (string | number | RegExp | RegExpstructor)[]
  ): RegExpstructor {
    const verbals = xs.map((x) => RegExpstructor.of(x));
    const nodes = verbals.map((x) => this._getRootNode(x).node);
    return this.from({ node: seq(nodes) });
  }

  /**
   * @description a ReStructor that matches a whitespace
   */
  static whitespace: ReadablePrimitive = new RegExpstructor({
    node: whitespace,
  });
  /**
   * @description an empty ReStructor
   */
  static empty: ReadablePrimitive = new RegExpstructor({ node: empty });
  /**
   * @description match one digit
   */
  static digit: ReadablePrimitive = new RegExpstructor({ node: digit });
  /**
   * @description match a tab-character
   */
  static tab: ReadablePrimitive = new RegExpstructor({ node: tab });
  /**
   * @description matches a whole word
   */
  static word: ReadablePrimitive = new RegExpstructor({ node: word });
  /**
   * @description match any kind of line break or new-lines
   */
  static linebreak: ReadablePrimitive = new RegExpstructor({ node: linebreak });
  static any = new RegExpstructor({ node: something(empty) });

  // Utility //

  private static _preSanitize = (value: unknown) => {
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

  #setPrefix = (prefix: string) => {
    const newInstance = new RegExpstructor(void 0, false);
    newInstance.#rootNode = setPrefix(this.#rootNode, prefix);
    return newInstance;
  };
  #setSuffix = (suffix: string) => {
    const newInstance = new RegExpstructor(void 0, false);
    newInstance.#rootNode = setSuffix(this.#rootNode, suffix);
    return newInstance;
  };

  // Rules //

  /**
   * @description Control start-of-line matching
   * @param [enable=true] whether to enable this behaviour
   */
  assertStartOfLine(enable: boolean = true): RegExpstructor {
    return this.#setPrefix(enable ? "^" : "");
  }

  /**
   * @description Control end-of-line matching
   * @param [enable=true] whether to enable this behaviour
   */
  assertEndOfLine(enable: boolean = true): RegExpstructor {
    return this.#setSuffix(enable ? "$" : "");
  }

  /**
   * @description Look for the value passed
   * @param value value to find
   */
  then(value: string | RegExp | number | RegExpstructor): RegExpstructor {
    return RegExpstructor.from(
      setNode(
        setSuffix(this.#rootNode, ""),
        then_(getNode(this.#rootNode), RegExpstructor.of(value).#rootNode.node)
      )
    );
  }

  /**
   * @description Add an optional branch for matching
   * @param value value to find
   */
  maybe(value: string | RegExp | number | RegExpstructor): RegExpstructor {
    return RegExpstructor.from(
      setNode(
        setSuffix(this.#rootNode, ""),
        maybe(getNode(this.#rootNode), RegExpstructor.of(value).#rootNode.node)
      )
    );
  }

  /**
   * @description Add alternative expressions
   * @param value value to find
   */
  or(value: string | RegExp | number | RegExpstructor): RegExpstructor {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        or_(getNode(this.#rootNode), RegExpstructor.of(value).#rootNode.node)
      )
    );
  }

  /**
   * @description Any character any number of times
   * @param lazy match least number of characters
   */
  anything(lazy: boolean = false): RegExpstructor {
    return RegExpstructor.from(
      setNode(this.#rootNode, anything(getNode(this.#rootNode), lazy))
    );
  }

  /**
   * @description Anything but these characters
   * @param value characters to not match
   * @param lazy match least number of characters
   */
  anythingBut(
    value: string | number | string[] | number[],
    lazy: boolean = false
  ): RegExpstructor {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        anythingBut(getNode(this.#rootNode), [value].flat().join(""), lazy)
      )
    );
  }

  /**
   * @description Any character(s) at least once
   */
  something(): RegExpstructor {
    return RegExpstructor.from(
      setNode(this.#rootNode, something(getNode(this.#rootNode)))
    );
  }

  /**
   * @description Any character at least one time except for these characters
   * @param value characters to not match
   */
  somethingBut(value: string | number | string[] | number[]): RegExpstructor {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        somethingBut(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }

  /**
   * @description Match any of the given characters
   * @param value characters to match
   */
  anyOf(value: string | number | string[] | number[]): RegExpstructor {
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
   */
  someOf(value: string | number | string[] | number[]): RegExpstructor {
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
   */
  oneOf(value: string | number | string[] | number[]): RegExpstructor {
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
   */
  any(value: string | number): RegExpstructor {
    return this.anyOf(value);
  }

  /**
   * @description Ensure that the parameter does not follow (negative lookahead)
   * @param {string|number|RegExp|RegExpstructor} value
   */
  assertNotFollowedBy(
    value: string | number | RegExp | RegExpstructor
  ): RegExpstructor {
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
   */
  assertFollowedBy(
    value: string | number | RegExp | RegExpstructor
  ): RegExpstructor {
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
   *
   *
   */
  charOfRanges(...characterRanges: [string, string][]): RegExpstructor {
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
   *
   *
   */
  charNotOfRanges(...characterRanges: [string, string][]): RegExpstructor {
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
   */
  lineBreak(): RegExpstructor {
    return this.then(RegExpstructor.linebreak);
  }

  /**
   * @description A shorthand for lineBreak() for html-minded users
   */
  br(): RegExpstructor {
    return this.lineBreak();
  }

  /**
   * @description Match a tab character
   */
  tab(): RegExpstructor {
    return this.then(RegExpstructor.tab);
  }

  /**
   * @description Match any alphanumeric sequence
   */
  word(): RegExpstructor {
    return this.then(RegExpstructor.word);
  }

  /**
   * @description Match a single digit
   */
  digit(): RegExpstructor {
    return this.then(RegExpstructor.digit);
  }

  /**
   * @description Match a single whitespace
   */
  whitespace(): RegExpstructor {
    return this.then(RegExpstructor.whitespace);
  }

  // Modifiers //
  /**
   * @description Add a regex flag - default flags are: "gi"
   * @param {string} flag
   */
  addFlag(flag: string = ""): RegExpstructor {
    return RegExpstructor.from(addFlags(this.#rootNode, flag));
  }
  /**
   * @description Remove a regex flag - default flags are: "gi"
   * @param {string} flag
   */
  removeFlag(flag: string): RegExpstructor {
    return RegExpstructor.from(removeFlags(this.#rootNode, flag));
  }

  /**
   *
   * @param {string} flag
   * @returns {boolean}
   */
  hasFlag(flag: string): boolean {
    return hasFlag(this.#rootNode, flag);
  }

  /**
   * @description Adds an "i" regex flag - default flags are: "gm"
   * @param enable
   */
  withAnyCase(enable = true): RegExpstructor {
    return enable ? this.addFlag("i") : this.removeFlag("i");
  }
  /**
   * @description Removes a "g" regex flag - default flags are: "gm"
   * @param enable `true` means no "g" flag
   */
  stopAtFirst(enable = true): RegExpstructor {
    return !enable ? this.addFlag("g") : this.removeFlag("g");
  }
  /**
   *
   * @param enable
   *
   */
  global(enable = true): RegExpstructor {
    return enable ? this.addFlag("g") : this.removeFlag("g");
  }
  /**
   *
   * @param flag
   *
   */
  toggleFlag(flag: string): RegExpstructor {
    return !this.hasFlag(flag) ? this.addFlag(flag) : this.removeFlag(flag);
  }

  /**
   * @description Removes any set "m" regex flag - default flags are: "gm"
   * @param enable `true` means "m" flag will be removed
   */
  searchOneLine(enable = true): RegExpstructor {
    return enable ? this.removeFlag("m") : this.addFlag("m");
  }

  // Loops //
  /**
   * @description match the expression <min> to <max> times
   * @example ```js
   * Sx("abc").whitespace().repeat(2, 4).compile().toString() === /(?:abc\w){2,4}/gm.toString()
   * ```
   * @param min
   * @param max
   */
  repeat(min: number, max: number): RegExpstructor {
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
   * @param n must be > 0
   */
  repeatExactly(n: number): RegExpstructor {
    return RegExpstructor.from(
      setNode(
        this.#rootNode,
        repeatExact(getNode(this.#rootNode), n != null ? n | 0 : void 0)
      )
    );
  }

  /**
   * @description the expression should match at least once
   *
   */
  oneOrMore(): RegExpstructor {
    return RegExpstructor.from(
      setNode(this.#rootNode, oneOrMore(getNode(this.#rootNode)))
    );
  }

  /**
   * @description the expression should match zero or more times
   * @param lazy enable lazy (non greedy) matching
   */
  zeroOrMore(lazy: boolean): RegExpstructor {
    return RegExpstructor.from(
      setNode(this.#rootNode, zeroOrMore(getNode(this.#rootNode), lazy))
    );
  }

  // Capture groups //
  /**
   *
   * @param name optionally name your capturing group
   */
  capture(name: string): RegExpstructor {
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
   *
   */
  compile(): RegExp {
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
  constructor(msg: string) {
    super(msg);
    this.name = "Warning";
  }
}
const writeWarning = (text: string, logType = "error") => {
  return warn;
  function warn() {
    // @ts-ignore
    if (!warn.warned) {
      // @ts-ignore
      warn.warned = true;
      // @ts-ignore
      (typeof console[logType] === "function"
        ? // @ts-ignore
          console[logType]
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
 *
 */
export default function ReStructor(
  value: string | number | RegExp | RegExpstructor
): RegExpstructor {
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
