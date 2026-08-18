#!/bin/bash

echo "Installing root dependencies..."
npm install --omit=dev

echo "Building frontend..."
npm run build

echo "Installing backend dependencies..."
cd backend
npm install --omit=dev
cd ..

echo "Build complete!"
