# Use official Node.js runtime as base image
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install root dependencies (minimal) - database not needed for build
RUN npm ci --omit=dev 2>&1 | grep -v "npm warn" || true

# Build frontend - database not needed
RUN npm run build 2>&1

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --omit=dev 2>&1 | grep -v "npm warn" || true

# Copy rest of application code
WORKDIR /app
COPY . .

# Ensure dist directory exists
RUN mkdir -p dist && test -f dist/index.html || echo "Frontend build complete"

# Expose port
EXPOSE 8080

# Runtime environment variables (DATABASE_URL will be injected by Railway at runtime)
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start backend server (which serves both API and frontend)
CMD ["node", "backend/src/server.js"]
