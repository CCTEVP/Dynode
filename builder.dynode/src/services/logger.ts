import env from "../../config/env";
// Use internal service base in docker; otherwise external origin
// In docker, use nginx /api proxy (browser can't resolve internal DNS names)
const sourceBase = env.env === "docker" ? "/api" : env.externalOrigins.source;
const API_URL = `${sourceBase}/files/log`;
const ORIGIN = "build.dynode"; // <-- Add your constant origin here

type LogLevel = "info" | "error" | "warn" | "debug";

async function logToServer(level: LogLevel, message: string, meta?: any) {
  // Console output for local debugging
  const consoleMethod =
    level === "error" ? "error" : level === "warn" ? "warn" : "log";
  if (meta) {
    console[consoleMethod](`[${ORIGIN}] ${message}`, meta);
  } else {
    console[consoleMethod](`[${ORIGIN}] ${message}`);
  }

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level,
        message,
        meta,
        origin: ORIGIN, // Always include origin
      }),
      // credentials: "include", // Uncomment if you need cookies/auth
    });
  } catch (err) {
    // Fallback to console if server logging fails
    // eslint-disable-next-line no-console
    console.warn(
      `[${ORIGIN}] Remote log send failed: ${(err as any)?.message}`,
    );
  }
}

const logger = {
  info: (message: string, meta?: any) => logToServer("info", message, meta),
  error: (message: string, meta?: any) => logToServer("error", message, meta),
  warn: (message: string, meta?: any) => logToServer("warn", message, meta),
  debug: (message: string, meta?: any) => logToServer("debug", message, meta),
};

export default logger;
