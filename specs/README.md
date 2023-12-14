# Documentation YAML Specifications

This folder describes what makes entries "correct".
All entries in the repository should follow these specifications.
It was decided to forego having a formal YAML schema to have more fine-grained constraints
that can not be expressed by structural schema alone.

Note that on top of the individual specs, the files still have to be properly-formatted yaml files. Mind the
[umpteen of ways to write strings](http://stackoverflow.com/questions/3790454/in-yaml-how-do-i-break-a-string-over-multiple-lines/21699210#21699210).
It also means yaml features can be used within them. A very useful example is
[anchoring](https://stackoverflow.com/questions/48940619/yaml-how-to-reuse-single-string-content) to reuse fields.

- [Function](/docs/specs/Function.md)
- [Constant](/docs/specs/Constant.md)
- [Namespace](/docs/specs/Namespace.md)
- [Enum](/docs/specs/Enum.md)
- Type
  - [FunctionType](/docs/specs/Type.Function.md)
  - [TableType](/docs/specs/Type.Table.md)
  - [OtherType](/docs/specs/Type.Other.md)
- [Tag](/docs/specs/Enum.md)

## Markdown

Some fields are specified as "must resolve to markdown".
For these fields, [CommonMark](https://commonmark.org/help/) and
[Github-Flavored Markdown](https://github.github.com/gfm/) elements are supported.

A custom admonition syntax can also be used:

```
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::
```

## Internal Linking

When linking tp another API documentation entry, use the entry's filepath starting from `api/`.
For example, to link to the `Card.AddCounter`entry, use `api/Card/AddCounter.yml`
(though unfortunately, github doesn't resolve links in yaml files so there will be no visual feedback).
