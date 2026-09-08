import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["lightningcss", "lightningcss-linux-x64-gnu"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "p4-ofp.static.pub",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
