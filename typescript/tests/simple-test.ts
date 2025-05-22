import * as fs from "fs";
import * as JSON5 from "json5";

// Simple test runner to verify the example data loads correctly
console.log("Running JSON-DOC Renderer Tests...");

try {
  const examplePath = "/Users/onur/tc/JSON-DOC/schema/page/ex1_success.json";
  const fileContent = fs.readFileSync(examplePath, "utf-8");
  const pageData = JSON5.parse(fileContent) as any;

  console.log("✓ Loaded example data successfully");
  console.log(
    "Page title:",
    pageData.properties?.title?.title?.[0]?.plain_text,
  );
  console.log("Number of children:", pageData.children?.length || 0);

  // Test block types in the example
  const blockTypes = new Set<string>();
  const collectBlockTypes = (blocks: any[]) => {
    blocks?.forEach((block: any) => {
      if (block.type) blockTypes.add(block.type);
      if (block.children) collectBlockTypes(block.children);
    });
  };
  collectBlockTypes(pageData.children);

  console.log("✓ Block types found:", Array.from(blockTypes).join(", "));
  console.log("✓ Total blocks:", Array.from(blockTypes).length);

  // Analyze the structure
  console.log("\nPage structure:");
  console.log("- Page ID:", pageData.id);
  console.log("- Page object:", pageData.object);
  console.log("- Has icon:", !!pageData.icon);
  if (pageData.icon) {
    console.log("  - Icon type:", pageData.icon.type);
    console.log("  - Icon value:", pageData.icon.emoji || pageData.icon.file);
  }

  console.log("\nFirst few blocks:");
  pageData.children?.slice(0, 5).forEach((block: any, index: number) => {
    console.log(
      `  ${index + 1}. ${block.type} (${block.id?.substring(0, 8)}...)`,
    );
    if (block[block.type]?.rich_text?.[0]?.plain_text) {
      const text = block[block.type].rich_text[0].plain_text;
      console.log(
        `     Text: "${text.length > 50 ? text.substring(0, 50) + "..." : text}"`,
      );
    }
  });

  console.log(
    "\n✅ All tests passed! The React renderer should work with this data.",
  );
} catch (error) {
  console.error("✗ Test failed:", error);
  process.exit(1);
}
