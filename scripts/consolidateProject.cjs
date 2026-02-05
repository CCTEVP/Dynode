// consolidateProject.cjs
// Centralized script to generate dyna_files.{project}.json for any project
// Usage: node scripts/consolidateProject.cjs <project-directory>
// Example: node ../scripts/consolidateProject.cjs . (from within a project folder)

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

// Utility to read .gitignore and build ignore patterns
function getIgnorePatterns(gitignorePath) {
  if (!fs.existsSync(gitignorePath)) return [];
  return fs
    .readFileSync(gitignorePath, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

// Utility to check if a file should be ignored
function isIgnored(filePath, ignorePatterns) {
  return ignorePatterns.some((pattern) => {
    if (pattern.endsWith("/")) {
      return filePath.includes(pattern.replace(/\/$/, ""));
    }
    return filePath.endsWith(pattern);
  });
}

// Extract full git commit history for a file
function getGitHistory(filePath) {
  try {
    const logRaw = execSync(
      `git log --follow --format="%H|%an|%aI|%s" -- "${filePath}"`,
      { encoding: "utf-8" },
    ).trim();
    if (!logRaw) return [];
    return logRaw.split("\n").map((line) => {
      const [commitId, author, date, message] = line.split("|");
      return {
        commitId: commitId || null,
        author: author || null,
        date: date || null,
        message: message || null,
      };
    });
  } catch (e) {
    return [];
  }
}

// Detect if a file was renamed using git history
function detectRename(oldPath, currentFiles) {
  try {
    // Use git log --follow --name-status to detect renames
    const logRaw = execSync(
      `git log --follow --name-status --format="" -- "${oldPath}"`,
      { encoding: "utf-8" },
    ).trim();

    if (!logRaw) return null;

    const lines = logRaw.split("\n");
    for (const line of lines) {
      // Look for rename entries: R100    old/path.ts    new/path.ts
      const renameMatch = line.match(/^R\d+\s+(.+?)\s+(.+)$/);
      if (renameMatch) {
        const [, from, to] = renameMatch;
        // Check if the target file exists in current files
        const normalizedTo = to.replace(/\\/g, "/");
        if (currentFiles.has(normalizedTo)) {
          return normalizedTo;
        }
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Check if a file was deleted in git
function isDeletedInGit(filePath) {
  try {
    // Check if file exists in git index
    execSync(`git ls-files --error-unmatch "${filePath}"`, {
      encoding: "utf-8",
      stdio: "pipe",
    });
    return false; // File exists in git
  } catch (e) {
    return true; // File not in git (deleted or never tracked)
  }
}

// Infer category from filename/path
function inferCategory(filename, relPath) {
  const ext = path.extname(filename).toLowerCase();
  if (/^readme|changelog|requirements|\.md$|\.mmd$/i.test(filename)) {
    return "documentation";
  }
  if (/\.env(\.|$)/.test(filename) || relPath.startsWith("config/")) {
    return "config";
  }
  if (filename === "Dockerfile" || filename === ".dockerignore") {
    return "deployment";
  }
  if (filename === ".gitignore" || filename === ".eslintignore") {
    return "config";
  }
  if (
    filename === "package.json" ||
    filename === "tsconfig.json" ||
    filename.endsWith(".esproj")
  ) {
    return "project-meta";
  }
  if ([".js", ".ts", ".tsx", ".jsx"].includes(ext)) return "source";
  if ([".css", ".scss", ".less"].includes(ext)) return "style";
  if ([".svg", ".png", ".jpg", ".jpeg", ".gif", ".ico"].includes(ext)) {
    return "image";
  }
  if ([".json"].includes(ext)) {
    return filename === "package.json" ? "project-meta" : "data";
  }
  if ([".txt"].includes(ext)) return "data";
  if (relPath.startsWith("public/")) return "asset";
  if (relPath.startsWith("scripts/")) return "script";
  if (relPath.startsWith("documentation/")) return "documentation";
  if (relPath.startsWith("cert/")) return "security";
  if (relPath.startsWith("obj/")) return "build-cache";
  return "other";
}

// Check if a dependency is internal (project file) or external (npm package)
function isInternalDependency(depPath) {
  return depPath.startsWith(".") || depPath.startsWith("/");
}

// Detect entry points from package.json
function detectEntryPoints(projectRoot, projectName) {
  const packageJsonPath = path.join(projectRoot, "package.json");
  const entryPoints = [];
  let mainField = null;

  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

      // Check main, module, browser fields
      mainField = pkg.main || pkg.module || pkg.browser;

      // Check scripts for entry point references
      if (pkg.scripts) {
        Object.values(pkg.scripts).forEach((script) => {
          // Look for node/ts-node commands in scripts
          const match = script.match(
            /(?:node|ts-node|ts-node-dev)\s+([\w\/.-]+)/,
          );
          if (match && match[1]) {
            // Only add if not starting with ../ (external scripts)
            if (!match[1].startsWith("../")) {
              entryPoints.push(match[1]);
            }
          }
        });
      }
    } catch (e) {
      console.warn("Warning: Could not parse package.json for entry points.");
    }
  }

  // Add main field if found
  if (mainField) {
    entryPoints.push(mainField);
  }

  // Add common entry point patterns
  const commonPatterns = [
    "src/main.tsx",
    "src/main.ts",
    "src/index.tsx",
    "src/index.ts",
    "app.ts",
    "app.js",
    "index.ts",
    "index.js",
    "bin/www",
  ];

  commonPatterns.forEach((pattern) => {
    const fullPath = path.join(projectRoot, pattern);
    if (fs.existsSync(fullPath)) {
      entryPoints.push(pattern);
    }
  });

  // Normalize paths and filter out non-strings
  const normalizedEntries = [...new Set(entryPoints)]
    .filter((ep) => typeof ep === "string" && ep.length > 0)
    .map((ep) => ep.replace(/\\/g, "/"));

  // Update package.json if main field is missing and we found an entry point
  if (
    !mainField &&
    normalizedEntries.length > 0 &&
    fs.existsSync(packageJsonPath)
  ) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      pkg.main = normalizedEntries[0];
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), "utf-8");
      console.log(
        `  Updated package.json with main field: ${normalizedEntries[0]}`,
      );
    } catch (e) {
      console.warn("Warning: Could not update package.json main field.");
    }
  }

  return normalizedEntries;
}

// Resolve TypeScript path aliases from tsconfig.json
function loadTsConfigPaths(projectRoot) {
  const tsconfigPath = path.join(projectRoot, "tsconfig.json");
  const aliases = {};

  if (fs.existsSync(tsconfigPath)) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
      const paths = tsconfig.compilerOptions?.paths || {};
      const baseUrl = tsconfig.compilerOptions?.baseUrl || ".";

      Object.entries(paths).forEach(([alias, targets]) => {
        // Remove trailing /* from alias and target
        const cleanAlias = alias.replace(/\/\*$/, "");
        const cleanTarget = targets[0].replace(/\/\*$/, "");
        const resolvedTarget = path.join(projectRoot, baseUrl, cleanTarget);
        aliases[cleanAlias] = path
          .relative(projectRoot, resolvedTarget)
          .replace(/\\/g, "/");
      });
    } catch (e) {
      console.warn("Warning: Could not parse tsconfig.json for path aliases.");
    }
  }

  return aliases;
}

// Resolve a relative import path to an absolute file path
function resolveImportPath(
  importPath,
  sourceFilePath,
  baseDir,
  tsAliases = {},
) {
  if (!isInternalDependency(importPath)) {
    // Check if it's a TypeScript path alias
    for (const [alias, target] of Object.entries(tsAliases)) {
      if (importPath === alias || importPath.startsWith(alias + "/")) {
        const relativePath = importPath.replace(alias, target);
        importPath = "." + path.sep + relativePath;
        break;
      }
    }

    if (!isInternalDependency(importPath)) return null;
  }

  const sourceDir = path.dirname(path.join(baseDir, sourceFilePath));
  let resolved = path.resolve(sourceDir, importPath);

  // Try adding common extensions if file doesn't exist
  const extensions = [
    "",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".css",
    ".scss",
  ];
  for (const ext of extensions) {
    const withExt = resolved + ext;
    if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) {
      return path.relative(baseDir, withExt).replace(/\\/g, "/");
    }
  }

  // Try index files in directory
  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    for (const indexFile of [
      "index.ts",
      "index.tsx",
      "index.js",
      "index.jsx",
    ]) {
      const indexPath = path.join(resolved, indexFile);
      if (fs.existsSync(indexPath)) {
        return path.relative(baseDir, indexPath).replace(/\\/g, "/");
      }
    }
  }

  return null;
}

// Extract dependencies from code/config files
function extractDependencies(
  fullPath,
  filename,
  relPath,
  baseDir,
  tsAliases = {},
) {
  const ext = path.extname(filename).toLowerCase();
  if ([".js", ".ts", ".tsx", ".jsx"].includes(ext)) {
    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      const importRegex = /import\s+(?:[^'";]+from\s+)?["']([^"']+)["']/g;
      const requireRegex = /require\(["']([^"']+)["']\)/g;
      const exportRegex = /export\s+\*\s+from\s+["']([^"']+)["']/g;
      const namedExportRegex = /export\s+\{[^}]+\}\s+from\s+["']([^"']+)["']/g; // export { X } from "./path"
      const dynamicImportRegex = /import\(["']([^"']+)["']\)/g; // Dynamic imports like import("./path")
      const deps = new Set();
      let m;
      while ((m = importRegex.exec(content))) {
        deps.add(m[1]);
      }
      while ((m = requireRegex.exec(content))) {
        deps.add(m[1]);
      }
      while ((m = exportRegex.exec(content))) {
        deps.add(m[1]);
      }
      while ((m = namedExportRegex.exec(content))) {
        deps.add(m[1]);
      }
      while ((m = dynamicImportRegex.exec(content))) {
        deps.add(m[1]);
      }
      return Array.from(deps).map((dep) => ({
        raw: dep,
        resolved: resolveImportPath(dep, relPath, baseDir, tsAliases),
      }));
    } catch {
      return [];
    }
  }
  if (filename === "Dockerfile") {
    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      const deps = [];
      if (/COPY\s+package\.json/.test(content))
        deps.push({ raw: "package.json", resolved: "package.json" });
      if (/COPY\s+nginx\.conf/.test(content))
        deps.push({ raw: "nginx.conf", resolved: "nginx.conf" });
      if (/COPY\s+index\.html/.test(content))
        deps.push({ raw: "index.html", resolved: "index.html" });
      return deps;
    } catch {
      return [];
    }
  }
  return [];
}

// Recursively walk directory, collecting file info
function walk(dir, ignorePatterns, baseDir, tsAliases = {}) {
  let results = [];
  fs.readdirSync(dir).forEach((file) => {
    const relPath = path.relative(baseDir, path.join(dir, file));
    if (isIgnored(relPath, ignorePatterns)) return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(
        walk(fullPath, ignorePatterns, baseDir, tsAliases),
      );
    } else {
      const history = getGitHistory(relPath.replace(/\\/g, "/"));
      const category = inferCategory(file, relPath.replace(/\\/g, "/"));
      const normalizedPath = relPath.replace(/\\/g, "/");
      const rawDeps = extractDependencies(
        fullPath,
        file,
        normalizedPath,
        baseDir,
        tsAliases,
      );

      results.push({
        filename: file,
        path: normalizedPath,
        created: stat.birthtime.toISOString(),
        updated: stat.mtime.toISOString(),
        size: stat.size,
        description: "",
        internalDependencies: [],
        externalDependencies: [],
        _rawDeps: rawDeps, // Temporary field for second pass
        category,
        _id: crypto.createHash("sha1").update(relPath).digest("hex"),
        history,
      });
    }
  });
  return results;
}

// Main execution
const projectRoot = path.resolve(process.argv[2] || process.cwd());

// Determine project name from folder name
const folderName = path.basename(projectRoot);
let projectName = "unknown";
if (folderName.includes(".")) {
  projectName = folderName.split(".")[0]; // Extract 'builder' from 'builder.dynode'
} else {
  projectName = folderName;
}

// Centralized tracking file in solution scripts folder
const solutionRoot = path.resolve(projectRoot, "..");
const lastgenPath = path.join(
  solutionRoot,
  "scripts",
  `.consolidatefiles.${projectName}.lastgen`,
);
let lastGen = 0;

if (fs.existsSync(lastgenPath)) {
  try {
    lastGen = parseInt(fs.readFileSync(lastgenPath, "utf-8"), 10) || 0;
  } catch (e) {
    console.warn("Warning: Could not read lastgen timestamp.");
  }
}

const gitignorePath = path.join(projectRoot, ".gitignore");
const ignorePatterns = getIgnorePatterns(gitignorePath);

// Load TypeScript path aliases
const tsAliases = loadTsConfigPaths(projectRoot);
if (Object.keys(tsAliases).length > 0) {
  console.log(
    `  Loaded ${Object.keys(tsAliases).length} TypeScript path alias(es)`,
  );
}

// Detect entry points
const entryPointPaths = detectEntryPoints(projectRoot, projectName);
if (entryPointPaths.length > 0) {
  console.log(
    `  Detected ${entryPointPaths.length} entry point(s): ${entryPointPaths.join(", ")}`,
  );
}

const files = walk(projectRoot, ignorePatterns, projectRoot, tsAliases);

// Build path-to-ID and ID-to-entry maps
const pathToId = {};
const idToEntry = {};
files.forEach((file) => {
  pathToId[file.path] = file._id;
  idToEntry[file._id] = file;
});

// Build set of current file paths for rename detection
const currentFilePaths = new Set(files.map((f) => f.path));

// Second pass: resolve dependencies to IDs
files.forEach((file) => {
  const internal = [];
  const external = [];

  if (file._rawDeps) {
    file._rawDeps.forEach(({ raw, resolved }) => {
      if (isInternalDependency(raw)) {
        // Internal dependency
        const depId = resolved ? pathToId[resolved] : null;
        internal.push({
          path: raw,
          resolvedPath: resolved || null,
          id: depId || null,
        });
      } else {
        // External dependency (npm package)
        external.push(raw);
      }
    });
  }

  file.internalDependencies = internal;
  file.externalDependencies = external;
  delete file._rawDeps; // Remove temporary field
});

// Add implicit dependencies on index.ts/tsx barrel files when importing Default.ts/tsx directly
// This ensures that index files are considered "used" when the Default files they export is imported
files.forEach((file) => {
  const additionalDeps = [];

  file.internalDependencies.forEach((dep) => {
    if (
      dep.resolvedPath &&
      (dep.resolvedPath.endsWith("/Default.tsx") ||
        dep.resolvedPath.endsWith("/Default.ts"))
    ) {
      // This file imports a Default.tsx/ts directly
      // Check if there's a sibling index.tsx/ts that re-exports it
      const dir = path.dirname(dep.resolvedPath);

      // Try both index.tsx and index.ts
      for (const indexFilename of ["index.tsx", "index.ts"]) {
        const indexPath = path.join(dir, indexFilename).replace(/\\/g, "/");
        const indexId = pathToId[indexPath];

        // Don't add self-reference
        if (indexId && indexId !== file._id) {
          const indexFile = idToEntry[indexId];
          // Check if index file re-exports the Default file
          const reexportsDefault =
            indexFile &&
            indexFile.internalDependencies.some(
              (idep) => idep.resolvedPath === dep.resolvedPath,
            );

          if (reexportsDefault) {
            // Add the index file as an implicit dependency
            additionalDeps.push({
              path:
                "./" +
                path
                  .relative(path.dirname(file.path), indexPath)
                  .replace(/\\/g, "/"),
              resolvedPath: indexPath,
              id: indexId,
            });
            break; // Found the index file, no need to check other extensions
          }
        }
      }
    }
  });

  // Add the implicit dependencies
  file.internalDependencies.push(...additionalDeps);
});

// === HIERARCHICAL KEY GENERATION ===

/**
 * Build folder hierarchy keys (folKey) for all files
 * Assigns dot-notation keys like "1", "1.1", "1.2.1" based on folder structure
 * Orphaned files (no folder) get their own top-level numbers
 */
function buildFolderHierarchyKeys(files) {
  // Extract all unique folder paths (directory paths)
  const folderPaths = new Set();
  files.forEach((file) => {
    const dirPath = path.dirname(file.path).replace(/\\/g, "/");
    if (dirPath && dirPath !== ".") {
      folderPaths.add(dirPath);
    }
  });

  // Build folder tree structure
  const folderTree = {};
  const sortedFolders = Array.from(folderPaths).sort(); // Alphabetical order

  sortedFolders.forEach((folderPath) => {
    const parts = folderPath.split("/").filter((p) => p);
    let currentLevel = folderTree;

    parts.forEach((part, index) => {
      const partialPath = parts.slice(0, index + 1).join("/");
      if (!currentLevel[part]) {
        currentLevel[part] = {
          fullPath: partialPath,
          children: {},
        };
      }
      currentLevel = currentLevel[part].children;
    });
  });

  // Assign keys to folders in the tree
  const folderKeys = {}; // Map: folderPath -> folKey
  let orphanCounter = 0;

  function assignKeys(node, parentKey = "") {
    const entries = Object.entries(node).sort((a, b) =>
      a[0].localeCompare(b[0]),
    ); // Alphabetical
    entries.forEach(([name, data], index) => {
      const key = parentKey ? `${parentKey}.${index + 1}` : `${index + 1}`;
      folderKeys[data.fullPath] = key;
      if (Object.keys(data.children).length > 0) {
        assignKeys(data.children, key);
      }
    });
  }

  assignKeys(folderTree);

  // Assign keys to files based on their folder
  files.forEach((file) => {
    const dirPath = path.dirname(file.path).replace(/\\/g, "/");

    if (dirPath && dirPath !== "." && folderKeys[dirPath]) {
      // File is in a folder
      const folKey = folderKeys[dirPath];
      file.folKey = folKey;
      file.folDepth = folKey.split(".").length;

      // Parent is the key with last segment removed
      const keyParts = folKey.split(".");
      file.folParent =
        keyParts.length > 1 ? keyParts.slice(0, -1).join(".") : "0";
    } else {
      // Orphaned file (no folder or root level)
      orphanCounter++;
      const maxTopLevel = Math.max(
        0,
        ...Object.values(folderKeys)
          .map((k) => parseInt(k.split(".")[0]))
          .filter((n) => !isNaN(n)),
      );
      file.folKey = `${maxTopLevel + orphanCounter}`;
      file.folDepth = 1;
      file.folParent = "0";
    }
  });

  console.log(`  Assigned folder hierarchy keys to ${files.length} files`);
  console.log(`  Total folders: ${Object.keys(folderKeys).length}`);
  console.log(`  Orphaned files: ${orphanCounter}`);
}

/**
 * Build relationship hierarchy keys (relKey) based on dependency depth
 * Assigns keys like "1", "1.1", "1.2.1" based on dependency relationships
 */
function buildRelationshipHierarchyKeys(files, entryPointIds, idToEntry) {
  // Group files by dependency depth
  const depthGroups = {};
  files.forEach((file) => {
    const depth = file.dependencyDepth;
    if (!depthGroups[depth]) {
      depthGroups[depth] = [];
    }
    depthGroups[depth].push(file);
  });

  // Sort depths
  const sortedDepths = Object.keys(depthGroups)
    .map((d) => parseInt(d))
    .filter((d) => d >= 0)
    .sort((a, b) => a - b);

  // Assign relationship keys
  const fileToRelKey = {};

  sortedDepths.forEach((depth) => {
    const filesAtDepth = depthGroups[depth].sort((a, b) =>
      a.path.localeCompare(b.path),
    );

    if (depth === 0) {
      // Entry points get top-level keys
      filesAtDepth.forEach((file, index) => {
        const relKey = `${index + 1}`;
        file.relKey = relKey;
        file.relDepth = 1;
        file.relParent = "0";
        fileToRelKey[file._id] = relKey;
      });
    } else {
      // Files at depth > 0 get keys based on their first dependency's key
      filesAtDepth.forEach((file) => {
        // Find the first dependency that has a relKey (closest to entry point)
        let parentKey = null;
        if (file.internalDependencies) {
          for (const dep of file.internalDependencies) {
            if (dep.id && fileToRelKey[dep.id]) {
              parentKey = fileToRelKey[dep.id];
              break;
            }
          }
        }

        if (parentKey) {
          // Find next available child index under this parent
          const childrenUnderParent = Object.values(fileToRelKey)
            .filter((k) => k.startsWith(parentKey + "."))
            .map((k) => {
              const parts = k.split(".");
              return parts.length === parentKey.split(".").length + 1
                ? parseInt(parts[parts.length - 1])
                : 0;
            })
            .filter((n) => !isNaN(n));

          const nextIndex =
            childrenUnderParent.length > 0
              ? Math.max(...childrenUnderParent) + 1
              : 1;
          const relKey = `${parentKey}.${nextIndex}`;
          file.relKey = relKey;
          file.relDepth = relKey.split(".").length;
          file.relParent = parentKey;
          fileToRelKey[file._id] = relKey;
        } else {
          // No parent found, treat as orphaned (shouldn't happen if depth calc is correct)
          const maxTopLevel = Math.max(
            0,
            ...Object.values(fileToRelKey)
              .map((k) => parseInt(k.split(".")[0]))
              .filter((n) => !isNaN(n)),
          );
          const relKey = `${maxTopLevel + 1}`;
          file.relKey = relKey;
          file.relDepth = 1;
          file.relParent = "0";
          fileToRelKey[file._id] = relKey;
        }
      });
    }
  });

  // Handle orphaned files (dependencyDepth === -1)
  if (depthGroups[-1]) {
    const maxTopLevel = Math.max(
      0,
      ...Object.values(fileToRelKey)
        .map((k) => parseInt(k.split(".")[0]))
        .filter((n) => !isNaN(n)),
    );

    depthGroups[-1]
      .sort((a, b) => a.path.localeCompare(b.path))
      .forEach((file, index) => {
        const relKey = `${maxTopLevel + index + 1}`;
        file.relKey = relKey;
        file.relDepth = 1;
        file.relParent = "0";
        fileToRelKey[file._id] = relKey;
      });
  }

  console.log(
    `  Assigned relationship hierarchy keys to ${files.length} files`,
  );
}

// === DATA ENRICHMENT ===
console.log("\n[Enriching Data]...");

// 1. Add project field and basic counts
files.forEach((file) => {
  file.project = projectName;
  file.dependencyCount = file.internalDependencies.length;
  file.externalDependencyLabels = [...new Set(file.externalDependencies)];
});

// 2. Build reverse dependency index
console.log("  Building reverse dependency index...");
const reverseDeps = {};
files.forEach((file) => {
  reverseDeps[file._id] = [];
});

files.forEach((file) => {
  file.internalDependencies.forEach((dep) => {
    if (dep.id && reverseDeps[dep.id]) {
      reverseDeps[dep.id].push({
        _id: file._id,
        filename: file.filename,
        path: file.path,
        category: file.category,
        project: projectName,
      });
    }
  });
});

// 3. Expand directDependencies with full objects and add reverseDependencies
files.forEach((file) => {
  file.directDependencies = file.internalDependencies
    .filter((dep) => dep.id)
    .map((dep) => {
      const depFile = idToEntry[dep.id];
      if (!depFile) return null;
      return {
        _id: dep.id,
        filename: depFile.filename,
        path: depFile.path,
        category: depFile.category,
        project: projectName,
      };
    })
    .filter((dep) => dep !== null);

  file.reverseDependencies = reverseDeps[file._id] || [];
});

// 3.5. Propagate reverse dependencies from Default.ts/tsx to index.ts/tsx barrel files
// When a file like EditorCanvas/Default.tsx is imported, but EditorCanvas/index.tsx re-exports it,
// the index file should also be considered "used" by inheriting the reverse dependencies
console.log("  Propagating dependencies through barrel exports...");
files.forEach((file) => {
  // Check if this is a Default.tsx or Default.ts file
  if (file.filename === "Default.tsx" || file.filename === "Default.ts") {
    // Look for sibling index.tsx or index.ts in the same directory
    const dir = path.dirname(file.path);

    // Try both index.tsx and index.ts
    for (const indexFilename of ["index.tsx", "index.ts"]) {
      const indexPath = path.join(dir, indexFilename).replace(/\\/g, "/");

      // Find the index file
      const indexFile = files.find((f) => f.path === indexPath);

      if (indexFile) {
        // Check if index file re-exports this Default file (check directDependencies, not internalDependencies)
        const reexportsDefault = indexFile.directDependencies.some(
          (dep) => dep.path === file.path,
        );

        if (reexportsDefault) {
          // Propagate reverse dependencies from Default file to index file
          file.reverseDependencies.forEach((revDep) => {
            // Only add if not already present
            const alreadyExists = indexFile.reverseDependencies.some(
              (existing) => existing._id === revDep._id,
            );
            if (!alreadyExists && revDep._id !== indexFile._id) {
              indexFile.reverseDependencies.push({ ...revDep });
            }
          });
          break; // Found the index file, no need to check other extensions
        }
      }
    }
  }
});

// 4. Detect circular dependencies
console.log("  Detecting circular dependencies...");
const circularDeps = [];
const visited = new Set();
const recursionStack = new Set();

function detectCycles(fileId, path = []) {
  if (recursionStack.has(fileId)) {
    // Found a cycle
    const cycleStart = path.indexOf(fileId);
    const cycle = [...path.slice(cycleStart), fileId];
    circularDeps.push(cycle);
    return;
  }
  if (visited.has(fileId)) return;

  visited.add(fileId);
  recursionStack.add(fileId);
  path.push(fileId);

  const file = idToEntry[fileId];
  if (file && file.internalDependencies) {
    file.internalDependencies.forEach((dep) => {
      if (dep.id) {
        detectCycles(dep.id, [...path]);
      }
    });
  }

  recursionStack.delete(fileId);
}

files.forEach((file) => detectCycles(file._id));

// Mark files that are in circular chains
const filesInCycles = new Set();
circularDeps.forEach((cycle) => {
  cycle.forEach((fileId) => filesInCycles.add(fileId));
});

files.forEach((file) => {
  file.isInCircularDependency = filesInCycles.has(file._id);
});

if (circularDeps.length > 0) {
  console.log(`  Found ${circularDeps.length} circular dependency chain(s):`);
  circularDeps.slice(0, 5).forEach((cycle, idx) => {
    const cyclePaths = cycle.map((id) => idToEntry[id]?.path || "unknown");
    console.log(`    ${idx + 1}. ${cyclePaths.join(" → ")}`);
  });
  if (circularDeps.length > 5) {
    console.log(`    ... and ${circularDeps.length - 5} more`);
  }
} else {
  console.log("  No circular dependencies detected.");
}

// 5. Calculate dependency depth from entry points
console.log("  Calculating dependency depth from entry points...");
const entryPointIds = new Set();
entryPointPaths.forEach((epPath) => {
  const epId = pathToId[epPath];
  if (epId) {
    entryPointIds.add(epId);
  }
});

const depths = {};
const queue = [];

// Initialize queue with entry points
entryPointIds.forEach((id) => {
  queue.push({ id, depth: 0 });
  depths[id] = 0;
});

// BFS traversal to calculate depths from entry points
while (queue.length > 0) {
  const { id, depth } = queue.shift();

  const file = idToEntry[id];
  if (file && file.internalDependencies) {
    file.internalDependencies.forEach((dep) => {
      if (dep.id) {
        const currentDepth = depths[dep.id];
        if (currentDepth === undefined || currentDepth > depth + 1) {
          depths[dep.id] = depth + 1;
          queue.push({ id: dep.id, depth: depth + 1 });
        }
      }
    });
  }
}

// Assign depths to files
let unreachableCount = 0;
files.forEach((file) => {
  file.dependencyDepth = depths[file._id] !== undefined ? depths[file._id] : -1;
  file.isEntryPoint = entryPointIds.has(file._id);
  if (file.dependencyDepth === -1) {
    unreachableCount++;
  }
});

if (unreachableCount > 0) {
  console.log(
    `  Warning: ${unreachableCount} file(s) are not reachable from entry points (orphaned).`,
  );
}

const depthStats = {};
files.forEach((file) => {
  const depth = file.dependencyDepth;
  depthStats[depth] = (depthStats[depth] || 0) + 1;
});

console.log("  Dependency depth distribution:");
Object.keys(depthStats)
  .sort((a, b) => parseInt(a) - parseInt(b))
  .forEach((depth) => {
    const label = depth === "-1" ? "Orphaned" : `Depth ${depth}`;
    console.log(`    ${label}: ${depthStats[depth]} file(s)`);
  });

// 6. Build hierarchical keys for folder and relationship structures
console.log("  Building hierarchical keys...");
buildFolderHierarchyKeys(files);
buildRelationshipHierarchyKeys(files, entryPointIds, idToEntry);

// Output to source.dynode/data/collections/
const sourceDynodePath = path.resolve(projectRoot, "..", "source.dynode");
const collectionsDir = path.join(sourceDynodePath, "data", "collections");
if (!fs.existsSync(collectionsDir)) {
  fs.mkdirSync(collectionsDir, { recursive: true });
}

const projectfilePath = path.join(
  collectionsDir,
  `dyna_codebase.${projectName}.json`,
);
const previous = {};

if (fs.existsSync(projectfilePath)) {
  try {
    const prevArr = JSON.parse(fs.readFileSync(projectfilePath, "utf-8"));
    prevArr.forEach((entry) => {
      previous[entry._id] = entry;
    });
  } catch (e) {
    console.warn(
      "Warning: Could not parse previous consolidatedFiles.json, starting fresh.",
    );
  }
}

// Detect renames and deletions
const renamedFiles = {}; // Maps old path -> new path
const deletedIds = new Set(); // IDs to remove

Object.values(previous).forEach((prevEntry) => {
  // Skip if file still exists with same path
  if (currentFilePaths.has(prevEntry.path)) return;

  // File is missing - check if renamed or deleted
  const newPath = detectRename(prevEntry.path, currentFilePaths);

  if (newPath) {
    // File was renamed
    renamedFiles[prevEntry.path] = newPath;
    console.log(`  Detected rename: ${prevEntry.path} → ${newPath}`);
  } else if (isDeletedInGit(prevEntry.path)) {
    // File was deleted
    deletedIds.add(prevEntry._id);
    console.log(`  Detected deletion: ${prevEntry.path}`);
  }
  // Otherwise, file might be temporarily missing (not committed yet), keep it
});

const merged = files.map((file) => {
  // Check if this file is a renamed version of a previous file
  let prev = previous[file._id];

  // Look for previous entry with old path (if this is a rename target)
  const oldPath = Object.keys(renamedFiles).find(
    (old) => renamedFiles[old] === file.path,
  );
  if (oldPath) {
    const oldId = crypto.createHash("sha1").update(oldPath).digest("hex");
    const oldEntry = previous[oldId];
    if (oldEntry) {
      // Migrate metadata from renamed file
      prev = oldEntry;
      console.log(`  Migrating metadata: ${oldPath} → ${file.path}`);
    }
  }

  const fileMTime = new Date(file.updated).getTime();
  const isNew = !prev;
  const isModified = fileMTime > lastGen;

  return {
    ...file,
    // Always preserve existing description
    description: prev && prev.description ? prev.description : file.description,
    // Only update dependencies/category if file is new or modified
    internalDependencies:
      isNew || isModified
        ? file.internalDependencies
        : prev && prev.internalDependencies
          ? prev.internalDependencies
          : file.internalDependencies,
    externalDependencies:
      isNew || isModified
        ? file.externalDependencies
        : prev && prev.externalDependencies
          ? prev.externalDependencies
          : file.externalDependencies,
    category:
      isNew || isModified
        ? file.category
        : prev && prev.category
          ? prev.category
          : file.category,
  };
});

// Filter out deleted files
const finalOutput = merged.filter((file) => !deletedIds.has(file._id));

fs.writeFileSync(
  projectfilePath,
  JSON.stringify(finalOutput, null, 2),
  "utf-8",
);
fs.writeFileSync(lastgenPath, Date.now().toString(), "utf-8");

const deletedCount = merged.length - finalOutput.length;
let summary = `[${projectName}] Generated dyna_files.${projectName}.json with ${finalOutput.length} files.`;
if (deletedCount > 0) {
  summary += ` Removed ${deletedCount} deleted file(s).`;
}
if (Object.keys(renamedFiles).length > 0) {
  summary += ` Detected ${Object.keys(renamedFiles).length} rename(s).`;
}
console.log(summary);
