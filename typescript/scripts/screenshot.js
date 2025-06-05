#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { exec, spawn } = require("child_process");

// Check if we have puppeteer installed
const puppeteerPath = path.join(
  __dirname,
  "../node_modules/puppeteer/package.json"
);
if (!fs.existsSync(puppeteerPath)) {
  console.log("Installing puppeteer for screenshots...");
  exec(
    "npm install puppeteer",
    { cwd: path.join(__dirname, "..") },
    (error) => {
      if (error) {
        console.error("Failed to install puppeteer:", error);
        process.exit(1);
      }
      console.log("Puppeteer installed, restarting script...");
      // Restart this script
      spawn(process.argv[0], process.argv.slice(1), { stdio: "inherit" });
    }
  );
  return;
}

const puppeteer = require("puppeteer");

const PORT = Math.floor(Math.random() * 1000) + 3000;
const SCREENSHOT_DIR = path.join(__dirname, "../screenshots");

// Get file path from command line argument
const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: node screenshot.js <path-to-json-doc-file>");
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function takeScreenshots() {
  console.log("Starting screenshot process...");

  // Modify the viewer script to use our PORT
  const viewerScript = path.join(__dirname, "viewer.js");
  let viewerContent = fs.readFileSync(viewerScript, "utf-8");
  viewerContent = viewerContent.replace(
    /const PORT = [^;]+;/,
    `const PORT = ${PORT};`
  );

  // Write temporary viewer script
  const tempViewerScript = path.join(__dirname, "viewer-temp.js");
  fs.writeFileSync(tempViewerScript, viewerContent);

  const serverProcess = spawn("node", [tempViewerScript, filePath], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  // Wait for server to start
  await new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => {
      reject(new Error("Server failed to start within timeout"));
    }, 15000);

    serverProcess.stdout.on("data", (data) => {
      output += data.toString();
      console.log("Server output:", data.toString());
      if (output.includes("JSON-DOC Viewer started")) {
        clearTimeout(timeout);
        console.log("Server started successfully");
        setTimeout(resolve, 2000); // Give server extra time to be ready
      }
    });

    serverProcess.stderr.on("data", (data) => {
      console.error("Server error:", data.toString());
    });
  });

  console.log("Launching browser...");

  // Launch puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Set viewport to capture full content
  await page.setViewport({
    width: 1200,
    height: 800,
    deviceScaleFactor: 1,
  });

  const url = `http://localhost:${PORT}`;
  console.log(`Navigating to ${url}...`);

  try {
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for React to render
    await page.waitForSelector("#json-doc-container", { timeout: 10000 });
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Additional wait for content to settle

    console.log("Taking screenshots...");

    // Get the full page height
    const bodyHandle = await page.$("body");
    const boundingBox = await bodyHandle.boundingBox();
    const fullHeight = boundingBox.height;

    console.log(`Full page height: ${fullHeight}px`);

    // Calculate 16:9 aspect ratio segments
    const viewportWidth = 1200;
    const segmentHeight = Math.floor(viewportWidth * (9 / 16)); // 675px for 16:9 ratio
    const segments = Math.ceil(fullHeight / segmentHeight);

    console.log(
      `Creating ${segments} screenshot segments with 16:9 aspect ratio (${viewportWidth}x${segmentHeight})`
    );

    for (let i = 0; i < segments; i++) {
      const startY = i * segmentHeight;
      const actualHeight = Math.min(segmentHeight, fullHeight - startY);

      console.log(
        `Capturing segment ${i + 1}/${segments} (y: ${startY}, height: ${actualHeight})`
      );

      const screenshotPath = path.join(
        SCREENSHOT_DIR,
        `page_segment_${String(i + 1).padStart(2, "0")}.png`
      );

      await page.screenshot({
        path: screenshotPath,
        clip: {
          x: 0,
          y: startY,
          width: viewportWidth,
          height: actualHeight,
        },
      });

      console.log(`Saved: ${screenshotPath}`);
    }

    // Also take a full page screenshot for reference
    const fullScreenshotPath = path.join(SCREENSHOT_DIR, "page_full.png");
    await page.screenshot({
      path: fullScreenshotPath,
      fullPage: true,
    });
    console.log(`Saved full page: ${fullScreenshotPath}`);
  } catch (error) {
    console.error("Error taking screenshots:", error);
  } finally {
    await browser.close();
    serverProcess.kill();

    // Clean up temporary file
    const tempViewerScript = path.join(__dirname, "viewer-temp.js");
    if (fs.existsSync(tempViewerScript)) {
      fs.unlinkSync(tempViewerScript);
    }

    console.log("Screenshot process completed");
  }
}

// Handle process cleanup
process.on("SIGINT", () => {
  console.log("\nShutting down screenshot script...");
  process.exit(0);
});

takeScreenshots().catch(console.error);
