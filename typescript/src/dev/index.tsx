import React from "react";
import ReactDOM from "react-dom/client";
import { JsonDocRenderer } from "../renderer/JsonDocRenderer";
import testPage from "./testJsonDocs/test_document.json";

const App = () => {
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
