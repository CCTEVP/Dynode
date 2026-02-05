# Centralized Logging Integration

**Date:** January 29, 2026  
**Change:** Updated logger service to use source.dynode centralized logging

---

## Summary

The echo.dynode logger service has been updated to match the logging pattern used by builder.dynode and render.dynode. All logs are now sent to the **source.dynode `/files/log` endpoint** for centralized log aggregation.

---

## What Changed

### Logger Service (src/services/logger.js)

**Before:**

- Used only Winston for local logging
- Logs written to console and local files
- No centralized log aggregation

**After:**

- Sends all logs to source.dynode via HTTP POST to `/files/log`
- Falls back to Winston console logging if remote logging fails
- Maintains local Winston logging in development
- Includes origin metadata ("echo.dynode") for log tracking

### Key Features

1. **Centralized Logging**: All logs sent to source.dynode
2. **Automatic Fallback**: Uses Winston if remote logging unavailable
3. **Redundancy**: In development, logs to both remote and local
4. **Metadata**: Includes origin, service name, environment, and component
5. **Non-blocking**: Remote logging failures don't crash the application

---

## Configuration

### Environment Variables

```bash
# Required: Source.dynode URL for centralized logging
SOURCE_BASE_URL=http://localhost:3000           # Development
SOURCE_BASE_URL=http://source.dynode:8080       # Docker
SOURCE_BASE_URL=https://source-dynode.run.app   # Production

# Optional: Enable local file logging in addition to remote
ENABLE_LOCAL_LOGS=true   # Default: true in dev, false in production

# Log level
LOG_LEVEL=info  # error, warn, info, debug
```

### Docker Environment

In docker-compose or kubernetes, use internal service name:

```bash
SOURCE_BASE_URL=http://source.dynode:8080
```

### Cloud Run / External

Use public URL:

```bash
SOURCE_BASE_URL=https://source-dynode.run.app
```

---

## How It Works

### Log Flow

```
Echo.dynode → HTTP POST → source.dynode /files/log → source.dynode logger
                ↓ (if fails)
           Winston Console/File
```

### Remote Logging Request

Each log creates an HTTP POST request to source.dynode:

```http
POST /files/log HTTP/1.1
Host: source.dynode:8080
Content-Type: application/json

{
  "level": "info",
  "message": "WebSocket connection established",
  "meta": {
    "clientId": "screen",
    "origin": "echo.dynode",
    "service": "echo-dynode",
    "environment": "production",
    "component": "websocket"
  }
}
```

### Fallback Behavior

If remote logging fails (timeout, connection error, etc.):

1. Error is logged to Winston console (suppressed to avoid noise)
2. Original log message is written to Winston console
3. Application continues normally

---

## Usage (No Changes Required)

The logger API remains the same:

```javascript
import logger, {
  authLogger,
  wsLogger,
  httpLogger,
  roomLogger,
} from "./services/logger.js";

// Works exactly the same, but now sends to source.dynode
logger.info("Server started", { port: 8080 });
authLogger.warn("Invalid token", { token: "abc123" });
wsLogger.error("Connection failed", { error: err.message });
```

---

## Benefits

1. **Centralized Monitoring**: All microservices log to one place
2. **Consistency**: Matches builder.dynode and render.dynode patterns
3. **Scalability**: Logs from multiple echo.dynode instances aggregated
4. **Reliability**: Automatic fallback prevents logging failures from affecting service
5. **Search/Analysis**: Easier to search across all services in one location

---

## Testing

### Test Remote Logging

```javascript
// Should send log to source.dynode
logger.info("Test message", { test: true });
```

Check source.dynode logs to verify receipt.

### Test Fallback

Stop source.dynode service and verify:

1. Logs still appear in echo.dynode console
2. Warning about remote logging failure appears
3. Application continues normally

### Test in Development

```bash
# Start source.dynode on port 3000
cd source.dynode
npm start

# Start echo.dynode
cd echo.dynode
SOURCE_BASE_URL=http://localhost:3000 npm start

# Verify logs appear in both consoles
```

---

## Migration Notes

- No code changes required in existing logger usage
- Update deployment configuration to set SOURCE_BASE_URL
- Ensure source.dynode is running and accessible
- Test in staging before production deployment

---

## Troubleshooting

### Logs Not Appearing in source.dynode

1. Check SOURCE_BASE_URL is set correctly
2. Verify source.dynode is running on specified URL
3. Check network connectivity (firewall, DNS)
4. Look for "Remote log send failed" warnings in echo.dynode console

### Performance Concerns

- Remote logging uses fire-and-forget HTTP requests (non-blocking)
- 5-second timeout prevents hanging
- Failed requests don't retry (falls back immediately)
- Minimal performance impact

### Docker Networking

Ensure services are on same network:

```yaml
services:
  echo.dynode:
    environment:
      SOURCE_BASE_URL: http://source.dynode:8080
  source.dynode:
    # Must be accessible at http://source.dynode:8080
```

---

## Files Modified

- `src/services/logger.js` - Updated to send logs to source.dynode
- `.env.example` - Added SOURCE_BASE_URL and ENABLE_LOCAL_LOGS
- `IMPLEMENTATION-GUIDE.md` - Updated logging documentation
- `PRODUCTION-READINESS.md` - Updated deployment checklist
- `LOGGING-INTEGRATION.md` - This file (documentation)

---

**Status:** ✅ Complete  
**Compatible With:** builder.dynode, render.dynode, source.dynode  
**Breaking Changes:** None (backward compatible with fallback)
