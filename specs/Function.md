# Function

Documents a function.
Must have the `---!function` tag at the top of the file.

## Fields

- `name`: **string**
  
  The function's name, excluding its namespace. So `Duel.Remove` would only have `Remove` as its name.
  - must be a valid lua binding when combined with its `namespace`
  - must be unique when combined with its `namespace`

- `namespace`: **string** (optional)

  The namespace it belongs to. Can be omitted if the function is global.
  - must be a valid lua binding when combined with its `name`
  - must be unique when combined with its `name`
 
- `description`: **string**
  
  The function description.
  - must resolve to a single markdown paragraph

- `summary`: **string** (optional)

  A shorter description.
  Useful for quickly browsing a list of functions without having to read full paragraphs.
  - must have 80 or fewer characters
  - must resolve to a single markdown paragraph

- `guide`: **string** (optional)

  A long form explanation for anything that can not be conveyed in the `description`.
  Usually, it's for discussing more advanced functionality.
  - can have any markdown element

- `status`: **Status**
  
  Describes the function's status in the codebase.
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

    The function's aliases.

  <details>
    <summary> Alias spec </summary>

  ### Alias

  - `name`: **string**
    
    The name of the alias. Note that unlike the function `name`, this should already have the namespace included.
      - must be a valid lua binding

  - `status`: **Status**

    The status of the alias.

    See [**Status** spec](#status)

  </details>

- `parameters`: **Parameter[]** (optional)

  The function's parameters.

  - all parameter `name`s must be unique
  - parameters with `required: false` must be at the end of the list
  - a parameter with `...` as `name` must be the very last parameter

  <details>
    <summary> Parameter spec </summary>

  ### Parameter

  - `name`: **string**
    
    The parameter's name.

    - must be a valid parameter name (a lua binding name but with no `.` unless it's `...`)

  - `type`: **string[]**

    The parameter's type(s), represented as a list to denote Union types.
    A parameter that can take either `Card` or `Group` would have `type: [ Card, Group ]`.
 
    - must not be empty
    - all members must be unique

  - `required`: **boolean** (optional)

    Whether a parameter is required.
    This defaults to `true` in the loader script, meaning if it's omitted, the parameter is considered required.

  - `defaultValue`: **number | string | boolean** (optional)

    The parameter's default value.
    If it's a string, it is treated as a lua expression to allow setting constants as `defaultValue`.
    This means `"5"` and `5` would be equivalent. If an actual lua string is needed, they should be quoted again `'"5"'`.

    - must not be a lua keyword, except for "nil"

  - `description`: **string**
    
    The parameter's description.
    - must resolve to a single markdown paragraph
  
  - `summary`: **string** (optional)
  
    A shorter description.
    Useful for quickly browsing a list of parameters without having to read full paragraphs.
    - must have 80 or fewer characters
    - must resolve to a single markdown paragraph
  
  - `guide`: **string** (optional)
  
    A long form explanation for anything that can not be conveyed in the `description`.
    *Currently unused for parameters.*

  </details>

- `returns`: **Return[]** (optional)

  The function's return values.

  - all return `name`s (that are supplied) must be unique
  - returns with `guaranteed: false` must be at the end of the list
  - a return with `...` as `name` must be the very last return

  <details>
    <summary> Return spec </summary>

  ### Return

  - `name`: **string** (optional)
    
    The return's name.
    Returns are not really named in lua, but a name can be optionally documented for easier discussion.
    
    - follows the same rules as `parameter` names for simplicity

  - `type`: **string[]**

    The return's type(s), represented as a list to denote Union types.
    A return that can either be `Card` or `Group` would have `type: [ Card, Group ]`.
 
    - must not be empty
    - all members must be unique

  - `guaranteed`: **boolean** (optional)

    Whether a return is guaranteed to be... returned.
    This defaults to `true` in the loader script, meaning if it's omitted, the return is considered guaranteed.

  - `description`: **string**
    
    The return's description.
    - must resolve to a single markdown paragraph
  
  - `summary`: **string** (optional)
  
    A shorter description.
    Useful for quickly browsing a list of returns without having to read full paragraphs.
    - must have 80 or fewer characters
    - must resolve to a single markdown paragraph
  
  - `guide`: **string** (optional)
  
    A long form explanation for anything that can not be conveyed in the `description`.
    *Currently unused for returns.*

  </details>

- `overloads`: **Overload[]** (optional)

  Alternative signatures for the function.
  
  <details>
    <summary> Overload spec </summary>

  ### Overload

  - `parameters`: **Parameter[]** (optional)
    
    The overload signature's parameters.
    See [**Parameter** spec](#parameter)

    - all parameter `name`s must be unique
    - parameters with `required: false` must be at the end of the list
    - a parameter with `...` as `name` must be the very last parameter

  - `returns`: **Return[]** (optional)
    The overload signature's return values.
    See [**Return** spec](#return)
    
    - all return `name`s (that are supplied) must be unique
    - returns with `guaranteed: false` must be at the end of the list
    - a return with `...` as `name` must be the very last return

  - `description`: **string**
    
    The overload's description.
    - must resolve to a single markdown paragraph
  
  - `summary`: **string** (optional)
  
    A shorter description.
    Useful for quickly browsing a list of overload without having to read full paragraphs.
    - must have 80 or fewer characters
    - must resolve to a single markdown paragraph
  
  - `guide`: **string** (optional)
  
    A long form explanation for anything that can not be conveyed in the `description`.
    Usually, it's for discussing more advanced functionality.
    - can have any markdown element

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
