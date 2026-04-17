import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      // Fotos de propiedades Inmovilla (el número del servidor puede variar: fotos1–fotos99)
      {
        protocol: 'https',
        hostname: '*.apinmo.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.inmovilla.com',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
