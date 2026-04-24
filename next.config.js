/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack config (for Next.js 16+)
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },
  // Webpack config (for fallback)
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    }
    return config
  },
}

module.exports = nextConfig