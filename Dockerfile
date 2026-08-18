# Use official Node.js runtime as base image
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install root dependencies (minimal)
RUN npm ci --omit=dev

# Build frontend
RUN npm run build

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copy rest of application code
WORKDIR /app
COPY . .

# Create dist directory if it doesn't exist (already created by build, but just in case)
RUN mkdir -p dist

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Start backend server (which serves both API and frontend)
CMD ["node", "backend/src/server.js"]
