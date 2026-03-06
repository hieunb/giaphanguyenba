import type { NextConfig } from "next";

// Use standalone output for Docker, default for Vercel
const isVercel = !!process.env.VERCEL;

const nextConfig: NextConfig = {
  output: isVercel ? undefined : "standalone",

  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
