# Reverse Engineering Notion Data Model and API

## UUIDs

Notion uses UUIDs (v4) for the ID of each object. We could possibly improve on this by

- Using TypeID's: Improves readability and attribution of IDs
- Using and ID format that is more efficient for database indices.

## Blocks

A `Block` is (literally) the primary building block of documents in Notion.

See: https://developers.notion.com/reference/block

A `Block` is a container that allows stacking and nesting of various content types that Notion supports. In that way, it is a meta-object. It does not contain content itself, but it represents the relationship between content objects.

An example Block of type `child_database`:

```json
{
  "object": "block",
  "id": "91589676-9cab-40dd-8ace-52f31a225d0a",
  "parent": {
    "type": "page_id",
    "page_id": "8d7dbc6b-5c55-4589-826c-1352450db04e"
  },
  "created_by": {
    "object": "user",
    "id": "b9eb2a95-ab37-462d-b6ff-ff84080051f0"
  },
  "created_time": "2024-05-28T20:28:00.000Z",
  "last_edited_time": "2024-05-28T20:29:00.000Z",
  "last_edited_by": {
    "object": "user",
    "id": "b9eb2a95-ab37-462d-b6ff-ff84080051f0"
  },
  "has_children": false,
  "archived": false,
  "in_trash": false,
  "type": "child_database",
  "child_database": {
    "title": "Example database"
  }
}
```

### `type` field

The `type` field specifies what kind of content a block represents. The content is then contained in the corresponding field of the block object. For example, if the `type` field is `code`, the content is in the `code` field.


## Pages

A `Page` is not a block, but a container for blocks. Pages can exist independently and contain other pages and blocks, creating a hierarchical structure. Blocks exist within pages (or other blocks) and do not have the capability to contain pages.

```json
{
  "id": "8d7dbc6b5c554589826c1352450db04e",
  "type": "page",
  "properties": {...},
  "children": [...]
}
```
