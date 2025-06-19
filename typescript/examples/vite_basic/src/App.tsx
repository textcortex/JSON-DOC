import { JsonDocRenderer, PageDelimiter } from "@textcortex/jsondoc";
import "@textcortex/jsondoc/dist/index.css";
import { useState, useEffect } from "react";

const App = () => {
  const [testPage, setTestPage] = useState(null);
  const [devMode, setDevMode] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/spacing_test.json");
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
  const testBackrefs: Array<{
    end_idx: number;
    block_id: string;
    start_idx: number;
  }> = [
    // {
    //   end_idx: 50,
    //   block_id: "blk_table_row_5",
    //   start_idx: 0,
    // },
    // {
    //   end_idx: 40,
    //   block_id: "blk_toggle_1",
    //   start_idx: 12,
    // },
    // {
    //   end_idx: 80,
    //   block_id: "bk_01jxwgvydze3bsy2p19cfteqge",
    //   start_idx: 20,
    // },
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
        background: theme === "dark" ? "oklch(20.5% 0 0)" : "oklch(95% 0 0)",
      }}
    >
      {/* Floating Dev Mode Button */}
      <button
        onClick={() => setDevMode(!devMode)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "8px 16px",
          background: devMode ? "oklch(60% 0.2 250)" : "oklch(40% 0.2 250)",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {devMode ? "Disable" : "Enable"} Dev Mode
      </button>

      {/* Floating Theme Toggle Button */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        style={{
          position: "fixed",
          top: "20px",
          right: "200px",
          zIndex: 1000,
          padding: "8px 16px",
          background:
            theme === "dark" ? "oklch(60% 0.2 50)" : "oklch(40% 0.2 50)",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {theme === "dark" ? "☀️ Light" : "🌙 Dark"} Mode
      </button>

      <div
        style={{
          padding: "20px",
          maxWidth: "300px",
          // background: "oklch(20.5% 0 0)",
          margin: "0 auto",
          color: theme === "dark" ? "oklch(90% 0 0)" : "oklch(10% 0 0)",
          display: "flex",
          justifyContent: "center",
          paddingTop: 160,
        }}
      >
        <div>
          <JsonDocRenderer
            page={testPage}
            theme={theme}
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
    </div>
  );
};

export default App;
