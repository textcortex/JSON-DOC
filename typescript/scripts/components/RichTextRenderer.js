// Rich Text Renderer Component
function RichTextRenderer({ richText }) {
  if (!richText || richText.length === 0) {
    return null;
  }

  return richText.map((item, index) => {
    const key = `rich-text-${index}`;

    if (item?.type === 'text') {
      const { text, annotations, href } = item;
      const content = text?.content || '';

      if (!content) return null;

      let element = React.createElement('span', { key }, content);

      // Apply text formatting
      if (annotations) {
        if (annotations.bold) {
          element = React.createElement('strong', { key }, element);
        }
        if (annotations.italic) {
          element = React.createElement('em', { key }, element);
        }
        if (annotations.strikethrough) {
          element = React.createElement('del', { key }, element);
        }
        if (annotations.underline) {
          element = React.createElement('u', { key }, element);
        }
        if (annotations.code) {
          element = React.createElement('code', { key, className: 'notion-inline-code' }, content);
        }
        if (annotations.color && annotations.color !== 'default') {
          element = React.createElement('span', {
            key,
            className: `notion-text-color-${annotations.color}`
          }, element);
        }
      }

      // Handle links
      if (href) {
        element = React.createElement('a', {
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
      return React.createElement('span', {
        key,
        className: 'notion-equation'
      }, item.equation?.expression || '');
    }

    return null;
  });
}

// Export for use in other files
if (typeof module !== 'undefined') {
  module.exports = RichTextRenderer;
}