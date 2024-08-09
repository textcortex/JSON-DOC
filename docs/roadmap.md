---
author: "Onur Solmaz<onur@textcortex.com>"
date: 2024-08-01
title: "JSON-DOC"
---

# JSON-DOC Implementation Roadmap

- [ ] Create JSONSchema for each block type.
- [ ] Implement converters into JSON-DOC
  - [ ] Multimodal-LLM based PDF/raster image -> JSON-DOC (Most important)
  - [ ] HTML -> JSON-DOC
  - [ ] DOCX -> JSON-DOC
  - [ ] XLSX -> JSON-DOC
  - [ ] PPTX -> JSON-DOC
  - [ ] CSV -> JSON-DOC
  - [ ] Google Docs -> JSON-DOC (lower priority compared to DOCX)
  - [ ] Google Sheets -> JSON-DOC
  - [ ] Google Slides -> JSON-DOC
- [ ] Implement converters from JSON-DOC
  - [ ] JSON-DOC -> Markdown/plain text with tabular metadata for injecting into LLM context.
  - [ ] Ability to reference, extract and render a certain table range. (Important for scrolling in spreadsheets)
- [ ] Frontend for JSON-DOC
  - [ ] JavaScript renderer for JSON-DOC to render it in the browser.

## JSON-DOC Schema

We will implement a JSONSchema for a Notion page and each block type.

See https://developers.notion.com/reference/block for the authoritative Notion specification.

## Text-type blocks

### Rich text (See https://developers.notion.com/reference/rich-text)

These are not "official" blocks, but exist under the `rich_text` key in some blocks.

- [x] `type: text`
- [x] `type: equation`
  - Inline equations.
  - Will be rendered using KaTeX on the client side.
- [ ] ~~`type: mention`~~
  - Won't implement for now

### Other text blocks

- [x] `type: paragraph`
- [x] `type: heading_1`
- [x] `type: heading_2`
- [x] `type: heading_3`
- [x] `type: code`
- [x] `type: equation`
  - Block-level equations.
- [x] `type: quote`
- [ ] ~~`type: callout`~~
  - Won't implement for now

## List item blocks

- [x] `type: bulleted_list_item`
- [x] `type: numbered_list_item`
- [x] `type: to_do`

## Table blocks

- [x] `type: table`
- [x] `type: table_row`

## Non-text blocks

- [x] `type: image`
- [ ] ~~`type: file`~~
  - Won't implement for now
- [ ] ~~`type: pdf`~~
  - Won't implement for now
- [ ] ~~`type: embed`~~
  - Won't implement for now
- [ ] ~~`type: video`~~
  - Won't implement for now


## Page/Container type blocks

- [ ] `type: column`
- [ ] `type: column_list`
- [ ] `type: table_of_contents`
- [ ] `type: child_page`
- [x] `type: divider`
  - Might implement, might not be necessary for the current document conversion use case
- [ ] `type: synced_block`
  - Might implement, ditto
- [ ] ~~`type: toggle`~~
  - Won't implement

## Link-related blocks

- [ ] ~~`type: link_preview`~~
  - Won't implement
- [ ] ~~`type: link_to_page`~~
  - Won't implement
- [ ] ~~`type: bookmark`~~
  - Won't implement

## Notion-specific blocks

- [ ] `type: child_database`
- [ ] ~~`type: breadcrumb`~~
  - Won't implement
- [ ] ~~`type: unsupported`~~
  - Meta block, not needed

## Deprecated blocks

- ~~`type: template`~~
