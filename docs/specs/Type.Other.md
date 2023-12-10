# Other Type

Documents types that are not function or table types.
Must have the `---!type` tag at the top of the file.


## Fields

- `name`: **string**
  
  The type's name.
  - must only contain alphabetic characters, or `_`
  - must not be a lua keyword, except `nil` or `function`

- `supertype`: **string** (optional)

  The type's supertype. Can be omitted for primitives.
  - must only contain alphabetic characters, or `_`
  - must not be a lua keyword, or 'table'
 
- `description`: **string**
  
  The type description.
  - must resolve to a single markdown paragraph

- `summary`: **string** (optional)

  A shorter description.
  Useful for quickly browsing a list of types without having to read full paragraphs.
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
