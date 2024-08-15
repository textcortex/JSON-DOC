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
