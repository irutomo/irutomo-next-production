/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 静的エクスポート設定を復活
  output: 'export',
  distDir: 'deployment/coreserver/out',
  // Server Actionsを無効化
  serverActions: {
    bodySizeLimit: '2mb',
    allowedOrigins: ['*'],
  },
  experimental: {
    serverActions: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'irutomo-trip.com',
      },
      {
        protocol: 'https',
        hostname: 'qgqebyunvamzfaaaypmd.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig; 