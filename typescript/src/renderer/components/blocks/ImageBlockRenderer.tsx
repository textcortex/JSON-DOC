import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { useRenderer } from "../../context/RendererContext";
import { RichTextRenderer } from "../RichTextRenderer";
import { BlockRenderer } from "../BlockRenderer";

const ImagePlaceholderIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

interface ImageBlockRendererProps extends React.HTMLAttributes<HTMLDivElement> {
  block: any;
  depth?: number;
  components?: React.ComponentProps<typeof BlockRenderer>["components"];
}

export const ImageBlockRenderer: React.FC<ImageBlockRendererProps> = ({
  block,
  depth = 0,
  className,
  components,
  ...props
}) => {
  const { resolveImageUrl } = useRenderer();
  const imageData = block.image;
  const [url, setUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showFullCaption, setShowFullCaption] = useState<boolean>(false);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const getImageUrl = () => {
    if (imageData?.type === "external") {
      return imageData.external?.url;
    } else if (imageData?.type === "file") {
      return imageData.file?.url;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  useEffect(() => {
    let cancelled = false;

    const imageUrlEffect = async () => {
      if (resolveImageUrl && imageUrl) {
        setIsLoading(true);
        setHasError(false);
        try {
          const url_ = await resolveImageUrl(imageUrl);
          if (!cancelled) {
            setUrl(url_);
            setIsLoading(false);
          }
        } catch (error) {
          if (!cancelled) {
            setHasError(true);
            setIsLoading(false);
            console.error("Failed to resolve image URL:", error);
          }
        }
      }
    };

    if (inView && imageUrl) {
      imageUrlEffect();
    }

    return () => {
      cancelled = true;
    };
  }, [inView, imageUrl, resolveImageUrl]);

  return (
    <div
      {...props}
      className={`notion-selectable notion-image-block${className ? ` ${className}` : ""}`}
      data-block-id={block.id}
    >
      <div className="notion-selectable-container">
        <div role="figure">
          <div className="notion-cursor-default" ref={ref}>
            {imageUrl && (
              <div className="notion-image-container">
                {(isLoading || (!url && resolveImageUrl)) && !hasError && (
                  <div className="image-loading-placeholder">
                    <div className="image-loading-content">
                      <div className="image-loading-icon">
                        <ImagePlaceholderIcon />
                      </div>
                      <div className="image-loading-text">Loading image...</div>
                    </div>
                  </div>
                )}
                {hasError && (
                  <div className="image-error-placeholder">
                    <div className="image-error-text">Failed to load image</div>
                  </div>
                )}
                {!isLoading && !hasError && (url || !resolveImageUrl) && (
                  <img
                    alt={imageData?.caption ? "" : "Image"}
                    src={url || imageUrl}
                    onError={() => setHasError(true)}
                  />
                )}
              </div>
            )}
          </div>
          {imageData?.caption && imageData.caption.length > 0 && (
            <div className="notranslate">
              <figcaption className="notion-image-caption">
                <div
                  className={`caption-content ${!showFullCaption ? "caption-truncated" : "caption-expanded"}`}
                >
                  <RichTextRenderer richText={imageData.caption} />
                </div>
                <button
                  className="caption-toggle-btn"
                  onClick={() => setShowFullCaption(!showFullCaption)}
                >
                  {showFullCaption ? "Show less" : "Show  more"}
                </button>
              </figcaption>
            </div>
          )}
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
