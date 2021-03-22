[![Build](https://github.com/mister-what/regexpstructor/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/mister-what/regexpstructor/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/regexpstructor?labelColor=%2324292E&style=flat&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHJvbGU9ImltZyIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZmlsbDogcmdiKDI1NSAyNTUgMjU1IC8gNTAlKTtwYWRkaW5nLXRvcDogMXB4O3dpZHRoOiAyNnB4O2hlaWdodDogMjZweDsiPjxwYXRoIGQ9Ik0wIDcuMzM0djhoNi42NjZ2MS4zMzJIMTJ2LTEuMzMyaDEydi04SDB6bTYuNjY2IDYuNjY0SDUuMzM0di00SDMuOTk5djRIMS4zMzVWOC42NjdoNS4zMzF2NS4zMzF6bTQgMHYxLjMzNkg4LjAwMVY4LjY2N2g1LjMzNHY1LjMzMmgtMi42Njl2LS4wMDF6bTEyLjAwMSAwaC0xLjMzdi00aC0xLjMzNnY0aC0xLjMzNXYtNGgtMS4zM3Y0aC0yLjY3MVY4LjY2N2g4LjAwMnY1LjMzMXpNMTAuNjY1IDEwSDEydjIuNjY3aC0xLjMzNVYxMHoiIHN0eWxlPSImIzEwOyIvPjwvc3ZnPg%3D%3D)](https://www.npmjs.com/package/regexpstructor)

# RegExpStructor

> Build regular expressions via a fluent api

## Highlights

- Describe your matcher in a human readable way
- Fluent api to build your regular expressions
- Make maintainable complex regular expressions
- **Immutable for maximum reuseablity:** All methods return a fresh RegExpstructor. No implicit mutation of any internals that could lead to unexpected results
- **Composable:** Build more complex expressions from your simple RegExpstructors. Use combinators like `ReStructor.seq(...RegExpstructors)` or `ReStructor.or(...RegExpstructors)` to combine your matchers.
- No useless non-capture group wrapping in the output (the final Regexp will be as performant and readable as possible)

## Getting started

Install with

```sh
npm i regexpstructor
```

or with yarn

```sh
yarn add regexpstructor
```

## Usage

```js
// ES module import:
import ReStructor from "regexpstructor";

// or in commonjs:
const ReStructor = require("regexpstructor");

/**
 * @example building a UUID regexp
 */
const hexChar = ReStructor().charOfRanges(["0", "9"], ["a", "f"]);

// tests for [0-9a-f]{8} - eg. "a019bc3f"
const digitBlock_8 = hexChar.repeatExactly(8);

// tests for [0-9a-f]{4} - eg. "bc3f"
const digitBlock_4 = hexChar.repeatExactly(4);

// uuid looks like this: "a019bc3f-1234-5678-9abc-def012345678"
const uuid = digitBlock_8
  .then("-")
  .then(
    // 3 times a 4-digit blocks, each followed by a dash
    digitBlock_4.then("-").repeatExactly(3)
  )
  .then(
    // block of size 12
    hexChar.repeatExactly(12)
  )
  .withAnyCase() // make case insensitive
  .searchOneLine(); // single line search

// compile the uuid reStructor into a regExp
const regex = uuid.compile();

// use it:
regex.test("a019bc3f-1234-5678-9abc-def012345678"); // result: true

// print it:
console.log(regex); /* logs: /[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}/gi */
```

##
