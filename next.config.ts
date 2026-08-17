import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/b2b',
        destination: '/custom-package',
      },
      {
        source: '/dmc',
        destination: '/b2b-directory',
      },
      {
        source: '/catalog',
        destination: '/b2b-directory',
      },
      {
        source: '/directory',
        destination: '/b2b-directory',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/product/13-seater-toyota-hiace',
        destination: '/services-catalog',
        permanent: true,
      },
      {
        source: '/product/23-seater',
        destination: '/services-catalog',
        permanent: true,
      },
      {
        source: '/product/3d2n-singapore-city-lights-and-wildlife-wonders',
        destination: '/packages',
        permanent: true,
      },
      {
        source: '/product/gardens-by-the-bay',
        destination: '/singapore-attractions',
        permanent: true,
      },
      {
        source: '/product/singapore-cable-car-sky-pass-2',
        destination: '/singapore-attractions',
        permanent: true,
      },
      {
        source: '/product/national-museum-of-singapore-admission-ticket',
        destination: '/singapore-attractions',
        permanent: true,
      },
      {
        source: '/product/deluxe-gold-twin-room',
        destination: '/packages',
        permanent: true,
      },
      {
        source: '/product/deluxe-twin-room',
        destination: '/packages',
        permanent: true,
      },
      {
        source: '/product/rock-royalty-queen-room',
        destination: '/packages',
        permanent: true,
      },
      {
        source: '/product-category/:path*',
        destination: '/singapore-attractions',
        permanent: true,
      },
      {
        source: '/product/:path*',
        destination: '/singapore-attractions',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
