# jsondoc-ts

TypeScript utilities for working with JSON-DOC documents. Interfaces are
generated from the JSON Schema definitions in `../schema` using the
`json-schema-to-typescript` package. The main entry point is `loadJsondoc`
which parses a JSON object (page or block) into typed structures.

To (re)generate the models and run the tests:

```bash
cd ts
npm run build
npm run test
```
