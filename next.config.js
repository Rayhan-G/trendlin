/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  compress: true,
  staticPageGenerationTimeout: 60,
  
  images: {
    domains: ['res.cloudinary.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  swcMinify: true,
  productionBrowserSourceMaps: false,
  
  modularizeImports: {
    'lodash': {
      transform: 'lodash/{{member}}',
    },
  },
  
  webpack: (config, { isServer }) => {
    // Add extension resolution
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    
    // Ensure the alias is properly resolved
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    
    // Reduce memory usage
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
      };
    }
    
    config.ignoreWarnings = [
      { module: /@upstash\/redis/ },
      { message: /A Node.js API is used/ },
      { message: /Attempted import error/ },
    ];
    return config;
  },
}

module.exports = nextConfig