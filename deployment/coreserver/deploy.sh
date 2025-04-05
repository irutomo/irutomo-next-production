#!/bin/bash
# IRUTOMOアプリケーションデプロイスクリプト

# エラーが発生したら停止
set -e

echo "IRUTOMOアプリケーションのデプロイを開始します..."

# カレントディレクトリを取得
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/../.." && pwd )"

# 出力ディレクトリの設定
OUTPUT_DIR="$SCRIPT_DIR/out"

# 環境設定
echo "環境変数を設定しています..."
cp "$PROJECT_DIR/.env" "$PROJECT_DIR/.env.backup"
cp "$PROJECT_DIR/.env.local" "$PROJECT_DIR/.env.local.backup"

# 本番環境用の.envを設定
cat > "$PROJECT_DIR/.env" << EOL
# 本番環境用の環境変数設定ファイル
NODE_ENV=production

# PayPal設定
PAYPAL_CLIENT_ID=AX__ZB3M5gT4CkuFI9T8bXoyZYZPqsvVu7JilzrpPg2rzkOPqJ1kh8WbPdeFEVwp9lS4NzQDzfF_SSqv
PAYPAL_SECRET_KEY=EPp-sA6Xj7x_91BOOaPTWTTO8J58ly75C3_BIBbhGCZgP5S8mxN3kEk3HVTEgTc-A7gKDyfiMpOds4EN
PAYPAL_WEBHOOK_URL=https://irutomo-trip.com/api/paypal/webhook
PAYPAL_WEBHOOK_ID=3RT668253M8169721

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://qgqebyunvamzfaaaypmd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncWVieXVudmFtemZhYWFhcG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA0ODQyNTQsImV4cCI6MjAyNjA2MDI1NH0.bq2x4kkKZGjOZXVQV9n9Yw7i5CKydPrK4IA0b64pKQE
NEXT_PUBLIC_REDIRECT_URL=https://irutomo-trip.com/auth/callback

# Clerk認証設定
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZGlzdGluY3QtZHVuZmxseS05Mi5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_QXdY5a19FO3gVKnZnKvs9ZnKqwH8lBBTPeQp79GN6d
NEXT_PUBLIC_CLERK_FRONTEND_API=https://distinct-dunfly-92.clerk.accounts.dev

# デバッグ設定
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_ENVIRONMENT=production
EOL

# next.config.jsを設定
echo "ビルド設定を更新しています..."
NEXT_CONFIG_PATH="$PROJECT_DIR/next.config.js"
cp "$NEXT_CONFIG_PATH" "$NEXT_CONFIG_PATH.backup"

cat > "$NEXT_CONFIG_PATH" << EOL
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  distDir: 'deployment/coreserver/out',
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
EOL

# API用ファイルの準備
echo "API用ファイルを準備しています..."
if [ ! -d "$OUTPUT_DIR/api" ]; then
  mkdir -p "$OUTPUT_DIR/api"
fi

# .htaccessをコピー
echo ".htaccessファイルをコピーしています..."
cp "$SCRIPT_DIR/.htaccess" "$OUTPUT_DIR/"

# ビルド実行
echo "アプリケーションをビルドしています..."
cd "$PROJECT_DIR"
npm run build || {
  echo "ビルド中にエラーが発生しました。"
  echo "ファイルを復元して終了します..."
  
  # 設定ファイルを復元
  mv "$PROJECT_DIR/.env.backup" "$PROJECT_DIR/.env"
  mv "$PROJECT_DIR/.env.local.backup" "$PROJECT_DIR/.env.local"
  mv "$NEXT_CONFIG_PATH.backup" "$NEXT_CONFIG_PATH"
  
  exit 1
}

# API関連ファイルをコピー
echo "API関連ファイルをコピーしています..."
cp -r "$SCRIPT_DIR/api" "$OUTPUT_DIR/"

# アップロード用のファイルを準備（必要に応じて）
echo "デプロイ用のファイルを準備しています..."
cd "$SCRIPT_DIR"

# 完了メッセージ
echo "デプロイ準備が完了しました。"
echo "コアサーバーにアップロードするには、以下のフォルダの内容をすべてアップロードしてください:"
echo "$OUTPUT_DIR"

# 設定ファイルを復元
mv "$PROJECT_DIR/.env.backup" "$PROJECT_DIR/.env"
mv "$PROJECT_DIR/.env.local.backup" "$PROJECT_DIR/.env.local"
mv "$NEXT_CONFIG_PATH.backup" "$NEXT_CONFIG_PATH"

echo "デプロイプロセスが完了しました。" 