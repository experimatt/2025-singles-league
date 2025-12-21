/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/discord-tennis-league' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/discord-tennis-league/' : '',
}

export default nextConfig
