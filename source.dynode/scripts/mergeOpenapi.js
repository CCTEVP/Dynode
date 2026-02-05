// scripts/merge-openapi.js (simplified)
// Now that build order compiles TS first, we import the compiled config directly.
const fs = require("fs");
const path = require("path");
const os = require("os");
// Require compiled config (tsc already ran before this script)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("../dist/config.js").default;
if (!config || !config.externalOrigins || !config.externalOrigins.source) {
  throw new Error(
    "mergeOpenapi: config.externalOrigins.source not available after compilation"
  );
}
const sourceBaseUrl = config.externalOrigins.source;

function resolveHostName() {
  const explicitHost =
    process.env.SOURCE_PUBLIC_HOST ||
    process.env.SERVER_NAME ||
    process.env.HOSTNAME ||
    process.env.COMPUTERNAME;
  if (explicitHost && explicitHost.trim()) {
    return explicitHost.trim();
  }
  try {
    const hostname = os.hostname();
    if (hostname && hostname.trim()) {
      return hostname.trim();
    }
  } catch (err) {
    // ignore and fall back below
  }
  return "localhost";
}

function resolvePort() {
  const envPort = process.env.PORT_ENV || process.env.PORT;
  if (envPort && !Number.isNaN(Number(envPort))) {
    return Number(envPort);
  }

  // Check if running in production/Docker environment
  const isProduction = process.env.NODE_ENV === "production";
  const isDocker =
    process.env.DOCKER_ENV === "true" ||
    process.env.RUNNING_IN_DOCKER === "true" ||
    fs.existsSync("/.dockerenv");

  // Check if the current process is listening on port 3000 (Docker production port)
  // This catches cases where Docker maps to port 3000 but environment variables aren't set
  const currentPort =
    process.env.ACTUAL_PORT ||
    (process.argv.find((arg) => arg.includes("--port=")) || "").split("=")[1] ||
    (global.server && global.server.address && global.server.address().port);

  if (currentPort && Number(currentPort) === 3000) {
    return 3000;
  }

  // Use production port (3000) for Docker/production, development port (3333) otherwise
  if (isProduction || isDocker) {
    return 3000;
  }

  return Number(config.port) || 3333;
}

function resolveProtocolFallback() {
  if (typeof process.env.SOURCE_PUBLIC_PROTOCOL === "string") {
    const candidate = process.env.SOURCE_PUBLIC_PROTOCOL.trim().toLowerCase();
    if (candidate === "http" || candidate === "https") {
      return candidate;
    }
  }
  if (typeof process.env.ENABLE_HTTPS === "string") {
    return process.env.ENABLE_HTTPS.toLowerCase() === "true" ? "https" : "http";
  }
  return config.https ? "https" : "http";
}

function normalizeUrlCandidate(candidate) {
  if (!candidate || !candidate.trim()) {
    return undefined;
  }
  const trimmed = candidate.trim();
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
  const protocol = resolveProtocolFallback();
  const urlString = hasProtocol ? trimmed : `${protocol}://${trimmed}`;
  try {
    return new URL(urlString);
  } catch (err) {
    return undefined;
  }
}

function formatUrl(url) {
  const pathname = url.pathname.replace(/\/+$/, "");
  return pathname && pathname !== "/" ? `${url.origin}${pathname}` : url.origin;
}

function resolveServerUrl() {
  // Check for explicit Docker/production server URL first
  const orderedCandidates = [
    process.env.SWAGGER_SERVER_URL,
    process.env.SOURCE_PUBLIC_URL,
    // For Docker builds, check if we should use port 3000 instead of config default
    process.env.NODE_ENV === "production" || process.env.DOCKER_BUILD === "true"
      ? "http://localhost:3000"
      : undefined,
    sourceBaseUrl, // This will be the config default (localhost:3333 for dev)
  ];

  for (const candidate of orderedCandidates) {
    if (!candidate) continue;
    const parsed = normalizeUrlCandidate(candidate);
    if (parsed) {
      return formatUrl(parsed);
    }
  }

  // If sourceBaseUrl is available from config, use it directly instead of constructing
  if (sourceBaseUrl && sourceBaseUrl.trim()) {
    try {
      const parsed = new URL(sourceBaseUrl);
      return formatUrl(parsed);
    } catch (err) {
      // Fall through to manual construction
    }
  }

  const protocol = resolveProtocolFallback();
  const host = resolveHostName();
  const port = resolvePort();
  const defaultPort = protocol === "https" ? 443 : 80;
  const portPart = port && port !== defaultPort ? `:${port}` : "";
  return `${protocol}://${host}${portPart}`;
}

// Load base OpenAPI file from /files
const resolvedServerUrl = resolveServerUrl();
const resolvedServer = (() => {
  try {
    return new URL(resolvedServerUrl);
  } catch (err) {
    return null;
  }
})();

const basePath = path.join(__dirname, "../files/openapi.json");
const baseContent = fs.readFileSync(basePath, "utf8");
let updatedBaseContent = baseContent.replace(
  /\{\{SOURCE_API_URL\}\}/g,
  sourceBaseUrl
);

if (resolvedServer) {
  const protocolWithoutColon = resolvedServer.protocol.replace(/:$/, "");
  const computedPort =
    resolvedServer.port || (protocolWithoutColon === "https" ? "443" : "80");
  updatedBaseContent = updatedBaseContent
    .replace(/\{\{protocol\}\}/g, protocolWithoutColon)
    .replace(/\{\{host\}\}/g, resolvedServer.hostname)
    .replace(/\{\{port\}\}/g, computedPort)
    .replace(/\{\{origin\}\}/g, resolvedServer.origin)
    .replace(/\{\{baseUrl\}\}/g, resolvedServerUrl);
}

const base = JSON.parse(updatedBaseContent);

// Overwrite servers list with dynamically detected protocol/host/port.
base.servers = [
  {
    url: resolvedServerUrl,
    description: "Primary server",
  },
];

// Collect all openapi.json files under /routes
function collectOpenapiFiles(dir, files = []) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      collectOpenapiFiles(fullPath, files);
    } else if (file === "openapi.json") {
      files.push(fullPath);
    }
  }
  return files;
}

// Merge all path objects from route openapi.json files
function mergeRouteOpenapi(files) {
  const merged = {};
  for (const file of files) {
    const fragment = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const [key, value] of Object.entries(fragment)) {
      merged[key] = value;
    }
  }
  return merged;
}

const routeOpenapiFiles = collectOpenapiFiles(
  path.join(__dirname, "../routes")
);
const mergedPaths = mergeRouteOpenapi(routeOpenapiFiles);

// Replace "external": "all" with merged paths inside base.paths
if (base.paths && base.paths.external === "all") {
  delete base.paths.external;
  Object.assign(base.paths, mergedPaths);
}

// Write merged OpenAPI spec to project root
const outputPath = path.join(__dirname, "../openapi.json");
fs.writeFileSync(outputPath, JSON.stringify(base, null, 2));
// console.log('Merged OpenAPI spec written to openapi.json in project root');
// console.log('Writing merged OpenAPI to:', outputPath);
// console.log('Merged content:', JSON.stringify(base, null, 2));
