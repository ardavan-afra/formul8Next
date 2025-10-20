#!/usr/bin/env node

// Simple debug script for Next.js
const { spawn } = require('child_process');

console.log('Starting Next.js with debugging enabled...');

const child = spawn('node', ['--inspect', 'node_modules/next/dist/bin/next', 'dev'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_OPTIONS: '--inspect'
  }
});

child.on('error', (error) => {
  console.error('Error starting Next.js:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  child.kill('SIGINT');
});
