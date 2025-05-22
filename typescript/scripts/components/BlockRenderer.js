// Import RichTextRenderer
// (Will be loaded in browser context)

// Global state for list numbering
const listCounters = new Map();

function BlockRenderer({ block, depth = 0, listIndex = null, parentType = null }) {
  const h = React.createElement;

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
  const blockHandlers = {
    paragraph: () => h('div', {
      className: 'notion-selectable notion-text-block',
      'data-block-id': block.id
    }, [
      h(RichTextRenderer, { 
        key: 'content',
        richText: block.paragraph?.rich_text || [] 
      }),
      renderChildren()
    ]),

    heading_1: () => h('div', {
      className: 'notion-selectable notion-header-block',
      'data-block-id': block.id
    }, [
      h('h2', {
        key: 'heading',
        className: 'notranslate'
      }, h(RichTextRenderer, { richText: block.heading_1?.rich_text || [] })),
      renderChildren()
    ]),

    heading_2: () => h('div', {
      className: 'notion-selectable notion-sub_header-block',
      'data-block-id': block.id
    }, [
      h('h3', {
        key: 'heading',
        className: 'notranslate'
      }, h(RichTextRenderer, { richText: block.heading_2?.rich_text || [] })),
      renderChildren()
    ]),

    heading_3: () => h('div', {
      className: 'notion-selectable notion-sub_header-block',
      'data-block-id': block.id
    }, [
      h('h4', {
        key: 'heading',
        className: 'notranslate'
      }, h(RichTextRenderer, { richText: block.heading_3?.rich_text || [] })),
      renderChildren()
    ]),

    bulleted_list_item: () => h('div', {
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
    ]),

    numbered_list_item: () => {
      const listNumber = listIndex || 1;
      return h('div', {
        className: 'notion-selectable notion-numbered_list-block',
        'data-block-id': block.id
      }, [
        h('div', { key: 'content', className: 'notion-list-content' }, [
          h('div', {
            key: 'number',
            className: 'notion-list-item-marker'
          }, `${listNumber}.`),
          h('div', { 
            key: 'text',
            className: 'notion-list-item-text'
          }, h(RichTextRenderer, { richText: block.numbered_list_item?.rich_text || [] }))
        ]),
        renderChildren()
      ]);
    },

    to_do: () => {
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
    },

    code: () => h('div', {
      className: 'notion-selectable notion-code-block',
      'data-block-id': block.id
    }, [
      h('div', { key: 'language' }, block.code?.language || 'Plain Text'),
      h('pre', { key: 'code' }, 
        h('code', {}, h(RichTextRenderer, { richText: block.code?.rich_text || [] }))
      ),
      renderChildren()
    ]),

    quote: () => h('div', {
      className: 'notion-selectable notion-quote-block',
      'data-block-id': block.id
    }, [
      h('blockquote', { key: 'quote' },
        h(RichTextRenderer, { richText: block.quote?.rich_text || [] })
      ),
      renderChildren()
    ]),

    divider: () => h('div', {
      className: 'notion-selectable notion-divider-block',
      'data-block-id': block.id
    }, [
      h('hr', { key: 'divider' }),
      renderChildren()
    ]),

    image: () => {
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
    },

    equation: () => h('div', {
      className: 'notion-selectable notion-equation-block',
      'data-block-id': block.id
    }, [
      h('div', { 
        key: 'equation',
        className: 'notion-equation-content'
      }, block.equation?.expression || ''),
      renderChildren()
    ]),

    table: () => h('div', {
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
    ]),

    table_row: () => {
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
    },

    column_list: () => h('div', {
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
    ]),

    column: () => parentType === 'column_list' ? h('div', {
      className: 'notion-column',
      'data-block-id': block.id
    }, [renderChildren()]) : null,

    toggle: () => h('div', {
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
    ])
  };

  const handler = blockHandlers[block?.type];
  if (handler) {
    return handler();
  }

  // Fallback for unsupported block types
  return h('div', {
    className: 'notion-unsupported-block',
    'data-block-type': block?.type
  }, [
    h('span', { key: 'text' }, `Unsupported block type: ${block?.type}`),
    renderChildren()
  ]);
}

// Export for use in other files
if (typeof module !== 'undefined') {
  module.exports = BlockRenderer;
}