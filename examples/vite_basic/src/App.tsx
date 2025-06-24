import { JsonDocRenderer, PageDelimiter } from "@textcortex/jsondoc";
import "@textcortex/jsondoc/dist/index.css";
import { useState } from "react";
import FileSelector from "./components/FileSelector";
import DevPanel from "./components/DevPanel";
import { useFileLoader } from "./hooks/useFileLoader";
import { AVAILABLE_FILES } from "./constants/files";

const App = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [devMode, setDevMode] = useState(false);
  const [showBackrefs, setShowBackrefs] = useState(false);
  const {
    selectedFile,
    data: testPage,
    loading,
    error,
    handleFileChange,
  } = useFileLoader(AVAILABLE_FILES[0]);

  // Get backrefs for the currently selected file
  const currentBackrefs = selectedFile?.backrefs || [];

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: theme === "dark" ? "oklch(90% 0 0)" : "oklch(10% 0 0)",
          background: theme === "dark" ? "oklch(20.5% 0 0)" : "oklch(95% 0 0)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Error Loading Document</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!testPage && loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: theme === "dark" ? "oklch(90% 0 0)" : "oklch(10% 0 0)",
          background: theme === "dark" ? "oklch(20.5% 0 0)" : "oklch(95% 0 0)",
        }}
      >
        Loading...
      </div>
    );
  }

  console.log("showBackrefs ", currentBackrefs);

  return (
    <div
      style={{
        background: theme === "dark" ? "oklch(20.5% 0 0)" : "oklch(95% 0 0)",
        minHeight: "100vh",
      }}
    >
      <FileSelector
        availableFiles={AVAILABLE_FILES}
        selectedFile={selectedFile}
        onFileChange={handleFileChange}
        loading={loading}
        theme={theme}
      />

      <DevPanel
        devMode={devMode}
        setDevMode={setDevMode}
        theme={theme}
        setTheme={setTheme}
        showBackrefs={showBackrefs}
        setShowBackrefs={setShowBackrefs}
      />

      <div
        style={{
          padding: "20px",
          maxWidth: "690px",
          margin: "0 auto",
          color: theme === "dark" ? "oklch(90% 0 0)" : "oklch(10% 0 0)",
          display: "flex",
          justifyContent: "center",
          paddingTop: 160,
        }}
      >
        {testPage && (
          <JsonDocRenderer
            page={testPage}
            theme={theme}
            devMode={devMode}
            backrefs={showBackrefs ? currentBackrefs : []}
            components={{
              page_delimiter: (props) => {
                return <PageDelimiter {...props} />;
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
