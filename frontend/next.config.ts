import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // this makes the api url work with trailing slashes!
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*/`,
      },
    ];
  },
  trailingSlash: true,
};

export default nextConfig;
