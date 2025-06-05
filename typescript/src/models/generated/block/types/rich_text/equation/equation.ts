export interface RichTextEquation {
  type: "equation";
  equation: {
    expression: string;
  };
  annotations: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
  plain_text: string;
  href: string | null;
}
