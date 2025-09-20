import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:42069';
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // this makes the api url work with trailing slashes!
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*/`,
      },
    ];
  },
  trailingSlash: true,
};
export default nextConfig;
