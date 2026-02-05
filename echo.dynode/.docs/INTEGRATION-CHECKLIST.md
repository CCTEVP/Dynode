# Integration Checklist - Remaining Work

This checklist tracks the remaining integration work needed to complete the production optimization.

---

## 🔄 Phase 1: Server.js Integration (High Priority)

### Configuration & Initialization

- [ ] Import `validateConfig` from `./config/validation.js`
- [ ] Call `validateConfig()` before server startup (exit if fails)
- [ ] Import `setupGlobalErrorHandlers` from `./middleware/error-handler.js`
- [ ] Call `setupGlobalErrorHandlers()` at the start

### Logging Integration

- [ ] Import logger and component loggers
- [ ] Replace `console.warn` for favicon warning
- [ ] Replace `console.log` for server startup messages
- [ ] Add structured logging for WebSocket connections
- [ ] Add structured logging for room events
- [ ] Add structured logging for HTTP requests

### Error Handling

- [ ] Import error handling utilities (`asyncHandler`, `readRequestBody`, etc.)
- [ ] Wrap HTTP request handler with `asyncHandler`
- [ ] Use `readRequestBody` for POST request body reading
- [ ] Add error handlers to request streams
- [ ] Use `closeWebSocket` for WebSocket disconnections

### CORS Implementation

- [ ] Import CORS middleware from `./middleware/cors.js`
- [ ] Add `handlePreflight` for OPTIONS requests
- [ ] Add `applyCors` for all HTTP requests
- [ ] Add `checkWebSocketOrigin` for WebSocket upgrades
- [ ] Remove or update existing ORIGIN_ALLOWLIST logic

### Rate Limiting

- [ ] Import rate limiters from `./middleware/rate-limiter.js`
- [ ] Add `tokenRateLimiter` to `/auth/token` endpoint
- [ ] Add `authRateLimiter` to authentication endpoints
- [ ] Add `contentRateLimiter` to POST content endpoints
- [ ] Add `wsConnectionLimiter` to WebSocket connections
- [ ] Add IP extraction utility for rate limiting

---

## 🔄 Phase 2: Room Handlers (Medium Priority)

### Radio Room Handler

- [ ] Import duration utilities from `../../utils/duration.js`
- [ ] Replace `parseDuration` method with imported utility
- [ ] Replace `extractDurationFromSource` with imported utility
- [ ] Replace `resolveDurationMs` with imported utility
- [ ] Replace `formatDuration` with imported utility
- [ ] Remove old duration parsing methods
- [ ] Import `roomLogger` from logger service
- [ ] Replace `console.log` statements with `roomLogger`

### Chat Room Handler (if applicable)

- [ ] Import `roomLogger` from logger service
- [ ] Replace `console.log` statements with `roomLogger`
- [ ] Add error handling for async operations

### Base Room Handler

- [ ] Import logger from logger service
- [ ] Replace any `console.log` statements
- [ ] Add error handling utilities if needed

---

## 🔄 Phase 3: Additional Files (Low Priority)

### Health Endpoint

- [ ] Import `httpLogger` from logger service
- [ ] Add structured logging for health checks
- [ ] Consider adding more metrics (connections, memory)

### Postcontent Handler

- [ ] Import `httpLogger` and error handlers
- [ ] Replace `console.log` statements
- [ ] Add error handling for HTTP requests
- [ ] Add rate limiting if not already present

### Swagger/Documentation

- [ ] Review for any `console.log` statements
- [ ] Ensure error handling is consistent

### Client Utilities

- [ ] Review client-side code for improvements
- [ ] Update to use new error responses
- [ ] Test with new rate limiting

---

## 🔄 Phase 4: Testing (Critical)

### Unit Tests

- [ ] Test logger service
- [ ] Test configuration validation
- [ ] Test duration utilities
- [ ] Test error handlers
- [ ] Test rate limiters
- [ ] Test CORS middleware

### Integration Tests

- [ ] Test full authentication flow with env tokens
- [ ] Test CORS with various origins
- [ ] Test rate limiting thresholds
- [ ] Test WebSocket lifecycle
- [ ] Test error scenarios
- [ ] Test configuration validation failures

### Load Testing

- [ ] Test concurrent WebSocket connections
- [ ] Test rate limiter under load
- [ ] Test memory usage
- [ ] Test message throughput
- [ ] Test connection recovery

---

## 🔄 Phase 5: Deployment (Critical)

### Pre-Deployment

- [ ] Generate secure AUTH_SECRET (32+ chars)
- [ ] Generate secure permanent tokens for all roles
- [ ] Hash documentation credentials
- [ ] Set ORIGIN_ALLOWLIST with actual client domains
- [ ] Review and set all environment variables
- [ ] Test configuration in staging environment

### Staging Deployment

- [ ] Deploy to staging with new environment variables
- [ ] Verify configuration validation passes
- [ ] Test authentication with new tokens
- [ ] Test CORS with actual client applications
- [ ] Test rate limiting behavior
- [ ] Monitor logs for warnings
- [ ] Run smoke tests

### Production Deployment

- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Verify WebSocket connections
- [ ] Test HTTP endpoints
- [ ] Monitor rate limiting
- [ ] Check security logs
- [ ] Set up alerts for critical errors

### Post-Deployment

- [ ] Monitor for 24 hours
- [ ] Review logs for issues
- [ ] Check performance metrics
- [ ] Verify no errors in production
- [ ] Document any issues found
- [ ] Update documentation if needed

---

## 🔄 Phase 6: Optional Enhancements

### Redis Integration

- [ ] Implement Redis session storage
- [ ] Update rate limiter to use Redis
- [ ] Test session persistence across restarts
- [ ] Update documentation

### Monitoring

- [ ] Add Prometheus metrics endpoint
- [ ] Set up Grafana dashboards
- [ ] Configure alerts
- [ ] Document monitoring setup

### Error Tracking

- [ ] Integrate Sentry or similar
- [ ] Configure error grouping
- [ ] Set up notifications
- [ ] Test error reporting

---

## 📊 Progress Tracking

**Current Status:** ✅ Foundation Complete, Integration Pending

| Phase                     | Status         | Priority    | Estimated Time |
| ------------------------- | -------------- | ----------- | -------------- |
| Phase 1: server.js        | 🔲 Not Started | 🔴 High     | 2-4 hours      |
| Phase 2: Room Handlers    | 🔲 Not Started | 🟡 Medium   | 1-2 hours      |
| Phase 3: Additional Files | 🔲 Not Started | 🟢 Low      | 1 hour         |
| Phase 4: Testing          | 🔲 Not Started | 🔴 Critical | 4-6 hours      |
| Phase 5: Deployment       | 🔲 Not Started | 🔴 Critical | 2-3 hours      |
| Phase 6: Optional         | 🔲 Not Started | 🟢 Low      | 4-8 hours      |

**Total Estimated Time:** 14-24 hours

---

## 🎯 Quick Start for Phase 1

To begin integration, start with these critical changes in server.js:

```javascript
// At the top of server.js, after dotenv.config()
import { validateConfig } from "./config/validation.js";
import { setupGlobalErrorHandlers } from "./middleware/error-handler.js";
import logger, { wsLogger, httpLogger } from "./services/logger.js";

// Before creating HTTP server
if (!validateConfig()) {
  process.exit(1);
}

setupGlobalErrorHandlers();

logger.info("Starting echo.dynode server...");
```

---

## 📝 Notes

- Each checkbox represents a specific task
- Some tasks may depend on others being completed first
- Testing should be done incrementally as features are integrated
- Document any issues or deviations from this plan
- Update this checklist as work progresses

---

**Created:** January 29, 2026  
**Last Updated:** January 29, 2026
