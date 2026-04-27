/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // INCREASE PAYLOAD SIZE LIMIT - FIXES 413 ERROR
  api: {
    responseLimit: false, // Disable response size limit
    bodyParser: {
      sizeLimit: '10mb', // Increase from default 4mb to 10mb for post content
    },
  },
  
  // For serverless functions (Vercel deployment)
  serverRuntimeConfig: {
    maxBodySize: '10mb',
  },
  
  // Enable response compression
  compress: true,
  
  // Increase timeout for large uploads
  staticPageGenerationTimeout: 120,
  
  // Configure for both webpack and turbopack
  webpack: (config, { isServer }) => {
    // Keep your webpack config for production builds
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    }
    
    // Add size limit warning for large chunks
    if (!isServer) {
      config.performance = {
        ...config.performance,
        maxAssetSize: 500000, // 500KB
        maxEntrypointSize: 1000000, // 1MB
      }
    }
    
    return config
  },
  
  // Add turbopack config to silence the warning
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },
  
  // Images optimization
  images: {
    domains: process.env.NEXT_PUBLIC_SUPABASE_URL 
      ? [process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', '')]
      : [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
  },
  
  // Headers for security and performance
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

module.exports = nextConfig;