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
  // パッケージのトランスパイル設定を追加
  transpilePackages: ["@ant-design", "rc-util", "rc-pagination", "rc-picker", "rc-notification", "rc-tooltip", "rc-tree", "rc-table"],
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
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
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
    domains: ['images.unsplash.com'],
  },
};

module.exports = nextConfig; 