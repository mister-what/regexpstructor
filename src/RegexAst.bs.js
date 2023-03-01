// Generated by ReScript, PLEASE EDIT WITH CARE

import * as Belt_List from "@rescript/std/lib/es6/belt_List.js";
import * as Caml_option from "@rescript/std/lib/es6/caml_option.js";
import * as Belt_SetString from "@rescript/std/lib/es6/belt_SetString.js";

var toEscape = /([.\][|*?+(){}^$\\:=])/g;

var escapeRegEx = /(?:\\)+/g;

var toEscapeInLiteral = /[\]\-\\]/g;

function removeDoubleEscapes(value) {
  return value.split(escapeRegEx).join("\\");
}

function sanitize(value) {
  return removeDoubleEscapes(value).replace(toEscape, (function (match_, param, param$1) {
                return "\\" + match_;
              }));
}

function escapeCharsForLiterals(value) {
  return removeDoubleEscapes(value).split("").map(function ($$char) {
                return $$char.replace(toEscapeInLiteral, (function (match_, param, param$1) {
                              return "\\" + match_;
                            }));
              }).join("");
}

function getNode(root) {
  return root.node;
}

function setNode(root, node) {
  return /* RootNode */{
          prefix: root.prefix,
          node: node,
          suffix: root.suffix,
          flags: root.flags
        };
}

function setPrefix(root, prefix) {
  return /* RootNode */{
          prefix: prefix,
          node: root.node,
          suffix: root.suffix,
          flags: root.flags
        };
}

function setSuffix(root, suffix) {
  return /* RootNode */{
          prefix: root.prefix,
          node: root.node,
          suffix: suffix,
          flags: root.flags
        };
}

function addFlags(root, flags) {
  return /* RootNode */{
          prefix: root.prefix,
          node: root.node,
          suffix: root.suffix,
          flags: Belt_SetString.union(root.flags, Belt_SetString.fromArray(flags.split("")))
        };
}

function removeFlags(root, flags) {
  return /* RootNode */{
          prefix: root.prefix,
          node: root.node,
          suffix: root.suffix,
          flags: Belt_SetString.diff(root.flags, Belt_SetString.fromArray(flags.split("")))
        };
}

function hasFlag(root, flag) {
  return Belt_SetString.has(root.flags, flag);
}

function exact(string) {
  return {
          TAG: /* Match */0,
          _0: {
            TAG: /* Exact */0,
            _0: sanitize(string)
          }
        };
}

function exact_(string) {
  return {
          TAG: /* Match */0,
          _0: {
            TAG: /* Exact */0,
            _0: string
          }
        };
}

function makeNode(source, node, sanitize$1) {
  if (source !== undefined) {
    if (node !== undefined) {
      return node;
    } else if (sanitize$1) {
      return {
              TAG: /* Match */0,
              _0: {
                TAG: /* Exact */0,
                _0: sanitize(source)
              }
            };
    } else {
      return {
              TAG: /* Match */0,
              _0: {
                TAG: /* Exact */0,
                _0: source
              }
            };
    }
  } else if (node !== undefined) {
    return node;
  } else {
    return /* Empty */0;
  }
}

function defaultTo(defaultValue, value) {
  if (value !== undefined) {
    return Caml_option.valFromOption(value);
  } else {
    return defaultValue;
  }
}

function createRoot_(prefix, suffix, flags, source, node, sanitize, param) {
  return /* RootNode */{
          prefix: prefix,
          node: makeNode(source, node, sanitize),
          suffix: suffix,
          flags: flags
        };
}

function defaultToEmptyString(param) {
  return defaultTo("", param);
}

function defaultFlags(param) {
  return defaultTo("gm", param);
}

function defaultSanitize(param) {
  return defaultTo(true, param);
}

function createRoot(param) {
  return createRoot_(defaultTo("", param.prefix), defaultTo("", param.suffix), Belt_SetString.fromArray(defaultTo("gm", param.flags).split("")), param.source, param.node, defaultTo(true, param.sanitize), undefined);
}

function flagsToString(flags) {
  return Belt_SetString.toArray(flags).join("");
}

function flags_to_opt_string(flags) {
  var str = Belt_SetString.toArray(flags).join("");
  if (str.length === 0) {
    return ;
  } else {
    return str;
  }
}

function and_(a, b) {
  if (typeof a === "number") {
    if (typeof b === "number") {
      return /* Empty */0;
    }
    
  } else if (typeof b === "number") {
    return a;
  }
  if (typeof a === "number") {
    return b;
  } else {
    return {
            TAG: /* ConcatExpr */1,
            left: a,
            right: b,
            kind: "Conjunction"
          };
  }
}

function range_(from, to_) {
  return {
          NAME: "Range",
          VAL: [
            from,
            to_
          ]
        };
}

function characters(chars) {
  return {
          NAME: "Chars",
          VAL: escapeCharsForLiterals(chars)
        };
}

function seq(nodes, kindOpt, param) {
  var kind = kindOpt !== undefined ? kindOpt : "Conjunction";
  var nodeList = Belt_List.fromArray(nodes);
  if (nodeList) {
    var _node = nodeList.hd;
    var _nodeList = nodeList.tl;
    while(true) {
      var nodeList$1 = _nodeList;
      var node = _node;
      if (!nodeList$1) {
        return node;
      }
      var next = nodeList$1.hd;
      if (typeof next === "number") {
        _nodeList = nodeList$1.tl;
        continue ;
      }
      _nodeList = nodeList$1.tl;
      _node = {
        TAG: /* ConcatExpr */1,
        left: node,
        right: next,
        kind: kind
      };
      continue ;
    };
  } else {
    return /* Empty */0;
  }
}

function alt(nodes) {
  return seq(nodes, "Disjunction", undefined);
}

function optional(node) {
  return {
          TAG: /* QuantifierExpr */2,
          node: node,
          kind: "ZeroOrOne"
        };
}

var then_ = and_;

function maybe(nodeA, nodeB) {
  return and_(nodeA, {
              TAG: /* QuantifierExpr */2,
              node: nodeB,
              kind: "ZeroOrOne"
            });
}

function or_(nodeA, nodeB) {
  if (typeof nodeA === "number" && typeof nodeB === "number") {
    return /* Empty */0;
  } else {
    return {
            TAG: /* ConcatExpr */1,
            left: nodeA,
            right: nodeB,
            kind: "Disjunction"
          };
  }
}

function anything(node, asLazy) {
  return {
          TAG: /* ConcatExpr */1,
          left: node,
          right: {
            TAG: /* QuantifierExpr */2,
            node: {
              TAG: /* Match */0,
              _0: {
                TAG: /* Exact */0,
                _0: "."
              }
            },
            kind: {
              NAME: "ZeroOrMore",
              VAL: asLazy ? "Lazy" : "Greedy"
            }
          },
          kind: "Conjunction"
        };
}

function something(node) {
  return {
          TAG: /* ConcatExpr */1,
          left: node,
          right: {
            TAG: /* QuantifierExpr */2,
            node: {
              TAG: /* Match */0,
              _0: {
                TAG: /* Exact */0,
                _0: "."
              }
            },
            kind: "OneOrMore"
          },
          kind: "Conjunction"
        };
}

function anythingBut(node, characters, asLazy) {
  return {
          TAG: /* ConcatExpr */1,
          left: node,
          right: {
            TAG: /* QuantifierExpr */2,
            node: {
              TAG: /* Match */0,
              _0: {
                TAG: /* Chars */1,
                chars: [{
                    NAME: "Chars",
                    VAL: escapeCharsForLiterals(characters)
                  }],
                negative: true
              }
            },
            kind: {
              NAME: "ZeroOrMore",
              VAL: asLazy ? "Lazy" : "Greedy"
            }
          },
          kind: "Conjunction"
        };
}

function somethingBut(node, characters) {
  return {
          TAG: /* ConcatExpr */1,
          left: node,
          right: {
            TAG: /* QuantifierExpr */2,
            node: {
              TAG: /* Match */0,
              _0: {
                TAG: /* Chars */1,
                chars: [{
                    NAME: "Chars",
                    VAL: escapeCharsForLiterals(characters)
                  }],
                negative: true
              }
            },
            kind: "OneOrMore"
          },
          kind: "Conjunction"
        };
}

function anyOf(node, characters) {
  return {
          TAG: /* ConcatExpr */1,
          left: node,
          right: {
            TAG: /* QuantifierExpr */2,
            node: {
              TAG: /* Match */0,
              _0: {
                TAG: /* Chars */1,
                chars: [{
                    NAME: "Chars",
                    VAL: escapeCharsForLiterals(characters)
                  }],
                negative: false
              }
            },
            kind: "ZeroOrOne"
          },
          kind: "Conjunction"
        };
}

function someOf(node, characters) {
  return {
          TAG: /* ConcatExpr */1,
          left: node,
          right: {
            TAG: /* QuantifierExpr */2,
            node: {
              TAG: /* Match */0,
              _0: {
                TAG: /* Chars */1,
                chars: [{
                    NAME: "Chars",
                    VAL: escapeCharsForLiterals(characters)
                  }],
                negative: false
              }
            },
            kind: "OneOrMore"
          },
          kind: "Conjunction"
        };
}

function oneOf(node, characters) {
  return {
          TAG: /* ConcatExpr */1,
          left: node,
          right: {
            TAG: /* Match */0,
            _0: {
              TAG: /* Chars */1,
              chars: [{
                  NAME: "Chars",
                  VAL: escapeCharsForLiterals(characters)
                }],
              negative: false
            }
          },
          kind: "Conjunction"
        };
}

function zeroOrMore(astNode, isLazy) {
  return {
          TAG: /* QuantifierExpr */2,
          node: astNode,
          kind: {
            NAME: "ZeroOrMore",
            VAL: isLazy !== undefined && isLazy ? "Lazy" : "Greedy"
          }
        };
}

function oneOrMore(astNode) {
  return {
          TAG: /* QuantifierExpr */2,
          node: astNode,
          kind: "OneOrMore"
        };
}

function followedBy(node, lookahead) {
  return {
          TAG: /* LookaheadExpr */3,
          node: node,
          lookahead: lookahead,
          kind: "Positive"
        };
}

function notFollowedBy(node, lookahead) {
  return {
          TAG: /* LookaheadExpr */3,
          node: node,
          lookahead: lookahead,
          kind: "Negative"
        };
}

var tab = {
  TAG: /* Match */0,
  _0: {
    TAG: /* Exact */0,
    _0: "\\t"
  }
};

var digit = {
  TAG: /* Match */0,
  _0: {
    TAG: /* Exact */0,
    _0: "\\d"
  }
};

var whitespace = {
  TAG: /* Match */0,
  _0: {
    TAG: /* Exact */0,
    _0: "\\s"
  }
};

var word_0 = {
  TAG: /* Match */0,
  _0: {
    TAG: /* Exact */0,
    _0: "\\w"
  }
};

var word = {
  TAG: /* QuantifierExpr */2,
  node: word_0,
  kind: "OneOrMore"
};

var linebreak = seq([
      and_({
            TAG: /* Match */0,
            _0: {
              TAG: /* Exact */0,
              _0: "\\r"
            }
          }, {
            TAG: /* Match */0,
            _0: {
              TAG: /* Exact */0,
              _0: "\\n"
            }
          }),
      {
        TAG: /* Match */0,
        _0: {
          TAG: /* Exact */0,
          _0: "\\r"
        }
      },
      {
        TAG: /* Match */0,
        _0: {
          TAG: /* Exact */0,
          _0: "\\n"
        }
      }
    ], "Disjunction", undefined);

function ranges(node, rangeArray, negateOpt, param) {
  var negate = negateOpt !== undefined ? negateOpt : false;
  return and_(node, {
              TAG: /* Match */0,
              _0: {
                TAG: /* Chars */1,
                chars: rangeArray.map(function (param) {
                      return {
                              NAME: "Range",
                              VAL: [
                                escapeCharsForLiterals(param[0]),
                                escapeCharsForLiterals(param[1])
                              ]
                            };
                    }),
                negative: negate
              }
            });
}

function repeat(node, low, high) {
  return {
          TAG: /* QuantifierExpr */2,
          node: node,
          kind: low !== undefined ? (
              high !== undefined ? ({
                    NAME: "MinMax",
                    VAL: [
                      Math.max(Math.min(low, high), 0),
                      Math.max(0, low, high)
                    ]
                  }) : ({
                    NAME: "MinMax",
                    VAL: [
                      Math.max(low, 0),
                      undefined
                    ]
                  })
            ) : (
              high !== undefined ? ({
                    NAME: "MinMax",
                    VAL: [
                      Math.max(high, 0),
                      undefined
                    ]
                  }) : ({
                    NAME: "MinMax",
                    VAL: [
                      low,
                      high
                    ]
                  })
            )
        };
}

function repeatExact(node, n) {
  return {
          TAG: /* QuantifierExpr */2,
          node: node,
          kind: {
            NAME: "Exact",
            VAL: n
          }
        };
}

function group(astNode, name) {
  return {
          TAG: /* CaptureGroup */5,
          node: astNode,
          name: name
        };
}

var empty = /* Empty */0;

export {
  toEscape ,
  escapeRegEx ,
  toEscapeInLiteral ,
  removeDoubleEscapes ,
  sanitize ,
  escapeCharsForLiterals ,
  getNode ,
  setNode ,
  setPrefix ,
  setSuffix ,
  addFlags ,
  removeFlags ,
  hasFlag ,
  exact ,
  exact_ ,
  makeNode ,
  defaultTo ,
  createRoot_ ,
  defaultToEmptyString ,
  defaultFlags ,
  defaultSanitize ,
  createRoot ,
  flagsToString ,
  flags_to_opt_string ,
  empty ,
  and_ ,
  range_ ,
  characters ,
  seq ,
  alt ,
  optional ,
  then_ ,
  maybe ,
  or_ ,
  anything ,
  something ,
  anythingBut ,
  somethingBut ,
  anyOf ,
  someOf ,
  oneOf ,
  zeroOrMore ,
  oneOrMore ,
  followedBy ,
  notFollowedBy ,
  tab ,
  digit ,
  whitespace ,
  word ,
  linebreak ,
  ranges ,
  repeat ,
  repeatExact ,
  group ,
  
}
/* linebreak Not a pure module */