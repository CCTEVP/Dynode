/**
 * Structured Logging Service
 * Sends logs to source.dynode centralized logging service
 * Falls back to Winston console logging for local development
 * Supports log levels, correlation IDs, and structured metadata
 */

import winston from "winston";
import dotenv from "dotenv";
import http from "http";
import https from "https";

dotenv.config();

const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const NODE_ENV = process.env.NODE_ENV || "development";
const ORIGIN = "echo.dynode";

// Source.dynode logging endpoint configuration
// Use internal service name in docker; otherwise external origin
const SOURCE_BASE_URL =
  process.env.SOURCE_BASE_URL ||
  (NODE_ENV === "docker"
    ? "http://source.dynode:8080"
    : process.env.PUBLIC_SOURCE_URL || "http://localhost:3000");
const LOG_API_URL = `${SOURCE_BASE_URL}/files/log`;

// Custom format for development - colorized and easy to read
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    ({ timestamp, level, message, service, correlationId, ...meta }) => {
      let log = `${timestamp} [${level}]`;
      if (service) log += ` [${service}]`;
      if (correlationId) log += ` [${correlationId}]`;
      log += `: ${message}`;

      // Add metadata if present
      const metaKeys = Object.keys(meta);
      if (metaKeys.length > 0) {
        log += " " + JSON.stringify(meta, null, 2);
      }

      return log;
    },
  ),
);

// Production format - JSON for log aggregation systems
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Create the Winston logger instance for fallback
const winstonLogger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: {
    service: "echo-dynode",
    environment: NODE_ENV,
  },
  format: NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Add file transports in production
if (NODE_ENV === "production") {
  winstonLogger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  );

  winstonLogger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  );
}

/**
 * Send log to source.dynode centralized logging service
 * @param {string} level - Log level (info, error, warn, debug)
 * @param {string} message - Log message
 * @param {Object} meta - Metadata object
 */
async function logToServer(level, message, meta = {}) {
  try {
    const payload = JSON.stringify({
      level,
      message,
      meta: {
        ...meta,
        origin: ORIGIN,
        service: "echo-dynode",
        environment: NODE_ENV,
      },
    });

    const url = new URL(LOG_API_URL);
    const protocol = url.protocol === "https:" ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
      timeout: 5000, // 5 second timeout
    };

    const req = protocol.request(options, (res) => {
      // Consume response data to free up memory
      res.on("data", () => {});
      res.on("end", () => {});
    });

    req.on("error", (err) => {
      // Fallback to Winston console logging if remote logging fails
      winstonLogger.warn("Remote log send failed, using local fallback", {
        error: err.message,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      winstonLogger.warn("Remote log timeout, using local fallback");
    });

    req.write(payload);
    req.end();

    // Also log locally for redundancy (can be disabled in production)
    if (NODE_ENV !== "production" || process.env.ENABLE_LOCAL_LOGS === "true") {
      winstonLogger[level](message, meta);
    }
  } catch (err) {
    // Fallback to Winston if something goes wrong
    winstonLogger[level](message, meta);
  }
}

/**
 * Main logger object with all log levels
 * Sends to centralized logging and falls back to Winston
 */
const logger = {
  info: (message, meta) => logToServer("info", message, meta),
  error: (message, meta) => logToServer("error", message, meta),
  warn: (message, meta) => logToServer("warn", message, meta),
  debug: (message, meta) => logToServer("debug", message, meta),
};

/**
 * Create a child logger with additional context
 * @param {Object} meta - Additional metadata to include in all logs
 * @returns {Object} Child logger with bound metadata
 */
export function createChildLogger(meta) {
  return {
    info: (message, additionalMeta) =>
      logger.info(message, { ...meta, ...additionalMeta }),
    error: (message, additionalMeta) =>
      logger.error(message, { ...meta, ...additionalMeta }),
    warn: (message, additionalMeta) =>
      logger.warn(message, { ...meta, ...additionalMeta }),
    debug: (message, additionalMeta) =>
      logger.debug(message, { ...meta, ...additionalMeta }),
  };
}

/**
 * Add correlation ID to logger context
 * Useful for tracking requests across multiple operations
 * @param {string} correlationId - Unique identifier for the operation
 * @returns {Object} Child logger with correlation ID
 */
export function withCorrelationId(correlationId) {
  return createChildLogger({ correlationId });
}

/**
 * Log authentication events with specific context
 */
export const authLogger = createChildLogger({ component: "auth" });

/**
 * Log WebSocket events with specific context
 */
export const wsLogger = createChildLogger({ component: "websocket" });

/**
 * Log room events with specific context
 */
export const roomLogger = createChildLogger({ component: "room" });

/**
 * Log HTTP events with specific context
 */
export const httpLogger = createChildLogger({ component: "http" });

export default logger;
