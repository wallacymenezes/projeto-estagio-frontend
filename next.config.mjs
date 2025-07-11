/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // A chave 'experimental' foi removida.
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;