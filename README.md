# irutomo-nextjs

レストラン予約システム「irutomo-trip」のNext.jsアプリケーションです。

## 技術スタック

- フロントエンド: Next.js 15.2.4, React 19.0.0, TypeScript 5.4.5
- スタイリング: Tailwind CSS 3.4.1, Shadcn UI
- データベース: Supabase 2.49.4
- 決済処理: PayPal API 8.8.2
- デプロイ: Vercel

## 機能

- レストラン検索と予約
- ユーザーアカウント管理
- 予約管理
- 決済処理
- レビュー機能

## 開発環境

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番モードで起動
npm run start
```

## GitHub CLI

このプロジェクトでは開発効率化のためにGitHub CLIを使用しています。インストール方法：

```bash
# macOS (Homebrew)
brew install gh

# Windows
winget install --id GitHub.cli

# 認証
gh auth login
```

## デプロイ

Vercelを使用してデプロイします。詳細は `VERCEL_DEPLOYMENT.md` を参照してください。

## 連絡先

お問い合わせは公式サイト [irutomo-trip.com](https://irutomo-trip.com) までご連絡ください。 