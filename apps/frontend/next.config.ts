import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@press/data'],
  allowedDevOrigins: ["2003-43-252-145-206.ngrok-free.app"],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1'}/:path*`
      }
    ];
  }
};

export default nextConfig;
