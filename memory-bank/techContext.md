# 技術コンテキスト - irutomo222レストラン予約システム

## 技術スタックの詳細

### フロントエンド
- **フレームワーク**: Next.js 15.2
- **言語**: TypeScript 5
- **レンダリング**: App Router, React Server Components
- **UI/スタイリング**: 
  - TailwindCSS
  - Shadcn UI (カスタマイズ可能なReactコンポーネント)
  - RadixUI (アクセシビリティに優れたUIプリミティブ)
  - Lucide Icons (モダンなアイコンライブラリ)
  - Framer Motion (アニメーション)
- **状態管理**:
  - React Server Components
  - React Context API (クライアント側)
  - TanStack Query (クライアント側データフェッチ)
- **国際化**: next-intl
- **バリデーション**: Zod

### バックエンド
- **サーバー**: Next.js API Routes, Server Components
- **データベース**: Supabase (PostgreSQL)
- **認証**: Clerk
- **支払い処理**: PayPal API
  - @paypal/react-paypal-js (PayPalのReact向け公式SDK)
- **API**: RESTful API, GraphQL (オプション)
- **リアルタイム通信**: Supabase Realtime

### 開発環境
- **開発サーバー**: Next.js Development Server
- **パフォーマンス**: Turbopack
- **環境変数管理**: Next.js環境変数
- **最適化**:
  - ストリーミングメタデータ
  - 永続的キャッシュ
  - 部分的プリレンダリング (PPR)
  - React Compiler (実験的機能)

### テスト/QA
- **テストフレームワーク**: Vitest, Testing Library
- **E2Eテスト**: Playwright
- **テストカバレッジ**: Istanbul

### デプロイメント
- **ホスティング**: Vercel (推奨), オプションとしてCloudflare Pages, CoreServer
- **CI/CD**: GitHub Actions

### 外部サービス
- **Channel.io**: リアルタイムユーザーサポート用チャットウィジェット

## 環境構成

### 開発環境
- Node.js 18.x 以上
- npm 9.x 以上またはpnpm
- Git
- 環境変数管理(.env.local, .env.development, .env.production)
- Next.js 開発サーバー構成:
  - デフォルトポート: 3000
  - TypeScript型チェック
  - Turbopack (--turbo オプション)
  - 開発者ツール

### テスト環境
- Vitest テスト環境
- Playwright E2Eテスト
- PayPalサンドボックス環境
- モック/スタブによるサービス分離
- テスト用.env.testファイル

### 本番環境
- Vercel (推奨) またはCloudflare Pages, CoreServer
- 本番用Supabaseプロジェクト
- SSL/TLSによるHTTPS対応
- 本番用環境変数
- エッジ配信最適化

## 重要な技術的実装

### Clerk-Supabase認証統合
- ✅ 最新のセッショントークン方式を採用（JWTテンプレート方式から完全移行）
  - 2025年4月1日より、JWTテンプレート方式は公式に非推奨化
  - JWTシークレットを他サービスと共有しないセキュリティ強化
  - プロジェクトのJWTシークレット更新時のダウンタイムリスク削減
  - 認証レイテンシーの削減（新しいJWT生成が不要）
- ✅ Server Actionsとの統合による安全な認証フロー
- ✅ App Routerのmiddleware.tsを活用した認証保護
- ✅ ClerkダッシュボードでのSupabase連携設定 (Connect with Supabase機能使用)
- ✅ Supabaseダッシュボードでのサードパーティ認証としてClerkを設定
- ✅ トークン取得の最適化と再試行メカニズム実装
  - トークンキャッシュによるパフォーマンス向上
  - 指数バックオフによる自動リトライ
  - 並列リクエストの重複排除
- ✅ セッション管理の強化
  - トークン有効期限の自動管理
  - 効率的なトークン更新
  - エラー耐性の向上

### PayPal決済処理統合
- ✅ 公式React SDK (`@paypal/react-paypal-js`) を使用した統合
- ✅ PayPalScriptProviderによるSDK初期化の最適化
- ✅ Server Actionsを活用した安全な決済処理
- ✅ 注文作成・キャプチャの実装
- ✅ サンドボックス/本番環境の切り替え
- ✅ サンドボックス診断ツールの実装
  - セッション状態診断
  - エラー検出と修正提案
  - SDKロード状態監視
- ✅ サンドボックスセッション問題対策
  - クリアメカニズムの実装
  - セッションクッキーの最適化
  - ストレージクリーンアップ機能
- ✅ 通貨フォーマット機能の強化
  - 国際化対応（多通貨サポート）
  - ロケール対応表示
- ✅ CSP対応のカスタマイズ
- ✅ エラーハンドリングとロギング
- ✅ 一貫性のあるエラー処理とリトライ機構

### Next.js最適化実装
- ✅ App Routerによるルーティング最適化
  - グループルート
  - 並列ルート
  - インターセプトルート
- ✅ React Server Componentsの効果的な使用
  - データフェッチングを含むサーバーコンポーネント
  - クライアントコンポーネントの最小化
  - サーバー/クライアントコンポーネントの適切な分離
- ✅ ストリーミングUI
  - Suspenseによる段階的なUI表示
  - ストリーミングHTMLレスポンス
  - ストリーミングメタデータによるパフォーマンス向上
- ✅ 永続的キャッシュ機能
  - フェッチリクエストの効率的なキャッシュ
  - データの再検証戦略
  - キャッシュタグとパス再検証
- ✅ サーバーアクション（Server Actions）
  - フォーム処理
  - データミューテーション
  - 楽観的な更新
- ✅ 画像最適化
  - next/imageコンポーネントによる自動最適化
  - WebPフォーマットの適用
  - レスポンシブ画像サイズ

### セキュリティ実装
- CSP (Content Security Policy) 設定
  - ✅ Next.js Config, next/headでのCSP実装
  - ✅ PayPal、Clerk、Channel.ioの専用ドメイン設定の最適化
  - ✅ 最適化されたPayPalドメイン設定: `www.paypal.com`, `www.paypalobjects.com`, `api.paypal.com`, `api-m.paypal.com`, `api.sandbox.paypal.com`, `checkout.paypal.com`
  - ✅ Clerk認証対応: `clerk.accounts.dev`, `clerk.dev`, `img.clerk.com`のドメイン許可
  - ✅ Web Worker対応: `'self'`とblob:スキームの許可
  - ✅ next.config.jsとheaderの設定
  - インラインスクリプト制限
  - XSS対策
- HTTPS強制リダイレクト
- CSRF対策
- Referrer-Policy設定

### 環境変数管理
- Next.js環境変数システム
  - process.env（サーバーサイド）
  - process.env.NEXT_PUBLIC_（クライアントサイド）
- .env.local, .env.development, .env.production
- 型安全な環境変数アクセス
- 環境検出と動的設定

### エラーハンドリングシステム
- 改善されたエラーUI
- グローバルエラーハンドリング
- エラーバウンダリー
- 集中型ロギングシステム
- API層での統一的なエラー変換

## 開発環境のセットアップ

### 前提条件
- Node.js 18.x 以上
- npm 9.x 以上またはpnpm
- Git

### インストール手順
1. リポジトリのクローン
2. 依存パッケージのインストール (npm install)
3. 環境変数ファイルの設定 (.env.local)
4. 開発サーバーの起動 (npm run dev)

### 開発サーバー起動コマンド
- 標準開発サーバー: `npm run dev`
- Turbopackを使用: `npm run dev:turbo`
- 本番モードテスト: `npm run build && npm run start`
- NPM スクリプト構成:
  ```json
  {
    "dev": "next dev",
    "dev:turbo": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
  ```

## データベース構造

Supabaseを使用したPostgreSQLデータベースで、以下の主要テーブルで構成:

- **users**: ユーザー情報
- **restaurants**: レストラン情報
- **reservations**: 予約データ
- **tables**: テーブル/座席情報
- **time_slots**: 予約可能時間枠
- **payment_transactions**: 支払い処理記録
- **reviews**: レビュー情報
- **error_logs**: エラーログデータ

RLS (Row Level Security) ポリシーによる行レベルのセキュリティが適用されています。

## APIエンドポイント

Next.js APIルートとServer Actionsの主な構成:

- **/api/auth/**: 認証関連
- **/api/restaurants/**: レストラン情報
- **/api/reservations/**: 予約管理
- **/api/payment/**: 決済処理
- **/api/log/**: ログ管理・エラー記録

## ビルドとデプロイ

### ビルドプロセス
- 標準ビルド: `npm run build`
- 分析付きビルド: `npm run build:analyze`
- デバッグ情報付き: `npm run build:debug`

### デプロイ
- Vercelへのデプロイ: Gitリポジトリ連携
- 手動デプロイ: `vercel deploy`
- CoreServerへのデプロイ: カスタムスクリプト

詳細な手順はDEPLOYMENT_GUIDE.mdに記載されています。 