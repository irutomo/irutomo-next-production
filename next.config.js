/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Vercelデプロイ用の設定
  // output: 'standalone', // 必要に応じて有効化
  // Server Actionsを有効化
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['irutomo-trip.com', 'vercel.app'],
    },
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    optimizeCss: true,
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
      {
        protocol: 'https',
        hostname: 'irutomo222yoyaku.core.coresv.com',
      },
    ],
    domains: ['qgqebyunvamzfaaaypmd.supabase.co'],
  },
};

module.exports = nextConfig; 