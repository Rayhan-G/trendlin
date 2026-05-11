/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // REMOVE output: 'standalone' - that's for Cloudflare
  // REMOVE experimental configs that might cause issues
  
  compress: true,
  staticPageGenerationTimeout: 60,
  
  images: {
    domains: ['res.cloudinary.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Memory optimization
  swcMinify: true,
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Optimize package imports
  modularizeImports: {
    'lodash': {
      transform: 'lodash/{{member}}',
    },
  },
  
  webpack: (config, { isServer }) => {
    // Add extension resolution - THIS FIXES THE MODULE NOT FOUND ERRORS
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    
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