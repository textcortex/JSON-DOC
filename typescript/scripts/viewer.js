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
    
    // Simple React components for rendering
    const { createElement: h, Fragment } = React;
    
    // Rich Text Renderer
    function RichTextRenderer({ richText }) {
      if (!richText || richText.length === 0) {
        return null;
      }
      
      return richText.map((item, index) => {
        const key = \`rich-text-\${index}\`;
        
        if (item?.type === 'text') {
          const { text, annotations, href } = item;
          const content = text?.content || '';
          
          if (!content) return null;
          
          let element = h('span', { key }, content);
          
          // Apply text formatting
          if (annotations) {
            if (annotations.bold) {
              element = h('strong', { key }, element);
            }
            if (annotations.italic) {
              element = h('em', { key }, element);
            }
            if (annotations.strikethrough) {
              element = h('del', { key }, element);
            }
            if (annotations.underline) {
              element = h('u', { key }, element);
            }
            if (annotations.code) {
              element = h('code', { key, className: 'notion-inline-code' }, content);
            }
            if (annotations.color && annotations.color !== 'default') {
              element = h('span', { 
                key, 
                className: \`notion-text-color-\${annotations.color}\` 
              }, element);
            }
          }
          
          // Handle links
          if (href) {
            element = h('a', {
              key,
              href,
              className: 'notion-link',
              target: '_blank',
              rel: 'noopener noreferrer'
            }, element);
          }
          
          return element;
        }
        
        if (item?.type === 'equation') {
          return h('span', {
            key,
            className: 'notion-equation'
          }, item.equation?.expression || '');
        }
        
        return null;
      });
    }
    
    // Block Renderer
    function BlockRenderer({ block, depth = 0 }) {
      const commonProps = { block, depth };
      
      // Render children helper
      function renderChildren() {
        if (!block.children || block.children.length === 0) return null;
        
        return h('div', {
          className: 'notion-block-children',
          style: { marginLeft: \`\${depth * 24}px\` }
        }, block.children.map((child, index) => 
          h(BlockRenderer, { 
            key: child.id || index, 
            block: child, 
            depth: depth + 1 
          })
        ));
      }
      
      // Paragraph block
      if (block?.type === 'paragraph') {
        return h('div', {
          className: 'notion-selectable notion-text-block',
          'data-block-id': block.id
        }, [
          h('div', { key: 'content' }, [
            h('div', { key: 'inner' }, [
              h('div', { 
                key: 'text',
                className: 'notranslate' 
              }, h(RichTextRenderer, { richText: block.paragraph?.rich_text || [] }))
            ])
          ]),
          renderChildren()
        ]);
      }
      
      // Heading blocks
      if (block?.type === 'heading_1') {
        const headingData = block.heading_1;
        return h('div', {
          className: 'notion-selectable notion-header-block',
          'data-block-id': block.id
        }, [
          h('div', { key: 'content' }, [
            h('h2', { 
              key: 'heading',
              className: 'notranslate' 
            }, h(RichTextRenderer, { richText: headingData?.rich_text || [] }))
          ]),
          renderChildren()
        ]);
      }
      
      if (block?.type === 'heading_2') {
        const headingData = block.heading_2;
        return h('div', {
          className: 'notion-selectable notion-sub_header-block',
          'data-block-id': block.id
        }, [
          h('div', { key: 'content' }, [
            h('h3', { 
              key: 'heading',
              className: 'notranslate' 
            }, h(RichTextRenderer, { richText: headingData?.rich_text || [] }))
          ]),
          renderChildren()
        ]);
      }
      
      if (block?.type === 'heading_3') {
        const headingData = block.heading_3;
        return h('div', {
          className: 'notion-selectable notion-sub_header-block',
          'data-block-id': block.id
        }, [
          h('div', { key: 'content' }, [
            h('h4', { 
              key: 'heading',
              className: 'notranslate' 
            }, h(RichTextRenderer, { richText: headingData?.rich_text || [] }))
          ]),
          renderChildren()
        ]);
      }
      
      // List items
      if (block?.type === 'bulleted_list_item') {
        const listData = block.bulleted_list_item;
        return h('div', {
          className: 'notion-selectable notion-bulleted_list-block',
          'data-block-id': block.id
        }, [
          h('div', { key: 'content' }, [
            h('div', { 
              key: 'bullet',
              className: 'notion-list-item-box-left' 
            }, h('div', { className: 'pseudoBefore' }, '•')),
            h('div', { key: 'text' }, [
              h('div', { key: 'inner' }, [
                h('div', { 
                  key: 'content',
                  className: 'notranslate' 
                }, h(RichTextRenderer, { richText: listData?.rich_text || [] }))
              ])
            ])
          ]),
          renderChildren()
        ]);
      }
      
      if (block?.type === 'numbered_list_item') {
        const listData = block.numbered_list_item;
        return h('div', {
          className: 'notion-selectable notion-numbered_list-block',
          'data-block-id': block.id
        }, [
          h('div', { key: 'content' }, [
            h('div', { 
              key: 'number',
              className: 'notion-list-item-box-left' 
            }, h('span', { className: 'pseudoBefore' }, '1.')),
            h('div', { key: 'text' }, [
              h('div', { key: 'inner' }, [
                h('div', { 
                  key: 'content',
                  className: 'notranslate' 
                }, h(RichTextRenderer, { richText: listData?.rich_text || [] }))
              ])
            ])
          ]),
          renderChildren()
        ]);
      }
      
      // Code block
      if (block?.type === 'code') {
        const codeData = block.code;
        return h('div', {
          className: 'notion-selectable notion-code-block',
          'data-block-id': block.id
        }, [
          h('div', { key: 'content' }, [
            h('div', { key: 'wrapper', role: 'figure' }, [
              h('div', { key: 'lang' }, [
                h('div', { key: 'inner' }, [
                  h('div', { key: 'text' }, codeData?.language || 'Plain Text')
                ])
              ]),
              h('div', { key: 'code' }, [
                h('div', { 
                  key: 'lines',
                  className: 'line-numbers notion-code-block' 
                }, [
                  h('div', { 
                    key: 'content',
                    className: 'notranslate' 
                  }, h(RichTextRenderer, { richText: codeData?.rich_text || [] }))
                ])
              ])
            ])
          ]),
          renderChildren()
        ]);
      }
      
      // Quote block
      if (block?.type === 'quote') {
        const quoteData = block.quote;
        return h('div', {
          className: 'notion-selectable notion-quote-block',
          'data-block-id': block.id
        }, [
          h('blockquote', { key: 'quote' }, [
            h('div', { key: 'content' }, [
              h('div', { 
                key: 'text',
                className: 'notranslate' 
              }, h(RichTextRenderer, { richText: quoteData?.rich_text || [] }))
            ])
          ]),
          renderChildren()
        ]);
      }
      
      // Divider block
      if (block?.type === 'divider') {
        return h('div', {
          className: 'notion-selectable notion-divider-block',
          'data-block-id': block.id
        }, [
          h('div', { 
            key: 'divider',
            className: 'notion-cursor-default' 
          }, [
            h('div', { key: 'line', role: 'separator' })
          ]),
          renderChildren()
        ]);
      }
      
      // Fallback for unsupported block types
      return h('div', {
        className: 'notion-unsupported-block',
        'data-block-type': block?.type
      }, [
        h('span', { key: 'text' }, \`Unsupported block type: \${block?.type}\`),
        renderChildren()
      ]);
    }
    
    // Main JSON-DOC Renderer
    function JsonDocRenderer({ page }) {
      return h('div', { className: 'json-doc-renderer' }, [
        h('div', { key: 'page', className: 'json-doc-page' }, [
          // Page icon
          page.icon && h('div', {
            key: 'icon',
            className: 'json-doc-page-icon'
          }, page.icon.type === 'emoji' && page.icon.emoji),
          
          // Page title
          page.properties?.title && h('h1', {
            key: 'title',
            className: 'json-doc-page-title'
          }, page.properties.title.title?.[0]?.plain_text || 'Untitled'),
          
          // Page children blocks
          page.children && page.children.length > 0 && h('div', {
            key: 'content',
            className: 'json-doc-page-content'
          }, page.children.map((block, index) => 
            h(BlockRenderer, { 
              key: block.id || index, 
              block, 
              depth: 0 
            })
          ))
        ])
      ]);
    }
    
    // Render the page
    const container = document.getElementById('json-doc-container');
    const root = ReactDOM.createRoot(container);
    root.render(h(JsonDocRenderer, { page: pageData }));
  </script>
</body>
</html>
`;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
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
  console.log(`\\nJSON-DOC Viewer started at ${url}`);
  console.log('Press Ctrl+C to stop the server\\n');
  
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
  console.log('\\nShutting down JSON-DOC Viewer...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});