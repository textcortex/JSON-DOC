import React from "react";
import { JsonDocRenderer } from "../JsonDocRenderer";

interface RendererTestProps {
  jsonDocData: any;
}

export const RendererTest: React.FC<RendererTestProps> = ({ jsonDocData }) => {
  try {
    return (
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1>JSON-DOC Renderer Test</h1>
        <JsonDocRenderer page={jsonDocData} />
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <h1>Error Loading JSON-DOC</h1>
        <pre>{String(error)}</pre>
        <details>
          <summary>Raw data</summary>
          <pre>{JSON.stringify(jsonDocData, null, 2)}</pre>
        </details>
      </div>
    );
  }
};
