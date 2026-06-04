import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/socket",
        destination: "http://ws_app:8080/socket",
      },
    ];
  },
};

export default nextConfig;
