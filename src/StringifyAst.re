open RegexAst;

let stringifyFlags = flagsToString;

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
and stringifyNode = (node, parents) => {
  let id = (. x) => x;
  let rec stringify = (node, parents, k) => {
    switch (node, parents) {
    | (Empty, _) => k(. "")
    | (Match(Exact(str)), _) => k(. str)
    | (Match(Chars({chars, negative})), _) =>
      k(.
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
        ++ "]",
      )
    | (ConcatExpr({left, right, kind: `Conjunction}) as parent, grandParents) =>
      stringify(left, [parent, ...grandParents], (. leftStr) =>
        stringify(right, [parent, ...grandParents], (. rightStr) =>
          k(. leftStr ++ rightStr)
        )
      )
    | (
        ConcatExpr({left, right, kind: `Disjunction}) as parent,
        [
          ConcatExpr({kind: `Disjunction}) | NonCaptureGroup(_) |
          CaptureGroup(_),
          ..._rest,
        ] as grandParents,
      ) =>
      stringify(left, [parent, ...grandParents], (. leftStr) =>
        stringify(right, [parent, ...grandParents], (. rightStr) =>
          k(. leftStr ++ "|" ++ rightStr)
        )
      )
    | (ConcatExpr({left, right, kind: `Disjunction}) as parent, grandParents) =>
      stringify(left, [parent, ...grandParents], (. leftStr) =>
        stringify(right, [parent, ...grandParents], (. rightStr) =>
          k(. "(?:" ++ leftStr ++ "|" ++ rightStr ++ ")")
        )
      )

    | (QuantifierExpr({node: Empty as node}) as parent, grandParents) =>
      stringify(node, [parent, ...grandParents], k)
    | (
        QuantifierExpr({
          node:
            (NonCaptureGroup(_) | CaptureGroup(_) | Match(Chars(_))) as node,
          kind,
        }),
        grandParents,
      ) =>
      stringify(node, grandParents, (. nodeStr) =>
        k(. nodeStr ++ stringifyQuanifier(kind))
      )
    | (QuantifierExpr({node, kind}) as parent, grandParents) =>
      stringify(
        NonCaptureGroup({node: node}),
        [parent, ...grandParents],
        (. nodeStr) =>
        k(. nodeStr ++ stringifyQuanifier(kind))
      )

    | (
        NonCaptureGroup({node}),
        [NonCaptureGroup(_) | CaptureGroup(_), ..._rest] as grandParents,
      ) =>
      stringify(node, grandParents, k)
    | (NonCaptureGroup({node}) as parent, grandParents) =>
      stringify(node, [parent, ...grandParents], (. nodeStr) =>
        k(. "(?:" ++ nodeStr ++ ")")
      )
    | (CaptureGroup({node, name: Some(name)}) as parent, grandParents) =>
      stringify(node, [parent, ...grandParents], (. nodeStr) =>
        k(. "(?<" ++ name ++ ">" ++ nodeStr ++ ")")
      )
    | (CaptureGroup({node, name: None}) as parent, grandParents) =>
      stringify(node, [parent, ...grandParents], (. nodeStr) =>
        k(. "(" ++ nodeStr ++ ")")
      )
    | (LookaheadExpr({node, lookahead, kind}) as realParent, grandParents) =>
      stringify(node, [realParent, ...grandParents], (. nodeStr_a) =>
        stringify(
          lookahead,
          [NonCaptureGroup({node: lookahead}), ...grandParents],
          (. lookaheadStr) =>
          k(.
            nodeStr_a
            ++ "(?"
            ++ (kind == `Negative && kind != `Positive ? "!" : "=")
            ++ lookaheadStr
            ++ ")",
          )
        )
      )
    };
  };
  stringify(node, parents, id);
};

let stringify = (RootNode({node, prefix, suffix, flags})) => {
  "source": prefix ++ stringifyNode(node, []) ++ suffix,
  "flags": stringifyFlags(flags),
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
