/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  compress: true,
  staticPageGenerationTimeout: 120,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  
  // Cloudflare Pages optimization
  output: 'standalone',
  
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /@upstash\/redis/ },
      { message: /A Node.js API is used/ },
      { message: /Attempted import error/ },
    ];
    return config;
  },
}

module.exports = nextConfig