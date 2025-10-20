#!/bin/bash

# Script to clean up Node.js debug ports
echo "Cleaning up Node.js debug ports..."

# Kill any processes using common debug ports
for port in 9229 9230 9231 9232 9233 9234; do
  echo "Checking port $port..."
  PID=$(lsof -ti:$port)
  if [ ! -z "$PID" ]; then
    echo "Killing process $PID on port $port"
    kill -9 $PID
  else
    echo "Port $port is free"
  fi
done

# Kill any existing Next.js processes
echo "Killing any existing Next.js processes..."
pkill -f "next dev" || echo "No Next.js processes found"

echo "Port cleanup complete!"
