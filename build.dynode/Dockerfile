# Multi-stage build for React Vite app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Accept build arguments for Vite environment variables with defaults
ARG VITE_SOURCE_API_URL=https://localhost:3333
ARG VITE_RENDER_BASE_URL=https://localhost:5555
ARG VITE_BUILDER_BASE_URL=https://localhost:4444

# Set environment variables for the build
ENV VITE_SOURCE_API_URL=$VITE_SOURCE_API_URL
ENV VITE_RENDER_BASE_URL=$VITE_RENDER_BASE_URL
ENV VITE_BUILDER_BASE_URL=$VITE_BUILDER_BASE_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install OpenSSL for certificate extraction
RUN apk add --no-cache openssl

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Copy the PFX certificate
COPY cert/build.dynode.pfx /tmp/build.dynode.pfx

# Add this ARG before the RUN command
ARG PFX_PASSWORD

# Replace the RUN command with this simpler version
RUN openssl pkcs12 -in /tmp/build.dynode.pfx -out /etc/nginx/ssl/cert.pem -clcerts -nokeys -passin pass:${PFX_PASSWORD} && \
    openssl pkcs12 -in /tmp/build.dynode.pfx -out /etc/nginx/ssl/key.pem -nocerts -nodes -passin pass:${PFX_PASSWORD} && \
    chmod 644 /etc/nginx/ssl/cert.pem && \
    chmod 600 /etc/nginx/ssl/key.pem && \
    rm /tmp/build.dynode.pfx

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (production uses nginx.conf)
COPY nginx.conf /etc/nginx/nginx.conf

# Expose HTTPS port for production
EXPOSE 4444

# Health check using HTTPS
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider --no-check-certificate https://localhost:4444 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]