# Tag

Documents a tag.
A tag is a label that can be attached to entries for additional categorization and identification.

Must have the legendary `---!tag` tag at the top of the file.

## Fields

- `name`: **string**

  The tag's name.

- `description`: **string**

  The tag description.
  - must resolve to a single markdown paragraph

- `summary`: **string** (optional)

  A shorter description.
  Useful for quickly browsing a list of tags without having to read full paragraphs.
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
