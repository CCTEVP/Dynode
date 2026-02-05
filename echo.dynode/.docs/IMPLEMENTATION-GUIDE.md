# Production Improvements - Implementation Guide

This document provides guidance on using the new production-ready features added to echo.dynode.

## 📚 Table of Contents

- [Structured Logging](#structured-logging)
- [Configuration Validation](#configuration-validation)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [CORS Enforcement](#cors-enforcement)
- [Duration Utilities](#duration-utilities)

---

## 📝 Structured Logging

### Overview

Echo.dynode uses a **centralized logging system** that sends all logs to the source.dynode `/files/log` endpoint. This approach:

- Centralizes logs from all microservices in one location
- Falls back to local Winston logging if remote logging fails
- Maintains consistency with other projects (builder.dynode, render.dynode)

### Configuration

Set the source.dynode URL in your environment:

```bash
# Development (local)
SOURCE_BASE_URL=http://localhost:3000

# Docker environment
SOURCE_BASE_URL=http://source.dynode:8080

# Production (external)
SOURCE_BASE_URL=https://source-dynode.run.app

# Optional: Enable local file logging in addition to remote
ENABLE_LOCAL_LOGS=true
```

### Usage

```javascript
import logger, {
  authLogger,
  wsLogger,
  httpLogger,
  roomLogger,
} from "./services/logger.js";

// General logging - sent to source.dynode
logger.info("Server started", { port: 8080, environment: "production" });
logger.warn("Configuration missing", { variable: "REDIS_URL" });
logger.error("Failed to connect", { error: err.message, stack: err.stack });

// Component-specific logging
authLogger.info("User authenticated", { userId: "user123" });
wsLogger.debug("WebSocket message received", { messageType: "broadcast" });
httpLogger.warn("Rate limit exceeded", { ip: "192.168.1.1" });
roomLogger.info("Client joined room", { room: "radio", clientId: "screen" });

// Create child logger with context
const requestLogger = createChildLogger({
  requestId: "abc123",
  userId: "user456",
});
requestLogger.info("Processing request");
requestLogger.error("Request failed", { error: "Invalid input" });
```

### Log Levels

- **error**: Errors that need immediate attention
- **warn**: Warning conditions that should be investigated
- **info**: Informational messages (default in production)
- **debug**: Detailed debugging information

Set log level via environment:

```bash
LOG_LEVEL=debug  # For development
LOG_LEVEL=info   # For production (default)
```

### How It Works

1. **Centralized Logging**: All logs are sent via HTTP POST to source.dynode `/files/log`
2. **Fallback**: If remote logging fails, logs are written to local Winston console
3. **Redundancy**: In development, logs are written both remotely and locally
4. **Metadata**: Each log includes origin ("echo.dynode"), service name, and environment

### Remote Logging Payload

Logs sent to source.dynode include:

```json
{
  "level": "info",
  "message": "User authenticated",
  "meta": {
    "userId": "user123",
    "origin": "echo.dynode",
    "service": "echo-dynode",
    "environment": "production",
    "component": "auth"
  }
}
```

### Local Fallback

If remote logging is unavailable:

- Logs automatically fall back to Winston console output
- In development: Both remote and local logging are active
- In production: Set `ENABLE_LOCAL_LOGS=true` for redundant file logging

**Development:** Colorized, human-readable

```
2026-01-29 10:30:45 [info] [auth]: User authenticated { userId: 'user123' }
```

**Production:** JSON for log aggregation

```json
{
  "level": "info",
  "message": "User authenticated",
  "service": "echo-dynode",
  "component": "auth",
  "userId": "user123",
  "timestamp": "2026-01-29T10:30:45.123Z"
}
```

---

## ✅ Configuration Validation

### Automatic Validation

Configuration is validated on server startup. Add this to your server initialization:

```javascript
import { validateConfig } from "./config/validation.js";

// Validate before starting server
if (!validateConfig()) {
  process.exit(1);
}
```

### Validated Configuration

**Required:**

- `AUTH_SECRET` - Must be 32+ characters, not a default value
- `NODE_ENV` - Must be set

**Recommended in Production:**

- `ORIGIN_ALLOWLIST` - Required in production
- `PUBLIC_BASE_URL`
- `REDIS_URL`
- Token environment variables

**Numeric Validation:**

- Port numbers: 1-65535
- Timeouts: Reasonable ranges
- Size limits: Within bounds

### Getting Validated Config Values

```javascript
import { getNumericConfig } from "./config/validation.js";

// Get port with validation and default
const port = getNumericConfig("PORT", 8080, 1, 65535);

// Get timeout with bounds checking
const timeout = getNumericConfig("IDLE_TIMEOUT_MS", 0, 0, 3600000);
```

---

## 🛡️ Error Handling

### Async Request Handlers

Wrap HTTP request handlers to catch errors:

```javascript
import {
  asyncHandler,
  sendJson,
  sendError,
} from "./middleware/error-handler.js";

const handler = asyncHandler(async (req, res) => {
  // Your async logic here
  const data = await fetchData();
  sendJson(res, 200, { success: true, data });
});

server.on("request", handler);
```

### Reading Request Body Safely

```javascript
import { readRequestBody, sendError } from "./middleware/error-handler.js";

try {
  const body = await readRequestBody(req, 256 * 1024); // Max 256KB
  const data = JSON.parse(body);
  // Process data
} catch (error) {
  sendError(res, 400, "Invalid request body");
}
```

### Request Stream Error Handling

```javascript
import { handleRequestErrors } from "./middleware/error-handler.js";

server.on("request", (req, res) => {
  handleRequestErrors(req, "api-endpoint");
  // Your handler logic
});
```

### Global Error Handlers

Set up once during server initialization:

```javascript
import { setupGlobalErrorHandlers } from "./middleware/error-handler.js";

setupGlobalErrorHandlers();
```

This catches:

- Uncaught exceptions
- Unhandled promise rejections

---

## 🚦 Rate Limiting

### HTTP Endpoints

```javascript
import {
  tokenRateLimiter,
  authRateLimiter,
  contentRateLimiter,
  apiRateLimiter,
} from "./middleware/rate-limiter.js";

// Token generation endpoint (10 requests per 15 minutes)
if (pathname === "/auth/token") {
  if (!tokenRateLimiter.checkLimit(clientIp)) {
    sendError(res, 429, "Too many token requests");
    return;
  }
}

// Authentication endpoint (20 requests per 15 minutes)
if (pathname === "/auth/login") {
  if (!authRateLimiter.checkLimit(clientIp)) {
    sendError(res, 429, "Too many authentication attempts");
    return;
  }
}

// Content posting (30 requests per minute)
if (pathname.startsWith("/room/") && req.method === "POST") {
  if (!contentRateLimiter.checkLimit(clientIp)) {
    sendError(res, 429, "Too many content posts");
    return;
  }
}
```

### WebSocket Connections

```javascript
import { wsConnectionLimiter } from "./middleware/rate-limiter.js";

wss.on("connection", (ws, req) => {
  const clientIp = req.socket.remoteAddress;

  if (!wsConnectionLimiter.checkLimit(clientIp)) {
    ws.close(1008, "Too many connections");
    return;
  }

  // Continue with connection logic
});
```

### Custom Rate Limiter

```javascript
import { SimpleRateLimiter } from "./middleware/rate-limiter.js";

// 5 requests per 60 seconds
const customLimiter = new SimpleRateLimiter(5, 60 * 1000);

if (!customLimiter.checkLimit(identifier)) {
  // Rate limited
}
```

---

## 🌍 CORS Enforcement

### HTTP Requests

```javascript
import { applyCors, handlePreflight } from "./middleware/cors.js";

server.on("request", (req, res) => {
  // Handle preflight requests
  if (handlePreflight(req, res)) {
    return; // Preflight handled
  }

  // Apply CORS for actual requests
  if (!applyCors(req, res)) {
    return; // CORS rejected, response already sent
  }

  // Continue with request handling
});
```

### WebSocket Connections

```javascript
import { checkWebSocketOrigin } from "./middleware/cors.js";

wss.on("upgrade", (req, socket, head) => {
  if (!checkWebSocketOrigin(req)) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }

  // Continue with upgrade
});
```

### Configuration

Set allowed origins in environment:

```bash
# Single origin
ORIGIN_ALLOWLIST=https://example.com

# Multiple origins
ORIGIN_ALLOWLIST=https://example.com,https://app.example.com

# Wildcard subdomain
ORIGIN_ALLOWLIST=*.example.com

# Development (allow all)
ORIGIN_ALLOWLIST=
```

**Production:** ORIGIN_ALLOWLIST is required and validated.

---

## ⏱️ Duration Utilities

Refactored duration parsing utilities for better maintainability.

### Basic Parsing

```javascript
import { parseDuration } from "./utils/duration.js";

// Parse number
const ms1 = parseDuration(5000); // 5000

// Parse string
const ms2 = parseDuration("30"); // 30

// With multiplier (seconds to milliseconds)
const ms3 = parseDuration(30, 1000); // 30000

// Invalid returns null
const ms4 = parseDuration(null); // null
```

### Extract from Objects

```javascript
import { extractDurationFromSource } from "./utils/duration.js";

const source = {
  expectedSlotDurationMs: 30000,
  metadata: {
    durationSeconds: 45,
  },
};

const duration = extractDurationFromSource(source); // 30000
```

### Resolve from Context

```javascript
import { resolveDurationMs } from "./utils/duration.js";

const context = {
  processed: { expectedSlotDurationMs: 30000 },
  original: { durationSeconds: 20 },
  socket: { radioMetadata: { expectedSlotDurationMs: 15000 } },
};

// Returns first valid duration found
const duration = resolveDurationMs(context); // 30000
```

### Format Duration

```javascript
import { formatDuration } from "./utils/duration.js";

formatDuration(5000); // "5s"
formatDuration(90000); // "1m 30s"
formatDuration(3665000); // "1h 1m 5s"
```

---

## 🔄 Migration Guide

### Replacing console.log

**Before:**

```javascript
console.log("User authenticated:", userId);
console.error("Error:", error);
```

**After:**

```javascript
import logger from "./services/logger.js";

logger.info("User authenticated", { userId });
logger.error("Error occurred", { error: error.message, stack: error.stack });
```

### Adding Error Handling

**Before:**

```javascript
server.on("request", async (req, res) => {
  const data = await fetchData();
  res.end(JSON.stringify(data));
});
```

**After:**

```javascript
import { asyncHandler, sendJson } from "./middleware/error-handler.js";

server.on(
  "request",
  asyncHandler(async (req, res) => {
    const data = await fetchData();
    sendJson(res, 200, data);
  }),
);
```

### Using Duration Utilities

**Before (in room handler):**

```javascript
parseDuration(value, multiplier) {
  if (value === undefined || value === null) return null;
  // ... complex logic
}
```

**After:**

```javascript
import { parseDuration, resolveDurationMs } from "../utils/duration.js";

// Use imported utilities
const duration = resolveDurationMs(context);
```

---

## 🧪 Testing

### Testing with New Features

```javascript
// Test logging
process.env.LOG_LEVEL = "debug";
logger.debug("Test message");

// Test rate limiting
const limiter = new SimpleRateLimiter(2, 1000);
assert(limiter.checkLimit("test1")); // true
assert(limiter.checkLimit("test1")); // true
assert(!limiter.checkLimit("test1")); // false (limit exceeded)

// Test CORS
process.env.ORIGIN_ALLOWLIST = "https://example.com";
const allowed = isOriginAllowed("https://example.com");
assert(allowed === true);
```

---

## 📊 Monitoring

### Health Endpoint

The `/health` endpoint provides server status:

```json
{
  "status": "ok",
  "uptime": 3600,
  "connections": 42,
  "rooms": ["radio", "chat"],
  "memory": {
    "rss": 123456789,
    "heapTotal": 98765432,
    "heapUsed": 45678901
  }
}
```

### Log Analysis

**Production logs are in JSON format for easy parsing:**

```bash
# Count errors
cat combined.log | grep '"level":"error"' | wc -l

# Find authentication failures
cat combined.log | grep '"component":"auth"' | grep 'Failed login'

# Track WebSocket connections
cat combined.log | grep '"component":"websocket"' | grep 'connected'
```

---

## 🚀 Deployment

### Environment Setup

1. Copy `.env.example` to `.env`
2. Set all required variables
3. Generate secure secrets:

```bash
# Generate AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate password hash
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('yourpassword').digest('hex'))"
```

### Validation

Server validates configuration on startup:

```
2026-01-29 10:00:00 [info]: Validating environment configuration...
2026-01-29 10:00:00 [warn]: Recommended environment variable not set: REDIS_URL
2026-01-29 10:00:00 [info]: Configuration validation passed { warnings: 1 }
```

If validation fails, server exits with error code 1.

---

## 📞 Support

For issues or questions about these production features:

1. Check the logs for detailed error messages
2. Review environment variable configuration
3. See [PRODUCTION-READINESS.md](./PRODUCTION-READINESS.md) for comprehensive guide
4. Check `.env.example` for configuration examples

---

**Last Updated:** January 29, 2026  
**Version:** 0.1.0
