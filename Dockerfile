# Multi-stage build
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

# Runtime stage
FROM node:24-alpine

WORKDIR /app

# Copy only what we need from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY backend ./backend
COPY run.sh ./run.sh

# Make script executable
RUN chmod +x ./run.sh && \
    echo "#!/bin/sh" > /app/.entry && \
    echo "exec bash /app/run.sh" >> /app/.entry && \
    chmod +x /app/.entry

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Expose port
EXPOSE 8080

# Explicit entrypoint to bypass npm completely
ENTRYPOINT []
CMD ["/bin/sh", "-c", "exec node /app/backend/src/server.js"]

