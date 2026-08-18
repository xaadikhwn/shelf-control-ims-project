# Multi-stage build
# Cache bust: 2026-08-18T11:35:00Z
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --omit=dev

# Build frontend
RUN npm run build

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --omit=dev

# Runtime stage - minimal Alpine with just Node
FROM alpine:latest

WORKDIR /app

# Install only Node.js, no npm
RUN apk add --no-cache nodejs

# Copy only what we need from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Copy application files
COPY backend ./backend

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Expose port
EXPOSE 8080

# Direct Node.js execution - NO npm, NO shell
ENTRYPOINT ["node"]
CMD ["backend/src/server.js"]

