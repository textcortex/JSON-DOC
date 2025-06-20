import React from "react";
import FloatingButton from "./FloatingButton";

interface DevPanelProps {
  devMode: boolean;
  setDevMode: (mode: boolean) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

const DevPanel: React.FC<DevPanelProps> = ({
  devMode,
  setDevMode,
  theme,
  setTheme,
}) => {
  return (
    <>
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
    </>
  );
};

export default DevPanel;
