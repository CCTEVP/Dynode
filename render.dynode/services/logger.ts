import fs from "fs";
import path from "path";

const API_URL = "https://localhost:3000/files/logs";
const ORIGIN = "render.dynode"; // <-- Add your constant origin here

type LogLevel = "info" | "error" | "warn" | "debug";

async function logToServer(level: LogLevel, message: string, meta?: any) {
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
    // Optionally, fallback to console if server logging fails
    // eslint-disable-next-line no-console
    console.error("Failed to send log to server:", err);
  }
}

const logger = {
  info: (message: string, meta?: any) => logToServer("info", message, meta),
  error: (message: string, meta?: any) => logToServer("error", message, meta),
  warn: (message: string, meta?: any) => logToServer("warn", message, meta),
  debug: (message: string, meta?: any) => logToServer("debug", message, meta),
};

export default logger;
