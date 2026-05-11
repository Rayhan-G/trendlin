/** @type {import('next').NextConfig} */
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Disable features that consume memory
  swcMinify: true,
  
  // Reduce memory usage
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB
    optimisticClientCache: false,
  },
  
  // Don't generate source maps in production
  productionBrowserSourceMaps: false,
  
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Reduce bundle size
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: false,
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