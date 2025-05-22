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

    /* Additional viewer-specific improvements */
    .notion-selectable + .notion-selectable {
      margin-top: 1px;
    }

    .notion-header-block,
    .notion-sub_header-block {
      margin: 16px 0 4px 0;
    }

    .notion-header-block:first-child,
    .notion-sub_header-block:first-child {
      margin-top: 0;
    }

    .pseudoHover.pseudoActive {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notion-toggle-block {
      display: flex;
      align-items: flex-start;
    }
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

    // Global state for list numbering
    const listCounters = new Map();
    
    // Block Renderer
    function BlockRenderer({ block, depth = 0, listIndex = null, parentType = null }) {
      const commonProps = { block, depth };

      // Render children helper
      function renderChildren() {
        if (!block.children || block.children.length === 0) return null;

        return h('div', {
          className: 'notion-block-children',
          style: { marginLeft: \`\${depth * 24}px\` }
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
        
        // Calculate proper list number
        let listNumber = 1;
        if (listIndex !== null) {
          listNumber = listIndex;
        } else {
          // Fallback: count previous numbered_list_item siblings
          const parent = arguments[0]?.parent; // This would need to be passed from parent
          listNumber = 1; // Default fallback
        }
        
        return h('div', {
          className: 'notion-selectable notion-numbered_list-block',
          'data-block-id': block.id
        }, [
          h('div', { key: 'content' }, [
            h('div', {
              key: 'number',
              className: 'notion-list-item-box-left'
            }, h('span', { className: 'pseudoBefore' }, \`\${listNumber}.\`)),
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

      // To-do block
      if (block?.type === 'to_do') {
        const todoData = block.to_do;
        const isChecked = todoData?.checked || false;

        return h('div', {
          className: 'notion-selectable notion-to_do-block',
          'data-block-id': block.id
        }, [
          h('div', { key: 'content' }, [
            h('div', {
              key: 'checkbox',
              className: 'notion-list-item-box-left'
            }, [
              h('div', {
                key: 'wrapper',
                className: 'pseudoHover pseudoActive'
              }, [
                h('div', {
                  key: 'icon',
                  'aria-hidden': 'true'
                }, [
                  h('svg', {
                    key: 'svg',
                    'aria-hidden': 'true',
                    className: isChecked ? 'check' : 'checkboxSquare',
                    role: 'graphics-symbol',
                    viewBox: '0 0 16 16',
                    style: { width: '16px', height: '16px' }
                  }, isChecked ?
                    h('path', {
                      key: 'checkmark',
                      d: 'M13.5 2.5l-7 7-3.5-3.5-1.5 1.5 5 5 8.5-8.5z',
                      fill: 'currentColor'
                    }) :
                    h('rect', {
                      key: 'square',
                      x: '2', y: '2', width: '12', height: '12',
                      fill: 'none', stroke: 'currentColor', strokeWidth: '1'
                    })
                  )
                ]),
                h('input', {
                  key: 'input',
                  type: 'checkbox',
                  checked: isChecked,
                  readOnly: true,
                  style: { position: 'absolute', opacity: 0, pointerEvents: 'none' }
                })
              ])
            ]),
            h('div', { key: 'text' }, [
              h('div', { key: 'inner' }, [
                h('div', {
                  key: 'content',
                  className: 'notranslate'
                }, h(RichTextRenderer, { richText: todoData?.rich_text || [] }))
              ])
            ])
          ]),
          renderChildren()
        ]);
      }

      // Table block
      if (block?.type === 'table') {
        const tableData = block.table;

        return h('div', {
          className: 'notion-selectable notion-table-block',
          'data-block-id': block.id
        }, [
          h('div', { key: 'content' }, [
            h('div', { key: 'wrapper' }, [
              h('div', {
                key: 'scroller',
                className: 'notion-scroller horizontal'
              }, [
                h('div', {
                  key: 'table-content',
                  className: 'notion-table-content'
                }, [
                  h('table', { key: 'table' }, [
                    tableData?.has_column_header && h('thead', { key: 'thead' },
                      block.children?.slice(0, 1).map((child, index) => {
                        if (child?.type === 'table_row') {
                          return h(BlockRenderer, {
                            key: child.id || index,
                            block: child,
                            depth: depth + 1,
                            parentType: 'table-header'
                          });
                        }
                        return null;
                      }).filter(Boolean)
                    ),
                    h('tbody', { key: 'tbody' },
                      block.children?.slice(tableData?.has_column_header ? 1 : 0).map((child, index) => {
                        if (child?.type === 'table_row') {
                          return h(BlockRenderer, {
                            key: child.id || index,
                            block: child,
                            depth: depth + 1,
                            parentType: 'table-body'
                          });
                        }
                        return null;
                      }).filter(Boolean)
                    )
                  ])
                ])
              ])
            ])
          ])
        ]);
      }

      // Image block
      if (block?.type === 'image') {
        const imageData = block.image;

        const getImageUrl = () => {
          if (imageData?.type === 'external') {
            return imageData.external?.url;
          } else if (imageData?.type === 'file') {
            return imageData.file?.url;
          }
          return null;
        };

        const imageUrl = getImageUrl();

        return h('div', {
          className: 'notion-selectable notion-image-block',
          'data-block-id': block.id
        }, [
          h('div', { key: 'content' }, [
            h('div', {
              key: 'container',
              className: 'notion-selectable-container'
            }, [
              h('div', { key: 'wrapper' }, [
                h('div', { key: 'inner' }, [
                  h('div', { key: 'figure', role: 'figure' }, [
                    h('div', { key: 'image-wrapper' }, [
                      h('div', {
                        key: 'cursor',
                        className: 'notion-cursor-default'
                      }, [
                        h('div', { key: 'image-container' }, [
                          h('div', { key: 'image-inner' }, [
                            h('div', { key: 'image-div' },
                              imageUrl ? [
                                h('img', {
                                  key: 'img',
                                  alt: '',
                                  src: imageUrl,
                                  style: { maxWidth: '100%', height: 'auto' },
                                  onError: () => {
                                    // If image fails to load, show placeholder
                                    event.target.style.display = 'none';
                                    event.target.nextSibling.style.display = 'block';
                                  }
                                }),
                                h('div', {
                                  key: 'fallback',
                                  style: {
                                    display: 'none',
                                    width: '300px',
                                    height: '200px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '8px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    margin: '10px 0'
                                  }
                                }, [
                                  h('div', {
                                    key: 'mountains',
                                    style: {
                                      position: 'absolute',
                                      bottom: '0',
                                      left: '0',
                                      right: '0',
                                      height: '60%',
                                      background: 'linear-gradient(to top, #2c3e50 0%, #3498db 70%)',
                                      clipPath: 'polygon(0 100%, 30% 60%, 60% 80%, 100% 50%, 100% 100%)'
                                    }
                                  }),
                                  h('div', {
                                    key: 'sun',
                                    style: {
                                      position: 'absolute',
                                      top: '20px',
                                      right: '30px',
                                      width: '40px',
                                      height: '40px',
                                      background: '#f1c40f',
                                      borderRadius: '50%',
                                      boxShadow: '0 0 20px rgba(241, 196, 15, 0.3)'
                                    }
                                  })
                                ])
                              ] : [
                                h('div', {
                                  key: 'placeholder',
                                  style: {
                                    width: '300px',
                                    height: '200px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '8px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    margin: '10px 0'
                                  }
                                }, [
                                  h('div', {
                                    key: 'mountains',
                                    style: {
                                      position: 'absolute',
                                      bottom: '0',
                                      left: '0',
                                      right: '0',
                                      height: '60%',
                                      background: 'linear-gradient(to top, #2c3e50 0%, #3498db 70%)',
                                      clipPath: 'polygon(0 100%, 30% 60%, 60% 80%, 100% 50%, 100% 100%)'
                                    }
                                  }),
                                  h('div', {
                                    key: 'sun',
                                    style: {
                                      position: 'absolute',
                                      top: '20px',
                                      right: '30px',
                                      width: '40px',
                                      height: '40px',
                                      background: '#f1c40f',
                                      borderRadius: '50%',
                                      boxShadow: '0 0 20px rgba(241, 196, 15, 0.3)'
                                    }
                                  })
                                ])
                              ]
                            )
                          ])
                        ])
                      ])
                    ]),
                    // Caption
                    imageData?.caption && imageData.caption.length > 0 && h('div', { key: 'caption' }, [
                      h('div', {
                        key: 'caption-text',
                        className: 'notranslate'
                      }, h(RichTextRenderer, { richText: imageData.caption }))
                    ])
                  ])
                ])
              ])
            ])
          ]),
          renderChildren()
        ]);
      }

      // Equation block
      if (block?.type === 'equation') {
        const equationData = block.equation;

        return h('div', {
          className: 'notion-selectable notion-equation-block',
          'data-block-id': block.id
        }, [
          h('div', { key: 'content' }, [
            h('div', {
              key: 'display',
              className: 'notion-equation-display'
            }, [
              h('div', {
                key: 'equation-content',
                className: 'notion-equation-content'
              }, equationData?.expression || '')
            ])
          ]),
          renderChildren()
        ]);
      }

      // Column list block
      if (block?.type === 'column_list') {
        return h('div', {
          className: 'notion-selectable notion-column_list-block',
          'data-block-id': block.id
        }, [
          h('div', {
            key: 'columns',
            className: 'notion-column-list',
            style: { display: 'flex', gap: '16px' }
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
      }

      // Column block (individual column) - only render if parent is column_list
      if (block?.type === 'column' && parentType === 'column_list') {
        return h('div', {
          className: 'notion-column',
          'data-block-id': block.id,
          style: { flex: 1, minWidth: 0 }
        }, [
          renderChildren()
        ]);
      }
      
      // Table row block
      if (block?.type === 'table_row') {
        const rowData = block.table_row;
        const isHeader = parentType === 'table-header';
        
        return h('tr', {
          className: 'notion-table-row',
          'data-block-id': block.id
        }, rowData?.cells?.map((cell, cellIndex) => {
          const CellTag = isHeader ? 'th' : 'td';
          return h(CellTag, {
            key: cellIndex,
            scope: isHeader ? 'col' : undefined
          }, [
            h('div', {
              key: 'cell',
              className: 'notion-table-cell'
            }, [
              h('div', {
                key: 'text',
                className: 'notion-table-cell-text notranslate'
              }, h(RichTextRenderer, { richText: cell || [] }))
            ])
          ]);
        }));
      }

      // Toggle block
      if (block?.type === 'toggle') {
        const toggleData = block.toggle;

        return h('div', {
          className: 'notion-selectable notion-toggle-block',
          'data-block-id': block.id
        }, [
          h('div', { key: 'content' }, [
            h('div', {
              key: 'arrow',
              className: 'notion-list-item-box-left'
            }, [
              h('div', {
                key: 'button',
                'aria-expanded': 'false',
                'aria-label': 'Open',
                role: 'button',
                tabIndex: 0,
                style: { cursor: 'pointer' }
              }, [
                h('svg', {
                  key: 'svg',
                  'aria-hidden': 'true',
                  className: 'arrowCaretDownFillSmall',
                  role: 'graphics-symbol',
                  viewBox: '0 0 16 16',
                  style: {
                    width: '16px',
                    height: '16px',
                    transform: 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }
                }, [
                  h('path', {
                    key: 'arrow-path',
                    d: 'M6 12l6-6H6z',
                    fill: 'currentColor'
                  })
                ])
              ])
            ]),
            h('div', { key: 'text' }, [
              h('div', { key: 'inner' }, [
                h('div', {
                  key: 'content',
                  className: 'notranslate'
                }, h(RichTextRenderer, { richText: toggleData?.rich_text || [] }))
              ])
            ])
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