#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const referenceDir = path.join(__dirname, "../reference_screenshots");
const referencePath = path.join(referenceDir, "notion_reference.png");

if (!fs.existsSync(referencePath)) {
  console.error("Reference screenshot not found:", referencePath);
  process.exit(1);
}

// Create split directory
const splitDir = path.join(referenceDir, "split");
if (!fs.existsSync(splitDir)) {
  fs.mkdirSync(splitDir, { recursive: true });
}

async function splitReference() {
  console.log("Splitting reference screenshot into 16:9 segments...");

  // First, get image dimensions using imagemagick identify
  const identify = spawn("identify", ["-format", "%wx%h", referencePath]);

  let dimensions = "";
  identify.stdout.on("data", (data) => {
    dimensions += data.toString();
  });

  await new Promise((resolve, reject) => {
    identify.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Failed to get image dimensions: ${code}`));
      }
    });
  });

  const [width, height] = dimensions.trim().split("x").map(Number);
  console.log(`Reference image dimensions: ${width}x${height}`);

  // Calculate 16:9 aspect ratio segments
  const segmentWidth = 1200; // Standard width
  const segmentHeight = Math.floor(segmentWidth * (9 / 16)); // 675px for 16:9 ratio
  const segments = Math.ceil(height / segmentHeight);

  console.log(
    `Creating ${segments} segments with 16:9 aspect ratio (${segmentWidth}x${segmentHeight})`
  );

  for (let i = 0; i < segments; i++) {
    const startY = i * segmentHeight;
    const actualHeight = Math.min(segmentHeight, height - startY);

    console.log(
      `Creating segment ${i + 1}/${segments} (y: ${startY}, height: ${actualHeight})`
    );

    const outputPath = path.join(
      splitDir,
      `reference_segment_${String(i + 1).padStart(2, "0")}.png`
    );

    // Use imagemagick convert to crop the image
    const convert = spawn("convert", [
      referencePath,
      "-crop",
      `${segmentWidth}x${actualHeight}+0+${startY}`,
      "+repage",
      outputPath,
    ]);

    await new Promise((resolve, reject) => {
      convert.on("close", (code) => {
        if (code === 0) {
          console.log(`Saved: ${outputPath}`);
          resolve();
        } else {
          reject(new Error(`Failed to create segment ${i + 1}: ${code}`));
        }
      });
    });
  }

  console.log("Reference screenshot split completed");
}

splitReference().catch(console.error);
