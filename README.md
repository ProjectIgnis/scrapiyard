<h1 align="center">scrapiyard</h1>
<p align="center">
  <img src="/assets/1050684.jpg" />
</p>
<p align="center">
  <strong>Documentation files for EDOPro's Card Scripting API</strong>
</p>

This repository aims to provide a single comprehensive source of truth for EDOPro scripting documentation and type information,
stored in a properly version-controlled interchange format that facilitates easier human contribution and tooling development.

It also includes a [parser](/docs/Parsing-Pipeline.md) that enforces entry correctness.
This can be [run standalone](#dumping-parsed-entries-as-json) by cloning the repository, or added [as an `npm` dependency](#the-typescript-package) when writing API-related tooling.

---

## Format

Documentation entries are in yaml format, found under [`/api/`](/api/),
following the specifications detailed in [`/docs/specs/`](/docs/specs/) and enforced by the parser.

The specs are meant to be highly specialized for the EDOPro scripting environment.
It does **NOT** aim to be able to represent the lua language as a whole or a general-purpose lua environment.

Spec considerations take inspiration from the following projects:

- [Factorio runtime API documentaion](https://lua-api.factorio.com/latest/index-runtime.html)
- [LÖVE wiki](https://love2d.org/wiki/Main_Page)
- [Binding of Isaac modding API documentation](https://wofsauge.github.io/IsaacDocs/rep/)
- [moonwave](https://github.com/evaera/moonwave)
- [sumneko's lua lsp server annotations](https://github.com/LuaLS/lua-language-server/wiki/Annotations)

### Emergent Type System

Since the documentation spec also needs to be able to represent types in some form, it naturally gives rise to a type system.
This emergent type system is fairly limited by design, as it must be reasonably easy to read and write in yaml format first and foremost,
and it needs only to specialize in type concepts relevant to EDOPro scripting. Namely:

- single inheritance, but all function types must be a subtype of `function` and all table types must be a subtype of `table`
- union types

It does **NOT** aim to support more advanced type concepts such as, but not limited to:

- generics
- intersections
- literal types

Furthermore, every type must be documented as a separate entry even if they are only used once.
Anonymous types are not supported to avoid arbitrary deep nesting and circular references in the yaml files.
The only exception are union types, which can be represented by a list of type names (the union itself does not need to be named).

### Dumping parsed entries as JSON

For quick local checking, you can run a dump script that generates a JSON file with the resulting entries, or an error file.
It only runs Steps 1 - 4 in the [parsing pipeline](/docs/Parsing-Pipeline.md), so the entries are not finalized, although guaranteed to be correct.

- Clone the repo and navigate to it.
- `npm i`
- `npm run dump`
- Check the `/dump/` folder for the output (or error).

---

## The Typescript Package

The parser module can be installed with npm.

```
npm i @that-hatter/scrapiyard
```

It provides loader functions that return strictly typed parsed outputs.
A utility module for working with markdown AST is also included.

### Usage

The most relevant function is `loadYard`. It is recommended to use [`fp-ts`](https://gcanti.github.io/fp-ts/) for the least amount of friction.

```ts
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as sy from '@that-hatter/scrapiyard';

const program = pipe(
  sy.loadYard(sy.DEFAULT_OPTIONS),
  TE.map(({ api }) => {
    // ...
  })
);
```

There are also more granular functions that perform specific steps, such as `loadAPI`, `loadRawAPI`, and `loadSourceRecord`.
See [`dump.ts`](/src/dump.ts) for an example usage.

If not using `fp-ts`, you will need to call the value returned by `loadYard` to get a `Promise`, and manually check if its `_tag` is `"Right"`.

```ts
const yard = await sy.loadYard(sy.DEFAULT_OPTIONS)();
if (yard._tag === 'Right') {
  const { api } = yard.right;
  // ...
}
```
