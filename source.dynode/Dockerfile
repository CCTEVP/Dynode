# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy everything (use .dockerignore to exclude unwanted files)
COPY . .

# Accept build arguments
ARG SOURCE_API_URL=https://localhost:3333
ARG RENDER_BASE_URL=https://localhost:5555
ARG BUILDER_BASE_URL=https://localhost:4444

# Set environment variables for build
ENV SOURCE_API_URL=${SOURCE_API_URL}
ENV RENDER_BASE_URL=${RENDER_BASE_URL}
ENV BUILDER_BASE_URL=${BUILDER_BASE_URL}

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

# Copy runtime files
COPY --from=builder /app/files/ ./dist/files/
COPY --from=builder /app/cert/ ./cert/
COPY --from=builder /app/views/ ./views/

# Copy environment file if it exists
COPY .env* ./

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S dynode -u 1001

# Change ownership
RUN chown -R dynode:nodejs /app
USER dynode

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('https://localhost:3333/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["node", "dist/app.js"]