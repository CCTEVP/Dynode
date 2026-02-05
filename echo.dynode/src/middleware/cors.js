/**
 * CORS Middleware
 * Enhanced CORS configuration with allowlist enforcement
 */

import logger from "../services/logger.js";

/**
 * Parse CORS allowlist from environment variable
 * @returns {Array<string>} Array of allowed origins
 */
function getAllowedOrigins() {
  const allowlist = process.env.ORIGIN_ALLOWLIST || "";

  if (!allowlist.trim()) {
    if (process.env.NODE_ENV === "production") {
      logger.error(
        "ORIGIN_ALLOWLIST is empty in production - CORS will block all origins",
      );
      return [];
    }
    logger.warn(
      "ORIGIN_ALLOWLIST is empty - allowing all origins (development only)",
    );
    return ["*"];
  }

  return allowlist
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Check if origin is allowed
 * @param {string} origin - Request origin
 * @returns {boolean} True if allowed
 */
export function isOriginAllowed(origin) {
  const allowedOrigins = getAllowedOrigins();

  // Allow all if wildcard
  if (allowedOrigins.includes("*")) {
    return true;
  }

  // Check exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Check pattern match (e.g., *.example.com)
  for (const allowed of allowedOrigins) {
    if (allowed.startsWith("*.")) {
      const domain = allowed.substring(2);
      if (origin && origin.endsWith(domain)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * CORS middleware for HTTP requests
 * @param {IncomingMessage} req - HTTP request
 * @param {ServerResponse} res - HTTP response
 * @returns {boolean} True if request should continue, false if rejected
 */
export function applyCors(req, res) {
  const origin = req.headers.origin;

  if (!origin) {
    // No origin header - allow (same-origin request)
    return true;
  }

  if (isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
    return true;
  }

  logger.warn("CORS: Origin not allowed", {
    origin,
    allowedOrigins: getAllowedOrigins(),
  });

  // Reject the request
  res.writeHead(403, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      error: "CORS policy: Origin not allowed",
      origin: origin,
    }),
  );

  return false;
}

/**
 * Handle CORS preflight requests
 * @param {IncomingMessage} req - HTTP request
 * @param {ServerResponse} res - HTTP response
 * @returns {boolean} True if this was a preflight request
 */
export function handlePreflight(req, res) {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;

    if (origin && isOriginAllowed(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Max-Age", "86400");
      res.writeHead(204);
      res.end();
    } else {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "CORS policy: Origin not allowed for preflight",
          origin: origin,
        }),
      );
    }

    return true;
  }

  return false;
}

/**
 * CORS check for WebSocket upgrade requests
 * @param {IncomingMessage} req - HTTP upgrade request
 * @returns {boolean} True if origin is allowed
 */
export function checkWebSocketOrigin(req) {
  const origin = req.headers.origin;

  if (!origin) {
    // No origin header - allow
    return true;
  }

  const allowed = isOriginAllowed(origin);

  if (!allowed) {
    logger.warn("WebSocket CORS: Origin not allowed", {
      origin,
      allowedOrigins: getAllowedOrigins(),
    });
  }

  return allowed;
}

export default {
  isOriginAllowed,
  applyCors,
  handlePreflight,
  checkWebSocketOrigin,
  getAllowedOrigins,
};
