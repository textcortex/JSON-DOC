import React from "react";
import ReactDOM from "react-dom/client";

import { ParagraphBlockRenderer } from "@/renderer/components/blocks/ParagraphBlockRenderer";
import { HeadingBlockRenderer } from "@/renderer/components/blocks/HeadingBlockRenderer";

import { JsonDocRenderer } from "../renderer/JsonDocRenderer";

import testPage from "./testJsonDocs/ex1_success.json";

const App = () => {
  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        background: "black",
      }}
    >
      <h1>JSON-DOC Renderer Development</h1>
      <JsonDocRenderer
        page={testPage}
        theme="dark"
        components={{
          heading_1: (props) => {
            return <HeadingBlockRenderer {...props} />;
          },
          paragraph: (props) => <ParagraphBlockRenderer {...props} />,
          // paragraph: (props) =>
        }}
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
