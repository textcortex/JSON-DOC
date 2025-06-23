import type { FileOption } from "../constants/files";

interface FileSelectorProps {
  availableFiles: FileOption[];
  selectedFile: FileOption;
  onFileChange: (file: FileOption) => void;
  loading: boolean;
  theme: "light" | "dark";
}

const FileSelector = ({
  availableFiles,
  selectedFile,
  onFileChange,
  loading,
  theme,
}: FileSelectorProps) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: theme === "dark" ? "oklch(25% 0 0)" : "oklch(90% 0 0)",
        borderBottom: `1px solid ${
          theme === "dark" ? "oklch(30% 0 0)" : "oklch(80% 0 0)"
        }`,
        padding: "16px 20px",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: "690px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <label
          htmlFor="file-selector"
          style={{
            color: theme === "dark" ? "oklch(90% 0 0)" : "oklch(10% 0 0)",
            fontWeight: "500",
            fontSize: "14px",
          }}
        >
          Select Document:
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <select
            id="file-selector"
            value={selectedFile.path}
            onChange={(e) => {
              const selectedPath = e.target.value;
              const file = availableFiles.find((f) => f.path === selectedPath);
              if (file) {
                onFileChange(file);
              }
            }}
            disabled={loading}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: `1px solid ${
                theme === "dark" ? "oklch(40% 0 0)" : "oklch(70% 0 0)"
              }`,
              background: theme === "dark" ? "oklch(30% 0 0)" : "oklch(95% 0 0)",
              color: theme === "dark" ? "oklch(90% 0 0)" : "oklch(10% 0 0)",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              minWidth: "200px",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor =
                theme === "dark" ? "oklch(60% 0.2 250)" : "oklch(50% 0.2 250)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor =
                theme === "dark" ? "oklch(40% 0 0)" : "oklch(70% 0 0)";
            }}
          >
            {availableFiles.map((file) => (
              <option key={file.path} value={file.path}>
                {file.name}
              </option>
            ))}
          </select>
          {loading && (
            <span
              style={{
                color: theme === "dark" ? "oklch(70% 0 0)" : "oklch(40% 0 0)",
                fontSize: "14px",
              }}
            >
              Loading...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileSelector;
