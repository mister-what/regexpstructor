
> Build regular expressions via a fluent api

## Highlights

- Describe your matcher in a human readable way
- Fluent api to build your regular expressions
- Make maintainable complex regular expressions
- **Immutable for maximum reuseablity:** All methods return a fresh readableExpression. No implicit mutation of any internals that could lead to unexpected results
- **Composable:** Build more complex expressions from your simple readableExpressions. Use combinators like `ReadExp.seq(...readableExpressions)` or `ReadExp.or(...readableExpressions)` to combine your matchers.
- No useless non-capture group wrapping in the output (the final Regexp will be as performant and readable as possible)

## Usage

```
import ReadExp from "./ReadableExpression";

// TODO: DEMONSTRATE API
```
