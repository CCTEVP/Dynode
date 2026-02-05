# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy everything (use .dockerignore to exclude unwanted files)
COPY . .

# Build the application
ARG APP_ENV_DOCKER=docker
RUN sed -i 's/const CURRENT_ENV = "[^"]*" as const;/const CURRENT_ENV = "'"${APP_ENV_DOCKER}"'" as const;/' config.ts
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

# Copy public assets (static files)
COPY --from=builder /app/public/ ./dist/public/

# Copy runtime files (views are needed at runtime for Pug templates)
COPY --from=builder /app/views/ ./views/

# Copy certificate files
COPY --from=builder /app/cert/ ./cert/

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S dynode -u 1001

# Change ownership
RUN chown -R dynode:nodejs /app
USER dynode

# Expose internal port 80 (host maps 5000 -> 80)
EXPOSE 80

# Health check (HTTP – render config disables https in dev/docker)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:80/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["node", "dist/app.js"]