import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // this makes the api url work with trailing slashes!
        source: '/api/:path*',
        destination: 'http://localhost:42069/api/:path*/',
      },
    ];
  },
  trailingSlash: true,
};

export default nextConfig;
