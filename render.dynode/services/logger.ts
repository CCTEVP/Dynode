import axios from "axios";

// Use the Docker service name instead of localhost
const API_URL = process.env.SOURCE_API_URL
  ? `${process.env.SOURCE_API_URL}/files/logs`
  : "http://source:3000/files/logs";

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
  try {
    await axiosInstance.post(API_URL, {
      level,
      message,
      meta,
      origin: ORIGIN,
    });
  } catch (err) {
    // Optionally, fallback to console if server logging fails
    console.error("Failed to send log to server from '" + ORIGIN + "':", err);
  }
}

const logger = {
  info: (message: string, meta?: any) => logToServer("info", message, meta),
  error: (message: string, meta?: any) => logToServer("error", message, meta),
  warn: (message: string, meta?: any) => logToServer("warn", message, meta),
  debug: (message: string, meta?: any) => logToServer("debug", message, meta),
};

export default logger;
