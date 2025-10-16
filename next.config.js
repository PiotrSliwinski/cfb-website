const withNextIntl = require('next-intl/plugin')(
  './src/lib/i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Enable standalone output for Docker
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for images
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true, // Use SWC minifier for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'], // Tree-shake icon imports
  },
}

module.exports = withNextIntl(nextConfig)
