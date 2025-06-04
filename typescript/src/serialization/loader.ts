import {
  BlockType,
  FileType,
  Page,
  RichText,
  RichTextEquation,
  RichTextText,
  RichTextType,
  ExternalFile,
  FileFile,
  ObjectType,
  Block,
  isPage,
  isBlock,
  ParagraphBlock,
  BulletedListItemBlock,
  NumberedListItemBlock,
  CodeBlock,
  ColumnBlock,
  ColumnListBlock,
  DividerBlock,
  EquationBlock,
  Heading1Block,
  Heading2Block,
  Heading3Block,
  ImageBlock,
  QuoteBlock,
  TableBlock,
  TableRowBlock,
  ToDoBlock,
  ToggleBlock,
  isExternalFile,
  isFileFile,
} from "../models/generated";
import { deepClone, getNestedValue, loadJson, setNestedValue } from "../utils/json";

// Block type to factory function mapping
const BLOCK_TYPE_FACTORIES: Record<BlockType, (obj: any) => Block> = {
  [BlockType.Paragraph]: createParagraphBlock,
  [BlockType.ToDo]: createToDoBlock,
  [BlockType.BulletedListItem]: createBulletedListItemBlock,
  [BlockType.NumberedListItem]: createNumberedListItemBlock,
  [BlockType.Code]: createCodeBlock,
  [BlockType.Column]: createColumnBlock,
  [BlockType.ColumnList]: createColumnListBlock,
  [BlockType.Divider]: createDividerBlock,
  [BlockType.Equation]: createEquationBlock,
  [BlockType.Heading1]: createHeading1Block,
  [BlockType.Heading2]: createHeading2Block,
  [BlockType.Heading3]: createHeading3Block,
  [BlockType.Image]: createImageBlock,
  [BlockType.Quote]: createQuoteBlock,
  [BlockType.Table]: createTableBlock,
  [BlockType.TableRow]: createTableRowBlock,
  [BlockType.Toggle]: createToggleBlock,
};

// Rich text type to factory function mapping
const RICH_TEXT_FACTORIES: Record<RichTextType, (obj: any) => RichText> = {
  [RichTextType.Text]: createRichTextText,
  [RichTextType.Equation]: createRichTextEquation,
};

// File type to factory function mapping
const FILE_FACTORIES: Record<FileType, (obj: any) => ExternalFile | FileFile> = {
  [FileType.File]: createFileFile,
  [FileType.External]: createExternalFile,
};

// Other rich text fields in specific block types
const OTHER_RICH_TEXT_FIELDS: Partial<Record<BlockType, string[]>> = {
  [BlockType.Code]: [".code.caption"],
  [BlockType.Image]: [".image.caption"],
};

// Nested rich text fields in specific block types
const NESTED_RICH_TEXT_FIELDS: Partial<Record<BlockType, string[]>> = {
  [BlockType.TableRow]: [".table_row.cells"],
};

/**
 * Load a rich text object
 * @param obj Rich text object
 * @returns Processed rich text object
 */
export function loadRichText(obj: any): RichText {
  obj = deepClone(obj);

  // Extract and validate rich text type
  const currentType = obj.type as RichTextType;

  // Find the corresponding rich text factory
  const richTextFactory = RICH_TEXT_FACTORIES[currentType];
  if (!richTextFactory) {
    throw new Error(`Unsupported rich text type: ${currentType}`);
  }

  // Create the rich text with all properties
  return richTextFactory(obj);
}

/**
 * Load an image file
 * @param obj Image file object
 * @returns Processed file object
 */
export function loadImage(obj: any): ExternalFile | FileFile {
  obj = deepClone(obj);

  // Extract and validate file type
  const currentType = obj.type as FileType;

  // Find the corresponding file factory
  const fileFactory = FILE_FACTORIES[currentType];
  if (!fileFactory) {
    throw new Error(`Unsupported file type: ${currentType}`);
  }

  // Create the file with all properties
  return fileFactory(obj);
}

/**
 * Load a block object
 * @param obj Block object
 * @returns Processed block object
 */
export function loadBlock(obj: any): Block {
  obj = deepClone(obj);

  // Extract children before processing
  const children = obj.children;
  delete obj.children;

  // Extract and validate block type
  const currentType = obj.type as BlockType;

  // Find the corresponding block factory
  const blockFactory = BLOCK_TYPE_FACTORIES[currentType];
  if (!blockFactory) {
    throw new Error(`Unsupported block type: ${currentType}`);
  }

  // Process children recursively if present
  if (children) {
    obj.children = children.map((child: any) => loadBlock(child));
  }

  // Process rich text
  // First get sub object field
  const objFieldKey = currentType;
  const objField = obj[objFieldKey] || {};

  // Check if there is a rich text field
  if (objField.rich_text) {
    // Must be a list
    if (!Array.isArray(objField.rich_text)) {
      throw new Error(
        `Rich text field must be a list: ${JSON.stringify(objField.rich_text)}`
      );
    }

    // Load rich text field
    objField.rich_text = objField.rich_text.map((richText: any) =>
      loadRichText(richText)
    );
  }

  // Process caption field
  if (currentType in OTHER_RICH_TEXT_FIELDS) {
    const rtFields = OTHER_RICH_TEXT_FIELDS[currentType] || [];
    for (const rtField of rtFields) {
      const val = getNestedValue(obj, rtField);

      if (!val) continue;

      if (!Array.isArray(val)) {
        throw new Error(`Field ${rtField} must be a list: ${JSON.stringify(val)}`);
      }

      const newVal = val.map((richText: any) => loadRichText(richText));
      setNestedValue(obj, rtField, newVal);
    }
  }

  // Process cell field
  if (currentType in NESTED_RICH_TEXT_FIELDS) {
    const rtFields = NESTED_RICH_TEXT_FIELDS[currentType] || [];
    for (const rtField of rtFields) {
      const val = getNestedValue(obj, rtField);

      if (!val) continue;

      if (!Array.isArray(val)) {
        throw new Error(`Field ${rtField} must be a list: ${JSON.stringify(val)}`);
      }

      const newVal: RichText[][] = [];
      for (const row of val) {
        const newRow = row.map((richText: any) => loadRichText(richText));
        newVal.push(newRow);
      }
      setNestedValue(obj, rtField, newVal);
    }
  }

  // Process image field
  if (currentType === BlockType.Image) {
    if (obj.image?.file) {
      const val = obj.image.file;
      const fileObj = loadImage({ type: FileType.File, file: val });

      if (isFileFile(fileObj)) {
        obj.image.file = fileObj.file;
      }
    } else if (obj.image?.external) {
      const val = obj.image.external;
      const externalObj = loadImage({ type: FileType.External, external: val });

      if (isExternalFile(externalObj)) {
        obj.image.external = externalObj.external;
      }
    }
  }

  // Create the block with all properties
  return blockFactory(obj);
}

/**
 * Load a page object
 * @param obj Page object
 * @returns Processed page object
 */
export function loadPage(obj: any): Page {
  obj = deepClone(obj);

  // Process children
  if (obj.children && Array.isArray(obj.children)) {
    obj.children = obj.children.map((child: any) => loadBlock(child));
  }

  return obj as Page;
}

/**
 * Load a JSON-DOC object
 * @param obj JSON-DOC object
 * @returns Processed JSON-DOC object (Page or Block or Block[])
 */
export function loadJsonDoc(obj: any): Page | Block | Block[] {
  obj = loadJson(obj);

  if (Array.isArray(obj)) {
    return obj.map((block) => loadJsonDoc(block) as Block) as Block[];
  }

  const objectType = obj.object;
  if (objectType === ObjectType.Page || objectType === "page") {
    return loadPage(obj);
  } else if (objectType === ObjectType.Block || objectType === "block") {
    return loadBlock(obj);
  } else {
    throw new Error(
      `Invalid object type: ${objectType}. Must be either 'page' or 'block'`
    );
  }
}

/**
 * Serialize a JSON-DOC object to a JSON string
 * @param obj JSON-DOC object
 * @param indent Indentation level
 * @returns JSON string
 */
export function jsonDocDumpJson(
  obj: Block | Block[] | Page,
  indent?: number
): string {
  if (Array.isArray(obj)) {
    // Serialize array of blocks
    return JSON.stringify(obj, null, indent);
  } else {
    // Serialize single object
    return JSON.stringify(obj, null, indent);
  }
}

// Factory functions for different block types
function createParagraphBlock(obj: any): ParagraphBlock {
  return { ...obj, object: "block" } as ParagraphBlock;
}

function createToDoBlock(obj: any): ToDoBlock {
  return { ...obj, object: "block" } as ToDoBlock;
}

function createBulletedListItemBlock(obj: any): BulletedListItemBlock {
  return { ...obj, object: "block" } as BulletedListItemBlock;
}

function createNumberedListItemBlock(obj: any): NumberedListItemBlock {
  return { ...obj, object: "block" } as NumberedListItemBlock;
}

function createCodeBlock(obj: any): CodeBlock {
  return { ...obj, object: "block" } as CodeBlock;
}

function createColumnBlock(obj: any): ColumnBlock {
  return { ...obj, object: "block" } as ColumnBlock;
}

function createColumnListBlock(obj: any): ColumnListBlock {
  return { ...obj, object: "block" } as ColumnListBlock;
}

function createDividerBlock(obj: any): DividerBlock {
  return { ...obj, object: "block" } as DividerBlock;
}

function createEquationBlock(obj: any): EquationBlock {
  return { ...obj, object: "block" } as EquationBlock;
}

function createHeading1Block(obj: any): Heading1Block {
  return { ...obj, object: "block" } as Heading1Block;
}

function createHeading2Block(obj: any): Heading2Block {
  return { ...obj, object: "block" } as Heading2Block;
}

function createHeading3Block(obj: any): Heading3Block {
  return { ...obj, object: "block" } as Heading3Block;
}

function createImageBlock(obj: any): ImageBlock {
  return { ...obj, object: "block" } as ImageBlock;
}

function createQuoteBlock(obj: any): QuoteBlock {
  return { ...obj, object: "block" } as QuoteBlock;
}

function createTableBlock(obj: any): TableBlock {
  return { ...obj, object: "block" } as TableBlock;
}

function createTableRowBlock(obj: any): TableRowBlock {
  return { ...obj, object: "block" } as TableRowBlock;
}

function createToggleBlock(obj: any): ToggleBlock {
  return { ...obj, object: "block" } as ToggleBlock;
}

// Factory functions for rich text types
function createRichTextText(obj: any): RichTextText {
  return obj as RichTextText;
}

function createRichTextEquation(obj: any): RichTextEquation {
  return obj as RichTextEquation;
}

// Factory functions for file types
function createExternalFile(obj: any): ExternalFile {
  return obj as ExternalFile;
}

function createFileFile(obj: any): FileFile {
  return obj as FileFile;
}
