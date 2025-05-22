// Object types
export enum ObjectType {
  Block = "block",
  Page = "page",
}

// Block types
export enum BlockType {
  Paragraph = "paragraph",
  ToDo = "to_do",
  BulletedListItem = "bulleted_list_item",
  NumberedListItem = "numbered_list_item",
  Code = "code",
  Column = "column",
  ColumnList = "column_list",
  Divider = "divider",
  Equation = "equation",
  Heading1 = "heading_1",
  Heading2 = "heading_2",
  Heading3 = "heading_3",
  Image = "image",
  Quote = "quote",
  Table = "table",
  TableRow = "table_row",
  Toggle = "toggle",
}

// Rich text types
export enum RichTextType {
  Text = "text",
  Equation = "equation",
}

// File types
export enum FileType {
  External = "external",
  File = "file",
}

// Parent types
export enum ParentType {
  DatabaseId = "database_id",
  PageId = "page_id",
  Workspace = "workspace",
  BlockId = "block_id",
}

// Base types
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonArray = JsonValue[];

// Type guards
export function isBlock(obj: any): obj is any {
  return obj && obj.object === ObjectType.Block;
}
export function isPage(obj: any): obj is any {
  return obj && obj.object === ObjectType.Page;
}
export function isParagraphBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.Paragraph;
}
export function isToDoBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.ToDo;
}
export function isBulletedListItemBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.BulletedListItem;
}
export function isNumberedListItemBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.NumberedListItem;
}
export function isCodeBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.Code;
}
export function isColumnBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.Column;
}
export function isColumnListBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.ColumnList;
}
export function isDividerBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.Divider;
}
export function isEquationBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.Equation;
}
export function isHeading1Block(obj: any): obj is any {
  return obj && obj.type === BlockType.Heading1;
}
export function isHeading2Block(obj: any): obj is any {
  return obj && obj.type === BlockType.Heading2;
}
export function isHeading3Block(obj: any): obj is any {
  return obj && obj.type === BlockType.Heading3;
}
export function isImageBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.Image;
}
export function isQuoteBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.Quote;
}
export function isTableBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.Table;
}
export function isTableRowBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.TableRow;
}
export function isToggleBlock(obj: any): obj is any {
  return obj && obj.type === BlockType.Toggle;
}
export function isRichTextText(obj: any): obj is any {
  return obj && obj.type === RichTextType.Text;
}
export function isRichTextEquation(obj: any): obj is any {
  return obj && obj.type === RichTextType.Equation;
}
export function isExternalFile(obj: any): obj is any {
  return obj && obj.type === FileType.External;
}
export function isFileFile(obj: any): obj is any {
  return obj && obj.type === FileType.File;
}
