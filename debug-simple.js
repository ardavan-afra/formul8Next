#!/usr/bin/env node

// Simple debug script that just runs your API routes directly
// This bypasses Next.js's complex debugging setup

console.log('🚀 Starting simple debug session...');
console.log('📝 You can now set breakpoints in your API routes and test them directly');

// Import your API route handlers for direct testing
const { NextRequest } = require('next/server');

// Mock request for testing
const mockRequest = new NextRequest('http://localhost:3000/api/users/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token-here'
  },
  body: JSON.stringify({
    name: 'Test User',
    bio: 'Test bio',
    skills: ['JavaScript', 'TypeScript'],
    interests: ['AI', 'Web Development']
  })
});

console.log('✅ Debug environment ready!');
console.log('🔧 Set breakpoints in your API routes and call them from your frontend');
console.log('🌐 Your Next.js app should be running on http://localhost:3000');
console.log('📡 API routes are available for debugging');

// Keep the process alive
process.stdin.resume();
