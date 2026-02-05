# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy everything (use .dockerignore to exclude unwanted files)
COPY . .

## Removed SOURCE/RENDER/BUILDER base URL ARG/ENV – static config handles these

# Build the application
ARG APP_ENV_DOCKER=docker
# Replace APP_ENV constant in config.ts for container build (no runtime env var usage)
RUN sed -i 's/const APP_ENV: AppEnv = "[^"]*";/const APP_ENV: AppEnv = "'"${APP_ENV_DOCKER}"'";/' config.ts
ENV DOCKER_BUILD=true
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist/ ./dist/

# Copy runtime files
COPY --from=builder /app/files/ ./dist/files/
COPY --from=builder /app/cert/ ./cert/
COPY --from=builder /app/views/ ./views/

## Omit .env copies – runtime no longer depends on env files

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S dynode -u 1001

# Change ownership
RUN chown -R dynode:nodejs /app
USER dynode

# Expose internal port 80 (host maps 3000 -> 80)
EXPOSE 80

# Health check (HTTP – config.https is false for docker/dev)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:80/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["node", "dist/app.js"]