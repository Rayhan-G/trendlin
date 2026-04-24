/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Add turbopack configuration to silence the warning
  turbopack: {},
  
  // If you have webpack config, keep it but it won't be used with turbopack
  webpack: (config, { isServer }) => {
    // Your existing webpack config here (if any)
    return config
  },
  
  // Environment variables that will be available to the browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

module.exports = nextConfig