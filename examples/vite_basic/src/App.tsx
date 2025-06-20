import { JsonDocRenderer, PageDelimiter } from "@textcortex/jsondoc";
import "@textcortex/jsondoc/dist/index.css";
import { useState, useEffect } from "react";
import DevPanel from "./components/DevPanel";

// Test backrefs for highlighting
const testBackrefs: Array<{
  end_idx: number;
  start_idx: number;
  block_id?: string;
  page_id?: string;
}> = [
  // Test page title highlighting
  {
    end_idx: 15,
    page_id: "pg_01jxm798ddfdvt60gy8nqh0xm7",
    start_idx: 0,
  },
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

  return (
    <div
      style={{
        background: theme === "dark" ? "oklch(20.5% 0 0)" : "oklch(95% 0 0)",
      }}
    >
      <DevPanel
        devMode={devMode}
        setDevMode={setDevMode}
        theme={theme}
        setTheme={setTheme}
      />

      <div
        style={{
          padding: "20px",
          maxWidth: "500px",
          margin: "0 auto",
          color: theme === "dark" ? "oklch(90% 0 0)" : "oklch(10% 0 0)",
          display: "flex",
          justifyContent: "center",
          paddingTop: 160,
          // background: "rgba(0,0,0,0.3)",
        }}
      >
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
  );
};

export default App;
