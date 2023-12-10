# Table Type

Documents a table type.
Must have the `---!type` tag at the top of the file.

## Fields

- `name`: **string**
  
  The table type's name.
  - must only contain alphabetic characters, or `_`

- `supertype`: **'table'**

  A type's `supertype` must be exactly `'table'` to be treated as a table type.
  Setting a different table type as the supertype is not supported.
 
- `description`: **string**
  
  The table type description.
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

- `fields`: **Field[]** (optional)

  The table type's named fields.

  - all field `name`s must be unique

  <details>
    <summary> Field spec </summary>

  ### Field

  - `name`: **boolean | number | string**
    
    The name of the field, which is not limited to strings, since any value can be used as a table index.
    If it's a string, it is treated as a lua expression to allow setting constants as field name.
    This means `"5"` and `5` would be equivalent. If an actual lua string is needed, they should be quoted again `'"5"'`.

  - `valueType`: **string[]**

    The type(s) of the field's value, represented as a list to denote Union types.
    A field that can either be `Card` or `Group` would have `type: [ Card, Group ]`.
 
    - must not be empty
    - all members must be unique

  - `description`: **string**
    
    The field's description.
    - must resolve to a single markdown paragraph
  
  - `summary`: **string** (optional)
  
    A shorter description.
    Useful for quickly browsing a list of fields without having to read full paragraphs.
    - must have 80 or fewer characters
    - must resolve to a single markdown paragraph
  
  - `guide`: **string** (optional)
  
    A long form explanation for anything that can not be conveyed in the `description`.
    *Currently unused for fields.*

  </details>

- `mappedTypes`: **MappedType[]** (optional)

  Mapped types are table fields that can take any value of a given key type.
  For example, a table type could be defined that can be indexed by any int.
  
  - all `keyType`s must be unique

  <details>
    <summary> MappedType spec </summary>

  ### MappedType

  - `keyType`: **string**
    
    The type of the key.

  - `valueType`: **string[]**

    The type(s) of the field's value, represented as a list to denote Union types.
    A field that can either be `Card` or `Group` would have `type: [ Card, Group ]`.
 
    - must not be empty
    - all members must be unique

  - `description`: **string**
    
    The mapped type's description.
    - must resolve to a single markdown paragraph
  
  - `summary`: **string** (optional)
  
    A shorter description.
    Useful for quickly browsing a list of mapped types without having to read full paragraphs.
    - must have 80 or fewer characters
    - must resolve to a single markdown paragraph
  
  - `guide`: **string** (optional)
  
    A long form explanation for anything that can not be conveyed in the `description`.
    *Currently unused for mapped types.*

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
