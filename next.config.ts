import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",
  
  // Other config options
  reactStrictMode: true,
  
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
