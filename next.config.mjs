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
    allowedDevOrigins: ["*"],
  },
  serverExternalPackages: [],
}

export default nextConfig
