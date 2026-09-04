/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@churchflow/database"],
  experimental: {
    outputFileTracingIncludes: {
      "/api/**/*": ["./node_modules/.pnpm/@prisma+client*/**/*", "../../node_modules/.pnpm/@prisma+client*/**/*"],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
