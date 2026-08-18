# Use official Node.js runtime as base image
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install root dependencies
RUN npm ci --omit=dev

# Build frontend
RUN npm run build

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copy rest of application code
WORKDIR /app
COPY . .

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Start backend server directly (serves API + frontend static files)
CMD ["node", "backend/src/server.js"]

