---
title: "Implementing JSON-DOC TypeScript parser"
author: "Onur <onur@textcortex.com>"
date: "2025-05-21"
---

A lot of coding agent products went into production recently, such as OpenAI Codex, Google Jules, Claude Code, etc. The TypeScript implementation is an ideal task, thanks to existing tests.

Below is the prompt:

```
Convert JSON Schemas into TS interfaces similar to what is in Python with datamodel-codegen. See https://github.com/bcherny/json-schema-to-typescript and https://github.com/ThomasAribart/json-schema-to-ts. Compare the two and choose the best option.

The interfaces MUST BE generated programmatically, just as how we do in Python. Understand the directory structure first, list, navigate and read files. Look at the json schema files under /schema, and compare them with the generated files in the python directory

We basically need to implement parsing of a JSON-DOC file into typed objects in typescript, similar to Python load_jsondoc() and similar functions

Note that we use uv for running python. There are example json-doc files and tests under /tests and github actions that make sure that the parsing and validation logic in python is correct

For a correct ts implementation, similar tests and checks need to be implemented. Make sure to use up-to-date typescript tooling and conventions. This library is supposed to be installed universally, keep that in mind. Do not use obscure or non-general tooling for packaging and distribution. Follow today's best practices
```

---

Round 2:

npm run test gives error. DO NOT BREAK EXISTING FUNCTIONALITY.

Also, add a script to directly view a json-doc file in the terminal. I don't know how it should work, maybe should start a server and open the file in the browser. Up to you.

Make sure the tests pass. Implement this and add instructions to the README file.