/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Node.jsデプロイ用の設定
  // output: 'export', // 静的出力を無効化（コメントアウト）
  // distDir: 'deployment/coreserver/out', // 出力先設定（コメントアウト）
  // Server Actionsを有効化
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['*'],
    },
  },
  images: {
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