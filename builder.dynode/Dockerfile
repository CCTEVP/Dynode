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

## Removed VITE_* build args/env – static TS config now supplies all base URLs

# Build argument to set environment mode
ARG APP_ENV=production
# Replace CURRENT_ENV constant in config/env.ts for container build
RUN sed -i 's/const CURRENT_ENV: AppEnv = "[^"]*";/const CURRENT_ENV: AppEnv = "'"${APP_ENV}"'";/' config/env.ts

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install OpenSSL for certificate extraction
RUN apk add --no-cache openssl

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Copy the PFX certificate
COPY cert/builder.dynode.pfx /tmp/builder.dynode.pfx

ARG PFX_PASSWORD
# Conditional certificate extraction: if no password supplied, skip TLS material (expect nginx.conf to handle fallback)
RUN if [ -n "$PFX_PASSWORD" ]; then \
      openssl pkcs12 -in /tmp/builder.dynode.pfx -out /etc/nginx/ssl/cert.pem -clcerts -nokeys -passin pass:"$PFX_PASSWORD" && \
      openssl pkcs12 -in /tmp/builder.dynode.pfx -out /etc/nginx/ssl/key.pem -nocerts -nodes -passin pass:"$PFX_PASSWORD" && \
      chmod 644 /etc/nginx/ssl/cert.pem && \
      chmod 600 /etc/nginx/ssl/key.pem && \
      rm /tmp/builder.dynode.pfx ; \
    else \
      echo "(Skipping TLS cert extraction: no PFX_PASSWORD provided)" ; \
      rm /tmp/builder.dynode.pfx ; \
    fi

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Selectable nginx config (multi-config approach)
# Options (present in repo):
#  - nginx.docker.conf (default, HTTP on 4000, proxy to source:3000)
#  - nginx.prod.conf   (HTTPS on 4000 with cert, security headers)
#  - nginx.dev.conf    (HTTP on 4000, proxy to localhost:3333 for local tooling — usually not used inside container)
ARG NGINX_CONF=nginx.docker.conf
COPY ${NGINX_CONF} /etc/nginx/nginx.conf

# Expose internal port 80 (host maps 4000 -> 80)
EXPOSE 80

# Health check (default http for docker config; override with --build-arg HEALTHCHECK_SCHEME=https for prod SSL)
ARG HEALTHCHECK_SCHEME=http
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider $HEALTHCHECK_SCHEME://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]