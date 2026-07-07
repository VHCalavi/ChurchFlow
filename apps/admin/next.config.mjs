/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@churchflow/database"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/:path*`
      }
    ];
  }
};

export default nextConfig;
