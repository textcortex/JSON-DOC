import { JsonDocRenderer, PageDelimiter } from "@textcortex/jsondoc";
import "@textcortex/jsondoc/dist/index.css";
import { useState, useEffect } from "react";

const App = () => {
  const [testPage, setTestPage] = useState(null);
  const [devMode, setDevMode] = useState(false);

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

  // Test backrefs for highlighting
  const testBackrefs = [
    {
      end_idx: 50,
      block_id: "bk_01jxwgvye6er08spmyxj99f6cp",
      start_idx: 0,
    },
    {
      end_idx: 100,
      block_id: "bk_01jxwgvydyfj6rhm125q1rd4h8",
      start_idx: 70,
    },
    {
      end_idx: 80,
      block_id: "bk_01jxwgvydze3bsy2p19cfteqge",
      start_idx: 20,
    },
    // {
    //   block_id: "bk_01jxwgvyehecbb2bv3jtnm9bzx",
    //   start_idx: 0,
    //   end_idx: 70,
    // },
    // {
    //   block_id: "bk_01jxj01879f8cvyq2hqc6p37z2",
    //   start_idx: 0,
    //   end_idx: 170,
    // },
  ];

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

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setDevMode(!devMode)}
            style={{
              padding: "8px 16px",
              background: devMode ? "oklch(60% 0.2 250)" : "oklch(40% 0.2 250)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {devMode ? "Disable" : "Enable"} Dev Mode
          </button>
        </div>

        <JsonDocRenderer
          page={testPage}
          theme="dark"
          devMode={devMode}
          backrefs={testBackrefs}
          components={{
            page_delimiter: (props) => {
              return <PageDelimiter {...props} />;
            },
          }}
        />
      </div>
    </div>
  );
};

export default App;
