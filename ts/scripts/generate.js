const fs = require('fs/promises');
const path = require('path');
const { compileFromFile } = require('json-schema-to-typescript');

/**
 * Reads a JSON file and removes comment lines that start with //
 */
async function readJsonFileWithoutComments(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  // Remove lines that begin with //. Account for spaces before the //
  const filteredContent = content.split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .join('\n');

  return JSON.parse(filteredContent);
}

/**
 * Recursively resolves $ref paths in a JSON schema object
 */
function resolveRefPaths(obj, schemaRootDir) {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    obj.forEach(item => resolveRefPaths(item, schemaRootDir));
    return;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (key === '$ref' && typeof value === 'string' && value.startsWith('/')) {
      // Convert absolute refs like "/block/types/x.json" to relative paths
      // that are relative to the schema root directory
      obj[key] = path.relative(schemaRootDir, path.join(schemaRootDir, value.substring(1)));
    } else if (typeof value === 'object' && value !== null) {
      resolveRefPaths(value, schemaRootDir);
    }
  }
}

async function processDir(inputDir, outputDir, rootDir) {
  const entries = await fs.readdir(inputDir, { withFileTypes: true });
  await fs.mkdir(outputDir, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(inputDir, entry.name);
    const destPath = path.join(
      outputDir,
      entry.name.replace(/_schema\.json$/, '.ts')
    );

    if (entry.isDirectory()) {
      await processDir(srcPath, path.join(outputDir, entry.name), rootDir);
    } else if (entry.isFile() && entry.name.endsWith('_schema.json')) {
      try {
        // Read the schema and remove comments
        const jsonSchema = await readJsonFileWithoutComments(srcPath);

        // Fix references in the schema
        const schemaRootDir = path.resolve(rootDir, 'schema');
        resolveRefPaths(jsonSchema, schemaRootDir);

        // Write to a temporary file for compilation
        const tempFilePath = srcPath + '.temp.json';
        await fs.writeFile(tempFilePath, JSON.stringify(jsonSchema, null, 2));

        const ts = await compileFromFile(tempFilePath, {
          bannerComment: '',
          cwd: rootDir,
        });

        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.writeFile(destPath, ts);
        console.log(`Generated ${path.relative('.', destPath)}`);

        // Clean up temporary file
        await fs.unlink(tempFilePath).catch(() => {});
      } catch (error) {
        console.error(`Error processing ${srcPath}:`, error);
        throw error;
      }
    }
  }
}

async function main() {
  const base = path.resolve(__dirname, '..');
  const schemaDir = path.resolve(base, '..', 'schema');
  const outDir = path.resolve(base, 'src', 'generated');
  const rootDir = path.resolve(base, '..');
  await processDir(schemaDir, outDir, rootDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
