# JSON-DOC Python Implementation

We use datamodel-code-generator to generate Pydantic `BaseModel`s from JSON-DOC JSON schemas. This saves us from writing the Pydantic models by hand.

The JSON Schemas as refer to each other, and there are circular dependencies in some cases, like blocks that have children blocks whose types are also the general block under `/block/block_schema.json`.

Since we can't inject types infinitely, we stop at the first-level of depth. That is, after first level `$ref`s are resolved, we replace the remaining `$ref`s with an arbitrary JSON schema object which allows any key-value pairs.

```py
ARBITRARY_JSON_SCHEMA_OBJECT = {
    "type": "object",
    "properties": {},
    "additionalProperties": True,
}
```

These are then annotated as `Dict[str, Any]` in the corresponding Pydantic model fields.

## TODO For the next week

`Dict[str, Any]` is not right. We should be able to refer to the actual Pydantic model that is generated.

- Compile all the generated types and models into a single file and deduplicate them.
- Set `title` fields to the class names that we want.
- Replace `$ref`s with a placeholder `Literal` value (`type:string, const:...`) that we will later replace with the actual type.
- After the file is generated, replace the placeholder `Literal` values with the actual class names.
- If Python complains that some of the annotations types are not defined, we might need to rearrange the order of the classes in the file, or escape them with `"..."` strings.