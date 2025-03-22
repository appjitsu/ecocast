const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui'],
  output: 'standalone',
  reactStrictMode: true,
  // Improve build times in development
  optimizeFonts: process.env.NODE_ENV === 'production',
  // For better security
  poweredByHeader: false,
  eslint: {
    dirs: ['src', 'app', 'components', 'lib', 'utils'],
  },
  images: {
    domains: ['images.unsplash.com'],
  },
};

/** @type {import('next').NextConfig} */
const finalConfig = withBundleAnalyzer(nextConfig);

module.exports = finalConfig;
