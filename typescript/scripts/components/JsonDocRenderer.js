// Main JSON-DOC Renderer Component
function JsonDocRenderer({ page }) {
  const h = React.createElement;

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

// Export for use in other files
if (typeof module !== 'undefined') {
  module.exports = JsonDocRenderer;
}