export type Color =
  | 'blue'
  | 'blue_background'
  | 'brown'
  | 'brown_background'
  | 'default'
  | 'gray'
  | 'gray_background'
  | 'green'
  | 'green_background'
  | 'orange'
  | 'orange_background'
  | 'yellow'
  | 'yellow_background'
  | 'pink'
  | 'pink_background'
  | 'purple'
  | 'purple_background'
  | 'red'
  | 'red_background';

export interface Annotations {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: string;
}

export interface Parent {
  type: string;
  block_id?: string;
  page_id?: string;
}

export interface CreatedBy {
  object: 'user';
  id: string;
}

export interface LastEditedBy {
  object: 'user';
  id: string;
}

export interface RichTextText {
  type: 'text';
  text: {
    content: string;
    link?: { url: string } | null;
  };
  annotations: Annotations;
  plain_text: string;
  href?: string | null;
}

export type RichText = RichTextText; // Extend with other rich text types as needed

export interface Paragraph {
  rich_text: RichText[];
  color?: Color;
}

export interface ToDo {
  rich_text: RichText[];
  checked?: boolean;
  color?: Color;
}

export interface ColumnList {}
export interface Column {}
export interface Toggle {
  rich_text: RichText[];
  color?: Color;
}

export type BlockType =
  | 'paragraph'
  | 'to_do'
  | 'bulleted_list_item'
  | 'numbered_list_item'
  | 'code'
  | 'column'
  | 'column_list'
  | 'divider'
  | 'equation'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'image'
  | 'quote'
  | 'table'
  | 'table_row'
  | 'toggle';

export interface BlockBase {
  object: 'block';
  id: string;
  parent?: Parent;
  type: BlockType;
  created_time: string;
  created_by?: CreatedBy;
  last_edited_time?: string;
  last_edited_by?: LastEditedBy;
  archived?: boolean;
  in_trash?: boolean;
  has_children?: boolean;
  children?: Block[];
  metadata?: Record<string, unknown>;
}

export interface ParagraphBlock extends BlockBase {
  type: 'paragraph';
  paragraph: Paragraph;
}

export interface ToDoBlock extends BlockBase {
  type: 'to_do';
  to_do: ToDo;
}

export interface ColumnBlock extends BlockBase {
  type: 'column';
  column: Column;
}

export interface ColumnListBlock extends BlockBase {
  type: 'column_list';
  column_list: ColumnList;
}

export interface ToggleBlock extends BlockBase {
  type: 'toggle';
  toggle: Toggle;
}

export type Block =
  | ParagraphBlock
  | ToDoBlock
  | ColumnBlock
  | ColumnListBlock
  | ToggleBlock;

export interface TitleProperty {
  id?: string;
  type: 'title';
  title?: RichTextText[];
}

export interface Properties {
  title?: TitleProperty;
}

export interface Page {
  object: 'page';
  id: string;
  parent?: Parent;
  created_time: string;
  created_by?: CreatedBy;
  last_edited_time?: string;
  last_edited_by?: LastEditedBy;
  icon?: {
    type: 'emoji';
    emoji: string;
  };
  archived?: boolean;
  in_trash?: boolean;
  properties: Properties;
  children: Block[];
}
