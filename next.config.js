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
  // ESLintエラーでビルドを失敗させない
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScriptエラーでビルドを失敗させない
  typescript: {
    ignoreBuildErrors: true,
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
      {
        protocol: 'https',
        hostname: 'strapi-production-dd77.up.railway.app',
      },
    ],
    domains: ['qgqebyunvamzfaaaypmd.supabase.co', 'strapi-production-dd77.up.railway.app'],
  },
  // CSPヘッダーの設定
  async headers() {
    // 開発環境ではCSPを適用しない
    if (process.env.NODE_ENV === 'development') {
      return [];
    }

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
              script-src * 'unsafe-inline' 'unsafe-eval' https://*.paypal.com https://pay.google.com;
              style-src * 'unsafe-inline';
              img-src * data: blob:;
              font-src * data:;
              connect-src * https://*.paypal.com https://*.paypalobjects.com;
              frame-src * https://*.paypal.com https://pay.google.com;
              child-src * https://*.paypal.com;
              object-src 'none';
              base-uri 'self';
              form-action * https://*.paypal.com;
              media-src *;
              report-uri /api/csp-report;
            `.replace(/\s{2,}/g, ' ').trim()
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
          }
        ]
      }
    ];
  },
  webpack: (config, { isServer }) => {
    // nodeモジュールのpolyfill設定
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 