#!/bin/bash
set -e

echo "Starting application..."
cd /app || cd .

# Make sure dependencies are installed
if [ ! -d "backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  cd backend
  npm install --omit=dev
  cd ..
fi

# Start the server
echo "Starting server on port $PORT..."
exec node backend/src/server.js
