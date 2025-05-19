import { Block, BlockBase, Page } from './generated';

function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object';
}

export function loadBlock(data: any): Block {
  if (!isObject(data) || data.object !== 'block') {
    throw new Error('Invalid block object');
  }
  const base: BlockBase = data as BlockBase;
  if (base.children) {
    base.children = base.children.map(loadBlock);
  }
  return base as Block;
}

export function loadPage(data: any): Page {
  if (!isObject(data) || data.object !== 'page') {
    throw new Error('Invalid page object');
  }
  const page = data as Page;
  page.children = (page.children || []).map(loadBlock);
  return page;
}

export function loadJsondoc(data: any): Page | Block | Block[] {
  if (Array.isArray(data)) {
    return data.map(loadBlock);
  }
  if (data.object === 'page') {
    return loadPage(data);
  }
  if (data.object === 'block') {
    return loadBlock(data);
  }
  throw new Error("Invalid JSON-DOC object");
}

export function jsondocDumpJson(obj: Page | Block | Block[]): string {
  return JSON.stringify(obj, null, 2);
}
