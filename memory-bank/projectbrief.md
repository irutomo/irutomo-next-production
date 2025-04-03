# プロジェクト概要 - irutomo222レストラン予約システム

## 目的
このプロジェクトは、モダンなWeb技術を活用した包括的なレストラン予約プラットフォームです。お客様はレストランを検索し、空き状況を確認し、予約を行い、オンライン決済まで完結できるシステムを提供します。

## 主要機能
- レストラン検索・閲覧機能
- 空席状況リアルタイム確認
- 予約管理（作成・変更・キャンセル）
- ユーザーアカウント管理
- 決済処理（PayPal連携）
- 多言語対応
- レストランオーナー向け管理画面

## 技術スタック概要
- **フロントエンド**: Next.js 15.2, React 19, TypeScript 5, App Router, Tailwind CSS
- **UI**: Shadcn UI, Radix UI, Lucide Icons
- **バックエンド**: Next.js API Routes, Serverless Functions, Server Components
- **データベース**: Supabase (PostgreSQL)
- **認証**: Clerk
- **支払い処理**: PayPal
- **状態管理**: Server Components, React Context API, TanStack Query
- **テスト**: Vitest, Playwright, Testing Library

## 現在の開発フェーズ
開発フェーズ中で、主要機能の実装とテストを進めています。現在はNext.js 15.2で提供されるストリーミングメタデータ、パフォーマンス最適化、エラーハンドリングの向上など、最新機能を活用した実装に取り組んでいます。

## 重要な実装ポイント
1. レストラン予約フローの完全なエンドツーエンド体験
2. Server Componentsを活用した効率的なレンダリング
3. PayPalを使用した安全な決済プロセス
4. レスポンシブなユーザーインターフェイスと多言語対応
5. 永続的キャッシュを活用したパフォーマンス最適化

## 次のマイルストーン
- Turbopack活用によるビルド時間の短縮
- React Compilerによる自動最適化の導入
- ストリーミングメタデータによるページロード時間の改善
- エラーUIとデバッグ体験の向上
- Persistentキャッシュ機能の活用 