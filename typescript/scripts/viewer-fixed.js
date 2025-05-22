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

    // Global state for list numbering
    const listCounters = new Map();

    // React createElement shorthand
    const h = React.createElement;

    // Rich Text Renderer Component
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

    // Block Renderer Component
    function BlockRenderer({ block, depth = 0, listIndex = null, parentType = null }) {
      if (!block) return null;

      // Render children helper
      function renderChildren() {
        if (!block.children || block.children.length === 0) return null;

        return h('div', {
          className: 'notion-block-children'
        }, block.children.map((child, index) => {
          // Calculate list index for numbered lists
          let childListIndex = null;
          if (child?.type === 'numbered_list_item') {
            const listId = block.id || 'default';
            if (!listCounters.has(listId)) {
              listCounters.set(listId, 0);
            }
            listCounters.set(listId, listCounters.get(listId) + 1);
            childListIndex = listCounters.get(listId);
          }
          
          return h(BlockRenderer, {
            key: child.id || index,
            block: child,
            depth: depth + 1,
            listIndex: childListIndex,
            parentType: block?.type
          });
        }));
      }

      // Block type handlers
      switch (block?.type) {
        case 'paragraph':
          return h('div', {
            className: 'notion-selectable notion-text-block',
            'data-block-id': block.id
          }, [
            h(RichTextRenderer, { 
              key: 'content',
              richText: block.paragraph?.rich_text || [] 
            }),
            renderChildren()
          ]);

        case 'heading_1':
          return h('div', {
            className: 'notion-selectable notion-header-block',
            'data-block-id': block.id
          }, [
            h('h2', {
              key: 'heading',
              className: 'notranslate'
            }, h(RichTextRenderer, { richText: block.heading_1?.rich_text || [] })),
            renderChildren()
          ]);

        case 'heading_2':
          return h('div', {
            className: 'notion-selectable notion-sub_header-block',
            'data-block-id': block.id
          }, [
            h('h3', {
              key: 'heading',
              className: 'notranslate'
            }, h(RichTextRenderer, { richText: block.heading_2?.rich_text || [] })),
            renderChildren()
          ]);

        case 'heading_3':
          return h('div', {
            className: 'notion-selectable notion-sub_header-block',
            'data-block-id': block.id
          }, [
            h('h4', {
              key: 'heading',
              className: 'notranslate'
            }, h(RichTextRenderer, { richText: block.heading_3?.rich_text || [] })),
            renderChildren()
          ]);

        case 'bulleted_list_item':
          return h('div', {
            className: 'notion-selectable notion-bulleted_list-block',
            'data-block-id': block.id
          }, [
            h('div', { key: 'content', className: 'notion-list-content' }, [
              h('div', {
                key: 'bullet',
                className: 'notion-list-item-marker'
              }, '•'),
              h('div', { 
                key: 'text',
                className: 'notion-list-item-text'
              }, h(RichTextRenderer, { richText: block.bulleted_list_item?.rich_text || [] }))
            ]),
            renderChildren()
          ]);

        case 'numbered_list_item':
          const listNumber = listIndex || 1;
          return h('div', {
            className: 'notion-selectable notion-numbered_list-block',
            'data-block-id': block.id
          }, [
            h('div', { key: 'content', className: 'notion-list-content' }, [
              h('div', {
                key: 'number',
                className: 'notion-list-item-marker'
              }, \`\${listNumber}.\`),
              h('div', { 
                key: 'text',
                className: 'notion-list-item-text'
              }, h(RichTextRenderer, { richText: block.numbered_list_item?.rich_text || [] }))
            ]),
            renderChildren()
          ]);

        case 'to_do':
          const isChecked = block.to_do?.checked || false;
          return h('div', {
            className: 'notion-selectable notion-to_do-block',
            'data-block-id': block.id
          }, [
            h('div', { key: 'content', className: 'notion-list-content' }, [
              h('div', {
                key: 'checkbox',
                className: 'notion-list-item-marker'
              }, [
                h('input', {
                  type: 'checkbox',
                  checked: isChecked,
                  readOnly: true,
                  className: 'notion-checkbox'
                })
              ]),
              h('div', { 
                key: 'text',
                className: 'notion-list-item-text'
              }, h(RichTextRenderer, { richText: block.to_do?.rich_text || [] }))
            ]),
            renderChildren()
          ]);

        case 'code':
          return h('div', {
            className: 'notion-selectable notion-code-block',
            'data-block-id': block.id
          }, [
            h('div', { key: 'language' }, block.code?.language || 'Plain Text'),
            h('pre', { key: 'code' }, 
              h('code', {}, h(RichTextRenderer, { richText: block.code?.rich_text || [] }))
            ),
            renderChildren()
          ]);

        case 'quote':
          return h('div', {
            className: 'notion-selectable notion-quote-block',
            'data-block-id': block.id
          }, [
            h('blockquote', { key: 'quote' },
              h(RichTextRenderer, { richText: block.quote?.rich_text || [] })
            ),
            renderChildren()
          ]);

        case 'divider':
          return h('div', {
            className: 'notion-selectable notion-divider-block',
            'data-block-id': block.id
          }, [
            h('hr', { key: 'divider' }),
            renderChildren()
          ]);

        case 'image':
          const imageData = block.image;
          return h('div', {
            className: 'notion-selectable notion-image-block',
            'data-block-id': block.id
          }, [
            h('div', { key: 'image-placeholder', className: 'notion-image-placeholder' }),
            imageData?.caption && h('div', { 
              key: 'caption',
              className: 'notion-image-caption'
            }, h(RichTextRenderer, { richText: imageData.caption })),
            renderChildren()
          ]);

        case 'equation':
          return h('div', {
            className: 'notion-selectable notion-equation-block',
            'data-block-id': block.id
          }, [
            h('div', { 
              key: 'equation',
              className: 'notion-equation-content'
            }, block.equation?.expression || ''),
            renderChildren()
          ]);

        case 'table':
          return h('div', {
            className: 'notion-selectable notion-table-block',
            'data-block-id': block.id
          }, [
            h('table', { key: 'table' }, [
              block.table?.has_column_header && h('thead', { key: 'thead' },
                block.children?.slice(0, 1).map((child, index) =>
                  h(BlockRenderer, {
                    key: child.id || index,
                    block: child,
                    depth: depth + 1,
                    parentType: 'table-header'
                  })
                )
              ),
              h('tbody', { key: 'tbody' },
                block.children?.slice(block.table?.has_column_header ? 1 : 0).map((child, index) =>
                  h(BlockRenderer, {
                    key: child.id || index,
                    block: child,
                    depth: depth + 1,
                    parentType: 'table-body'
                  })
                )
              )
            ])
          ]);

        case 'table_row':
          const isHeader = parentType === 'table-header';
          const CellTag = isHeader ? 'th' : 'td';
          
          return h('tr', {
            className: 'notion-table-row',
            'data-block-id': block.id
          }, block.table_row?.cells?.map((cell, cellIndex) =>
            h(CellTag, {
              key: cellIndex,
              scope: isHeader ? 'col' : undefined,
              className: 'notion-table-cell'
            }, h(RichTextRenderer, { richText: cell || [] }))
          ));

        case 'column_list':
          return h('div', {
            className: 'notion-selectable notion-column_list-block',
            'data-block-id': block.id
          }, [
            h('div', {
              key: 'columns',
              className: 'notion-column-list'
            }, block.children?.map((child, index) => {
              if (child?.type === 'column') {
                return h(BlockRenderer, {
                  key: child.id || index,
                  block: child,
                  depth: depth + 1,
                  parentType: 'column_list'
                });
              }
              return null;
            }).filter(Boolean))
          ]);

        case 'column':
          return parentType === 'column_list' ? h('div', {
            className: 'notion-column',
            'data-block-id': block.id
          }, [renderChildren()]) : null;

        case 'toggle':
          return h('div', {
            className: 'notion-selectable notion-toggle-block',
            'data-block-id': block.id
          }, [
            h('div', { key: 'content', className: 'notion-toggle-content' }, [
              h('span', { key: 'arrow', className: 'notion-toggle-arrow' }, '▶'),
              h('span', { 
                key: 'text',
                className: 'notion-toggle-text'
              }, h(RichTextRenderer, { richText: block.toggle?.rich_text || [] }))
            ]),
            renderChildren()
          ]);

        default:
          // Fallback for unsupported block types
          return h('div', {
            className: 'notion-unsupported-block',
            'data-block-type': block?.type
          }, [
            h('span', { key: 'text' }, \`Unsupported block type: \${block?.type}\`),
            renderChildren()
          ]);
      }
    }

    // Main JSON-DOC Renderer Component
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
          }, page.children.map((block, index) => {
            // Reset list counter for numbered lists at page level
            let listIndex = null;
            if (block?.type === 'numbered_list_item') {
              const listId = 'page-level';
              if (!listCounters.has(listId)) {
                listCounters.set(listId, 0);
              }
              listCounters.set(listId, listCounters.get(listId) + 1);
              listIndex = listCounters.get(listId);
            }
            
            return h(BlockRenderer, {
              key: block.id || index,
              block,
              depth: 0,
              listIndex,
              parentType: 'page'
            });
          }))
        ])
      ]);
    }

    // Render the page
    try {
      const container = document.getElementById('json-doc-container');
      if (container) {
        const root = ReactDOM.createRoot(container);
        root.render(h(JsonDocRenderer, { page: pageData }));
        console.log('Rendered successfully');
      } else {
        console.error('Container not found');
      }
    } catch (error) {
      console.error('Rendering error:', error);
    }
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