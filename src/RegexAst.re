[@bs.val] [@bs.scope "Math"] [@bs.variadic]
external max: array('n) => 'n = "max";
[@bs.val] [@bs.scope "Math"] [@bs.variadic]
external min: array('n) => 'n = "min";

let toEscape = [%re "/([.\\][|*?+(){}^$\\\\:=])/g"];
let escapeRegEx = [%re "/(?:\\\\)+/g"];
let toEscapeInLiteral = [%re "/[\\]\\-\\\\]/g"];

let removeDoubleEscapes = value =>
  value->Js.String2.splitByRe(escapeRegEx)->Js.Array2.joinWith("\\");

let sanitize = value =>
  value
  ->removeDoubleEscapes
  ->Js.String2.unsafeReplaceBy0(toEscape, (match, _, _) => "\\" ++ match);
//.replace(toEscape, (lastMatch) => `\\${lastMatch}`)
let escapeCharsForLiterals = value =>
  value
  ->removeDoubleEscapes
  ->Js.String2.split("")
  ->Js.Array2.map(char =>
      char->Js.String2.unsafeReplaceBy0(toEscapeInLiteral, (match, _, _) =>
        "\\" ++ match
      )
    )
  ->Js.Array2.joinWith("");
type emptyNode =
  | Empty;
type matchNode =
  | Exact(string)
  | Chars({
      chars: array([ | `Range(string, string) | `Chars(string)]),
      negative: bool,
    });

type astNode =
  | Empty
  | Match(matchNode)
  | ConcatExpr({
      left: astNode,
      right: astNode,
      kind: [ | `Disjunction | `Conjunction],
    })
  | QuantifierExpr({
      node: astNode,
      kind: [
        | `ZeroOrOne
        | `ZeroOrMore([ | `Greedy | `Lazy])
        | `OneOrMore
        | `Exact(int)
        | `MinMax(option(int), option(int))
      ],
    })
  | LookaheadExpr({
      node: astNode,
      lookahead: astNode,
      kind: [ | `Negative | `Positive],
    })
  | NonCaptureGroup({node: astNode})
  | CaptureGroup({
      node: astNode,
      name: option(string),
    });

type rootNode('a) =
  | RootNode({
      prefix: string,
      node: astNode,
      suffix: string,
      flags: string,
    });
let getNode = (RootNode(root)) => root.node;
let setNode = (RootNode(root), node) => RootNode({...root, node});
let setPrefix = (RootNode(root), prefix) => RootNode({...root, prefix});
let setSuffix = (RootNode(root), suffix) => RootNode({...root, suffix});

let addFlags = (RootNode(root), flags) => {
  let rec addToFlags = (existingFlags, newFlags) =>
    switch (newFlags) {
    | [] => existingFlags
    | [flag, ...rest] =>
      addToFlags(
        existingFlags->Js.String2.includes(flag)
          ? existingFlags : existingFlags->Js.String2.concat(flag),
        rest,
      )
    };
  RootNode({
    ...root,
    flags:
      addToFlags(
        root.flags,
        Belt.List.fromArray(Js.String.split("", flags)),
      ),
  });
};
let removeFlags = (RootNode(root), flags) => {
  let rec removeFromFlags = (existingFlags, flagsToRemove) =>
    switch (flagsToRemove) {
    | [] => existingFlags
    | [flag, ...rest] =>
      removeFromFlags(
        existingFlags->Js.String2.includes(flag)
          ? Js.Array.joinWith("", existingFlags->Js.String2.split(flag))
          : existingFlags,
        rest,
      )
    };
  RootNode({
    ...root,
    flags:
      removeFromFlags(
        root.flags,
        Belt.List.fromArray(Js.String.split("", flags)),
      ),
  });
};
let exact = string => string->sanitize->Exact->Match;
let exact_ = string => string->Exact->Match;
let makeNode = (source, node, sanitize) =>
  switch (source, node, sanitize) {
  | (None, None, _) => Empty
  | (_, Some(node), _) => node
  | (Some(source), None, true) => source->exact
  | (Some(source), None, false) => source->exact_
  };
type createRootArg = {
  prefix: option(string),
  suffix: option(string),
  flags: option(string),
  source: option(string),
  node: option(astNode),
  sanitize: option(bool),
};
let defaultTo = (defaultValue, value) =>
  switch (value) {
  | None => defaultValue
  | Some(x) => x
  };
let createRoot_ = (~prefix, ~suffix, ~flags, ~source, ~node, ~sanitize, ()) =>
  RootNode({node: makeNode(source, node, sanitize), prefix, suffix, flags});
let defaultToEmptyString = defaultTo("");
let defaultFlags = defaultTo("gm");
let defaultSanitize = defaultTo(true);
let createRoot = ({prefix, suffix, flags, source, node, sanitize}) =>
  createRoot_(
    ~prefix=prefix |> defaultToEmptyString,
    ~suffix=suffix |> defaultToEmptyString,
    ~source,
    ~flags=flags |> defaultFlags,
    ~sanitize=sanitize |> defaultSanitize,
    ~node,
    (),
  );

let empty = Empty;

let and_ = (a, b) =>
  switch (a, b) {
  | (Empty, Empty) => Empty
  | (a, Empty) => a
  | (Empty, b) => b
  | (a, b) => ConcatExpr({left: a, right: b, kind: `Conjunction})
  };

let range_ = (from: string, to_: string) => `Range((from, to_));
let characters = chars => chars->escapeCharsForLiterals->`Chars;

/**
 * static
 */

let seq = (nodes, ~kind=`Conjunction, ()) => {
  let nodeList = Belt.List.fromArray(nodes);
  let rec builder = (node, nodeList) =>
    switch (nodeList) {
    | [] => node
    | [Empty, ...rest] => builder(node, rest)
    | [next, ...rest] =>
      builder(ConcatExpr({left: node, right: next, kind}), rest)
    };
  switch (nodeList) {
  | [] => Empty
  | [firstNode, ...rest] => builder(firstNode, rest)
  };
};
let alt = nodes => seq(nodes, ~kind=`Disjunction, ());
let optional = node => QuantifierExpr({node, kind: `ZeroOrOne});

/*
 * structure methods
 */
let then_ = (nodeA, nodeB) => nodeA->and_(nodeB);
let maybe = (nodeA, nodeB) => nodeA->then_(nodeB->optional);
let or_ = (nodeA, nodeB) =>
  switch (nodeA, nodeB) {
  | (Empty, Empty) => Empty
  | (a, b) => ConcatExpr({left: a, right: b, kind: `Disjunction})
  };

/*
 * _any_ and _some_ utils
 */

let anything = (node, asLazy) =>
  ConcatExpr({
    left: node,
    right:
      QuantifierExpr({
        node: Match(Exact(".")),
        kind: `ZeroOrMore(asLazy ? `Lazy : `Greedy),
      }),
    kind: `Conjunction,
  });

let something = node =>
  ConcatExpr({
    left: node,
    right: QuantifierExpr({node: Match(Exact(".")), kind: `OneOrMore}),
    kind: `Conjunction,
  });

let anythingBut = (node, characters, asLazy) =>
  ConcatExpr({
    left: node,
    right:
      QuantifierExpr({
        node:
          Match(
            Chars({
              chars: [|characters->escapeCharsForLiterals->`Chars|],
              negative: true,
            }),
          ),
        kind: `ZeroOrMore(asLazy ? `Lazy : `Greedy),
      }),
    kind: `Conjunction,
  });

let somethingBut = (node, characters) =>
  ConcatExpr({
    left: node,
    right:
      QuantifierExpr({
        node:
          Match(
            Chars({
              chars: [|characters->escapeCharsForLiterals->`Chars|],
              negative: true,
            }),
          ),
        kind: `OneOrMore,
      }),
    kind: `Conjunction,
  });

let anyOf = (node, characters) =>
  ConcatExpr({
    left: node,
    right:
      QuantifierExpr({
        node:
          Match(
            Chars({
              chars: [|characters->escapeCharsForLiterals->`Chars|],
              negative: false,
            }),
          ),
        kind: `ZeroOrOne,
      }),
    kind: `Conjunction,
  });
let someOf = (node, characters) =>
  ConcatExpr({
    left: node,
    right:
      QuantifierExpr({
        node:
          Match(
            Chars({
              chars: [|characters->escapeCharsForLiterals->`Chars|],
              negative: false,
            }),
          ),
        kind: `OneOrMore,
      }),
    kind: `Conjunction,
  });

let oneOf = (node, characters) =>
  ConcatExpr({
    left: node,
    right:
      Match(
        Chars({
          chars: [|characters->escapeCharsForLiterals->`Chars|],
          negative: false,
        }),
      ),
    kind: `Conjunction,
  });

let zeroOrMore = (astNode, isLazy) =>
  QuantifierExpr({
    node: astNode,
    kind:
      `ZeroOrMore(
        switch (isLazy) {
        | None => `Greedy
        | Some(false) => `Greedy
        | Some(true) => `Lazy
        },
      ),
  });
let oneOrMore = astNode => QuantifierExpr({node: astNode, kind: `OneOrMore});

let followedBy = (node, lookahead) =>
  LookaheadExpr({node, lookahead, kind: `Positive});
let notFollowedBy = (node, lookahead) =>
  LookaheadExpr({node, lookahead, kind: `Negative});

let tab = "\\t"->exact_;
let digit = "\\d"->exact_;
let whitespace = "\\s"->exact_;
let word = "\\w"->exact_->oneOrMore;
let linebreak =
  alt([|"\\r"->exact_->then_("\\n"->exact_), "\\r"->exact_, "\\n"->exact_|]);
let ranges = (node, rangeArray, ~negate=false, ()) =>
  node->then_(
    Chars({
      chars:
        rangeArray->Js.Array2.map(((from, to_)) =>
          (from->escapeCharsForLiterals, to_->escapeCharsForLiterals)->`Range
        ),
      negative: negate,
    })
    ->Match,
  );
let repeat = (node, low, high) =>
  QuantifierExpr({
    node,
    kind:
      switch (low, high) {
      | (None, None) as value => value->`MinMax
      | (Some(low), None) => (Some(max([|low, 0|])), None)->`MinMax
      | (None, Some(high)) => (Some(max([|high, 0|])), None)->`MinMax
      | (Some(low), Some(high)) =>
        (
          Some(max([|min([|low, high|]), 0|])),
          Some(max([|0, low, high|])),
        )
        ->`MinMax
      },
  });
let repeatExact = (node, n) => QuantifierExpr({node, kind: n->`Exact});

let group = (astNode, name) => CaptureGroup({node: astNode, name});