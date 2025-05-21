/**
 * Generated TypeScript interfaces for JSON-DOC
 * Based on the example files in the schema directory
 */

// Base types
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject { [key: string]: JsonValue }
export type JsonArray = JsonValue[];

// Object types
export enum ObjectType {
  Page = 'page',
  Block = 'block',
  User = 'user',
}

// Block types
export enum BlockType {
  Paragraph = 'paragraph',
  ToDo = 'to_do',
  BulletedListItem = 'bulleted_list_item',
  NumberedListItem = 'numbered_list_item',
  Code = 'code',
  Column = 'column',
  ColumnList = 'column_list',
  Divider = 'divider',
  Equation = 'equation',
  Heading1 = 'heading_1',
  Heading2 = 'heading_2',
  Heading3 = 'heading_3',
  Image = 'image',
  Quote = 'quote',
  Table = 'table',
  TableRow = 'table_row',
  Toggle = 'toggle',
}

// Rich text types
export enum RichTextType {
  Text = 'text',
  Equation = 'equation',
}

// File types
export enum FileType {
  File = 'file',
  External = 'external',
}

// Parent types
export enum ParentType {
  DatabaseId = 'database_id',
  PageId = 'page_id',
  Workspace = 'workspace',
  BlockId = 'block_id',
}

// User interface
export interface User {
  object: ObjectType.User;
  id: string;
}

// Parent interface
export interface Parent {
  type: ParentType;
  [key: string]: string | ParentType | boolean;
}

// Annotations interface
export interface Annotations {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

// RichText interfaces
export interface RichTextBase {
  type: RichTextType;
  annotations?: Annotations;
  plain_text?: string;
  href?: string | null;
}

export interface RichTextText extends RichTextBase {
  type: RichTextType.Text;
  text: {
    content: string;
    link?: { url: string } | null;
  };
}

export interface RichTextEquation extends RichTextBase {
  type: RichTextType.Equation;
  equation: {
    expression: string;
  };
}

export type RichText = RichTextText | RichTextEquation;

// File interfaces
export interface FileBase {
  type: FileType;
}

export interface ExternalFile extends FileBase {
  type: FileType.External;
  external: {
    url: string;
  };
}

export interface FileFile extends FileBase {
  type: FileType.File;
  file: {
    url: string;
    expiry_time?: string;
  };
}

export type File = ExternalFile | FileFile;

// Block content interfaces
export interface ParagraphContent {
  rich_text: RichText[];
  color?: string;
}

export interface HeadingContent {
  rich_text: RichText[];
  color?: string;
  is_toggleable?: boolean;
}

export interface BulletedListItemContent {
  rich_text: RichText[];
  color?: string;
}

export interface NumberedListItemContent {
  rich_text: RichText[];
  color?: string;
}

export interface ToDoContent {
  rich_text: RichText[];
  checked?: boolean;
  color?: string;
}

export interface CodeContent {
  rich_text: RichText[];
  caption?: RichText[];
  language?: string;
}

export interface QuoteContent {
  rich_text: RichText[];
  color?: string;
}

export interface EquationContent {
  expression: string;
}

export interface DividerContent {
}

export interface TableContent {
  table_width: number;
  has_column_header?: boolean;
  has_row_header?: boolean;
}

export interface TableRowContent {
  cells: RichText[][];
}

export interface ToggleContent {
  rich_text: RichText[];
  color?: string;
}

export interface ColumnContent {
}

export interface ColumnListContent {
}

export interface ImageContent {
  caption?: RichText[];
  file?: FileFile;
  external?: ExternalFile;
}

// Block type interfaces
export interface ParagraphBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.Paragraph;
  paragraph: ParagraphContent;
  children?: Block[];
}

export interface Heading1Block {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.Heading1;
  heading_1: HeadingContent;
  children?: Block[];
}

export interface Heading2Block {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.Heading2;
  heading_2: HeadingContent;
  children?: Block[];
}

export interface Heading3Block {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.Heading3;
  heading_3: HeadingContent;
  children?: Block[];
}

export interface BulletedListItemBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.BulletedListItem;
  bulleted_list_item: BulletedListItemContent;
  children?: Block[];
}

export interface NumberedListItemBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.NumberedListItem;
  numbered_list_item: NumberedListItemContent;
  children?: Block[];
}

export interface ToDoBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.ToDo;
  to_do: ToDoContent;
  children?: Block[];
}

export interface CodeBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.Code;
  code: CodeContent;
  children?: Block[];
}

export interface QuoteBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.Quote;
  quote: QuoteContent;
  children?: Block[];
}

export interface EquationBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.Equation;
  equation: EquationContent;
  children?: Block[];
}

export interface DividerBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.Divider;
  divider: DividerContent;
  children?: Block[];
}

export interface TableBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.Table;
  table: TableContent;
  children?: Block[];
}

export interface TableRowBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.TableRow;
  table_row: TableRowContent;
  children?: Block[];
}

export interface ToggleBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.Toggle;
  toggle: ToggleContent;
  children?: Block[];
}

export interface ColumnBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.Column;
  column: ColumnContent;
  children?: Block[];
}

export interface ColumnListBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.ColumnList;
  column_list: ColumnListContent;
  children?: Block[];
}

export interface ImageBlock {
  object: ObjectType.Block;
  id: string;
  parent?: Parent;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  has_children?: boolean;
  archived?: boolean;
  in_trash?: boolean;
  type: BlockType.Image;
  image: ImageContent;
  children?: Block[];
}

// Union type for all blocks
export type Block =
  | ParagraphBlock
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | BulletedListItemBlock
  | NumberedListItemBlock
  | ToDoBlock
  | CodeBlock
  | QuoteBlock
  | EquationBlock
  | DividerBlock
  | TableBlock
  | TableRowBlock
  | ToggleBlock
  | ColumnBlock
  | ColumnListBlock
  | ImageBlock;

// Page interface
export interface Page {
  object: ObjectType.Page;
  id: string;
  created_time?: string;
  last_edited_time?: string;
  created_by?: User;
  last_edited_by?: User;
  archived?: boolean;
  in_trash?: boolean;
  parent?: Parent;
  url?: string;
  properties?: JsonObject;
  children?: Block[];
}

// Type guards
export function isPage(obj: any): obj is Page {
  return obj && obj.object === ObjectType.Page;
}

export function isBlock(obj: any): obj is Block {
  return obj && obj.object === ObjectType.Block;
}

export function isRichTextText(obj: any): obj is RichTextText {
  return obj && obj.type === RichTextType.Text;
}

export function isRichTextEquation(obj: any): obj is RichTextEquation {
  return obj && obj.type === RichTextType.Equation;
}

export function isExternalFile(obj: any): obj is ExternalFile {
  return obj && obj.type === FileType.External;
}

export function isFileFile(obj: any): obj is FileFile {
  return obj && obj.type === FileType.File;
}