#!/bin/bash
set -e

echo "=== BizManage Application Starting ==="
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo ""

# Ensure we have everything we need
if [ ! -d "backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  cd backend
  npm install --production
  cd ..
fi

# Start the application
echo "Starting Node.js server..."
exec node backend/src/server.js
