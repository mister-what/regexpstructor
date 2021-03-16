> Build regular expressions via a fluent api

## Highlights

- Describe your matcher in a human readable way
- Fluent api to build your regular expressions
- Make maintainable complex regular expressions
- **Immutable for maximum reuseablity:** All methods return a fresh readableExpression. No implicit mutation of any internals that could lead to unexpected results
- **Composable:** Build more complex expressions from your simple readableExpressions. Use combinators like `ReadExp.seq(...readableExpressions)` or `ReadExp.or(...readableExpressions)` to combine your matchers.
- No useless non-capture group wrapping in the output (the final Regexp will be as performant and readable as possible)

## Getting started

Install with

```sh
npm i readable-expressions
```

or with yarn

```sh
yarn add readable-expressions
```

## Usage

```js
// ES module import:
import ReadExp from "readable-expressions";

// or in commonjs:
const ReadExp = require("readable-expressions");

/**
 * @example building a UUID regexp
 */
const hexChar = ReadExp().charOfRanges(["0", "9"], ["a", "f"]);

// tests for [0-9a-f]{8} - eg. "a019bc3f"
const digit_block_8 = hexChar.repeatExactly(8);

// tests for [0-9a-f]{4} - eg. "bc3f"
const digit_block_4 = hexBlock.repeatExactly(4);

// uuid looks like this: "a019bc3f-1234-5678-9abc-def012345678"
const uuid = digit_block_8
  .then("-")
  .then(
    // 3 times a 4-digit blocks, each followed by a dash
    digit_block_4.then("-").repeatExactly(3)
  )
  .then(
    // block of size 12
    hexBlock.repeatExactly(12)
  )
  .withAnyCase() // make case insensitive
  .searchOneLine(); // single line search

// compile the readExp into a regExp
const regex = readExp.compile();

// use it:
console.log(regex.test("a019bc3f-1234-5678-9abc-def012345678")); // true

// print it:
console.log(`/${regex.source}/${regex.flags}`); // "/[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}/gi"
```

##
