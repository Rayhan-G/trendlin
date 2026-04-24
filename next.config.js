/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Configure for both webpack and turbopack
  webpack: (config, { isServer }) => {
    // Keep your webpack config for production builds
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    }
    return config
  },
  
  // Add turbopack config to silence the warning
  turbopack: {
    // Empty config - Turbopack will use defaults
    // Add custom rules if needed
    resolveAlias: {
      '@': './src',
    },
  },
}

module.exports = nextConfig