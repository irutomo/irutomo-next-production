# ビルド試行記録

## 発生した問題

1. TypeScriptの型エラー
   - `searchParams`や`params`の型定義の問題
   - Next.js 15ではページプロパティの型が変更された可能性

2. `createContext is not a function`エラー
   - React 19とNext.js 15.2.4の互換性問題の可能性
   - クライアントコンポーネントの処理に関連する問題

3. APIルートの問題
   - 一部のAPIルートでURLの解析エラー
   - Supabase関連の設定や認証処理に問題

## 試行した解決策

1. 型定義の修正
   - `PageProps`型の定義調整
   - `null`チェックの追加

2. 問題ファイルの一時的な無効化
   - `/api/payments/route.ts`
   - `/restaurants/[id]/map/page.tsx`
   - `/restaurants/[id]/reviews/page.tsx`

3. ビルドオプションの変更
   - `--no-lint`フラグの追加
   - 環境変数の調整

4. `.next`キャッシュのクリア

## 次のステップ（推奨）

1. パッケージのバージョン調整
   - Next.jsを14系にダウングレード
   - またはReactを18系にダウングレード

2. `createContext`の使用方法の確認
   - クライアントコンポーネントの実装を見直す
   - コンテキストプロバイダーの修正

3. APIルートの修正
   - URLやSupabase関連の設定を確認
   - 特にWebhookや認証関連の処理を見直す

4. 段階的なコード修正
   - 基本的な機能から順に修正を進める
   - 一つずつ問題を解決していく 