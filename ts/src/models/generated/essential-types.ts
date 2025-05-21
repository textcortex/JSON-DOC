
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

// Base types
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject { [key: string]: JsonValue }
export type JsonArray = JsonValue[];

// Type guards
export function isPage(obj: any): obj is any {
  return obj && obj.object === ObjectType.Page;
}

export function isBlock(obj: any): obj is any {
  return obj && obj.object === ObjectType.Block;
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
