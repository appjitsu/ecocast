import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui'],
  output: 'standalone',
  reactStrictMode: true,
  // For better security
  poweredByHeader: false,
  eslint: {
    dirs: ['src', 'app', 'components', 'lib', 'utils'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

/** @type {import('next').NextConfig} */
const finalConfig = withBundleAnalyzer(nextConfig);

export default finalConfig;
