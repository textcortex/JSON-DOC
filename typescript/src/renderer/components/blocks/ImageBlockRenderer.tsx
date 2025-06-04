import React from "react";

import { RichTextRenderer } from "../RichTextRenderer";
import { BlockRenderer } from "../BlockRenderer";

interface ImageBlockRendererProps extends React.HTMLAttributes<HTMLDivElement> {
  block: any;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>['components'];
}

export const ImageBlockRenderer: React.FC<ImageBlockRendererProps> = ({
  block,
  depth = 0,
  className,
  components,
  ...props
}) => {
  const imageData = block.image;

  const getImageUrl = () => {
    if (imageData?.type === "external") {
      return imageData.external?.url;
    } else if (imageData?.type === "file") {
      return imageData.file?.url;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <div
      {...props}
      className={`notion-selectable notion-image-block${className ? ` ${className}` : ''}`}
      data-block-id={block.id}
    >
      <div>
        <div className="notion-selectable-container">
          <div>
            <div>
              <div role="figure">
                <div>
                  <div className="notion-cursor-default">
                    <div>
                      <div>
                        <div>
                          {imageUrl && (
                            <img
                              alt=""
                              src={imageUrl}
                              style={{ maxWidth: "100%", height: "auto" }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Caption */}
                {imageData?.caption && imageData.caption.length > 0 && (
                  <div>
                    <div className="notranslate">
                      <RichTextRenderer richText={imageData.caption} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render children blocks recursively */}
      {block.children && block.children.length > 0 && (
        <div
          className="notion-block-children"
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {block.children.map((child: any, index: number) => (
            <BlockRenderer
              key={child.id || index}
              block={child}
              depth={depth + 1}
              components={components}
            />
          ))}
        </div>
      )}
    </div>
  );
};
