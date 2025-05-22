#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const JSON5 = require('json5');

const PORT = 3000;

// Get file path from command line argument
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: npm run view <path-to-json-doc-file>');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

// Load the JSON-DOC file
let pageData;
try {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  pageData = JSON5.parse(fileContent);
  console.log(`Loaded JSON-DOC file: ${filePath}`);
  console.log(`Page title: ${pageData.properties?.title?.title?.[0]?.plain_text || 'Untitled'}`);
  console.log(`Blocks: ${pageData.children?.length || 0}`);
} catch (error) {
  console.error(`Error reading file: ${error.message}`);
  process.exit(1);
}

// Read the CSS file
const cssPath = path.join(__dirname, '../src/renderer/styles.css');
const cssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf-8') : '';

// Read component files
const richTextRendererPath = path.join(__dirname, 'components/RichTextRenderer.js');
const blockRendererPath = path.join(__dirname, 'components/BlockRenderer.js');
const jsonDocRendererPath = path.join(__dirname, 'components/JsonDocRenderer.js');

const richTextRendererCode = fs.readFileSync(richTextRendererPath, 'utf-8');
const blockRendererCode = fs.readFileSync(blockRendererPath, 'utf-8');
const jsonDocRendererCode = fs.readFileSync(jsonDocRendererPath, 'utf-8');

// Create HTML template
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSON-DOC Viewer - ${pageData.properties?.title?.title?.[0]?.plain_text || 'Untitled'}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
    }

    .viewer-header {
      background: #f7f6f3;
      border-bottom: 1px solid #e9e9e9;
      padding: 16px 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif;
      font-size: 14px;
      color: #37352f;
    }

    .viewer-header h1 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .viewer-header p {
      margin: 4px 0 0 0;
      opacity: 0.7;
    }

    ${cssContent}
  </style>
</head>
<body>
  <div class="viewer-header">
    <h1>JSON-DOC Viewer</h1>
    <p>File: ${path.basename(filePath)} • Blocks: ${pageData.children?.length || 0}</p>
  </div>

  <div id="json-doc-container"></div>

  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script>
    // Page data
    const pageData = ${JSON.stringify(pageData, null, 2)};

    // Global list counters for numbering
    const listCounters = new Map();

    // Component code
    ${richTextRendererCode}
    ${blockRendererCode}
    ${jsonDocRendererCode}

    // Render the page
    const container = document.getElementById('json-doc-container');
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(JsonDocRenderer, { page: pageData }));
  </script>
</body>
</html>
`;

// Create HTTP server
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlTemplate);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start server
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\nJSON-DOC Viewer started at ${url}`);
  console.log('Press Ctrl+C to stop the server\n');

  // Try to open browser automatically
  const open = (url) => {
    const { exec } = require('child_process');
    const start = process.platform === 'darwin' ? 'open' :
                  process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${start} ${url}`);
  };

  try {
    open(url);
  } catch (err) {
    console.log('Could not automatically open browser. Please visit the URL manually.');
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\nShutting down JSON-DOC Viewer...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});