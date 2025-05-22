import React from "react";
import { RichTextRenderer } from "../RichTextRenderer";
import { BlockRenderer } from "../BlockRenderer";

interface ImageBlockRendererProps {
  block: any;
  depth?: number;
}

export const ImageBlockRenderer: React.FC<ImageBlockRendererProps> = ({
  block,
  depth = 0,
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
      className="notion-selectable notion-image-block"
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
            />
          ))}
        </div>
      )}
    </div>
  );
};
