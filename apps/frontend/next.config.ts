import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@press/data'],
  allowedDevOrigins: ["f41b-43-252-145-206.ngrok-free.app"],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:5000/api/v1/:path*'
      }
    ];
  }
};

export default nextConfig;
