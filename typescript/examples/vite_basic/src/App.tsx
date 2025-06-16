import { JsonDocRenderer, PageDelimiter } from "@textcortex/jsondoc";
import "@textcortex/jsondoc/dist/index.css";
import { useState, useEffect } from "react";

const App = () => {
  const [testPage, setTestPage] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/test_document.json");
        const data = await response.json();
        setTestPage(data);
      } catch (error) {
        console.error("Error loading JSON:", error);
      }
    };
    loadData();
  }, []);

  if (!testPage) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        background: "oklch(20.5% 0 0)",
        color: "oklch(90% 0 0)",
        display: "flex",
        justifyContent: "center",
        width: "100vw",
      }}
    >
      <div>
        <h1>JSON-DOC Renderer Development</h1>
        <JsonDocRenderer
          page={testPage}
          theme="dark"
          devMode={true}
          components={{
            page_delimiter: (props) => {
              return <PageDelimiter {...props} pageNumber={99} />;
            },
          }}
        />
      </div>
    </div>
  );
};

export default App;
