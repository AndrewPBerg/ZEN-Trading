import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Environment variables for debugging
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // For better debugging in Docker
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
