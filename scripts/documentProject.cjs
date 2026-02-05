// documentProject.cjs
// Centralized script to generate PROJECTFILES.md for any project
// Usage: node scripts/documentProject.cjs <project-directory>
// Example: node ../scripts/documentProject.cjs . (from within a project folder)

const fs = require("fs");
const path = require("path");

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

// Read the consolidated data from source.dynode/data/collections/
const sourceDynodePath = path.resolve(projectRoot, "..", "source.dynode");
const dataPath = path.join(
  sourceDynodePath,
  "data",
  "collections",
  `dyna_codebase.${projectName}.json`,
);

if (!fs.existsSync(dataPath)) {
  console.error(
    `Error: Data file not found at ${dataPath}. Run consolidate first.`,
  );
  process.exit(1);
}

const files = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Group files by category
const categories = {};
files.forEach((file) => {
  const cat = file.category || "other";
  if (!categories[cat]) categories[cat] = [];
  categories[cat].push(file);
});

// Sort files within each category by path
Object.keys(categories).forEach((cat) => {
  categories[cat].sort((a, b) => a.path.localeCompare(b.path));
});

// Calculate statistics
const totalSize = files.reduce((sum, f) => sum + f.size, 0);
const filesWithDesc = files.filter((f) => f.description).length;
const totalInternalDeps = files.reduce(
  (sum, f) => sum + (f.internalDependencies?.length || 0),
  0,
);
const totalExternalDeps = new Set(
  files.flatMap((f) => f.externalDependencies || []),
).size;

// Format bytes to human-readable
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Format date to readable string
function formatDate(isoDate) {
  if (!isoDate) return "N/A";
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Build markdown content
let markdown = `# ${projectName.toUpperCase()} Project Files\n\n`;
markdown += `> Auto-generated documentation from project analysis\n\n`;
markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;

// Overview section
markdown += `## 📊 Overview\n\n`;
markdown += `| Metric | Value |\n`;
markdown += `|--------|-------|\n`;
markdown += `| Total Files | ${files.length} |\n`;
markdown += `| Total Size | ${formatBytes(totalSize)} |\n`;
markdown += `| Files with Descriptions | ${filesWithDesc} (${Math.round((filesWithDesc / files.length) * 100)}%) |\n`;
markdown += `| Internal Dependencies | ${totalInternalDeps} |\n`;
markdown += `| External Dependencies | ${totalExternalDeps} |\n`;
markdown += `| Categories | ${Object.keys(categories).length} |\n\n`;

// Table of Contents
markdown += `## 📑 Table of Contents\n\n`;
const sortedCategories = Object.keys(categories).sort();
sortedCategories.forEach((cat) => {
  const displayName = cat
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  markdown += `- [${displayName}](#${cat.toLowerCase().replace(/\s+/g, "-")}) (${categories[cat].length} files)\n`;
});
markdown += `\n---\n\n`;

// Files by category
sortedCategories.forEach((cat) => {
  const displayName = cat
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  markdown += `## ${displayName}\n\n`;

  categories[cat].forEach((file) => {
    markdown += `### \`${file.path}\`\n\n`;

    if (file.description) {
      markdown += `**Description:** ${file.description}\n\n`;
    }

    markdown += `| Property | Value |\n`;
    markdown += `|----------|-------|\n`;
    markdown += `| Size | ${formatBytes(file.size)} |\n`;
    markdown += `| Created | ${formatDate(file.created)} |\n`;
    markdown += `| Updated | ${formatDate(file.updated)} |\n`;
    markdown += `| Category | ${file.category} |\n`;

    // Internal dependencies
    if (file.internalDependencies && file.internalDependencies.length > 0) {
      markdown += `\n**Internal Dependencies:**\n\n`;
      file.internalDependencies.forEach((dep) => {
        if (dep.resolvedPath) {
          markdown += `- \`${dep.path}\` → \`${dep.resolvedPath}\`\n`;
        } else {
          markdown += `- \`${dep.path}\` *(unresolved)*\n`;
        }
      });
      markdown += `\n`;
    }

    // External dependencies
    if (file.externalDependencies && file.externalDependencies.length > 0) {
      markdown += `**External Dependencies:**\n\n`;
      const uniqueExternals = [...new Set(file.externalDependencies)].sort();
      uniqueExternals.forEach((dep) => {
        markdown += `- \`${dep}\`\n`;
      });
      markdown += `\n`;
    }

    // Git history (last 3 commits)
    if (file.history && file.history.length > 0) {
      markdown += `**Recent History:**\n\n`;
      const recentHistory = file.history.slice(0, 3);
      recentHistory.forEach((commit) => {
        markdown += `- **${formatDate(commit.date)}** - ${commit.message} *(${commit.author})*\n`;
      });
      if (file.history.length > 3) {
        markdown += `- *...and ${file.history.length - 3} more commits*\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  });
});

// External Dependencies Summary
const allExternalDeps = new Set(
  files.flatMap((f) => f.externalDependencies || []),
);
if (allExternalDeps.size > 0) {
  markdown += `## 📦 External Dependencies Summary\n\n`;
  markdown += `Total unique external packages: **${allExternalDeps.size}**\n\n`;

  // Count usage of each dependency
  const depUsage = {};
  files.forEach((file) => {
    if (file.externalDependencies) {
      file.externalDependencies.forEach((dep) => {
        depUsage[dep] = (depUsage[dep] || 0) + 1;
      });
    }
  });

  // Sort by usage count
  const sortedDeps = Object.entries(depUsage).sort((a, b) => b[1] - a[1]);

  markdown += `| Package | Usage Count |\n`;
  markdown += `|---------|-------------|\n`;
  sortedDeps.forEach(([dep, count]) => {
    markdown += `| \`${dep}\` | ${count} |\n`;
  });
  markdown += `\n`;
}

// Write to solution .documentation folder
const solutionRoot = path.resolve(projectRoot, "..");
const docDir = path.join(solutionRoot, ".docs");
if (!fs.existsSync(docDir)) {
  fs.mkdirSync(docDir, { recursive: true });
}
const outputPath = path.join(
  docDir,
  `CONSOLIDATEDFILES.${projectName.toUpperCase()}.md`,
);
fs.writeFileSync(outputPath, markdown, "utf-8");

console.log(
  `[${projectName}] Generated CONSOLIDATEDFILES.${projectName.toUpperCase()}.md with ${files.length} files documented.`,
);
