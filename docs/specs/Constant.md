# Constant

Documents a constant.
Must have the `---!constant` tag at the top of the file.

## Fields

- `name`: **string**

  The constant's name, excluding its namespace. 
  - must be a valid lua binding when combined with its `namespace`
  - must be unique when combined with its `namespace`

- `namespace`: **string** (optional)

  The namespace it belongs to. Can be omitted if the constant is global.
  - must be a valid lua binding when combined with its `name`
  - must be unique when combined with its `name`

- `value`: **number | string | boolean**

  The constant's value.
  If it's a string, it is treated as a lua expression to allow setting constants as `value`.
  This means `"5"` and `5` would be equivalent. If an actual lua string is needed, they should be quoted again `'"5"'`.

- `description`: **string**

  The constant description.
  - must resolve to a single markdown paragraph

- `summary`: **string** (optional)

  A shorter description.
  Useful for quickly browsing a list of constants without having to read full paragraphs.
  - must have 80 or fewer characters
  - must resolve to a single markdown paragraph

- `guide`: **string** (optional)

  A long form explanation for anything that can not be conveyed in the `description`.
  Usually, it's for discussing more advanced functionality.
  - can have any markdown element

- `status`: **Status**

  Describes the constant's status in the codebase.
  <details>
    <summary> Status spec </summary> 

  ### Status

  - `index`: 'stable' | 'unstable' | 'deprecated' | 'deleted'

  - `message`: **string** (optional)

    A message attached to the status, usually explaining its reason if it's not 'stable'.

  - `since`: **string** (optional)

    *Currently unused. Supposed to represent some sort of API versioning.*

  </details>

- `aliases`: **Alias[]** (optional)

    The constant's aliases.

  <details>
    <summary> Alias spec </summary>

  ### Alias

  - `name`: **string**

    The name of the alias. Note that unlike the constant `name`, this should already have the namespace included.
      - must be a valid lua binding

  - `status`: **Status**

    The status of the alias.

    See [**Status** spec](#status)

  </details>

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
