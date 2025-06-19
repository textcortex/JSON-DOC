import { JsonDocRenderer, PageDelimiter } from "@textcortex/jsondoc";
import "@textcortex/jsondoc/dist/index.css";
import { useState, useEffect } from "react";

interface FloatingButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  offset?: { x: number; y: number };
  backgroundColor?: string;
  color?: string;
  zIndex?: number;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  onClick,
  children,
  position = "top-right",
  offset = { x: 20, y: 20 },
  backgroundColor = "oklch(40% 0.2 250)",
  color = "white",
  zIndex = 1000,
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case "top-left":
        return { top: offset.y, left: offset.x };
      case "bottom-right":
        return { bottom: offset.y, right: offset.x };
      case "bottom-left":
        return { bottom: offset.y, left: offset.x };
      default:
        return { top: offset.y, right: offset.x };
    }
  };

  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        ...getPositionStyles(),
        zIndex,
        padding: "8px 16px",
        background: backgroundColor,
        color,
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
      {children}
    </button>
  );
};

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
      <FloatingButton
        onClick={() => setDevMode(!devMode)}
        backgroundColor={devMode ? "oklch(60% 0.2 250)" : "oklch(40% 0.2 250)"}
        offset={{ x: 20, y: 20 }}
      >
        {devMode ? "Disable" : "Enable"} Dev Mode
      </FloatingButton>

      {/* Floating Theme Toggle Button */}
      <FloatingButton
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        backgroundColor={
          theme === "dark" ? "oklch(60% 0.2 50)" : "oklch(40% 0.2 50)"
        }
        offset={{ x: 200, y: 20 }}
      >
        {theme === "dark" ? "☀️ Light" : "🌙 Dark"} Mode
      </FloatingButton>

      <div
        style={{
          padding: "20px",
          maxWidth: "700px",
          margin: "0 auto",
          color: theme === "dark" ? "oklch(90% 0 0)" : "oklch(10% 0 0)",
          display: "flex",
          justifyContent: "center",
          paddingTop: 160,
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
