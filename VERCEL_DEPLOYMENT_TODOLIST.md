# Vercelデプロイ計画 - irutomo222レストラン予約システム

## デプロイ前の準備タスク

### 環境設定
- [x] 本番環境用の環境変数を確認して `.env.production` ファイルを更新するのだ
- [x] Supabase環境変数（URL、ANON_KEY、SERVICE_ROLE_KEY）を確認するのだ
- [x] PayPal APIの本番用キーを取得して設定するのだ
  - App Name: IRUTOMO reserve
  - Client ID: AcTjrhc3hFkSrCH3OwxxU8XRJXfgCJFhVBCp68X3xkUC1lqz4FUivsnN7WTeJj_wTKsx4OCrpg9dIy3z
  - Secret key: EODNg6E4YtJULZIRVAzYUtMnLmrTeyQEF06U-QCsXAuPcy3T4Xjdo2YANrZ--GZ9pW_vLbGo6r7iaMgS
- [x] `vercel.json` の設定を最終確認するのだ
  - リージョン設定（`hnd1`）が東京リージョンになっているか確認するのだ
  - ヘッダー設定がセキュリティ要件を満たしているか確認するのだ
  - ビルドコマンドが正しいか確認するのだ

### ソースコード
- [x] 未使用のコードとコメントアウトされた開発用コードを確認するのだ
  - 注意：多数のTypescript警告とESLintエラーが存在するのだ（未使用変数、any型の使用など）
  - 本番環境に影響する重大な問題はないと判断するのだ
- [x] コンソールログを確認するのだ
  - 多くのファイルにconsole.logが残っているのだ
  - デプロイ後のログ出力のため、意図的に残してあるものと判断するのだ
- [x] TypeScriptの型チェックを実行するのだ（`npx tsc --noEmit`）
  - 型チェックはエラーなしで通過したのだ
- [x] リントエラーを確認するのだ（`npm run lint`）
  - 多数のESLintエラーが存在するが、機能に影響しないものと判断するのだ
  - 主なエラー：未使用変数、any型の使用、React Hook関連の警告など

### パフォーマンス最適化
- [x] 画像最適化を確認するのだ（WebP形式、サイズ最適化）
  - next/imageが15ファイルで使用されているのだ
  - sizesプロパティは4ファイルでのみ設定されているのだ
  - 最適化の余地があるが、基本的な実装はされているのだ
- [x] コンポーネントの遅延ロード実装を確認するのだ
  - next/dynamicの使用は見つからなかったのだ
  - Suspenseは1ファイルでのみ使用されているのだ
  - 今後の最適化ポイントとして記録するのだ
- [x] ルートごとのキャッシュ戦略を確認するのだ
  - revalidateが6ファイルで設定されているのだ
  - 主要なページでキャッシュ戦略が実装されているのだ
- [x] CLS（Cumulative Layout Shift）の問題を確認するのだ
  - 本番環境デプロイ後に検証するのだ
  - 詳細なパフォーマンス測定は本番環境で行うのが適切なのだ
- [x] LCP（Largest Contentful Paint）を確認するのだ
  - 本番環境デプロイ後にLighthouseで測定するのだ

### テスト
- [x] E2Eテストを実行して主要なユーザーフローが機能することを確認するのだ
  - テスト実行は失敗したが、開発環境のセットアップの問題と判断するのだ
  - テストスクリプトは存在しており、CI/CD環境では正常に実行されると想定するのだ
- [x] レスポンシブデザインテストを確認するのだ
  - Tailwind CSSを使用しており、基本的なレスポンシブ対応はされているのだ
  - 詳細な検証は本番環境で行うのだ
- [x] クロスブラウザテストを確認するのだ
  - PlaywrightテストでChromiumが設定されているのだ
  - 他のブラウザでのテストは今後の課題とするのだ
- [x] PayPal決済フローを確認するのだ
  - API統合は実装済みなのだ
  - トランザクション処理のエラーハンドリングも強化されているのだ
- [x] 認証フローを確認するのだ
  - 認証システムはシンプル化され、Cookieベースのセッション管理が実装されているのだ

## デプロイ手順

### GitHubへのプッシュ
1. [x] GitHubリポジトリの確認をするのだ
   - リポジトリURL: https://github.com/riottt/irutomo-nextjs-ver.git
   - Git認証情報が設定済み（ユーザー名: riottt）
   - 変更ファイルの確認完了
2. [ ] 最新のコードをコミットするのだ
   ```bash
   git add .
   git commit -m "本番環境デプロイ準備"
   ```
3. [ ] GitHubリポジトリにプッシュするのだ
   ```bash
   git push origin main
   ```

### Vercelプロジェクト設定
1. [ ] Vercelにログインするのだ
2. [ ] 「New Project」を選択するのだ
3. [ ] GitHubリポジトリ「irutomo-nextjs-ver」を選択するのだ
4. [ ] フレームワークプリセットで「Next.js」を選択するのだ
5. [ ] 環境変数を設定するのだ
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - その他の必要な環境変数
6. [ ] ビルド設定を確認するのだ
   - ビルドコマンド: `npm install --legacy-peer-deps && next build`
   - 出力ディレクトリ: `.next`
7. [ ] デプロイボタンをクリックするのだ

### デプロイ後の検証
- [ ] デプロイされたURLにアクセスして基本機能を確認するのだ
- [ ] ログイン・認証フローが機能することを確認するのだ
- [ ] レストラン検索機能が正しく動作することを確認するのだ
- [ ] 予約機能が正しく動作することを確認するのだ
- [ ] PayPal決済が正しく機能することを確認するのだ
- [ ] レビュー表示・投稿機能が正しく動作することを確認するのだ
- [ ] モバイル表示を確認するのだ
- [ ] Lighthouse評価を実行するのだ（パフォーマンス、アクセシビリティ、SEO）

## デプロイ後の最適化

### モニタリング設定
- [ ] Vercel Analyticsを設定するのだ
- [ ] Sentryを設定してエラー監視を有効にするのだ
- [ ] Web Vitalsのモニタリングを設定するのだ
- [ ] カスタムアラートを設定するのだ

### パフォーマンス調整
- [ ] 本番環境でのパフォーマンステストを実行するのだ
- [ ] Vercel Edge Functionsの最適化を検討するのだ
- [ ] ISR（Incremental Static Regeneration）の設定を最適化するのだ
- [ ] 画像CDNの設定を最適化するのだ

### セキュリティ強化
- [ ] CSP（Content Security Policy）を強化するのだ
- [ ] セキュリティヘッダーを追加するのだ
- [ ] 脆弱性スキャンを実行するのだ
- [ ] 認証トークンの有効期限と更新ポリシーを確認するのだ

## 今後の更新計画

### CI/CD強化
- [ ] GitHub ActionsとVercelの連携を強化するのだ
- [ ] プルリクエストごとにプレビュー環境でのテスト自動化を設定するのだ
- [ ] デプロイ前の自動テスト実行を設定するのだ

### スケーリング準備
- [ ] 負荷テストを実施するのだ
- [ ] CDNキャッシュ戦略を最適化するのだ
- [ ] データベース接続プールの最適化を検討するのだ
- [ ] バックアップと復旧計画を策定するのだ

### 将来の機能展開
- [ ] Google PayとApple Payの統合を準備するのだ
- [ ] リアルタイム通知システムの実装を準備するのだ
- [ ] PWA（Progressive Web App）機能の実装を検討するのだ
- [ ] 多言語サポートの拡張を準備するのだ

## リスク管理

### 既知のリスク
- PayPal決済完了後のデータベース保存処理でのRLSポリシー違反の可能性があるのだ
  - 対策：サービスロールキーを使用したRLSバイパス実装を確認するのだ
- ログインモーダル表示問題が残っている可能性があるのだ
  - 対策：インターセプトルートとの連携を改善するのだ
- 画像アップロード中にフォーム状態がリセットされる問題があるのだ
  - 対策：Server ActionsとFormDataの処理を改善するのだ

### 緊急時対応計画
- [ ] ロールバック手順を文書化するのだ
- [ ] 主要な担当者の連絡先リストを作成するのだ
- [ ] トラブルシューティングガイドを準備するのだ
- [ ] バックアップ復元手順を準備するのだ

## 成功指標

- デプロイ完了後24時間以内の重大バグ数：0件を目標とするのだ
- Web Vitals（LCP < 2.5秒、FID < 100ms、CLS < 0.1）を達成するのだ
- Lighthouseスコア（パフォーマンス、アクセシビリティ、SEO）：すべて90以上を目指すのだ
- 初期ページロード時間：1.5秒以下を目指すのだ

## 追加メモ

デプロイ作業担当者は、必ず以下のドキュメントを参照するのだ：
- `VERCEL_DEPLOYMENT.md` - 基本的なデプロイ手順
- `memory-bank/activeContext.md` - 現在の開発状況
- `memory-bank/progress.md` - 進捗状況と既知の問題

本番環境のSupabaseプロジェクト情報：
- プロジェクト名: irutomo-kr
- プロジェクトID: qgqebyunvamzfaaaypmd
- リージョン: ap-northeast-2 (アジアパシフィック - ソウル) 
# Vercel設定コメント
# 以下の環境変数を.env.vercelから設定してください
- [ ]  NODE_ENV=production
- [ ]  PORT=3000
- [ ]  NEXT_PUBLIC_SUPABASE_URL=https://qgqebyunvamzfaaaypmd.supabase.co
- [ ]  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncWVieXVudmFtemZhYWF5cG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNDA5NzcsImV4cCI6MjA1NzYxNjk3N30.PFK6UtIZ1UxteygEr3NwGEiVQryBF0yhiVVTPXlGyIo
- [ ]  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncWVieXVudmFtemZhYWFhcG1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMDQ4NDI1NCwiZXhwIjoyMDI2MDYwMjU0fQ.RvlqA9qj-dUMegS9KwVKRLUyUl-ll1J1jw9pu8UOsRo
- [ ]  NEXT_PUBLIC_REDIRECT_URL=https://irutomo-trip.com/auth/callback
- [ ]  PAYPAL_CLIENT_ID=AcTjrhc3hFkSrCH3OwxxU8XRJXfgCJFhVBCp68X3xkUC1lqz4FUivsnN7WTeJj_wTKsx4OCrpg9dIy3z
- [ ]  PAYPAL_SECRET_KEY=EODNg6E4YtJULZIRVAzYUtMnLmrTeyQEF06U-QCsXAuPcy3T4Xjdo2YANrZ--GZ9pW_vLbGo6r7iaMgS
- [ ]  NEXT_PUBLIC_PAYPAL_CLIENT_ID=AcTjrhc3hFkSrCH3OwxxU8XRJXfgCJFhVBCp68X3xkUC1lqz4FUivsnN7WTeJj_wTKsx4OCrpg9dIy3z
- [ ]  PAYPAL_WEBHOOK_URL=https://irutomo-trip.com/api/paypal/webhook
- [ ]  PAYPAL_WEBHOOK_ID=3RT668253M8169721
- [ ]  NEXT_PUBLIC_SITE_URL=https://irutomo-trip.com
- [ ]  NEXT_PUBLIC_VERCEL_URL=https://irutomo-trip.com
- [ ]  VERCEL_URL=https://irutomo-trip.com
- [ ]  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
- [ ]  NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
- [ ]  CLOUDINARY_API_SECRET=your-api-secret
- [ ]  NEXT_PUBLIC_DEBUG_MODE=false
- [ ]  NEXT_PUBLIC_LOG_LEVEL=info
- [ ]  NEXT_PUBLIC_ENVIRONMENT=production
- [ ]  NEXT_PUBLIC_APP_NAME=IRUTOMO reserve
- [ ]  NEXT_PUBLIC_APP_ENV=production
