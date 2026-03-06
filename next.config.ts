import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  output: "export",
  basePath: "/MitaC_Prototype",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "/MitaC_Prototype",
  },
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
