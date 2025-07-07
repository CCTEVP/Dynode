// scripts/merge-openapi.js
const fs = require('fs');
const path = require('path');

// Load base OpenAPI file from /files
const basePath = path.join(__dirname, '../files/openapi.json');
const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));

// Collect all openapi.json files under /routes
function collectOpenapiFiles(dir, files = []) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      collectOpenapiFiles(fullPath, files);
    } else if (file === 'openapi.json') {
      files.push(fullPath);
    }
  }
  return files;
}

// Merge all path objects from route openapi.json files
function mergeRouteOpenapi(files) {
  const merged = {};
  for (const file of files) {
    const fragment = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const [key, value] of Object.entries(fragment)) {
      merged[key] = value;
    }
  }
  return merged;
}

const routeOpenapiFiles = collectOpenapiFiles(path.join(__dirname, '../routes'));
const mergedPaths = mergeRouteOpenapi(routeOpenapiFiles);

// Replace "external": "all" with merged paths inside base.paths
if (base.paths && base.paths.external === "all") {
  delete base.paths.external;
  Object.assign(base.paths, mergedPaths);
}

// Write merged OpenAPI spec to project root
const outputPath = path.join(__dirname, '../openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(base, null, 2));
console.log('Merged OpenAPI spec written to openapi.json in project root');
console.log('Writing merged OpenAPI to:', outputPath);
console.log('Merged content:', JSON.stringify(base, null, 2));