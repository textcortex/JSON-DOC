// Rich Text Renderer utility
export function renderRichText(richText, createElement) {
  if (!richText || richText.length === 0) {
    return null;
  }

  return richText.map((item, index) => {
    const key = `rich-text-${index}`;

    if (item?.type === "text") {
      const { text, annotations, href } = item;
      const content = text?.content || "";

      if (!content) return null;

      let element = createElement("span", { key }, content);

      // Apply text formatting
      if (annotations) {
        if (annotations.bold) {
          element = createElement("strong", { key }, element);
        }
        if (annotations.italic) {
          element = createElement("em", { key }, element);
        }
        if (annotations.strikethrough) {
          element = createElement("del", { key }, element);
        }
        if (annotations.underline) {
          element = createElement("u", { key }, element);
        }
        if (annotations.code) {
          element = createElement(
            "code",
            { key, className: "notion-inline-code" },
            content,
          );
        }
        if (annotations.color && annotations.color !== "default") {
          element = createElement(
            "span",
            {
              key,
              className: `notion-text-color-${annotations.color}`,
            },
            element,
          );
        }
      }

      // Handle links
      if (href) {
        element = createElement(
          "a",
          {
            key,
            href,
            className: "notion-link",
            target: "_blank",
            rel: "noopener noreferrer",
          },
          element,
        );
      }

      return element;
    }

    if (item?.type === "equation") {
      return createElement("span", {
        key,
        className: "notion-equation",
        dangerouslySetInnerHTML: {
          __html: window.katex
            ? window.katex.renderToString(item.equation?.expression || "", {
                throwOnError: false,
                displayMode: false,
              })
            : item.equation?.expression || "",
        },
      });
    }

    return null;
  });
}
