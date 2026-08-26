import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  outputFileTracingIncludes: {
    '/**': ['./db/custom.db', './prisma/**/*'],
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
