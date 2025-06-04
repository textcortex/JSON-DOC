import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import { JsonDocRenderer } from "../renderer/JsonDocRenderer";
import { loadSchema, validateAgainstSchema } from "../validation/validator";

import testPage from "./testJsonDocs/test_document.json";
// import testPage from "./testJsonDocs/test_document_2.json";

const App = () => {
  // async function main() {
  //   const schema = await loadSchema("./testJsonDocs/test_document_2.json");

  //   try {
  //     const isValid = validateAgainstSchema(testPage, schema);
  //     console.log("isvlaid: ", isValid);
  //     console.log("schema:  ", schema);
  //   } catch (error) {
  //     console.log("error validating schema: ", error);
  //   }
  // }

  // useEffect(() => {
  //   main();
  // }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>JSON-DOC Renderer Development</h1>
      <JsonDocRenderer page={testPage} />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
