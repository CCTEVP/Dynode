import axios from "axios";
import config from "../config";

// Select correct base depending on environment using dual namespace
const baseForLogging =
  config.env === "docker"
    ? config.internalServices.source
    : config.externalOrigins.source;
const API_URL = baseForLogging + "/files/log"; // POST endpoint

const ORIGIN = "render.dynode";

type LogLevel = "info" | "error" | "warn" | "debug";

// Create axios instance with default configuration
const axiosInstance = axios.create({
  timeout: 5000, // 5 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

async function logToServer(level: LogLevel, message: string, meta?: any) {
  const logData = {
    level,
    message,
    meta,
    origin: ORIGIN,
  };

  // Console output for local debugging
  const consoleMethod =
    level === "error" ? "error" : level === "warn" ? "warn" : "log";
  if (meta) {
    console[consoleMethod](`[${ORIGIN}] ${message}`, meta);
  } else {
    console[consoleMethod](`[${ORIGIN}] ${message}`);
  }

  try {
    await axiosInstance.post(API_URL, logData);
  } catch (err) {
    // Log to console when remote logging fails
    console.warn(
      `[${ORIGIN}] Remote log send failed to ${API_URL}: ${(err as any)?.message}`,
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
