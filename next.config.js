/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Enable response compression
  compress: true,
  
  // Increase timeout for large uploads
  staticPageGenerationTimeout: 120,
  
  // ✅ ADD THIS: Turbopack configuration (required when you have webpack config)
  turbopack: {
    // Empty config to silence the warning
    // Add custom resolve alias to match webpack
    resolveAlias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Webpack configuration (kept for production builds)
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    }
    return config
  },
  
  // Images optimization - using remotePatterns (not domains)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
}

module.exports = nextConfig