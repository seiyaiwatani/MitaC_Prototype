import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  output: "export",
  basePath: "/MitaC_Prototype",
  images: {
    unoptimized: true,
  },
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
