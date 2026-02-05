/**
 * Error Handling Utilities
 * Provides wrappers for async operations and standardized error responses
 */

import logger from "../services/logger.js";

/**
 * Wrap async request handlers to catch errors
 * Prevents unhandled promise rejections
 * @param {Function} fn - Async handler function
 * @returns {Function} Wrapped handler
 */
export function asyncHandler(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      logger.error("Unhandled error in request handler", {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
      });

      // Send error response if headers not sent
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Internal server error",
            message:
              process.env.NODE_ENV === "production"
                ? "An unexpected error occurred"
                : error.message,
          }),
        );
      }
    }
  };
}

/**
 * Wrap async functions with error logging
 * @param {Function} fn - Async function
 * @param {string} context - Context description for logging
 * @returns {Function} Wrapped function
 */
export function asyncTryCatch(fn, context = "operation") {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(`Error in ${context}`, {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  };
}

/**
 * Handle request stream errors
 * Prevents unhandled stream errors from crashing server
 * @param {IncomingMessage} req - HTTP request
 * @param {string} context - Context for logging
 */
export function handleRequestErrors(req, context = "request") {
  req.on("error", (error) => {
    logger.error(`Request stream error in ${context}`, {
      error: error.message,
      code: error.code,
    });
  });
}

/**
 * Read request body with size limit
 * @param {IncomingMessage} req - HTTP request
 * @param {number} maxBytes - Maximum body size in bytes
 * @returns {Promise<string>} Request body
 */
export function readRequestBody(req, maxBytes = 1048576) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalSize = 0;

    req.on("data", (chunk) => {
      totalSize += chunk.length;

      if (totalSize > maxBytes) {
        req.destroy();
        reject(new Error(`Request body too large (max ${maxBytes} bytes)`));
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf-8"));
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Send JSON response
 * @param {ServerResponse} res - HTTP response
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response data
 */
export function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

/**
 * Send error response
 * @param {ServerResponse} res - HTTP response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 */
export function sendError(res, statusCode, message, details = {}) {
  const response = {
    error: message,
    ...details,
  };

  sendJson(res, statusCode, response);
}

/**
 * WebSocket close with code and reason
 * @param {WebSocket} ws - WebSocket connection
 * @param {number} code - Close code
 * @param {string} reason - Close reason
 */
export function closeWebSocket(ws, code, reason) {
  try {
    if (ws.readyState === ws.OPEN || ws.readyState === ws.CONNECTING) {
      ws.close(code, reason);
    }
  } catch (error) {
    logger.error("Error closing WebSocket", {
      error: error.message,
      code,
      reason,
    });
  }
}

/**
 * Global uncaught exception handler
 */
export function setupGlobalErrorHandlers() {
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", {
      error: error.message,
      stack: error.stack,
    });

    // Give logger time to flush, then exit
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Promise Rejection", {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      promise: String(promise),
    });
  });
}

export default {
  asyncHandler,
  asyncTryCatch,
  handleRequestErrors,
  readRequestBody,
  sendJson,
  sendError,
  closeWebSocket,
  setupGlobalErrorHandlers,
};
