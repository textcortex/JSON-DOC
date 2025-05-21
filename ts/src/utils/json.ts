/**
 * Utilities for JSON handling
 */

/**
 * Load JSON from a string or parse a JSON object
 * @param input String or object to parse
 * @returns Parsed JSON object
 */
export function loadJson<T>(input: string | object): T {
  if (typeof input === 'string') {
    return JSON.parse(input) as T;
  }
  return input as T;
}

/**
 * Get a nested value from an object using a dot-separated path
 * @param obj Object to get value from
 * @param path Dot-separated path to the value
 * @returns Value at the path or undefined if not found
 */
export function getNestedValue(obj: any, path: string): any {
  if (!path || !obj) return undefined;
  
  // Remove leading dot if present
  const normalizedPath = path.startsWith('.') ? path.substring(1) : path;
  
  // Navigate through object properties
  return normalizedPath.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Set a nested value in an object using a dot-separated path
 * @param obj Object to set value in
 * @param path Dot-separated path to the value
 * @param value Value to set
 * @returns Modified object
 */
export function setNestedValue(obj: any, path: string, value: any): any {
  if (!path) return obj;
  
  // Remove leading dot if present
  const normalizedPath = path.startsWith('.') ? path.substring(1) : path;
  
  const parts = normalizedPath.split('.');
  let current = obj;
  
  // Navigate to the second-to-last part
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  // Set the value
  const lastKey = parts[parts.length - 1];
  current[lastKey] = value;
  
  return obj;
}

/**
 * Deep clone an object
 * @param obj Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}