import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  outputFileTracingIncludes: {
    '/**': ['./db/custom.db', './prisma/**/*', './node_modules/pdfkit/js/data/**/*'],
  },
  serverExternalPackages: ['@prisma/client', 'prisma', '@sparticuz/chromium', 'playwright-core', 'pdfkit', 'fontkit', 'linebreak', 'png-js', 'fflate'],
};

export default nextConfig;
