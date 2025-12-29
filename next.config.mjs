/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
    unoptimized: true,
  },
  experimental: {
    // allowedDevOrigins is for Next.js 14+, but sometimes causes warnings in certain environments
  },
  serverExternalPackages: [],
}

export default nextConfig
