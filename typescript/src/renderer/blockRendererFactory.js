// Block Renderer Factory
import { getComponentForBlockType } from "./utils/blockMapping.js";
import { listCounter } from "./utils/listCounter.js";
import { renderRichText } from "./utils/richTextRenderer.js";

export function createBlockRenderer(createElement) {
  // Block component definitions
  const blockComponents = {
    ParagraphBlock: ({ block, renderChildren }) =>
      createElement(
        "div",
        {
          className: "notion-selectable notion-text-block",
          "data-block-id": block.id,
        },
        [
          renderRichText(block.paragraph?.rich_text || [], createElement),
          renderChildren(),
        ],
      ),

    Heading1Block: ({ block, renderChildren }) =>
      createElement(
        "div",
        {
          className: "notion-selectable notion-header-block",
          "data-block-id": block.id,
        },
        [
          createElement(
            "h2",
            {
              key: "heading",
              className: "notranslate",
            },
            renderRichText(block.heading_1?.rich_text || [], createElement),
          ),
          renderChildren(),
        ],
      ),

    Heading2Block: ({ block, renderChildren }) =>
      createElement(
        "div",
        {
          className: "notion-selectable notion-sub_header-block",
          "data-block-id": block.id,
        },
        [
          createElement(
            "h3",
            {
              key: "heading",
              className: "notranslate",
            },
            renderRichText(block.heading_2?.rich_text || [], createElement),
          ),
          renderChildren(),
        ],
      ),

    Heading3Block: ({ block, renderChildren }) =>
      createElement(
        "div",
        {
          className: "notion-selectable notion-sub_header-block",
          "data-block-id": block.id,
        },
        [
          createElement(
            "h4",
            {
              key: "heading",
              className: "notranslate",
            },
            renderRichText(block.heading_3?.rich_text || [], createElement),
          ),
          renderChildren(),
        ],
      ),

    BulletedListBlock: ({ block, renderChildren }) =>
      createElement(
        "div",
        {
          className: "notion-selectable notion-bulleted_list-block",
          "data-block-id": block.id,
        },
        [
          createElement(
            "div",
            { key: "content", className: "notion-list-content" },
            [
              createElement(
                "div",
                {
                  key: "bullet",
                  className: "notion-list-item-marker",
                },
                "•",
              ),
              createElement(
                "div",
                {
                  key: "text",
                  className: "notion-list-item-text",
                },
                renderRichText(
                  block.bulleted_list_item?.rich_text || [],
                  createElement,
                ),
              ),
            ],
          ),
          renderChildren(),
        ],
      ),

    NumberedListBlock: ({ block, renderChildren, listIndex }) => {
      const listNumber = listIndex || 1;
      return createElement(
        "div",
        {
          className: "notion-selectable notion-numbered_list-block",
          "data-block-id": block.id,
        },
        [
          createElement(
            "div",
            { key: "content", className: "notion-list-content" },
            [
              createElement(
                "div",
                {
                  key: "number",
                  className: "notion-list-item-marker",
                },
                `${listNumber}.`,
              ),
              createElement(
                "div",
                {
                  key: "text",
                  className: "notion-list-item-text",
                },
                renderRichText(
                  block.numbered_list_item?.rich_text || [],
                  createElement,
                ),
              ),
            ],
          ),
          renderChildren(),
        ],
      );
    },

    TodoBlock: ({ block, renderChildren }) => {
      const isChecked = block.to_do?.checked || false;
      return createElement(
        "div",
        {
          className: "notion-selectable notion-to_do-block",
          "data-block-id": block.id,
        },
        [
          createElement(
            "div",
            { key: "content", className: "notion-list-content" },
            [
              createElement(
                "div",
                {
                  key: "checkbox",
                  className: "notion-list-item-marker",
                },
                [
                  createElement("input", {
                    type: "checkbox",
                    checked: isChecked,
                    readOnly: true,
                    className: "notion-checkbox",
                  }),
                ],
              ),
              createElement(
                "div",
                {
                  key: "text",
                  className: "notion-list-item-text",
                },
                renderRichText(block.to_do?.rich_text || [], createElement),
              ),
            ],
          ),
          renderChildren(),
        ],
      );
    },

    CodeBlock: ({ block, renderChildren }) =>
      createElement(
        "div",
        {
          className: "notion-selectable notion-code-block",
          "data-block-id": block.id,
        },
        [
          createElement(
            "div",
            { key: "language" },
            block.code?.language || "Plain Text",
          ),
          createElement(
            "pre",
            { key: "code" },
            createElement(
              "code",
              {},
              renderRichText(block.code?.rich_text || [], createElement),
            ),
          ),
          renderChildren(),
        ],
      ),

    QuoteBlock: ({ block, renderChildren }) =>
      createElement(
        "div",
        {
          className: "notion-selectable notion-quote-block",
          "data-block-id": block.id,
        },
        [
          createElement(
            "blockquote",
            { key: "quote" },
            renderRichText(block.quote?.rich_text || [], createElement),
          ),
          renderChildren(),
        ],
      ),

    DividerBlock: ({ block, renderChildren }) =>
      createElement(
        "div",
        {
          className: "notion-selectable notion-divider-block",
          "data-block-id": block.id,
        },
        [createElement("hr", { key: "divider" }), renderChildren()],
      ),

    ImageBlock: ({ block, renderChildren }) => {
      const imageData = block.image;
      return createElement(
        "div",
        {
          className: "notion-selectable notion-image-block",
          "data-block-id": block.id,
        },
        [
          createElement("div", {
            key: "image-placeholder",
            className: "notion-image-placeholder",
          }),
          imageData?.caption &&
            createElement(
              "div",
              {
                key: "caption",
                className: "notion-image-caption",
              },
              renderRichText(imageData.caption, createElement),
            ),
          renderChildren(),
        ],
      );
    },

    EquationBlock: ({ block, renderChildren }) => {
      const expression = block.equation?.expression || "";
      return createElement(
        "div",
        {
          className: "notion-selectable notion-equation-block",
          "data-block-id": block.id,
        },
        [
          createElement("div", {
            key: "equation",
            className: "notion-equation-content",
            dangerouslySetInnerHTML: {
              __html: window.katex
                ? window.katex.renderToString(expression, {
                    throwOnError: false,
                    displayMode: true,
                  })
                : expression,
            },
          }),
          renderChildren(),
        ],
      );
    },

    TableBlock: ({ block, renderChildren, depth, renderBlock }) =>
      createElement(
        "div",
        {
          className: "notion-selectable notion-table-block",
          "data-block-id": block.id,
        },
        [
          createElement("table", { key: "table", className: "notion-table" }, [
            block.table?.has_column_header &&
              createElement(
                "thead",
                { key: "thead" },
                block.children
                  ?.slice(0, 1)
                  .map((child, index) =>
                    renderBlock(child, depth + 1, index, "table-header"),
                  ),
              ),
            createElement(
              "tbody",
              { key: "tbody" },
              block.children
                ?.slice(block.table?.has_column_header ? 1 : 0)
                .map((child, index) =>
                  renderBlock(child, depth + 1, index, "table-body"),
                ),
            ),
          ]),
        ],
      ),

    TableRowBlock: ({ block, parentType }) => {
      const isHeader = parentType === "table-header";
      const CellTag = isHeader ? "th" : "td";

      return createElement(
        "tr",
        {
          className: "notion-table-row",
          "data-block-id": block.id,
        },
        block.table_row?.cells?.map((cell, cellIndex) =>
          createElement(
            CellTag,
            {
              key: cellIndex,
              scope: isHeader ? "col" : undefined,
              className: "notion-table-cell",
            },
            renderRichText(cell || [], createElement),
          ),
        ),
      );
    },

    ColumnListBlock: ({ block, renderChildren, depth, renderBlock }) =>
      createElement(
        "div",
        {
          className: "notion-selectable notion-column_list-block",
          "data-block-id": block.id,
        },
        [
          createElement(
            "div",
            {
              key: "columns",
              className: "notion-column-list",
            },
            block.children
              ?.map((child, index) => {
                if (child?.type === "column") {
                  return renderBlock(child, depth + 1, index, "column_list");
                }
                return null;
              })
              .filter(Boolean),
          ),
        ],
      ),

    ColumnBlock: ({ block, renderChildren, parentType }) =>
      parentType === "column_list"
        ? createElement(
            "div",
            {
              className: "notion-column",
              "data-block-id": block.id,
            },
            [renderChildren()],
          )
        : null,

    ToggleBlock: ({ block, renderChildren }) =>
      createElement(
        "div",
        {
          className: "notion-selectable notion-toggle-block",
          "data-block-id": block.id,
        },
        [
          createElement(
            "div",
            { key: "content", className: "notion-toggle-content" },
            [
              createElement(
                "span",
                { key: "arrow", className: "notion-toggle-arrow" },
                "▶",
              ),
              createElement(
                "span",
                {
                  key: "text",
                  className: "notion-toggle-text",
                },
                renderRichText(block.toggle?.rich_text || [], createElement),
              ),
            ],
          ),
          renderChildren(),
        ],
      ),

    UnsupportedBlock: ({ block, renderChildren }) =>
      createElement(
        "div",
        {
          className: "notion-unsupported-block",
          "data-block-type": block?.type,
        },
        [
          createElement(
            "span",
            { key: "text" },
            `Unsupported block type: ${block?.type}`,
          ),
          renderChildren(),
        ],
      ),
  };

  // Main render function
  function renderBlock(block, depth = 0, index = 0, parentType = null) {
    if (!block) return null;

    const componentName = getComponentForBlockType(block.type);
    const component = blockComponents[componentName];

    if (!component) {
      console.warn(`No component found for block type: ${block.type}`);
      return blockComponents.UnsupportedBlock({
        block,
        renderChildren: () => null,
      });
    }

    // Calculate list index for numbered lists
    let listIndex = null;
    if (block.type === "numbered_list_item") {
      const listId =
        parentType === "page"
          ? "page-level"
          : block.parent?.block_id || "default";
      listIndex = listCounter.getNextNumber(listId);
    }

    // Render children helper
    function renderChildren() {
      if (!block.children || block.children.length === 0) return null;

      return createElement(
        "div",
        {
          className: "notion-block-children",
        },
        block.children.map((child, childIndex) =>
          renderBlock(child, depth + 1, childIndex, block.type),
        ),
      );
    }

    return component({
      block,
      renderChildren,
      listIndex,
      parentType,
      depth,
      renderBlock,
    });
  }

  return renderBlock;
}
