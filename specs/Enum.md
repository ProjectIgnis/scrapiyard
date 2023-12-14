# Enum

Documents an enum. An enum is a grouping of constants with related functionality. 
They are referred to as enums for a lack of better term, but they are not meant to represent all the valid values for any specific use.
Some enums, for example, are meant to be have their constants combined.
(`LOCATION_HAND|LOCATION_MZONE` is still a valid Location value). They are also not treated as types.

Must have the `---!enum` tag at the top of the file.

## Fields

- `name`: **string**

  The enum's name.
  - must only have alphabetic characters, or `_`
  - must not be a lua keyword

- `bitmaskInt`: **boolean** (optional)

  Whether to treat integer members as bitmasks/bitfields.
  This is to mark constants that would be more convenient to display as hexadecimal or binary,
  since a user would generally be more interested with its bits.
  Defaults to `false`.

- `description`: **string**

  The enum description.
  - must resolve to a single markdown paragraph

- `summary`: **string** (optional)

  A shorter description.
  Useful for quickly browsing a list of enums without having to read full paragraphs.
  - must have 80 or fewer characters
  - must resolve to a single markdown paragraph

- `guide`: **string** (optional)

  A long form explanation for anything that can not be conveyed in the `description`.
  Usually, it's for discussing more advanced functionality.
  - can have any markdown element

- `suggestedLinks`: **SuggestedLink[]** (optional)

  Suggestions for further reading. Also called "See Also" links.

  <details>
    <summary> SuggestedLink spec </summary>

  ### SuggestedLink

  - `name`: **string**
    
    A name for the link.

  - `link`: **string**

    The URL.

  - `message`: **string** (optional)

    An attached message, usually explaining why the link is suggested.

    - must resolve to a markdown paragraph

  </details>

- `tags`: **string[]** (optional)

  A list of documentation tag names.
