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

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["node", "dist/app.js"]