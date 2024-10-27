# v1-nification

The initial entries were generated on December 9, 2023 from the Bastion spreadsheet.
Not everything could be cleanly converted to the new format due to how inconsistently
written the previous docs were.

Initial entries were given an `'under-construction'` tag to denote they have not been checked yet,
and some required fields were given `'(To be added)'`.
Before the repository is bumped to v1.0.0, all entries must have been manually checked.
This means `'under-construction'` and `'(To be added)'` should be nowhere to be found in the repo.

Functions and constants should be prioritized since they were the ones generated from the spreadsheet.
Enums, namespaces, types, and tags, will probably gradually get corrected as we go through functions and constants.

To get started, fork the repo then start searching for the `'under-construction'` tag.
The following are quick general step-by-step guides on updating initial function/constant entries.

- shorten descriptions
  - examples and advanced discussion should be in the guide
  - for functions, remove parameter and return explanations
- optionally, write a summary
  - if the description is short enough and also makes sense as a summary, they can be reused by
    [yaml anchoring](https://stackoverflow.com/questions/48940619/yaml-how-to-reuse-single-string-content)
- optionally, write a guide for more complex functionality or to give examples
- write a description for each function parameter and return
- all varArg (...) params currently have "any" as their type, check if their type can be narrowed down
- for aliases:
  - go to the new name's file
  - add the old name to its `aliases` field
  - if the alias is deprecated, set its status index to `deprecated`
  - delete the old name's file
- format descriptions with line breaks if they're too long
- remove the `under-construction` tag

---

Sample commits:

- https://github.com/ProjectIgnis/scrapiyard/pull/29
- https://github.com/ProjectIgnis/scrapiyard/pull/30.

Tentative style guideline:

- https://gist.github.com/that-hatter/f7ff7678612d27ad3d24e61425b5f5b8

---

To add entries, the quickest way would be to copy-paste from an existing entry
then edit as necessary (much like card scripting).
When unsure about a field, consult the [specs](/specs/README.md).

When you open a PR, a checker will run to validate the entries.
Make sure to verify the result for possible errors.
You can also [set up `scrapi-factory` locally](https://github.com/that-hatter/scrapi-factory#validating-locally)
if you want to validate your changes without having to upload them every time.
