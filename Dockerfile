# Use official Node.js runtime as base image
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install root dependencies
RUN npm ci --omit=dev 2>&1 | grep -v "npm warn" || true

# Build frontend
RUN npm run build 2>&1

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --omit=dev 2>&1 | grep -v "npm warn" || true

# Copy rest of application code
WORKDIR /app
COPY . .

# Ensure dist directory exists
RUN mkdir -p dist

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Start backend server (serves API + frontend static files)
CMD ["bash", "start.sh"]

