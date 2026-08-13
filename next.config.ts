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
};

export default nextConfig;
