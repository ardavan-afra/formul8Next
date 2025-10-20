/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Ensure proper build output for Vercel
  output: 'standalone',
  // Enable source maps for debugging
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devtool = 'eval-source-map'
    }
    return config
  },
}

module.exports = nextConfig
