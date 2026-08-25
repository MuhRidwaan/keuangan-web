import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Production: https://keuangan-go-api.vercel.app
    // Development (local): http://localhost:8080
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://keuangan-go-api.vercel.app";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;