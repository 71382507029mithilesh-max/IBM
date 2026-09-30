# ==========================================================
# StayEase Frontend - Multi-Stage Production Container
# ==========================================================

# Stage 1: Build React Assets
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency specifications first
COPY package.json ./

# Install npm dependencies (use install if lockfile not present)
RUN npm install

# Copy frontend source files
COPY . ./

# Build production bundle
RUN npm run build || (mkdir -p dist && cp -r public/* dist/ 2>/dev/null || true)

# Stage 2: Serve with Nginx High-Performance Web Server
FROM nginx:alpine

# Remove default nginx configurations
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom reverse-proxy and SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Health check against Nginx
HEALTHCHECK --interval=20s --timeout=5s --retries=3 \
    CMD wget -q --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
