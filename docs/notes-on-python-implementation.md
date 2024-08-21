# JSON-DOC Python Implementation

JSON Schemas are the single source of truth for page and block types.

We use [datamodel-code-generator](https://koxudaxi.github.io/datamodel-code-generator) to generate Pydantic `BaseModel`s from JSON-DOC JSON schemas. This saves us from writing the Pydantic models by hand.

The JSON Schemas as refer to each other, and there are circular dependencies in some cases, like blocks that have children blocks whose types are also the general block under `/block/block_schema.json`.

We make use of datamodel-code-generator conventions of `customBasePath` and `customTypePath` to rewire inheritance from base classes, so that blocks, rich text objects and file objects (e.g. for image block) can be deserialized elegantly. `jsondoc.serialize` contains logic that initializes Pydantic models from JSON-DOC files or dicts.

- `customBasePath` is used to override the base class of a model, instead of `BaseModel`. This is used to inherit from the correct base class, e.g. `BlockBase` for blocks, `RichTextBase` for rich text objects, etc.
- `customTypePath` is used to override the type of a field in a model, which will be imported from the given path. If this is given, there won't be a definition for that object in the generated code.

> [!WARNING]
>
> This stuff is pretty mind-bending, it probably needs a diagram. It is also not as hacky as it looks.

During model generation, instead of simply substituting the `$ref`s with the actual types, we create dummy types and make use of `customTypePath` to refer to the actual type:

```python
# We use the existence of title as a control variable to determine if we should substitute the $ref with the actual type, or inherit from the referenced customTypePath.
title = ref_obj.get("title")
if title is None:
    return ref_obj

# We set customTypePath wherever necessary.
# If it's not found, we construct it from the ref.
if "customTypePath" in ref_obj:
    customTypePath = ref_obj["customTypePath"]
else:
    ref_tokens = ref.split("/")
    ref_tokens = ["jsondoc", "models"] + ref_tokens[:-1] + [title]
    customTypePath = ".".join(ref_tokens)

ret = {
    "type": "object",
    "title": title,
    "customTypePath": customTypePath,
    "properties": {},
}
```

See [autogen_pydantic.py](/scripts/autogen_pydantic.py) for the full implementation.

The module path `jsondoc.models` contains auto-generated models and any edits will be overwritten.
