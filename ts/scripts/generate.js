const fs = require('fs/promises');
const path = require('path');
const { compileFromFile } = require('json-schema-to-typescript');

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
      const ts = await compileFromFile(srcPath, {
        bannerComment: '',
        cwd: rootDir,
      });
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.writeFile(destPath, ts);
      console.log(`Generated ${path.relative('.', destPath)}`);
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
