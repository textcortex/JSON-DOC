import { ReactNode } from "react";

export interface JsonDocRendererProps {
  page: any;
  className?: string;
}

export interface BlockRendererProps {
  block: any;
  depth?: number;
}

export interface RichTextRendererProps {
  richText: any[];
}

export interface BlockComponentProps extends BlockRendererProps {
  children?: ReactNode;
}
