/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  reactStrictMode: false,
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
