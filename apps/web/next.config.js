/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui'],
  output: 'standalone',
  reactStrictMode: true,
  // Improve build times in development
  optimizeFonts: process.env.NODE_ENV === 'production',
  // For better security
  poweredByHeader: false,
};

module.exports = nextConfig;
