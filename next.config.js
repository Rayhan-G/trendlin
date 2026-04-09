/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['picsum.photos', 'via.placeholder.com'],
    unoptimized: true,
  },
  // Allow static export if needed
  output: 'standalone',
}

module.exports = nextConfig