/**
 * Rate Limiting Middleware
 * Provides rate limiting for HTTP endpoints to prevent abuse
 */

import rateLimit from "express-rate-limit";
import logger from "../services/logger.js";

/**
 * Create a rate limiter with custom configuration
 * @param {Object} options - Rate limit options
 * @returns {Function} Rate limiter middleware
 */
export function createRateLimiter(options = {}) {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn("Rate limit exceeded", {
        ip: req.ip || req.connection.remoteAddress,
        url: req.url,
        method: req.method,
      });

      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: options.message || defaults.message,
          retryAfter: Math.ceil(options.windowMs / 1000),
        }),
      );
    },
  };

  return rateLimit({ ...defaults, ...options });
}

/**
 * Rate limiter for token generation endpoint
 * More restrictive to prevent token abuse
 */
export const tokenRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: "Too many token generation requests, please try again later",
});

/**
 * Rate limiter for authentication endpoints
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes
  message: "Too many authentication attempts, please try again later",
});

/**
 * Rate limiter for content posting
 */
export const contentRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: "Too many content posts, please slow down",
});

/**
 * Rate limiter for general API endpoints
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: "Too many requests, please try again later",
});

/**
 * Simple in-memory rate limiter for non-Express usage
 * Useful for WebSocket connections
 */
class SimpleRateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map(); // ip -> [timestamps]
  }

  /**
   * Check if request should be allowed
   * @param {string} identifier - IP address or client identifier
   * @returns {boolean} True if allowed, false if rate limited
   */
  checkLimit(identifier) {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      logger.warn("Simple rate limit exceeded", { identifier });
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  /**
   * Clean up old entries periodically
   */
  cleanup() {
    const now = Date.now();
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        (time) => now - time < this.windowMs,
      );
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

// Create WebSocket connection rate limiter
// 10 connections per minute per IP
export const wsConnectionLimiter = new SimpleRateLimiter(10, 60 * 1000);

// Periodic cleanup of rate limiter memory
setInterval(
  () => {
    wsConnectionLimiter.cleanup();
  },
  5 * 60 * 1000,
); // Every 5 minutes

export default {
  createRateLimiter,
  tokenRateLimiter,
  authRateLimiter,
  contentRateLimiter,
  apiRateLimiter,
  wsConnectionLimiter,
  SimpleRateLimiter,
};
