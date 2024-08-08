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

# Blocks

See https://developers.notion.com/reference/block for the authoritative Notion specification.

## Text-type blocks

### Rich text (See https://developers.notion.com/reference/rich-text)

These are not "official" blocks, but exist under the `rich_text` key in some blocks.

- [x] `type: text`
- [ ] `type: equation` -> Needed, will be rendered using KaTeX on the client side
- [ ] `type: mention` ???

### Other text blocks

- [x] `type: paragraph`
- [x] `type: heading_1`
- [x] `type: heading_2`
- [x] `type: heading_3`
- [x] `type: code`
- [ ] `type: equation`
- [ ] `type: quote`
- [ ] ~~`type: callout`~~
  - Won't implement for now

## List item blocks

- [ ] `type: bulleted_list_item`
- [ ] `type: numbered_list_item`
- [ ] `type: to_do`

## Table blocks

- [ ] `type: table`
- [ ] `type: table_of_contents`
- [ ] `type: table_row`
- [ ] `type: column`
- [ ] `type: column_list`

## Non-text blocks

- [ ] `type: image`
- [ ] ~~`type: file`~~
  - Won't implement
- [ ] ~~`type: pdf`~~
  - Won't implement
- [ ] ~~`type: embed`~~
  - Won't implement
- [ ] ~~`type: video`~~
  - Won't implement

## Page-related blocks

## Page/Container blocks

- [ ] `type: child_page`
  - Might implement, might not be necessary for the current document conversion use case
- [ ] `type: synced_block`
  - Might implement, ditto
- [ ] ~~`type: toggle`~~
  - Won't implement
- [ ] ~~`type: divider`~~
  - Won't implement, not that relevant for LLM

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
