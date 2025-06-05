import React from "react";
import ReactDOM from "react-dom/client";

import { ParagraphBlockRenderer } from "@/renderer/components/blocks/ParagraphBlockRenderer";
import { HeadingBlockRenderer } from "@/renderer/components/blocks/HeadingBlockRenderer";

import { JsonDocRenderer } from "../renderer/JsonDocRenderer";

// import testPage from "./testJsonDocs/test_document.json";
import testPage from "./testJsonDocs/ex1_success.json";
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
      <JsonDocRenderer
        page={testPage}
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
