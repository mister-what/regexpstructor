open RegexAst;

let rec stringifyQuanifier = kind => {
  switch (kind) {
  | `ZeroOrOne => "?"
  | `ZeroOrMore(mode) => "*" ++ (mode == `Lazy ? "?" : "")
  | `OneOrMore => "+"
  | `Exact(n) => "{" ++ string_of_int(n) ++ "}"
  | `MinMax(Some(min), Some(max)) =>
    "{" ++ string_of_int(min) ++ "," ++ string_of_int(max) ++ "}"
  | `MinMax(None, Some(max)) => "{" ++ "," ++ string_of_int(max) ++ "}"
  | `MinMax(Some(min), None) => "{" ++ string_of_int(min) ++ "," ++ "}"
  | `MinMax(None, None) => "{" ++ "," ++ "}"
  };
}
and stringifyNode = (node, parents) =>
  switch (node, parents) {
  | (Empty, _) => ""
  | (Match(Exact(str)), _) => str
  | (Match(Chars({chars, negative})), _) =>
    "["
    ++ (negative ? "^" : "")
    ++ chars
       ->Js.Array2.map(kind =>
           switch (kind) {
           | `Chars(value) => value
           | `Range(from, to_) => from ++ "-" ++ to_
           }
         )
       ->Js.Array2.joinWith("")
    ++ "]"
  | (ConcatExpr({left, right, kind: `Conjunction}) as parent, grandParents) =>
    stringifyNode(left, [parent, ...grandParents])
    ++ stringifyNode(right, [parent, ...grandParents])
  | (
      ConcatExpr({left, right, kind: `Disjunction}) as parent,
      [
        ConcatExpr({kind: `Disjunction}) | NonCaptureGroup(_) | CaptureGroup(_),
        ..._rest,
      ] as grandParents,
    ) =>
    stringifyNode(left, [parent, ...grandParents])
    ++ "|"
    ++ stringifyNode(right, [parent, ...grandParents])
  | (ConcatExpr({left, right, kind: `Disjunction}) as parent, grandParents) =>
    "(?:"
    ++ stringifyNode(left, [parent, ...grandParents])
    ++ "|"
    ++ stringifyNode(right, [parent, ...grandParents])
    ++ ")"
  | (QuantifierExpr({node: Empty as node}) as parent, grandParents) =>
    stringifyNode(node, [parent, ...grandParents])
  | (
      QuantifierExpr({
        node:
          (NonCaptureGroup(_) | CaptureGroup(_) | Match(Chars(_))) as node,
        kind,
      }),
      grandParents,
    ) =>
    stringifyNode(node, grandParents) ++ stringifyQuanifier(kind)
  | (QuantifierExpr({node, kind}) as parent, grandParents) =>
    stringifyNode(NonCaptureGroup({node: node}), [parent, ...grandParents])
    ++ stringifyQuanifier(kind)
  | (
      NonCaptureGroup({node}),
      [NonCaptureGroup(_) | CaptureGroup(_), ..._rest] as grandParents,
    ) =>
    stringifyNode(node, grandParents)
  | (NonCaptureGroup({node}) as parent, grandParents) =>
    "(?:" ++ stringifyNode(node, [parent, ...grandParents]) ++ ")"
  | (CaptureGroup({node, name: Some(name)}) as parent, grandParents) =>
    "(?<"
    ++ name
    ++ ">"
    ++ stringifyNode(node, [parent, ...grandParents])
    ++ ")"
  | (CaptureGroup({node, name: None}) as parent, grandParents) =>
    "(" ++ stringifyNode(node, [parent, ...grandParents]) ++ ")"
  | (LookaheadExpr({node, lookahead, kind}) as realParent, grandParents) =>
    stringifyNode(node, [realParent, ...grandParents])
    ++ "(?"
    ++ (kind == `Negative && kind != `Positive ? "!" : "=")
    ++ stringifyNode(
         lookahead,
         [NonCaptureGroup({node: lookahead}), ...grandParents],
       )
    ++ ")"
  };

let stringify = (RootNode({node, prefix, suffix, flags})) => {
  "source": prefix ++ stringifyNode(node, []) ++ suffix,
  "flags": flags,
};
/*
 let myNode =
   empty
   ->then_("Hello"->exact)
   ->maybe(whitespace->then_(linebreak))
   ->then_("World"->exact->or_("world"->exact))
   ->oneOf("!?.")
   ->notFollowedBy(
       empty
       ->maybe(whitespace)
       ->then_("Not"->exact->or_("not"->exact))
       ->maybe("!"->exact),
     );

 let mySource = stringifyNode(myNode, []);
 Js.log(
   Js.Json.stringifyAny(myNode)
   ->Belt.Option.map(Js.Json.parseExn)
   ->Belt.Option.map(Js.Json.stringifyWithSpace(_, 2)),
 );
 */