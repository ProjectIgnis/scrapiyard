<h1 align="center">scrapiyard</h1>
<p align="center">
  <img src="/assets/scrapyard-artwork.jpg" />
</p>
<p align="center">
  <strong>Documentation files for EDOPro's Card Scripting API</strong>
</p>

This repository aims to provide a single comprehensive source of truth for
EDOPro scripting documentation and type information,
stored in a properly version-controlled interchange format
that facilitates easier human contribution and tooling development.

## Contribute

Currently, we're working on checking every doc,
correcting and modernizing them as needed after they were imported from the old format.
There are over 2000 entries to go through so any help would be appreciated.
See [`v1-nification`](/v1-nification.md) to get started with contributing.

---

## Format

Documentation entries are in yaml format, found under [`/api/`](/api/),
following the specifications detailed in [`/docs/specs/`](/specs/).

The specs are meant to be highly specialized for the EDOPro scripting environment.
It does **NOT** aim to be able to represent the lua language as a whole or a general-purpose lua environment.

Spec considerations take inspiration from the following projects:

- [Factorio runtime API documentaion](https://lua-api.factorio.com/latest/index-runtime.html)
- [LÖVE wiki](https://love2d.org/wiki/Main_Page)
- [Binding of Isaac modding API documentation](https://wofsauge.github.io/IsaacDocs/rep/)
- [moonwave](https://github.com/evaera/moonwave)
- [sumneko's lua lsp server annotations](https://github.com/LuaLS/lua-language-server/wiki/Annotations)

### Emergent Type System

Since the documentation spec needs to be able to represent types in some form,
it naturally gives rise to a type system.
This emergent type system is very limited by design,
as it must be reasonably easy to read and write in yaml format first and foremost,
and it needs only to specialize in type concepts relevant to EDOPro scripting. Namely:

- subtyping, but all function types must be a subtype of `function` and all table types must be a subtype of `table`
- function overloading
- union types

It does **NOT** aim to support more advanced type concepts such as, but not limited to:

- generics
- intersection types
- literal types

Furthermore, every type must be documented as a separate entry even if they are only used once.
Anonymous types are not supported to avoid arbitrary deep nesting and circular references in the yaml files.
The only exception are union types, which can be represented by a list of type names
(the union itself does not need to be named).
