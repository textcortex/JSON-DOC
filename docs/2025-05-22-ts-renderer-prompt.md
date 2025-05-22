---
title: "Implementing JSON-DOC TypeScript parser"
author: "Onur <onur@textcortex.com>"
date: "2025-05-21"
---

We have previously implemented a TypeScript parser for JSON-DOC, a new JSON based file format for documents. The excerpt below shows our initial intentions.

---

Convert JSON Schemas into TS interfaces similar to what is in Python with datamodel-codegen. See https://github.com/bcherny/json-schema-to-typescript and https://github.com/ThomasAribart/json-schema-to-ts. Compare the two and choose the best option.

The interfaces MUST BE generated programmatically, just as how we do in Python. Understand the directory structure first, list, navigate and read files. Look at the json schema files under /schema, and compare them with the generated files in the python directory

We basically need to implement parsing of a JSON-DOC file into typed objects in typescript, similar to Python load_jsondoc() and similar functions

Note that we use uv for running python. There are example json-doc files and tests under /tests and github actions that make sure that the parsing and validation logic in python is correct

For a correct ts implementation, similar tests and checks need to be implemented. Make sure to use up-to-date typescript tooling and conventions. This library is supposed to be installed universally, keep that in mind. Do not use obscure or non-general tooling for packaging and distribution. Follow today's best practices

---

This was implemented successfully, and now the tests for serialization and parsing passes. The next step is to implement a React TypeScript renderer for this file format. Implement a React component that will receive a JSON-DOC object and render it in the same visual style as Notion documents. You need to write logic to map each JSON-DOC block into HTML elements.

To aid your process, I have included HTML elements and CSS files from Notion under /examples/notion/frontend. notion_frame1.html contains a Notion page with a lot of different block types, and notion_frame1_reduced.html contains the same page, but with certain information truncated to make it easier to see the structure and fit into the context.

You don't need to match the style exactly, but you need to write code that will render each block at least in a logical and consistent way. Note that blocks can include other blocks recursively.

IMPORTANT: YOU WILL AT NO CIRCUMSTANCE SKIP THE TASK OF RENDERING BLOCKS RECURSIVELY. BLOCKS CAN CONTAIN OTHER BLOCKS AT AN ARBITRARY DEPTH.

YOU WILL RENDER ALL BLOCK TYPES THAT JSON-DOC SUPPORTS.

For your test, you will be making sure that /schema/page/ex1_success.json is rendered correctly with this new React component.

Look at README and CLAUDE.md files for more information. The Python implementation is the single source of truth for the JSON-DOC format. The TypeScript implementation was generated from the Python implementation, so it might contain some errors. If you encounter any errors or inconsistencies, fix them.

TAKING SHORTCUTS WILL BE PENALIZED HEAVILY.