/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Ensure proper build output for Vercel
  output: 'standalone',
}

module.exports = nextConfig
