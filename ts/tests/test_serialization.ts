declare var __dirname: string;
declare var require: any;
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadPage, jsondocDumpJson } = require('../src/loader');

function loadJsonFile(filePath: string): any {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const cleaned = raw
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('//'))
    .join('\n');
  return JSON.parse(cleaned);
}

function removeNulls(obj: any): any {
  if (Array.isArray(obj)) return obj.map(removeNulls);
  if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null) newObj[k] = removeNulls(v);
    }
    return newObj;
  }
  return obj;
}

function sortKeys(value: any): any {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    const sorted: any = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortKeys((value as any)[key]);
    }
    return sorted;
  }
  return value;
}

const pagePath = path.join(__dirname, '../../../schema/page/ex1_success.json');
const content = loadJsonFile(pagePath);
const page = loadPage(JSON.parse(JSON.stringify(content)));
const serialized = JSON.parse(jsondocDumpJson(page));

const canonicalOriginal = sortKeys(removeNulls(content));
const canonicalSerialized = sortKeys(removeNulls(serialized));

assert.deepStrictEqual(canonicalSerialized, canonicalOriginal);
console.log('test_serialization passed');
