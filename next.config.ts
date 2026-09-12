import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www2.pnwx.com" },
      { protocol: "http", hostname: "www2.pnwx.com" },
      { protocol: "https", hostname: "www.pnwx.com" },
    ],
  },
};

export default nextConfig;
