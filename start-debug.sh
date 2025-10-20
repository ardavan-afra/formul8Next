#!/bin/bash

echo "🧹 Cleaning up any existing processes..."
./cleanup-ports.sh

echo "🚀 Starting Next.js with debugging enabled..."
echo "📝 After the server starts, use 'Attach to Running Server' in VS Code"

# Start Next.js with debugging
NODE_OPTIONS="--inspect" npm run dev
